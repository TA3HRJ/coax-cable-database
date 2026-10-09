// Sayfaların ortak yardımcıları.
import { t, lang, fmt } from "./i18n.js";
import * as coax from "./coax.js";

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

export function round(v, d) {
  const p = Math.pow(10, d);
  return Math.round(v * p) / p;
}

export function num(v, d) {
  const n = Number(v);
  return v != null && v !== "" && isFinite(n) && n > 0 ? n : d;
}

/** Frekans: 2 GHz altı MHz, üstü GHz; binlik ayraç yok. */
export function fmtF(f, long) {
  const nf = (x, d = 2) => new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US", { maximumFractionDigits: d, useGrouping: false }).format(x);
  if (long) return f >= 1000 ? `${nf(f / 1000, 3)} GHz` : `${nf(f, f < 10 ? 2 : 1)} MHz`;
  return f >= 2000 ? `${nf(f / 1000)} GHz` : `${nf(f)} MHz`;
}

/** Zayıflama için uygun basamak. */
export function fmtA(v) {
  return fmt(v, v < 1 ? 3 : v < 10 ? 2 : 1);
}

export function fmtW(w) {
  return fmt(w, w < 10 ? 2 : w < 100 ? 1 : 0);
}

/** Maksimum değer ve tahmini değer üst simgeleri. */
export function indicators(c, f) {
  return (c.val === "max" ? `<sup class="ind" title="${esc(t("ind_max_title"))}">${t("ind_max")}</sup>` : "") +
    (f != null && coax.isExtrapolated(c, f) ? `<sup class="ind est" title="${esc(t("ind_est_title"))}">~</sup>` : "");
}

export function classLabel(db, c) {
  const k = db.classes.find((x) => x.k === c.cls);
  return k ? (lang === "tr" ? k.tr : k.en) : "";
}

/** Kablo seçme listesi: sık önerilenler başta, sonra sınıflar. */
export function cableSelect(db, value, exclude = []) {
  const sel = document.createElement("select");
  const group = (label, list) => {
    const g = document.createElement("optgroup");
    g.label = label;
    for (const c of list) {
      if (exclude.includes(c.id)) continue;
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = `${c.s} — ${c.n}${c.z !== 50 ? ` (${c.z} Ω)` : ""}`;
      g.append(o);
    }
    if (g.children.length) sel.append(g);
  };
  group(t("popular_group"), db.cables.filter((c) => c.pop).sort((a, b) => a.pop - b.pop));
  for (const k of db.classes) {
    group(lang === "tr" ? k.tr : k.en, db.cables.filter((c) => c.cls === k.k).sort((a, b) => a.z - b.z || a.s.localeCompare(b.s)));
  }
  if (value) sel.value = value;
  return sel;
}

/** Bant çipleri; seçili frekansı aria-pressed ile işaretler. onPick(f) çağrılır. */
export function bandChips(db, current, onPick) {
  const chips = el("div", "chips");
  for (const [label, f] of db.bands) {
    const b = el("button", "chip");
    b.type = "button";
    b.textContent = label;
    b.dataset.f = f;
    b.addEventListener("click", () => onPick(f));
    chips.append(b);
  }
  chips.sync = (f) => chips.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.f) === f ? "true" : "false"));
  chips.sync(current);
  return chips;
}
