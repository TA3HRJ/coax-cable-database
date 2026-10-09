# -*- coding: utf-8 -*-
"""
TA3HRJ_Coax_Database.xlsx -> export/csv/*.csv + export/coax.sqlite

Excel'de hesaplanmış (kaydedilmiş) çalışma kitabının değerlerini okur; formül sonuçları
Excel'in son hesapladığı değerlerdir. Excel'de değişiklik yaptıysanız önce kaydedin.

Kullanım:  python -X utf8 scripts/export_db.py [xlsx_yolu]
"""
import csv
import os
import sqlite3
import sys
import openpyxl

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sanitize_xlsx import sanitize  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "TA3HRJ_Coax_Database.xlsx")
OUT = os.path.join(ROOT, "export")
CSV_DIR = os.path.join(OUT, "csv")
DB = os.path.join(OUT, "coax.sqlite")

# Excel tablosu -> (SQL tablo adı, birincil anahtar, yalnızca Excel'e özgü yardımcı sütunlar)
TABLES = [
    ("tblSources", "sources", "source_id", []),
    ("tblCables", "cables", "cable_id", ["att_first_row", "pwr_first_row"]),
    ("tblAttenuation", "attenuation", "point_id", ["ln_f", "ln_att", "w0", "w1", "w2", "one", "dev_sq", "order_ok"]),
    ("tblPower", "power", "power_id", ["ln_f", "ln_p", "order_ok"]),
    ("tblLegacyIndex", "legacy_index", "legacy_key", []),
    ("tblLegacyPoints", "legacy_points", None, []),
    ("tblDataDictionary", "data_dictionary", None, []),
]
FOREIGN_KEYS = {
    "cables": [("primary_source_id", "sources", "source_id")],
    "attenuation": [("cable_id", "cables", "cable_id"), ("source_id", "sources", "source_id")],
    "power": [("cable_id", "cables", "cable_id"), ("source_id", "sources", "source_id")],
    "legacy_index": [("cable_id", "cables", "cable_id")],
    "legacy_points": [("legacy_key", "legacy_index", "legacy_key"), ("cable_id", "cables", "cable_id")],
    "ham_bands": [("cable_id", "cables", "cable_id")],
}
INDEXES = {"attenuation": ["cable_id"], "power": ["cable_id"], "legacy_points": ["legacy_key"], "ham_bands": ["cable_id"]}


def read_table(wb, name):
    for ws in wb.worksheets:
        if name in ws.tables:
            rows = list(ws[ws.tables[name].ref])
            hdr = [c.value for c in rows[0]]
            data = [[c.value for c in r] for r in rows[1:]]
            return hdr, data
    raise KeyError(name)


def clean(v):
    if isinstance(v, str):
        if v.startswith("#"):
            raise ValueError(f"Excel hata değeri: {v}")
        return v if v != "" else None
    return v


def ham_bands(wb):
    ws = wb["Ham_Bands"]
    hdr = ["cable_id", "band", "freq_mhz", "att_db_100m", "att_db_100ft", "extrapolated"]
    out = []
    ncol_band = 12
    for r in range(6, ws.max_row + 1):
        cid = ws.cell(r, 1).value
        if not cid:
            continue
        fmin, fmax = ws.cell(r, 6).value, ws.cell(r, 7).value
        for k in range(ncol_band):
            v = ws.cell(r, 10 + k).value
            if not isinstance(v, (int, float)):
                continue
            f = ws.cell(5, 10 + k).value
            out.append([cid, ws.cell(4, 10 + k).value, f, v, v * 0.3048, int(f < fmin or f > fmax)])
    return hdr, out


def sql_type(values):
    vals = [v for v in values if v is not None]
    if vals and all(isinstance(v, bool) for v in vals):
        return "INTEGER"
    if vals and all(isinstance(v, int) and not isinstance(v, bool) for v in vals):
        return "INTEGER"
    if vals and all(isinstance(v, (int, float)) and not isinstance(v, bool) for v in vals):
        return "REAL"
    return "TEXT"


