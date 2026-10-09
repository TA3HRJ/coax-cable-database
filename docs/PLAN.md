# Web arayüzü planı

Durum: M1–M5 tamam, site yayında: https://ta3hrj.github.io/coax-cable-database/ · sıradaki M6 (geri bildirim yolu) · 2026-10-09
Hedef: veritabanını sade, hızlı ve anlaşılır bir web sitesine dönüştürmek. Site, telsizcinin
"hangi kabloyu almalıyım, şu uzunlukta ne kadar kaybederim?" sorusuna birkaç tıkla cevap vermeli.

---

## 1. Teknik yaklaşım

Diğer repolarla (ör. `turkey-repeaters`) aynı düzen:

- **Statik site, GitHub Pages, kök `site/`** (aprs-agent düzeni: site ayrı klasörde, `docs/` yalnızca çalışma notları ve yayımlanmaz). Sunucu yok, giriş yok, derleme adımı yok. Vanilla HTML/CSS/JS
  (gerekirse tek dosya `docs/index.html` + küçük modüller).
- **Veri:** `scripts/export_db.py` ek olarak `docs/data/cables.min.json` üretir. Site yalnızca bunu yükler
  (tahmini 150–250 KB, gzip ile ~40 KB).
- **Hesap:** Excel ile birebir aynı log-log interpolasyon JS'te. ARRL SWR formülü ve güç sınırı da aynı.
- **Grafik:** log-log eksenli zayıflama eğrileri için hafif bir kütüphane (uPlot, ~45 KB) ya da elle SVG.
  Harici kütüphane gerekirse sabit sürümle CDN'den, yoksa repoya gömülü.
- **PWA:** service worker ile çevrimdışı çalışma (sahada, antende internet yokken de kullanılabilsin).
- **TR / EN** dil düğmesi; **varsayılan dil tarayıcı dili** (tr* → Türkçe, diğerleri İngilizce, seçim hatırlanır), **koyu mod** (sistemi izler, elle değiştirilebilir), **paylaşılabilir URL**
  (`?c=TMS-LMR400,BEL-8267&f=145&L=20`).
- **Birim düğmesi:** dB/100 m ↔ dB/100 ft, m ↔ ft.

## 2. Sayfalar

| Sayfa | Amaç | İçerik |
|---|---|---|
| **Ana sayfa: Popüler kablolar** (ara sayfa) | Çoğu kullanıcının ilk ve çoğu zaman tek durağı | Sınıflara ayrılmış ~25 kablo kartı, bant seçici, "bunu hesapla / karşılaştır" kısayolları |
| **Hesaplayıcı** | Tek kablo, tek hat | Kablo, frekans (bant çipleri + serbest giriş), uzunluk, güç, SWR → kayıp, antene ulaşan güç, verim, verici ucu SWR, güç sınırı, λ/4 boyu |
| **Karşılaştır** | 2–6 kablo yan yana | Log-log grafik, seçili frekans ve uzunlukta tablo, "fark kaç dB / kaç W" |
| **Tüm kablolar** | Katalog | Aranabilir ve süzülebilir tablo: empedans, çap sınıfı, üretici, kılıf, gömülebilirlik; sütun seçimi |
| **Kablo detayı** | Tek kablonun her şeyi | Özellikler, eğri, datasheet noktaları + **kaynak bağlantıları**, QA sapması, notlar, benzer kablolar |
| **Yöntem ve kaynaklar** | Güven | Hesap yöntemi, değer türleri (nominal/maksimum), kaynak listesi, eski tablo karşılaştırması, katkı yolu |

Gezinme: üstte 4 sekme (Popüler · Hesapla · Karşılaştır · Tümü). Detay ve yöntem sayfalarına bağlantılardan gidilir.

## 3. Popüler kablolar ara sayfası

### Seçim ölçütü

Bu konuda yayımlanmış bir anket ya da satış istatistiği bulunamadı. Liste şu kaynaklardaki tekrar eden
önerilerden derlendi:
- ABD forumları (worldwidedx, HF Underground) ve eğitim siteleri (Ham Radio School);
- Avrupa satıcı vitrinleri (WiMo, PCS, koax24);
- yerli bulunabilirlik.

Tablolardaki **10 m, 2 m ve 70 cm** sütunları her bandın temsil frekansındaki (10 m ≈ 28, 2 m ≈ 144, 70 cm ≈ 432 MHz)
zayıflamadır (dB/100 m).

Liste bir **görüş** olarak sunulmalı ("sık önerilenler"). Kalite sıralaması gibi gösterilmemeli. Sıralama veride
`popular_rank` sütunuyla tutulur ve kolayca değiştirilebilir.

