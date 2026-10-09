# Devir notu

## 2026-10-09 — M5 tamam: site yayında (https://ta3hrj.github.io/coax-cable-database/)

- PWA: `site/manifest.json`, `site/sw.js` (ağ öncelikli + önbellek yedekli, kurulumda 19 dosya önbelleğe), PNG simgeler
  (`scripts/make_icons.py`, maskable dahil), içeriğe geç bağlantısı (JS ile; `#view` hash yönlendirmeyi bozardı),
  rota değişince odak `main`'e, noscript.
- Test: `sw.js` PRECACHE listesi `site/` altındaki her js/css/json/html dosyasını kapsamalı (yeni sayfa eklerken unutma).
- Kullanıcı onayıyla Pages açıldı (`build_type=workflow`); `.github/workflows/pages.yml` yalnızca `site/`'ı yayımlar,
  yayından önce testler + public-text çalışır. Repo homepage ayarlandı. `docs/` yayında 404 (doğrulandı).
- Yayında doğrulandı: service worker `activated`, önbellek 19 dosya, tüm rotalar çalışıyor, konsol hatası yok.

**Tuzaklar**
- Uygulamanın gömülü tarayıcısında `localhost` üzerinde service worker kaydı "unknown error" ile başarısız olur
  (ortam kısıtı); mantık sayfa içinde sahte `self` ile, gerçek kayıt yayındaki HTTPS sitede doğrulandı.
- `sw.js` önbellek sürümü `CACHE_VERSION`; PRECACHE yapısı değişirse artır.

**M6 tamam:** `.github/ISSUE_TEMPLATE/` (data-correction, new-cable, config; etiketler `data`, `new cable`); yöntem sayfasında issue bağlantısı, kablo sayfasında kabloyu önceden dolduran "hatalı değer bildir" bağlantısı (SW cache v2); profil README (TA3HRJ/TA3HRJ) Projects tablosuna satır eklendi. Planlanmış iş kalmadı.

## 2026-10-09 — M4 tamam (Karşılaştır, Tümü, Kablo detayı, Yöntem)

- `site/js/chart.js`: kütüphanesiz log-log SVG grafik; dataviz referans paletinin 8 kategorik slotu (açık/koyu ayrı,
  `--series-N`), seri başına kesik çizgi deseni, ≥2 seride açıklama, ≤4 seride doğrudan etiket (çakışma önleyici),
  gezinmede dikey çizgi + değer kutusu.
- `#/compare?c=ID,ID&f=&L=&P=&s=` (en fazla 8; URL'deki seçim `ctx.setCmp` ile Popüler seçimine yazılır),
  `#/all?q=&z=&cls=&m=&f=&sort=&dir=`, `#/cable/ID` (bantlar, eğri + datasheet noktaları, özellikler, nokta tabloları,
  kaynaklar, benzerler), `#/method` (yöntem, değer türleri, 58 kaynak, lisans). `util.js` ortak yardımcılar.
- Yüzde biçimi `fmtPct` (TR "%55", EN "55%"). Popüler kart başlığı detaya bağlı.
- Tarayıcıda: konsol hatası yok; tüm sayfalar 375px'te taşmasız; grafik etiketleri çakışmasız.

**Tuzaklar**
- Grafik DOM'a eklenmeden kurulur: `getBBox()` sıfır döner - etiket kutusu yazı uzunluğundan tahmin ediliyor.
- Mobil tek sütun grid'de `1fr` yerine `minmax(0,1fr)` (yoksa içerik taşırır).
- Pencere küçültülmüşken ekran görüntüsü zaman aşımına uğrar; ölçümler JS ile.

**Sıradaki:** M5 - PWA (service worker + manifest + ikonlar; önbellek sürümleme modül önbelleği sorununu da çözer),
erişilebilirlik cilası, GitHub Pages (site/ için Actions ile yayın) ve repo homepage. Pages açmak kullanıcı onayı ister.

## 2026-10-09 — Bükülme yarıçapı gösterimi düzeltildi (kullanıcı bildirimi)

- Kullanıcı LMR-400'ün bükülmesinin (25 mm) kalınlığına göre düşük göründüğünü bildirdi. Veri kaynakla aynıydı; sorun
  gösterimdi: kartta tek seferlik/kurulum değeri "bükülme" etiketiyle gösteriliyordu.
- Kart artık: tekrarlı değer varsa "tekrarlı bükülme"; yoksa Times için "tek sefer bükülme" (kurulum), diğerleri için
  "en küçük bükülme" (üretici tür belirtmiyor; Belden "Installation Min." ~10×OD). İpucu metinleri var.
- LMR-195/200/500/600 tekrarlı değerleri model datasheet'lerinden eklendi (S054–S057; kurulum değerinin 4 katı).
  LMR-100A/300/900 datasheet'leri Fairview'da yok (404) - kurulum değeri ve notla kaldı.
- Yeniden üretimden önce artık: `~$` kilidi VE `git diff --quiet -- TA3HX_Coax_Database.xlsx` (kullanıcı değişikliği yok) kontrolü;
  ikisinden biri tutmazsa komut duruyor.
- Tuzak: python http.server ile tarayıcı ES modüllerini önbellekte tutuyor; değişiklik sonrası `fetch(f,{cache:'reload'})`
  ile yenile. Yayında sürüm/önbellek stratejisi M5'te (service worker) ele alınmalı.

## 2026-10-09 — M3 tamam (Hesaplayıcı)

- `site/js/pages/calc.js`, route `#/calc?c=&f=&L=&u=ft&P=&s=` (varsayılan LMR-400, 145 MHz, 20 m, 100 W, SWR 1).
- Çıktılar `coax.lineCalc`'tan: antene ulaşan güç (öne çıkan), zayıflama, uyumlu/SWR/toplam kayıp, verici SWR, güç sınırı,
  λ, λ/4, elektriksel uzunluk; uyarılar: güç sınırı aşımı, veri aralığının 2 katı ötesi, tahmini değer, maks değer, Z0≠50.
- "Aynı koşulda aynı sınıf" listesi (aynı sınıf + empedans, toplam kayba göre; tıklayınca seçer).
- Tarayıcıda Excel varsayılan girdileriyle birebir doğrulandı (78,8 W · 1,03 dB · SWR 1,38 · 1496 W · λ 1,757 m) ve
  beş uç durum denendi. 1280 px yan yana, 375 px alt alta, taşma yok.
- Sıradaki: M4. Popüler kartlarındaki "Karşılaştır" seçimi `localStorage.cmp`'de duruyor.

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
