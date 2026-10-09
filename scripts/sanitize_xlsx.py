# -*- coding: utf-8 -*-
"""
.xlsx dosyasındaki kişisel üst verileri temizler: yerel klasör yolu (x15ac:absPath) ve
oluşturan/son değiştiren kişi adı. Hücre içeriğine dokunmaz; yalnızca iki XML parçası değişir.

Kullanım:  python scripts/sanitize_xlsx.py dosya.xlsx [hedef.xlsx]
"""
import re
import shutil
import sys
import tempfile
import zipfile

AUTHOR = "TA3HX"


def sanitize(src, dst=None):
    dst = dst or src
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx").name
    with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "xl/workbook.xml":
                t = data.decode("utf-8")
                t = re.sub(r'<mc:AlternateContent[^>]*>\s*<mc:Choice Requires="x15">\s*<x15ac:absPath[^>]*/>\s*'
                           r'</mc:Choice>\s*</mc:AlternateContent>', "", t)
                t = re.sub(r"<x15ac:absPath[^>]*/>", "", t)
                data = t.encode("utf-8")
            elif item.filename == "docProps/core.xml":
                t = data.decode("utf-8")
                t = re.sub(r"<dc:creator>.*?</dc:creator>", f"<dc:creator>{AUTHOR}</dc:creator>", t)
                t = re.sub(r"<cp:lastModifiedBy>.*?</cp:lastModifiedBy>", f"<cp:lastModifiedBy>{AUTHOR}</cp:lastModifiedBy>", t)
                data = t.encode("utf-8")
            zout.writestr(item, data)
    shutil.move(tmp, dst)


if __name__ == "__main__":
    sanitize(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
    print("temizlendi:", sys.argv[-1])
