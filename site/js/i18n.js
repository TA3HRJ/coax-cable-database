// Arayüz metinleri (TR/EN). Varsayılan dil tarayıcı dili; seçim localStorage'da hatırlanır.

export const STRINGS = {
  tr: {
    app_title: "Koaksiyel Kablo Veritabanı",
    tab_popular: "Popüler", tab_calc: "Hesapla", tab_compare: "Karşılaştır", tab_all: "Tümü",
    theme_toggle: "Açık / koyu tema",
    loading: "Veri yükleniyor…",
    load_error: "Veri yüklenemedi. Sayfayı yenileyin.",
    pop_title: "Sık önerilen kablolar",
    pop_lead: "Amatör telsizcilikte en çok önerilen kablolar, çap sınıflarına göre. Bandı ve uzunluğu seçin; bütün kartlar anında güncellenir. Her değer bir üretici datasheet'ine dayanır.",
    band: "Bant", length: "Uzunluk", unit: "Birim",
    featured: "Öne çıkanlar", featured_note: "En sık önerilen sekiz kablo",
    standard: "standart", std_title: "Sınıfının standart RG tipi",
    per100m: "dB/100 m", per100ft: "dB/100 ft",
    line_loss: (L, db, pct) => `${L}: <b>${db} dB</b> kayıp · antene ulaşan: <b>%${pct}</b>`,
    no_data: "bu bantta veri yok",
    vf: "VF", peak: "tepe", uv: "UV", burial: "gömülebilir", bend: "bükülme",
    calc: "Hesapla", compare_add: "Karşılaştır", source: "Datasheet",
    ind_max: "maks", ind_max_title: "Üretici maksimum değer yayımlıyor; tipik değer genellikle daha düşüktür.",
    ind_est_title: "Datasheet frekans aralığı dışında: tahmini değer.",
    note_max: "Üretici bu kablo için tipik değil maksimum zayıflama yayımlıyor; tipik değer genellikle daha düşüktür. Diğer kablolarla yan yana gösterilir.",
    note_est: "Datasheet'in verdiği frekans aralığının dışında; komşu iki noktanın eğimiyle tahmin edildi.",
    note_basis: "Liste bir görüştür: forum ve satıcı önerilerinden derlendi, satış istatistiği değildir. Çubuk, aynı gruptaki en kayıplı kabloya göre ölçeklidir.",
    note_conn: "Konnektör ve ek kayıpları dahil değildir.",
    calc_title: "Kablo kaybı hesaplayıcı",
    calc_lead: "Kablo, frekans, uzunluk, güç ve antenin SWR'sini girin. Sonuç anında hesaplanır; adres çubuğundaki bağlantı bu ayarlarla paylaşılabilir.",
    cable: "Kablo", frequency: "Frekans", tx_power: "Verici çıkış gücü", load_swr: "Anten (yük) SWR",
    popular_group: "Sık önerilenler",
    power_at_antenna: "Antene ulaşan güç",
    of_power_lost: (w, db) => `Hatta kaybolan: ${w} W · toplam ${db} dB`,
    attenuation: "Zayıflama",
    matched_loss: (L) => `Hat kaybı, uyumlu yük (${L})`,
    swr_loss: "SWR kaynaklı ek kayıp", total_loss: "Toplam hat kaybı", swr_tx: "Verici ucundaki SWR",
    max_power: "Maks. ortalama güç (bu frekansta)", no_power_data: "datasheet vermiyor",
    wavelength: "Kablo içi dalga boyu λ", quarter_wave: "λ/4 fiziksel uzunluk", electrical_length: "Hattın elektriksel uzunluğu",
    no_vf: "VF yayımlanmamış",
    warn_power: (w) => `Verici gücü, kablonun bu frekanstaki ortalama güç sınırını (${w} W) aşıyor.`,
    warn_far: (f) => `Datasheet verisi ${f} MHz'e kadar; bu frekans çok uzakta, sonuç güvenilir değil.`,
    info_extrap: (a, b) => `Datasheet aralığı ${a}–${b} MHz; bu frekanstaki değer tahminidir.`,
    info_z: (z) => `Bu kablonun empedansı ${z} Ω; 50 Ω sistemde ek uyumsuzluk kaybı oluşur.`,
    alts_title: "Aynı koşulda aynı sınıf", alts_lead: "Aynı frekans, uzunluk, güç ve SWR ile; toplam kayba göre. Seçmek için tıklayın.",
    calc_note: "Toplam kayıp ARRL Antenna Book uyumsuz hat formülüyle hesaplanır: TL = 10·log10[(a² − |Γ|²) / (a·(1 − |Γ|²))], a = 10^(ML/10). Güç sınırı datasheet'in ortam sıcaklığı (çoğunlukla 40 °C) ve uyumlu yük içindir; SWR ve sıcaklık sınırı düşürür. Konnektör kayıpları dahil değildir.",
    soon_title: "Bu sayfa hazırlanıyor",
    soon_calc: "Hesaplayıcı bir sonraki sürümde gelecek.",
    soon_compare: "Karşılaştırma sayfası yakında. Seçtiğiniz kablolar hatırlanıyor:",
    soon_all: "Tüm kabloların aranabilir listesi yakında.",
    none_selected: "henüz kablo seçilmedi",
    foot: (v, n, s) => `Veri sürümü ${v} · ${n} kablo · ${s} kaynak belge`,
    foot_license: "Kod MIT · veri CC BY 4.0",
  },
  en: {
    app_title: "Coax Cable Database",
    tab_popular: "Popular", tab_calc: "Calculate", tab_compare: "Compare", tab_all: "All cables",
    theme_toggle: "Light / dark theme",
    loading: "Loading data…",
    load_error: "Could not load data. Please reload the page.",
    pop_title: "Frequently recommended cables",
    pop_lead: "The cables most often recommended in amateur radio, grouped by size class. Pick a band and a length; every card updates instantly. Every value comes from a manufacturer datasheet.",
    band: "Band", length: "Length", unit: "Unit",
    featured: "Featured", featured_note: "The eight most often recommended",
    standard: "standard", std_title: "The standard RG type of its class",
    per100m: "dB/100 m", per100ft: "dB/100 ft",
    line_loss: (L, db, pct) => `${L}: <b>${db} dB</b> loss · reaches the antenna: <b>${pct}%</b>`,
    no_data: "no data for this band",
    vf: "VF", peak: "peak", uv: "UV", burial: "burial", bend: "bend",
    calc: "Calculate", compare_add: "Compare", source: "Datasheet",
    ind_max: "max", ind_max_title: "The manufacturer publishes maximum values; typical loss is usually lower.",
    ind_est_title: "Outside the datasheet frequency range: estimated value.",
    note_max: "The manufacturer publishes maximum, not typical, attenuation for this cable; typical loss is usually lower. Shown side by side with the others.",
    note_est: "Outside the datasheet's frequency range; estimated from the slope of the two nearest points.",
    note_basis: "The list is an opinion compiled from forum and retailer recommendations, not sales statistics. Each bar is scaled to the lossiest cable in the same group.",
    note_conn: "Connector and splice losses are not included.",
    calc_title: "Feedline loss calculator",
    calc_lead: "Enter the cable, frequency, length, power and the antenna's SWR. Results update instantly; the link in the address bar shares these settings.",
    cable: "Cable", frequency: "Frequency", tx_power: "Transmitter power", load_swr: "Antenna (load) SWR",
    popular_group: "Frequently recommended",
    power_at_antenna: "Power at the antenna",
    of_power_lost: (w, db) => `Lost in the line: ${w} W · ${db} dB total`,
    attenuation: "Attenuation",
    matched_loss: (L) => `Matched line loss (${L})`,
    swr_loss: "Additional loss due to SWR", total_loss: "Total line loss", swr_tx: "SWR at the transmitter",
    max_power: "Max. average power (at this frequency)", no_power_data: "not published",
    wavelength: "Wavelength in the cable λ", quarter_wave: "λ/4 physical length", electrical_length: "Electrical length of the line",
    no_vf: "VF not published",
    warn_power: (w) => `Transmitter power exceeds the cable's average power rating at this frequency (${w} W).`,
    warn_far: (f) => `Datasheet data reach ${f} MHz; this frequency is far beyond, the result is not reliable.`,
    info_extrap: (a, b) => `Datasheet range ${a}–${b} MHz; the value at this frequency is estimated.`,
    info_z: (z) => `This cable is ${z} Ω; in a 50 Ω system there is additional mismatch loss.`,
    alts_title: "Same class, same conditions", alts_lead: "Same frequency, length, power and SWR, ranked by total loss. Click to select.",
    calc_note: "Total loss uses the ARRL Antenna Book mismatched-line formula: TL = 10·log10[(a² − |Γ|²) / (a·(1 − |Γ|²))], a = 10^(ML/10). Power ratings are for the datasheet's ambient temperature (mostly 40 °C) and a matched load; SWR and heat lower them. Connector losses are not included.",
    soon_title: "This page is in progress",
    soon_calc: "The calculator arrives in the next release.",
    soon_compare: "The comparison page is coming soon. Your selection is remembered:",
    soon_all: "A searchable list of all cables is coming soon.",
    none_selected: "no cables selected yet",
    foot: (v, n, s) => `Data version ${v} · ${n} cables · ${s} source documents`,
    foot_license: "Code MIT · data CC BY 4.0",
  },
};

export let lang = document.documentElement.lang === "en" ? "en" : "tr";

export function setLang(l) {
  lang = l === "en" ? "en" : "tr";
  document.documentElement.lang = lang;
  try { localStorage.setItem("lang", lang); } catch (e) { /* özel pencere */ }
}

export function t(key, ...args) {
  const s = STRINGS[lang][key] ?? STRINGS.tr[key] ?? key;
  return typeof s === "function" ? s(...args) : s;
}

/** Sayı biçimi: Türkçe virgül, İngilizce nokta. */
export function fmt(x, digits = 1) {
  if (x == null || !isFinite(x)) return "–";
  return new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US", {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(x);
}

/** data-i / data-i-title özniteliklerini doldur. */
export function applyStatic(root = document) {
  root.querySelectorAll("[data-i]").forEach((el) => { el.textContent = t(el.dataset.i); });
  root.querySelectorAll("[data-i-title]").forEach((el) => { el.title = t(el.dataset.iTitle); });
}
