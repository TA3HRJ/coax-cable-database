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
