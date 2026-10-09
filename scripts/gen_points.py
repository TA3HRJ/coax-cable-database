# -*- coding: utf-8 -*-
"""
kaynaklar/ klasöründeki datasheet PDF'lerinden zayıflama ve güç noktalarını çıkarır,
scripts/points_extra.py dosyasına Python verisi olarak yazar.

Kullanım:  python -X utf8 scripts/gen_points.py
Gereken:   pip install pdfplumber
Çıkan dosya elle düzenlenmemeli; düzeltme gerekiyorsa burada (FIXES) yapılır.
"""
import os
import re
import pdfplumber

HERE = os.path.dirname(os.path.abspath(__file__))
K = os.path.join(os.path.dirname(HERE), "kaynaklar")
OUT = os.path.join(HERE, "points_extra.py")


def text(fn, pages=None):
    with pdfplumber.open(os.path.join(K, fn)) as pdf:
        pg = pdf.pages if pages is None else [pdf.pages[i] for i in pages]
        return "\n".join((p.extract_text() or "") for p in pg)


def num(s):
    """Avrupa yazımı: '10.000' = on bin, '1,8' = 1.8"""
    if re.match(r"^\d{1,3}(\.\d{3})+$", s):
        return float(s.replace(".", ""))
    return float(s.replace(".", "").replace(",", ".")) if "," in s else float(s)


def belden(fn):
    t = text(fn).split("Part Numbers")[0]
    att, pwr, unit = [], [], None
    for l in t.splitlines():
        m = re.match(r"^([\d.,]+) MHz ([\d.]+) dB/100(ft|m)", l.strip())
        if m:
            att.append((float(m.group(1).replace(",", "")), float(m.group(2))))
            unit = "dB/100" + m.group(3)
        m = re.match(r"^([\d.,]+) MHz ([\d.,]+) W$", l.strip())
        if m:
            pwr.append((float(m.group(1).replace(",", "")), float(m.group(2).replace(",", ""))))
    return att, unit, pwr, "W"


def andrew(fn):
    att, pwr = [], []
    for l in text(fn).splitlines():
        m = re.match(r"^(\d[\d.]*)\s+(\d+\.\d+)\s+(\d+\.?\d*)\s+(\d+\.?\d*)$", l.strip())
        if m:
            f = float(m.group(1))
            att.append((f, float(m.group(3))))   # dB/100 m sütunu
            pwr.append((f, float(m.group(4))))   # kW
    return att, "dB/100m", pwr, "kW"


def rfs(fn, skip=()):
    att, pwr = [], []
    for l in text(fn).splitlines():
        m = re.match(r"^(\d+)\s+(\d+\.\d+)\s+(\d+\.?\d*)\s+(\d+\.\d+)$", l.strip())
        if m and float(m.group(1)) not in skip:
            att.append((float(m.group(1)), float(m.group(2))))
            pwr.append((float(m.group(1)), float(m.group(4))))
    return att, "dB/100m", pwr, "kW"


def mp(fn):
    t = text(fn, pages=[0])
    att = [(num(f), num(a)) for f, a, _ in re.findall(r"(\d[\d.]*(?:,\d)?) MHz (\d+,\d+) (\d+,\d+)", t)]
    pwr = [(num(f), num(w)) for f, w in re.findall(r"(\d[\d.]*(?:,\d)?) MHz (\d[\d.]*) W", t)]
    att = sorted(set(att))
    pwr = sorted(set(pwr))
    return att, "dB/100m", pwr, "W"


