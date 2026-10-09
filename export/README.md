# TA3HX Koaksiyel Kablo Veritabanı — dışa aktarım

`TA3HX_Coax_Database.xlsx` dosyasından `scripts/export_db.py` ile üretilir. Elle düzenlemeyin, Excel'i düzenleyip yeniden üretin:

```
python -X utf8 scripts/export_db.py
```

- `coax.sqlite` — SQLite 3, yabancı anahtarlar tanımlı
- `csv/*.csv` — UTF-8 (BOM yok), virgül ayraçlı, ondalık ayracı nokta. Türkçe Excel'de açarken *Veri > Metinden/CSV'den* kullanın.

## Tablolar

| Tablo | Anahtar | İçerik |
|---|---|---|
| `sources` | `source_id` | Kaynak belgeler (URL, revizyon, erişim tarihi, `kaynaklar/` içindeki kopya) |
| `cables` | `cable_id` | Kablo ana bilgileri: elektriksel, mekanik, uygunluk + QA katsayıları (`k0_fit`, `k1_fit`, `k2_fit`, dB/100 m) |
| `attenuation` | `point_id` | Datasheet zayıflama noktaları: `value` + `unit` datasheet'te yazdığı gibi, `att_db_100m` dönüştürülmüş |
| `power` | `power_id` | Ortalama (CW) güç noktaları: `value` + `unit` olduğu gibi, `power_w` dönüştürülmüş |
| `ham_bands` | — | 12 amatör bandında hesaplanmış zayıflama; `extrapolated = 1` ise datasheet aralığı dışında |
| `legacy_index` | `legacy_key` | Eski elle hazırlanmış tablonun satırları ve `cable_id` eşlemesi |
| `legacy_points` | — | Eski tablodaki bant değerleri ile yeni değerlerin karşılaştırması |
| `data_dictionary` | — | Sütunların Türkçe açıklaması ve birimi |

İlişkiler: `attenuation.cable_id`, `power.cable_id`, `ham_bands.cable_id` → `cables`; `*.source_id` → `sources`.

## Herhangi bir frekansta zayıflama

Çalışma kitabıyla aynı yöntem: bir kablonun `attenuation` noktaları frekansa göre sıralanır, hedef frekansın iki yanındaki noktalar arasında ln(α)–ln(f) düzleminde doğrusal interpolasyon yapılır. Aralık dışındaysa uçtaki iki noktanın eğimi kullanılır.

```python
import math, sqlite3
con = sqlite3.connect("coax.sqlite")

def attenuation_db_100m(cable_id, f_mhz):
    pts = con.execute("SELECT freq_mhz, att_db_100m FROM attenuation WHERE cable_id=? ORDER BY freq_mhz",
                      (cable_id,)).fetchall()
    i = max(0, min(len(pts) - 2, sum(1 for f, _ in pts if f <= f_mhz) - 1))
    (f0, a0), (f1, a1) = pts[i], pts[i + 1]
    return math.exp(math.log(a0) + math.log(a1 / a0) * math.log(f_mhz / f0) / math.log(f1 / f0))

print(attenuation_db_100m("TMS-LMR400", 145))   # ≈ 4.84 dB/100 m
```

## Örnek sorgular

```sql
-- 2 m bandında en az kayıplı 50 Ω kablolar
SELECT c.display_name, h.att_db_100m
FROM ham_bands h JOIN cables c USING (cable_id)
WHERE h.band = '2 m' AND c.impedance_ohm = 50
ORDER BY h.att_db_100m;

-- Bir kablonun tüm noktaları ve kaynak belgeleri
SELECT a.freq_mhz, a.value, a.unit, s.publisher, s.document_title, s.url
FROM attenuation a JOIN sources s USING (source_id)
WHERE a.cable_id = 'MP-HYPERFLEX10' ORDER BY a.freq_mhz;
```

Not: Değer türü üreticiye göre değişir (nominal/tipik/maksimum). Ayrıntı `cables.notes` ve `sources.notes` sütunlarında.