def fmt(v):
    if v is None:
        return ""
    if isinstance(v, bool):
        return "1" if v else "0"
    if isinstance(v, float):
        return format(v, ".10g")
    return str(v)


def main():
    sanitize(SRC)   # yerel klasör yolu ve kişi adı gibi üst verileri temizle (hücrelere dokunmaz)
    wb = openpyxl.load_workbook(SRC, data_only=True)
    os.makedirs(CSV_DIR, exist_ok=True)
    if os.path.exists(DB):
        os.remove(DB)
    con = sqlite3.connect(DB)
    con.execute("PRAGMA foreign_keys = ON")
    datasets = []
    for xl, sq, pk, drop in TABLES:
        hdr, data = read_table(wb, xl)
        keep = [i for i, h in enumerate(hdr) if h not in drop]
        hdr = [hdr[i] for i in keep]
        data = [[clean(r[i]) for i in keep] for r in data]
        datasets.append((sq, pk, hdr, data))
    hdr, data = ham_bands(wb)
    datasets.append(("ham_bands", None, hdr, data))
    # veri sözlüğü: tablo adlarını SQL adlarına çevir, çıkarılan yardımcı sütunları sil, ham_bands'i ekle
    dd = next(d for d in datasets if d[0] == "data_dictionary")
    xl_to_sql = {xl[3:].lower(): sq for xl, sq, _, _ in TABLES}   # "tblCables" -> "cables"
    dropped = {(sq, c) for _, sq, _, drop in TABLES for c in drop}
    rows = []
    for t, col, desc, unit, kind in dd[3]:
        t = xl_to_sql.get(t.lower(), t.lower())
        if (t, col) not in dropped:
            rows.append([t, col, desc, unit, kind])
    dd[3][:] = rows
    for col, desc, unit in (("cable_id", "cables.cable_id", ""), ("band", "Amatör bandı", ""), ("freq_mhz", "Bant temsil frekansı", "MHz"),
                            ("att_db_100m", "Zayıflama (log-log interpolasyon)", "dB/100m"), ("att_db_100ft", "Zayıflama", "dB/100ft"),
                            ("extrapolated", "1 = datasheet frekans aralığı dışında", "")):
        dd[3].append(["ham_bands", col, desc, unit, "formül"])

    order = ["sources", "cables", "attenuation", "power", "legacy_index", "legacy_points", "data_dictionary", "ham_bands"]
    datasets.sort(key=lambda d: order.index(d[0]))
    for sq, pk, hdr, data in datasets:
        cols = []
        for i, h in enumerate(hdr):
            t = sql_type([r[i] for r in data])
            cols.append(f'"{h}" {t}' + (" PRIMARY KEY" if h == pk else ""))
        for c, rt, rc in FOREIGN_KEYS.get(sq, []):
            cols.append(f'FOREIGN KEY("{c}") REFERENCES {rt}("{rc}")')
        con.execute(f'CREATE TABLE {sq} ({", ".join(cols)})')
        con.executemany(f'INSERT INTO {sq} VALUES ({",".join("?" * len(hdr))})',
                        [[int(v) if isinstance(v, bool) else v for v in r] for r in data])
        for c in INDEXES.get(sq, []):
            con.execute(f'CREATE INDEX ix_{sq}_{c} ON {sq}("{c}")')
        with open(os.path.join(CSV_DIR, f"{sq}.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f)
            w.writerow(hdr)
            for r in data:
                w.writerow([fmt(v) for v in r])
        print(f"{sq:16s} {len(data):5d} satır, {len(hdr):2d} sütun")
    con.commit()
    bad = con.execute("PRAGMA foreign_key_check").fetchall()
    assert not bad, bad
    con.execute("VACUUM")
    con.close()
    print("yazıldı:", DB)


if __name__ == "__main__":
    main()