# (cable_id, source_id, parser, args, temp_att, temp_pwr, source_ref)
JOBS = [
    ("BEL-83265", "S014", belden, ("S014_Belden_83265.pdf",), None, None, "Attenuation / Power Rating tabloları"),
    ("BEL-84316", "S015", belden, ("S015_Belden_84316.pdf",), None, None, "Attenuation tablosu"),
    ("BEL-83269", "S016", belden, ("S016_Belden_83269.pdf",), None, None, "Attenuation tablosu"),
    ("BEL-9273", "S017", belden, ("S017_Belden_9273.pdf",), None, None, "Attenuation / Power Rating tabloları"),
    ("BEL-83242", "S018", belden, ("S018_Belden_83242.pdf",), None, None, "Attenuation tablosu"),
    ("BEL-8219", "S020", belden, ("S020_Belden_8219.pdf",), None, None, "Attenuation tablosu"),
    ("BEL-9269", "S021", belden, ("S021_Belden_9269.pdf",), None, None, "Attenuation tablosu"),
    ("BEL-8268", "S022", belden, ("S022_Belden_8268.pdf",), None, None, "Attenuation / Power Rating tabloları"),
    ("MP-HYPERFLEX5", "S023", mp, ("S023_MessiPaoloni_Hyperflex5.pdf",), 20, 40, "ATTENUATION (20°C) / POWER HANDLING (40°C)"),
    ("MP-ULTRAFLEX7", "S024", mp, ("S024_MessiPaoloni_Ultraflex7.pdf",), 20, 40, "ATTENUATION (20°C) / POWER HANDLING (40°C)"),
    ("MP-ULTRAFLEX10", "S025", mp, ("S025_MessiPaoloni_Ultraflex10.pdf",), 20, 40, "ATTENUATION (20°C) / POWER HANDLING (40°C)"),
    ("MP-AIRBORNE10", "S026", mp, ("S026_MessiPaoloni_Airborne10.pdf",), 20, 40, "ATTENUATION (20°C) / POWER HANDLING (40°C)"),
    ("MP-HYPERFLEX13", "S027", mp, ("S027_MessiPaoloni_Hyperflex13.pdf",), 20, 40, "ATTENUATION (20°C) / POWER HANDLING (40°C)"),
    ("RFS-SCF14-50J", "S029", rfs, ("S029_RFS_SCF14-50J.pdf",), 20, 40, "Attenuation @20°C / Power @40°C"),
    ("RFS-SCF38-50J", "S030", rfs, ("S030_RFS_SCF38-50J.pdf", (75,)), 20, 40, "Attenuation and Power Rating (75 MHz satırı hatalı, alınmadı)"),
    ("CS-FSJ1-50A", "S031", andrew, ("S031_Andrew_FSJ1-50A.pdf",), 20, 40, "Attenuation / Average Power tablosu"),
    ("CS-FSJ2-50", "S032", andrew, ("S032_Andrew_FSJ2-50.pdf",), 20, 40, "Attenuation and Average Power Ratings"),
    ("CS-FSJ4-50B", "S033", andrew, ("S033_Andrew_FSJ4-50B.pdf",), 20, 40, "Attenuation and Average Power Ratings"),
    ("CS-LDF2-50", "S034", andrew, ("S034_Andrew_LDF2-50.pdf",), 20, 40, "Attenuation / Average Power tablosu"),
    ("CS-LDF5-50A", "S035", andrew, ("S035_Andrew_LDF5-50A.pdf",), 20, 40, "Attenuation and Average Power Ratings"),
    ("CS-LDF6-50", "S036", andrew, ("S036_Andrew_LDF6-50.pdf",), 20, 40, "Attenuation and Average Power Ratings"),
    ("CS-LDF7-50A", "S037", andrew, ("S037_Andrew_LDF7-50A.pdf",), 20, 40, "Attenuation and Average Power Ratings"),
    ("BEL-9914", "S038", belden, ("S038_Belden_9914.pdf",), None, None, "Attenuation / Power Rating tabloları"),
    ("BEL-H1000C1", "S039", belden, ("S039_Belden_H1000C1.pdf",), None, None, "Attenuation tablosu (Nom.)"),
    ("BEL-83264", "S043", belden, ("S043_Belden_83264.pdf",), None, None, "Attenuation / Power Rating tabloları"),
    ("BEL-8263", "S044", belden, ("S044_Belden_8263.pdf",), None, None, "High Frequency - Nom. Insertion Loss"),
    ("BEL-1694A", "S045", belden, ("S045_Belden_1694A.pdf",), None, None, "Attenuation tablosu"),
    ("BEL-9292", "S046", belden, ("S046_Belden_9292.pdf",), None, None, "Attenuation tablosu"),
    ("BEL-8261", "S047", belden, ("S047_Belden_8261.pdf",), None, None, "Attenuation tablosu"),
]

# PDF metninde bozuk/iç içe geçmiş olan ve elle çözümlenen değerler (cable_id -> ek noktalar)
FIXES_ATT = {
    # Ultraflex 10: 7000/8000 MHz satırları iç içe yazılmış ("7 8 0 0 ... 5 5 0 5 , , 2 8") -> 50,2 ve 55,8
    "MP-ULTRAFLEX10": [(7000, 50.2), (8000, 55.8)],
}

ATT, PWR = [], []
for cid, sid, fn, args, ta, tp, ref in JOBS:
    att, au, pwr, pu = fn(*args)
    att = sorted(set(att + FIXES_ATT.get(cid, [])))
    assert len(att) >= 4, (cid, att)
    ATT.append((cid, sid, au, ta, ref, att, ""))
    if pwr:
        PWR.append((cid, sid, pu, tp, ref, sorted(set(pwr))))
    print(f"{cid:16s} {sid} att {len(att):3d} {au}  pwr {len(pwr):3d} {pu}")