### Sınıflar (çap sınıfı = pratikte aynı konnektör ve kullanım)

Her sınıfta önce **standart RG tipi**, ardından **düşük kayıplı alternatifler** gösterilir. Böylece kullanıcı "RG-58 yerine
ne alabilirim?" sorusunun cevabını aynı satırda görür.

**Öne çıkanlar (ilk ekran, 8 kart):** RG-58 · RG-8X · RG-213 · LMR-400 · H155 · Aircell 7 · Ecoflex 10 · 1/2" HELIAX (LDF4-50A)

| Sınıf | Tipik kullanım | Standart | Düşük kayıplı alternatifler |
|---|---|---|---|
| İnce / ara kablo (2.5–2.8 mm) | Cihaz içi, SDR, kısa ara kablolar | RG-316 (BEL-84316), RG-174 (BEL-8216) | — |
| RG-58 sınıfı (~5 mm) | Mobil, kısa hatlar, el telsizi | RG-58 (BEL-8259) | H155, Aircell 5, Airborne 5, LMR-200, Reçber RWC 200 |
| RG-8X sınıfı (~6 mm) | Kısa baz hatları, taşınabilir | RG-8X (BEL-9258) | LMR-240, Reçber RWC 240 |
| 7 mm | Rotor döngüsü, esneklik gereken yerler | — | Aircell 7, Ultraflex 7 |
| RG-213 sınıfı (~10 mm) | HF baz, yüksek güç, VHF/UHF baz | RG-213 (BEL-8267) | LMR-400, Ecoflex 10, H2000 Flex, Hyperflex 10, Airborne 10, Reçber RWC 400, Westflex 103 |
| 1/2" ve üstü (12.7–28 mm) | Uzun VHF/UHF/SHF hatları, kule | — | Ecoflex 15, LMR-600, Hyperflex 13, LDF4-50A (1/2"), LDF5-50A (7/8") |

Veritabanındaki güncel değerler (dB/100 m), kartlarda gösterilecek bilgiye örnek:

| Kablo | Çap | 10 m | 2 m | 70 cm |
|---|---|---|---|---|
| RG-58 (Belden 8259) | 4.9 | 8.8 | 21.9 | 42.7 |
| H155 | 5.4 | 5.3 | 10.8 | 18.8 |
| RG-8X (Belden 9258) | 6.15 | 5.1 | 12.4 | 22.6 |
| LMR-240 | 6.1 | 4.1 | 9.6 | 17.0 |
| Aircell 7 | 7.3 | 3.5 | 7.6 | 13.6 |
| RG-213 (Belden 8267) | 10.3 | 3.1 | 7.5 | 14.3 |
| LMR-400 | 10.29 | 2.2 | 4.8 | 8.7 |
| Ecoflex 10 | 10.2 | 2.1 | 4.9 | 8.9 |
| H2000 Flex | 10.3 | 2.0 | 4.8 | 8.5 |
| Ecoflex 15 | 14.6 | 1.5 | 3.4 | 6.1 |
| LDF4-50A (1/2") | 15.9 | 1.1 | 2.6 | 4.6 |

### Kart tasarımı

```
┌─────────────────────────────────────┐
│ RG-213 sınıfı · 10.3 mm             │
│ Times Microwave LMR-400             │
│                                     │
│  2 m   4.8 dB/100m   ▓▓▓░░░░░░      │  ← seçili banda göre çubuk (sınıf içi kıyas)
│  20 m uzunlukta: 0.97 dB · %80 güç   │  ← üstteki uzunluk kaydırıcısına bağlı
│                                     │
│ VF 0.85 · tepe 16 kW · UV · 25 mm   │
│ [Hesapla] [Karşılaştır +]  Kaynak ↗  │
└─────────────────────────────────────┘
```

- Sayfanın üstünde **bant çipleri** (160 m … 6 cm) ve bir **uzunluk kaydırıcısı** bulunur. Tüm kartlar anında güncellenir;
  "20 m RG-58 ile 2 m'de vericinin yarısını kaybediyorum" bilgisi hesap yapmadan görülür.
- Maksimum değer yayımlayan kablolar (`val = "max"`: Reçber, Ericsson) diğerleriyle **yan yana** gösterilir; değerin yanında
  bir **üst simge göstergesi** (ör. 8.8<sup>maks</sup> ya da 8.8<sup>†</sup>) bulunur. Üzerine gelince/dokununca ve sayfa altındaki
  dipnotta açıklama çıkar: "Üretici maksimum değer yayımlıyor; tipik değer genellikle daha düşüktür."
  Veri aralığı dışındaki (tahmini) değerler de aynı yöntemle ayrı bir üst simgeyle (<sup>~</sup>) işaretlenir.
- 75/93 Ω kablolar bu sayfada gösterilmez; yalnızca "Tümü" sayfasında, süzgeçle görünür.

## 4. Arayüz ilkeleri (sade ve şık)

- Tek vurgu rengi, bol boşluk, sistem fontu, rakamlar için tabular-nums. Tablo yerine önce kart ve çubuk; tablo "Tümü"de.
- Önce mobil: kartlar tek sütun, hesaplayıcı tek ekranda. Masaüstünde 3–4 sütun.
- Her sayı birimiyle birlikte gösterilir; uzun ondalık yok (dB 1 basamak, W tam sayı).
- Kaynak her zaman bir tık uzakta: her değerin yanında "↗ datasheet".
- Erişilebilirlik: klavye ile gezinme, renk körlüğüne uygun palet, grafikte renk yanında çizgi stili.

## 5. Veri tarafında gerekenler (M1 - tamam)

1. `Cables` tablosuna yeni sütunlar (eklendi: `short_name`, `size_class`, `popular_rank`, `standard_type`, `value_type`;
   sınıf kullanım metinleri `classes` içinde): `size_class` (yukarıdaki sınıflar), `popular_rank` (boş = popüler değil),
   `use_case` (kısa TR/EN metin), `name_en` / kısa ad (kart başlığı için, ör. "LMR-400").
2. `scripts/export_db.py` → `docs/data/cables.min.json`: kablolar, frekansa göre sıralı noktalar, güç noktaları,
   kaynak başlık ve adresleri. Kısa anahtarlar, gereksiz QA sütunları yok.
3. **Eşlik testi:** JS interpolasyonu, birkaç yüz (kablo, frekans) çifti için SQLite `ham_bands` ve Excel ile
   aynı sonucu vermeli. Bu, `tests/` altında Node ya da Python ile yazılır.
4. Marka: site ve dosya adlarında çağrı işareti **TA3HX** (yapıldı; repo adresi GitHub hesabı nedeniyle TA3HRJ/...).
5. Hesap çekirdeği `docs/js/coax.js` (DOM'suz ES modülü): interpolasyon, SWR'li kayıp, güç sınırı, dalga boyu.
   Eşlik testi 6309 denetimle Excel'e karşı geçiyor; bozulmuş hesapla denendi, hatayı yakalıyor.

## 6. Aşamalar

| # | İş | Çıktı |
|---|---|---|
| M0 | Repo, yapı, plan | Bu belge (tamam) |
| M1 | Veri ekleri + `cables.min.json` + eşlik testi | `docs/data/`, `docs/js/coax.js`, `tests/`, CI (tamam) |
| M2 | Site iskeleti, gezinme, tema, dil, **Popüler** sayfası | `site/` (tamam; Pages henüz açılmadı) |
| M3 | **Hesaplayıcı** (+ paylaşılabilir URL) | `site/js/pages/calc.js` (tamam) |
| M4 | **Karşılaştır**, **Tümü**, **Kablo detayı**, **Yöntem** | `site/js/pages/*.js`, `site/js/chart.js` (tamam) |
| M5 | PWA, erişilebilirlik ve mobil cilası, GitHub Pages'i aç, repo homepage | `ta3hrj.github.io/coax-cable-database` (tamam) |
| M6 | Geri bildirim yolu: hatalı veri ve yeni kablo için issue şablonu | `.github/ISSUE_TEMPLATE/` |

Her aşama ayrı commit/PR; M2 sonrası site kullanılabilir durumda olur.

## 7. Kararlar (2026-10-09)

1. **Lisans:** kod MIT, veri CC BY 4.0 (`LICENSE`, `LICENSE-DATA.md`).
2. **Popüler listesi:** önerildiği gibi (§3); `scripts/cables_extra.py` → `POPULAR`.
3. **Varsayılan dil:** tarayıcı dili.
4. **Maksimum değerler:** yan yana, üst simge göstergesi + açıklama (§3 kart tasarımı).
5. **Çağrı işareti:** TA3HX.

## 8. Riskler

- Bazı kaynaklar eski ya da distribütör kopyası. Sitede `sources.host` ve tarih açıkça gösterilmeli.
- Popülerlik listesi öznel. Sitede "sık önerilenler" diye adlandırılmalı ve geri bildirime açık olmalı.
- Excel ile site arasında sapma olabilir. Bunu eşlik testi (M1) önler.
