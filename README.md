# Coax Cable Database

A referenced, formula-driven attenuation and specification database for 65 coaxial cables used in amateur radio —
every value traced to a manufacturer datasheet.
Live site: **https://coax.aprsagent.com/**

---

## Web site

- **Popular** — the most often recommended cables by size class; pick a band and a length, every card updates
- **Calculate** — loss, power at the antenna, SWR at the transmitter, power rating and wavelength for any cable,
  frequency, length, power and antenna SWR; the link in the address bar shares the settings
- **Compare** — up to 8 cables on one log-log chart plus a table at your frequency, length, power and SWR
- **All cables** — searchable, filterable, sortable catalogue; each cable has a details page with its datasheet
  points and sources
- TR / EN (follows the browser language); light theme by default, dark one click away and remembered, as on every
  aprsagent.com site; installable, works offline after the first visit
- No backend, no login; served from `site/` by GitHub Pages. The calculation is tested against the Excel workbook
  on every push

---

## What's inside

- **65 cables** — RG types (Belden MIL/RG series), Times Microwave LMR (Amphenol), Messi & Paoloni, SSB-Electronic
  (Ecoflex, Aircell), Belden H155/H1000/H2000 Flex, CommScope/Andrew HELIAX, RFS CELLFLEX, Reçber (Turkey),
  Westflex, Ericsson and 75/93 Ω types
- **1126 attenuation points** and **775 power-handling points**, each stored exactly as published (value + unit)
  and linked to its source document - **58 sources** in all (title, revision, date, URL, access date)
- Electrical, mechanical and suitability parameters: velocity factor, capacitance, DC resistance, screening,
  peak power, voltage, bend radius, weight, temperature, jacket, burial/UV, connectors
- Attenuation at any frequency by **log-log interpolation** between datasheet points (exact at published
  frequencies); a fitted `k0 + k1·√f + k2·f` model is kept only as a data-entry QA check
- Comparison with the original hand-made chart (`Legacy_*` sheets), including the discrepancies it revealed

## Files

```
TA3HX_Coax_Database.xlsx       # master workbook (Excel) - Ham_Bands, Calculator, Graph, data tables
site/                           # static web site (published to GitHub Pages)
├── data/cables.min.json        # compact data the site loads (generated)
├── js/coax.js                  # calculation core (same method as the workbook, no DOM)
docs/
└── PLAN.md                     # web interface plan
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
tests/                          # parity tests: JS and Python vs. Excel-calculated results
kaynaklar/                      # source index (README.md); datasheet PDFs are not redistributed
data/legacy/                    # the original hand-made chart (metadata-cleaned copy)
```

## Quick start

```bash
pip install openpyxl pdfplumber
python -X utf8 scripts/build_database.py   # writes TA3HX_Coax_Database.xlsx
```

Open the workbook in Excel once and save it so formula results are cached, then:

```bash
python -X utf8 scripts/export_db.py        # refreshes export/, site/data/, test fixture, source index
```

`gen_points.py` needs the datasheet PDFs in `kaynaklar/`; download them from the URLs in
[kaynaklar/README.md](kaynaklar/README.md). The generated `points_extra.py` is committed, so building the
workbook does not require the PDFs.

## Tests

```bash
python -m unittest discover -s tests   # data consistency + Python interpolation vs. Excel
node --test tests/                     # site/js/coax.js vs. Excel (Ham_Bands, Calculator, all cables)
```

Without Node, serve the repo root (`python -m http.server`) and open `/tests/parity.html`. Both run on every push
(GitHub Actions).

## Data caveats

- Values are as published: most are nominal/typical, Reçber and Ericsson publish **maximum** values,
  Belden H155/H1000 maxima are nominal +10 %. See `cables.notes` and `sources.notes`.
- Some sources are older datasheets (e.g. Andrew HELIAX 2002–2007, SSB 2009–2010); current SSB values for
  Ecoflex 10, Aircell 7 and Aircell 5 are about 5 % lower.
- Connector and splice losses are not included.

## Trademarks and disclaimer

LMR® and Times Microwave Systems® are registered trademarks of Times Microwave Systems; HELIAX® and CommScope® of
CommScope, Inc.; CELLFLEX® of Radio Frequency Systems; Ecoflex® and Aircell® of SSB-Electronic GmbH; Duofoil® and
Duobond® of Belden Inc.; Messi & Paoloni® of Messi & Paoloni S.r.l.; Fairview Microwave® of Infinite Electronics,
Inc. Other brand and product names (Belden, Amphenol, Andrew, RFS, Ericsson, Reçber, Westflex, Hyperflex, Ultraflex,
Airborne, H155, H1000, H2000, Bury-Flex …) may be trademarks or registered trademarks of their owners. Names are used
only to identify products. This project is not affiliated with, endorsed or sponsored by any manufacturer.

The data is compiled from manufacturers' published documents and provided **as is**, without warranty of accuracy,
completeness or fitness for a particular purpose. Check the current datasheet with the manufacturer before choosing
or buying a cable. The calculations are an idealised model (no connector loss, installation, ageing or water
ingress). The cable drawings on the site are representative, not product photos.

## License

Code: MIT ([LICENSE](LICENSE)). Compiled data: CC BY 4.0 ([LICENSE-DATA.md](LICENSE-DATA.md)) — manufacturer
datasheets remain their owners' and are not redistributed.

---

## Türkçe özet

Amatör telsizcilikte kullanılan 65 koaksiyel kablonun zayıflama, güç ve yapı verileri; her değer bir üretici
belgesine bağlı. Ana dosya `TA3HX_Coax_Database.xlsx` (Ham_Bands, Hesaplayıcı, Grafik ve veri tabloları),
program için `export/coax.sqlite` ve `export/csv/`. Hesap yöntemi: datasheet noktaları arasında log-log
interpolasyon. Web arayüzü planı: [docs/PLAN.md](docs/PLAN.md).

Marka ve ürün adları sahiplerinin (tescilli) ticari markalarıdır ve yalnızca ürünü tanımlamak için kullanılır; proje
hiçbir üreticiyle bağlantılı değildir. Veriler "olduğu gibi" sunulur, garanti verilmez; seçimden önce güncel
datasheet'i üreticiden doğrulayın.
