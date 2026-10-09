#!/usr/bin/env python3
"""Fail if the public repository carries what only belongs to its makers.

Adapted from TA3HRJ/aprs-agent tools/check_public_text.py. Everything committed here is
published on GitHub and the site under site/ is served to the public.

What must hold:

  1. no tracked file contains an identifier the operator has asked to keep out of the
     repository (a login, a private address, a personal name). The list is held as SHA-256
     hashes of the normalised text (lower case, accents and spaces dropped), so the check
     does not publish what it guards; any run of one to four consecutive words is tested.
     Unlike the original, the XML inside .xlsx files and the text inside .sqlite files are
     scanned too - spreadsheet metadata is where a personal name and a local folder path
     turned up in this project. To add one:
         python scripts/check_public_text.py --hash "Name Surname"
  2. files written for users carry no internal markers: working-note names, IP addresses,
     or the assistant / a working conversation.
  3. .xlsx files carry no local folder path (x15ac:absPath) - run scripts/sanitize_xlsx.py.

Usage:  python scripts/check_public_text.py
Exit code 1 on failure.
"""
from __future__ import annotations

import hashlib
import re
import subprocess
import sys
import unicodedata
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# sha256(normalised identifier). Keep a comment-free list: a label here would
# say what is being hidden.
_PRIVATE = {
    "088f594a97cff1bcb8e593602ffb181368eba7dcaa3d2b3e18b03a060a173847",
    "53d25056b3235900b43b9c1dc7f8a0e445c3bf018901920a285e2abfd71ec7c9",
    "7ecbaaec647426fe103e805bdeb2c87c099de8220d15fdebadf1075480bbdf84",
    "98e804fb219435bb3ba4dedb99f61e66fd3bcfef5e3935757d44299f5550ede7",
    "aecf87881c5f723fc7088278520c1b595137fee28e66077f054c59354a53d573",
    "e4efa34744d1c46d4c17e9db6734a04e0de7bb68c370034dba17c759223ca80f",
    "56d65265a9777577665bbc3cbb97e7d8811f8a44b99146ed083f62512510fddc",
    "b6874c5097e8ea416f2b56ed5e67ffcc3f16fa54ca443ff5c9ae7cbc649da88b",
}

_USER_FACING_GLOBS = ["README.md", "LICENSE", "LICENSE-DATA.md", "export/README.md", "kaynaklar/README.md",
                      "site/**/*.html", "site/**/*.js", "site/**/*.css", "site/**/*.json"]

_INTERNAL = [
    (r"\b(HANDOFF|FINDINGS|NEXT)\.md\b|SESSION-HANDOFF", "a working note by name"),
    (r"\b(?:\d{1,3}\.){3}\d{1,3}\b", "an IP address"),
    (r"\bClaude Code\b|\bthis session\b|\bthe operator (?:chose|asked|said|wanted|approved)\b",
     "the assistant or a working conversation"),
]
_IP_OK = {"127.0.0.1", "0.0.0.0"}


def norm(s: str) -> str:
    s = s.lower().replace("ı", "i")
    s = unicodedata.normalize("NFKD", s)
    return "".join(c for c in s if c.isalnum() and not unicodedata.combining(c))


def h(s: str) -> str:
    return hashlib.sha256(norm(s).encode("utf-8")).hexdigest()


def tracked() -> list[Path]:
    out = subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True,
                         text=True, check=True).stdout.split("\n")
    return [ROOT / p for p in out if p]


def private_hits(text: str) -> int:
    words = [norm(w) for w in re.findall(r"\w+", text)]
    words = [w for w in words if w]
    n = 0
    for i in range(len(words)):
        acc = ""
        for j in range(i, min(i + 4, len(words))):
            acc += words[j]
            if hashlib.sha256(acc.encode("utf-8")).hexdigest() in _PRIVATE:
                n += 1
    return n


def file_text(p: Path) -> str | None:
    suf = p.suffix.lower()
    if suf in (".png", ".ico", ".jpg", ".zip", ".pyc", ".db", ".pdf"):
        return None
    if suf == ".xlsx":
        with zipfile.ZipFile(p) as z:
            return "\n".join(z.read(n).decode("utf-8", "ignore") for n in z.namelist() if n.endswith((".xml", ".rels")))
    if suf == ".sqlite":
        return p.read_bytes().decode("utf-8", "ignore")
    try:
        return p.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return None


def main() -> int:
    if len(sys.argv) == 3 and sys.argv[1] == "--hash":
        print(h(sys.argv[2]))
        return 0
    fails = []
    for p in tracked():
        if not p.exists():
            continue
        text = file_text(p)
        if text is None:
            continue
        n = private_hits(text)
        if n:
            # The file and the count only: printing the match would publish it in every CI log.
            fails.append("%s: %d private identifier(s)" % (p.relative_to(ROOT).as_posix(), n))
        if p.suffix.lower() == ".xlsx" and "x15ac:absPath" in text:
            fails.append("%s: local folder path in workbook metadata (run scripts/sanitize_xlsx.py)"
                         % p.relative_to(ROOT).as_posix())
    seen = set()
    for g in _USER_FACING_GLOBS:
        for p in sorted(ROOT.glob(g)):
            rel = p.relative_to(ROOT).as_posix()
            if rel in seen or not p.is_file():
                continue
            seen.add(rel)
            for ln, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
                for pat, what in _INTERNAL:
                    for m in re.finditer(pat, line):
                        if what == "an IP address" and m.group(0) in _IP_OK:
                            continue
                        fails.append("%s:%d: %s (%s)" % (rel, ln, what, m.group(0)))
    for f in fails:
        print("  FAIL  " + f)
    if fails:
        print("\n%d failure(s)" % len(fails))
        return 1
    print("  ok    no private identifiers; user-facing files carry no internal notes")
    print("\nall clear")
    return 0


if __name__ == "__main__":
    sys.exit(main())