# --- S001 Times Microwave Coax Selection Guide: 26 sütunlu tablo (zayıflama dB/100ft @25°C, güç kW @40°C)
def times_guide():
    t = text("S001_TimesMicrowave_Coax_Selection_Guide.pdf")
    cols = {"TMS-LMR1700": 4, "TMS-LMR1200": 6, "TMS-LMR900": 7, "TMS-LMR600": 9, "TMS-LMR500": 10, "TMS-LMR300": 19,
            "TMS-LMR200": 22, "TMS-LMR195": 24, "TMS-LMR100A": 26}
    att_tbl, pwr_tbl = {}, {}
    part = 0
    for l in t.splitlines():
        if l.startswith("Power Handling"):
            part = 1
        m = re.match(r"^([\d,]+) ?MHz (.+)$", l.strip())
        if not m:
            continue
        vals = m.group(2).split()
        if len(vals) != 26:
            continue
        (pwr_tbl if part else att_tbl)[float(m.group(1).replace(",", ""))] = vals
    out_a, out_p = {}, {}
    for cid, c in cols.items():
        for tbl, out in ((att_tbl, out_a), (pwr_tbl, out_p)):
            pts = []
            for f, vals in sorted(tbl.items()):
                v = vals[c - 1]
                if v.startswith("-") or v.endswith("*"):   # -.- = yok, * = tahmini
                    continue
                pts.append((f, float(v)))
            out[cid] = pts
    return out_a, out_p


ga, gp = times_guide()
for cid in ga:
    ATT.append((cid, "S001", "dB/100ft", 25, "Attenuation tablosu (+25°C), " + cid[4:] + " sütunu", ga[cid], ""))
    PWR.append((cid, "S001", "kW", 40, "Power Handling tablosu (+40°C)", gp[cid]))
    print(f"{cid:16s} S001 att {len(ga[cid]):3d}  pwr {len(gp[cid]):3d}")


# --- S013 Reçber katalog: RG 213 U (s.68), RWC 200 (s.69), RWC 240 (s.70); PDF sayfa indeksleri 68,69,70
def recber(page_idx):
    t = text("S013_Recber_Kablo_Urun_Katalogu.pdf", pages=[page_idx])
    return [(num(f), num(a)) for f, a in re.findall(r"(\d+) MHz ([\d,]+) dB/100m", t)]


for cid, pi, label in (("RCB-RG213U-PE", 68, "RG 213 U, katalog s.68"), ("RCB-RWC200PE", 69, "RWC 200, katalog s.69"),
                       ("RCB-RWC240PE", 70, "RWC 240, katalog s.70")):
    pts = recber(pi)
    ATT.append((cid, "S013", "dB/100m", 20, label + ", Zayıflama @20 °C max.", sorted(pts), "Maksimum değer"))
    print(f"{cid:16s} S013 att {len(pts):3d}")


# --- S028 M&P 2022 katalog, s.17 'Quick reference comparison' tablosu (dB/100m @20°C)
def mp_catalog():
    with pdfplumber.open(os.path.join(K, "S028_MessiPaoloni_Catalog_2022.pdf")) as pdf:
        tables = pdf.pages[16].extract_tables()
    freqs = [10, 28, 50, 100, 144, 200, 430, 800, 1296, 2400, 5000, 8000]
    rows = {}
    for tb in tables:
        for r in tb:
            if r and r[0] in ("ULTRAFLEX 13", "RG 58 C/U", "RG 213/U"):
                pts = []
                for f, cell in zip(freqs, r[1:]):
                    if cell and cell != "/":
                        pts.append((f, num(cell.split("\n")[0])))
                rows[r[0]] = pts
    return rows


mc = mp_catalog()
for cid, key in (("MP-ULTRAFLEX13", "ULTRAFLEX 13"), ("MP-RG58CU", "RG 58 C/U"), ("MP-RG213U", "RG 213/U")):
    ATT.append((cid, "S028", "dB/100m", 20, "Katalog s.17 Quick reference comparison, " + key, mc[key], ""))
    print(f"{cid:16s} S028 att {len(mc[key]):3d}")

with open(OUT, "w", encoding="utf-8") as f:
    f.write("# -*- coding: utf-8 -*-\n# OTOMATİK ÜRETİLDİ: scripts/gen_points.py - elle düzenlemeyin.\n")
    f.write("ATT_PDF = [\n")
    for r in ATT:
        f.write(f"    {r!r},\n")
    f.write("]\nPWR_PDF = [\n")
    for r in PWR:
        f.write(f"    {r!r},\n")
    f.write("]\n")
print("yazıldı:", OUT)
