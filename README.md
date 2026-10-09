# Coax Cable Database

A referenced, formula-driven attenuation and specification database for 65 coaxial cables used in amateur radio —
every value traced to a manufacturer datasheet.
A web interface is planned (see [docs/PLAN.md](docs/PLAN.md)).

---

## What's inside

- **65 cables** — RG types (Belden MIL/RG series), Times Microwave LMR (Amphenol), Messi & Paoloni, SSB-Electronic
  (Ecoflex, Aircell), Belden H155/H1000/H2000 Flex, CommScope/Andrew HELIAX, RFS CELLFLEX, Reçber (Turkey),
  Westflex, Ericsson and 75/93 Ω types
- **1126 attenuation points** and **775 power-handling points**, each stored exactly as published (value + unit)
  and linked to one of **54 source documents** (title, revision, date, URL, access date)
- Electrical, mechanical and suitability parameters: velocity factor, capacitance, DC resistance, screening,
  peak power, voltage, bend radius, weight, temperature, jacket, burial/UV, connectors
- Attenuation at any frequency by **log-log interpolation** between datasheet points (exact at published
  frequencies); a fitted `k0 + k1·√f + k2·f` model is kept only as a data-entry QA check
- Comparison with the original hand-made chart (`Legacy_*` sheets), including the discrepancies it revealed

## Files

```
TA3HRJ_Coax_Database.xlsx       # master workbook (Excel) - Ham_Bands, Calculator, Graph, data tables
export/
├── coax.sqlite                 # SQLite with foreign keys
├── csv/*.csv                   # UTF-8, comma separated, decimal point
└── README.md                   # schema, example queries, interpolation snippet
scripts/
├── build_database.py           # generates the workbook from the data modules
├── cables_extra.py             # cable records, sources, manually entered points
├── gen_points.py               # extracts points from datasheet PDFs -> points_extra.py
├── points_extra.py             # generated - do not edit
├── export_db.py                # workbook -> export/ (CSV + SQLite); cleans file metadata first
└── sanitize_xlsx.py            # strips local paths / author names from .xlsx metadata
kaynaklar/                      # source index (README.md); datasheet PDFs are not redistributed
docs/                           # plan and handoff notes; future GitHub Pages root
data/legacy/                    # the original hand-made chart (metadata-cleaned copy)
```

## Quick start

```bash
pip install openpyxl pdfplumber
python -X utf8 scripts/build_database.py   # writes TA3HRJ_Coax_Database.xlsx
```

Open the workbook in Excel once and save it so formula results are cached, then:

```bash
python -X utf8 scripts/export_db.py        # refreshes export/coax.sqlite and export/csv/
```

`gen_points.py` needs the datasheet PDFs in `kaynaklar/`; download them from the URLs in
[kaynaklar/README.md](kaynaklar/README.md). The generated `points_extra.py` is committed, so building the
workbook does not require the PDFs.

## Data caveats

- Values are as published: most are nominal/typical, Reçber and Ericsson publish **maximum** values,
  Belden H155/H1000 maxima are nominal +10 %. See `cables.notes` and `sources.notes`.
- Some sources are older datasheets (e.g. Andrew HELIAX 2002–2007, SSB 2009–2010); current SSB values for
  Ecoflex 10, Aircell 7 and Aircell 5 are about 5 % lower.
- Connector and splice losses are not included.

---

## Türkçe özet

Amatör telsizcilikte kullanılan 65 koaksiyel kablonun zayıflama, güç ve yapı verileri; her değer bir üretici
belgesine bağlı. Ana dosya `TA3HRJ_Coax_Database.xlsx` (Ham_Bands, Hesaplayıcı, Grafik ve veri tabloları),
program için `export/coax.sqlite` ve `export/csv/`. Hesap yöntemi: datasheet noktaları arasında log-log
interpolasyon. Web arayüzü planı: [docs/PLAN.md](docs/PLAN.md).
