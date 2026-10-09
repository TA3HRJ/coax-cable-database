# Devir notu

## 2026-10-09 — M2 tamam (site iskeleti + Popüler sayfası)

**Yapılanlar**
- Kullanıcı aprs-agent'ı referans gösterdi: site `site/` klasörüne taşındı (Pages kökü olacak; `docs/` notlar, yayımlanmaz),
  görsel dil aprs-agent'tan (Adwaita değişkenleri, alt çizgili sekmeler, 10px köşe) - ondan farklı olarak açık + koyu tema.
- `scripts/check_public_text.py` aprs-agent'tan uyarlandı (aynı özet listesi + bu projede görülen iki tanımlayıcı;
  xlsx içindeki XML ve sqlite metnini de tarıyor, xlsx absPath'i yakalıyor). CI'da çalışıyor.
- `site/`: `index.html` (tema/dil ilk çizimden önce), `css/app.css`, `js/i18n.js` (TR/EN, varsayılan tarayıcı dili),
  `js/app.js` (hash yönlendirme `#/sayfa?param`, `replaceState` ile paylaşılabilir URL, karşılaştırma seçimi localStorage),
  `js/pages/popular.js`, `js/pages/soon.js` (Hesapla/Karşılaştır/Tümü yer tutucu).
- Popüler: öne çıkan 8 + 6 sınıf; bant çipleri, uzunluk, m/ft; maks (`val=max`) ve tahmini (`~`) üst simgeleri + dipnot.
- Tarayıcıda denetlendi: konsol hatası yok, açık/koyu, EN, 375px mobil (taşma yok), 6 cm "veri yok" durumu.

**Sıradaki:** M3 Hesaplayıcı (`#/calc?c=ID&f=&L=&P=&s=`) - `coax.lineCalc` hazır ve Excel'e karşı test edili.

**Tuzaklar**
- Tarayıcı paneli gizliyken ekran görüntüsü boş gelir; ölçümleri JS ile al.
- Yerel sunucu: `python -m http.server 8766 --directory site` (kullanıcı da çalıştırıyor olabilir - port dolu hatası).
- Türkçe yüzde ekleri sayıya göre değişir (%36'sı/%57'si); metinler ekten bağımsız kuruldu ("antene ulaşan: %36").

## 2026-10-09 — M1 tamam (veri ekleri, site verisi, hesap çekirdeği, eşlik testi)

**Yapılanlar**
- Çağrı işareti TA3HX: ana dosya `TA3HX_Coax_Database.xlsx` (git mv), başlıklar ve S000 güncellendi.
- Lisans: kod MIT, veri CC BY 4.0.
- `Cables`'a web sütunları: `short_name`, `size_class` (od_mm'den), `popular_rank`, `standard_type`, `value_type`.
- `export_db.py` artık `docs/data/cables.min.json` (92 KB), `tests/fixtures/excel_calculator.json` ve
  `kaynaklar/README.md` de üretiyor.
- `docs/js/coax.js` + `tests/` (Node, tarayıcı, Python) + `.github/workflows/test.yml`. Tarayıcıda 6309 denetim geçti;
  bilerek bozulmuş hesapla (binde 1 / SWR yok sayma) test başarısız oluyor - test gerçekten ayırt ediyor.

**Sıradaki:** M2 - site iskeleti (gezinme, tema, dil = tarayıcı dili), Popüler sayfası. Maksimum değerler yan yana,
üst simge göstergesi + açıklamayla (PLAN §3).

**Açık kalanlar**
- Bu oturumda proje klasöründe `~$TA3HX_Coax_Database.xlsx` kilit dosyası görüldü, ardından kayboldu (Excel kapalıydı).
  Kullanıcı o arada Excel'de değişiklik kaydettiyse yeniden üretim onları ezmiş olabilir - kullanıcıya soruldu.
- Yerelde Node yok; Node testi yalnızca CI'da koşuyor, yerelde tarayıcı sayfası kullanıldı.
- "RG58 CellFoil (9006)" için kaynak yok; Birikim Kablo kataloğu indirilemedi.

**Tuzaklar**
- Kilit kontrolü komut zincirinde `;` ile yazılırsa iş durmaz - `&& exit 1` kullan.
- Yerel test sunucusu `.claude/launch.json` (gitignore'da): `repo-static`, port 8765, kök = repo.

## 2026-10-09 — Repo açıldı, web planı yazıldı

**Durum:** Veritabanı v1.0 tamam: 65 kablo, 1126 zayıflama ve 775 güç noktası, 54 kaynak. Excel, SQLite ve CSV güncel.
Web arayüzü için plan `docs/PLAN.md`'de; M1'e (veri ekleri + JSON + eşlik testi) başlanmadı.

**Açık kalanlar**
- PLAN.md'deki açık sorular kullanıcı onayı bekliyor: lisans, popüler liste, varsayılan dil, maksimum/tipik gösterimi.
- Çağrı işareti TA3HX'e geçmiş; dosya ve sayfa adlarında hâlâ TA3HRJ var. Yeniden adlandırma kullanıcıya soruldu.
- Kaynak bulunamayan tek eski tablo satırı: "RG58 CellFoil (9006)".
- Birikim Kablo RG 58 C/U kataloğu indirilemedi (sunucu HTML döndürüyor). Kullanıcı PDF'i sağlarsa eklenebilir.

**Tuzaklar**
- `build_database.py` xlsx'in üzerine yazar. Kullanıcı Excel'de düzenleme yapmış olabilir; önce tarih ve `~$` kilit kontrolü.
- openpyxl ile yazılan dosyada formül sonuçları yok; `export_db.py`'den önce Excel'de hesaplatıp kaydetmek şart.
- openpyxl Table: `_initialise_columns()` sonrası sütun adları başlık hücrelerinden ayrıca atanmazsa Excel dosyayı açmıyor.
- Excel `OR()` tüm argümanlarını değerlendirir; boş hücreyle aritmetik `#VALUE!` verir. İç içe `IF` kullan.
- M&P PDF'lerinde "10.000 MHz" binlik ayraçlıdır (`gen_points.num()` bunu ele alıyor). Bazı satırlar metinde iç içe
  geçmiş durumda (Ultraflex 10 7000/8000 MHz, Hyperflex 10 8000/9000 MHz); elle çözümlendi.
- Scratchpad'deki yardımcı betik adları stdlib modüllerini gölgelememeli (ör. `bisect.py` openpyxl'i bozdu).
