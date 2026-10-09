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
    vf: "VF", peak: "tepe", uv: "UV", burial: "gömülebilir",
    bend_rep: "tekrarlı bükülme", bend_once: "tek sefer bükülme", bend_min: "en küçük bükülme",
    bend_min_title: "Üretici tek bir en küçük bükülme yarıçapı veriyor; tek sefer / tekrarlı ayrımı yapmıyor.",
    bend_rep_title: "Kablo defalarca bükülecekse (ör. rotor döngüsü) en küçük yarıçap.",
    bend_once_title: "Kablo bir kez bükülüp sabitlenecekse en küçük yarıçap. Tekrarlı bükülme için üretici değer vermemiş; genellikle bunun birkaç katıdır.",
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
    cmp_title: "Kablo karşılaştırma",
    cmp_lead: "En fazla 8 kablo seçin. Grafik tüm frekanslarda zayıflamayı, tablo seçtiğiniz frekans, uzunluk, güç ve SWR'de sonucu gösterir.",
    remove: "Çıkar", add_cable: "Kablo ekle", max_series: (n) => `En fazla ${n} kablo karşılaştırılabilir.`,
    cmp_chart: "Zayıflama – frekans (log-log)",
    cmp_table: (f, L, P, s) => `${f} · ${L} m · ${P} W · SWR ${s}`,
    vs_best: "En iyiye göre fark",
    all_title: "Tüm kablolar", all_lead: (n) => `${n} kablo. Arayın, süzün, sütun başlığına tıklayarak sıralayın; ayrıntı için kablo adına tıklayın.`,
    search_ph: "Ara: RG-213, LMR, Ecoflex, Belden…", all_z: "Tüm empedanslar", all_classes: "Tüm sınıflar", all_mfrs: "Tüm üreticiler",
    n_cables: (n) => `${n} kablo`, manufacturer: "Üretici", od: "Çap (mm)", peak_kw: "Tepe (kW)", class: "Sınıf",
    no_match: "Aramaya uyan kablo yok.",
    not_found: "Kablo bulunamadı.", max_values: "maksimum değerler",
    bands_title: "Amatör bantlarında zayıflama", bands_note: "~ = datasheet aralığı dışında tahmini; – = veri yok",
    curve_title: "Zayıflama eğrisi ve datasheet noktaları",
    curve_note: (n, a, b) => `Noktalar: datasheet'in yayımladığı ${n} değer (${a} – ${b}). Çizgi: noktalar arasında log-log interpolasyon; aralığın yarısından iki katına kadar çizilir.`,
    specs_title: "Özellikler", notes: "Notlar", data_lang_note: "",
    points_title: "Datasheet değerleri", power_points: "Ortalama güç sınırı (datasheet)",
    sources_title: "Kaynaklar", qa_note: (r) => `Kalite kontrolü: noktaların k0+k1·√f+k2·f modelinden ortalama sapması %${r}.`,
    similar_title: "Aynı sınıftaki diğer kablolar", similar_note: "2 m bandında (144 MHz) dB/100 m, en az kayıplıdan başlayarak.",
    f_manufacturer: "Üretici", f_part_number: "Parça no", f_family: "Tip / aile", f_impedance: "Empedans", f_od: "Dış çap",
    f_velocity_factor: "Hız faktörü (VF)", f_capacitance: "Kapasitans", f_inductance: "Endüktans", f_inner_material: "İç iletken",
    f_inner_construction: "İç iletken yapısı", f_inner_od: "İç iletken çapı", f_dielectric: "Dielektrik", f_dielectric_od: "Dielektrik çapı",
    f_shield: "Ekran", f_braid_coverage: "Örgü kaplama", f_jacket: "Kılıf", f_shielding: "Ekranlama etkinliği",
    f_dcr_inner: "DC direnç (iç)", f_dcr_outer: "DC direnç (dış)", f_fmax: "Maks. frekans", f_peak_power: "Tepe güç", f_voltage: "Gerilim",
    f_bend_single: "En küçük bükülme (tek sefer / genel)", f_bend_repeated: "En küçük bükülme (tekrarlı)", f_weight: "Ağırlık",
    f_tensile: "Çekme kuvveti", f_temperature: "Çalışma sıcaklığı", f_outdoor: "Dış mekan / UV", f_burial: "Toprağa gömme",
    f_fire: "Yangın / onaylar", f_connectors: "Konnektörler", f_k_published: "Üreticinin k1/k2 katsayıları",
    method_title: "Yöntem ve kaynaklar", method_lead: "Değerlerin nereden geldiği ve nasıl hesaplandığı.",
    method_body: `<h2>Zayıflama nasıl hesaplanıyor?</h2>
<p>Her kablonun datasheet'inde yayımlanan zayıflama noktaları olduğu gibi saklanır. Herhangi bir frekanstaki değer, o frekansın iki yanındaki noktalar arasında <b>ln(α)–ln(f) düzleminde doğrusal interpolasyonla</b> bulunur. Datasheet frekanslarında sonuç datasheet ile birebir aynıdır.</p>
<p>Datasheet aralığının dışında uçtaki iki noktanın eğimi kullanılır (α ∝ f<sup>n</sup>). Bu değerler <sup class="ind est">~</sup> ile işaretlenir; en yüksek veri frekansının iki katından ötesi gösterilmez.</p>
<p>Fiziksel model <b>α(f) = k0 + k1·√f + k2·f</b> (k1·√f iletken, k2·f dielektrik kaybı) yalnızca veri girişini denetlemek için kullanılır; ince ve köpük dielektrikli kablolarda HF'de iki terimli model %20–30 sapabildiği için ana hesap interpolasyondur.</p>
<h2>SWR'li kayıp ve güç</h2>
<p>Toplam kayıp ARRL Antenna Book uyumsuz hat formülüyle hesaplanır: TL = 10·log10[(a² − |Γ|²) / (a·(1 − |Γ|²))], a = 10<sup>ML/10</sup>, |Γ| = (SWR−1)/(SWR+1). Ortalama güç sınırı datasheet'in güç noktaları arasında aynı log-log interpolasyonla bulunur; çoğunlukla 40 °C ortam ve uyumlu yük içindir.</p>
<h2>Değer türleri</h2>
<p>Çoğu üretici nominal/tipik değer yayımlar. Reçber ve Ericsson <b>maksimum</b> değer verir; bu kablolar diğerleriyle yan yana gösterilir ve <sup class="ind">maks</sup> ile işaretlenir. Belden H155/H1000'de maksimum nominalin %10 üstüdür; CommScope ±%5 garanti verir. Konnektör ve eklem kayıpları dahil değildir.</p>
<p>Bükülme yarıçapında üreticiler iki değer verir: <b>tek sefer</b> (kurulum; LMR ve süper esnek tiplerde çapın ~2,5 katı) ve <b>tekrarlı</b> (çapın ~10 katı). Kartlarda tekrarlı değer öncelikli gösterilir.</p>
<h2>Doğrulama</h2>
<p>Sitedeki hesap, Excel çalışma kitabının hesapladığı değerlerle her değişiklikte otomatik olarak karşılaştırılır (tüm kablolar × 12 bant, hesaplayıcı ve karşılaştırma tablosu).</p>`,
    all_sources: (n) => `Kaynak belgeler (${n})`,
    data_body: `<h2>Veri ve lisans</h2>
<p>Veritabanı Excel çalışma kitabı, SQLite ve CSV olarak <a href="https://github.com/TA3HRJ/coax-cable-database" rel="noopener">GitHub</a>'da indirilebilir. Derlenmiş veri CC BY 4.0, kod MIT lisanslıdır. Üretici datasheet'leri sahiplerine aittir ve burada yeniden dağıtılmaz; yalnızca başlık ve adresleri listelenir.</p>
<p>Hatalı bir değer ya da eksik bir kablo görürseniz GitHub'da bir issue açabilirsiniz.</p>`,
    foot_method: "Yöntem ve kaynaklar",
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
    vf: "VF", peak: "peak", uv: "UV", burial: "burial",
    bend_rep: "repeated bend", bend_once: "one-time bend", bend_min: "min. bend",
    bend_min_title: "The manufacturer gives a single minimum bend radius without distinguishing one-time and repeated bends.",
    bend_rep_title: "Minimum radius when the cable is flexed repeatedly (e.g. a rotator loop).",
    bend_once_title: "Minimum radius for a single bend that stays fixed. The manufacturer gives no repeated-bend value; it is usually several times larger.",
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
    cmp_title: "Compare cables",
    cmp_lead: "Pick up to 8 cables. The chart shows attenuation at every frequency; the table shows the result at your frequency, length, power and SWR.",
    remove: "Remove", add_cable: "Add a cable", max_series: (n) => `Up to ${n} cables can be compared.`,
    cmp_chart: "Attenuation vs. frequency (log-log)",
    cmp_table: (f, L, P, s) => `${f} · ${L} m · ${P} W · SWR ${s}`,
    vs_best: "vs. best",
    all_title: "All cables", all_lead: (n) => `${n} cables. Search, filter, click a column header to sort; click a cable name for details.`,
    search_ph: "Search: RG-213, LMR, Ecoflex, Belden…", all_z: "All impedances", all_classes: "All classes", all_mfrs: "All manufacturers",
    n_cables: (n) => `${n} cables`, manufacturer: "Manufacturer", od: "OD (mm)", peak_kw: "Peak (kW)", class: "Class",
    no_match: "No cable matches.",
    not_found: "Cable not found.", max_values: "maximum values",
    bands_title: "Attenuation on the amateur bands", bands_note: "~ = estimated outside the datasheet range; – = no data",
    curve_title: "Attenuation curve and datasheet points",
    curve_note: (n, a, b) => `Points: the ${n} values the datasheet publishes (${a} – ${b}). Line: log-log interpolation between them, drawn from half to twice the data range.`,
    specs_title: "Specifications", notes: "Notes", data_lang_note: "Text fields of the data are in Turkish.",
    points_title: "Datasheet values", power_points: "Average power rating (datasheet)",
    sources_title: "Sources", qa_note: (r) => `Quality check: the points deviate ${r}% on average from a k0+k1·√f+k2·f fit.`,
    similar_title: "Other cables in the same class", similar_note: "dB/100 m on 2 m (144 MHz), lowest loss first.",
    f_manufacturer: "Manufacturer", f_part_number: "Part number", f_family: "Type / family", f_impedance: "Impedance", f_od: "Outer diameter",
    f_velocity_factor: "Velocity factor", f_capacitance: "Capacitance", f_inductance: "Inductance", f_inner_material: "Center conductor",
    f_inner_construction: "Center conductor construction", f_inner_od: "Center conductor diameter", f_dielectric: "Dielectric", f_dielectric_od: "Dielectric diameter",
    f_shield: "Shield", f_braid_coverage: "Braid coverage", f_jacket: "Jacket", f_shielding: "Shielding effectiveness",
    f_dcr_inner: "DC resistance (inner)", f_dcr_outer: "DC resistance (outer)", f_fmax: "Max. frequency", f_peak_power: "Peak power", f_voltage: "Voltage",
    f_bend_single: "Min. bend radius (one-time / general)", f_bend_repeated: "Min. bend radius (repeated)", f_weight: "Weight",
    f_tensile: "Pull strength", f_temperature: "Operating temperature", f_outdoor: "Outdoor / UV", f_burial: "Direct burial",
    f_fire: "Fire / approvals", f_connectors: "Connectors", f_k_published: "Manufacturer's k1/k2",
    method_title: "Method and sources", method_lead: "Where the values come from and how they are calculated.",
    method_body: `<h2>How attenuation is calculated</h2>
<p>The attenuation points published in each datasheet are stored as published. The value at any frequency is found by <b>linear interpolation in the ln(α)–ln(f) plane</b> between the two neighbouring points, so results at datasheet frequencies match the datasheet exactly.</p>
<p>Outside the datasheet range the slope of the two outermost points is used (α ∝ f<sup>n</sup>). Such values are marked <sup class="ind est">~</sup>; nothing beyond twice the highest data frequency is shown.</p>
<p>The physical model <b>α(f) = k0 + k1·√f + k2·f</b> (k1·√f conductor, k2·f dielectric loss) is used only to check data entry; for thin and foam-dielectric cables a two-term model can be off by 20–30% at HF, so interpolation is the main method.</p>
<h2>Loss with SWR, and power</h2>
<p>Total loss uses the ARRL Antenna Book mismatched-line formula: TL = 10·log10[(a² − |Γ|²) / (a·(1 − |Γ|²))], a = 10<sup>ML/10</sup>, |Γ| = (SWR−1)/(SWR+1). The average power rating is interpolated the same way between the datasheet's power points; it mostly assumes 40 °C ambient and a matched load.</p>
<h2>Value types</h2>
<p>Most manufacturers publish nominal/typical values. Reçber and Ericsson publish <b>maximum</b> values; these cables are shown side by side with the others and marked <sup class="ind">max</sup>. Belden H155/H1000 maxima are nominal +10%; CommScope guarantees ±5%. Connector and splice losses are not included.</p>
<p>For bend radius, manufacturers give two values: <b>one-time</b> (installation; about 2.5× the diameter for LMR and superflexible types) and <b>repeated</b> (about 10×). Cards show the repeated value first.</p>
<h2>Verification</h2>
<p>The site's calculation is compared automatically with the values the Excel workbook calculates on every change (all cables × 12 bands, the calculator and the comparison table).</p>`,
    all_sources: (n) => `Source documents (${n})`,
    data_body: `<h2>Data and license</h2>
<p>The database can be downloaded from <a href="https://github.com/TA3HRJ/coax-cable-database" rel="noopener">GitHub</a> as an Excel workbook, SQLite and CSV. The compiled data is CC BY 4.0, the code MIT. Manufacturer datasheets belong to their owners and are not redistributed here; only their titles and URLs are listed.</p>
<p>If you spot a wrong value or a missing cable, please open an issue on GitHub.</p>`,
    foot_method: "Method and sources",
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

/** Yüzde: Türkçe "%55,3", İngilizce "55.3%". x = 0..1 */
export function fmtPct(x, digits = 0) {
  if (x == null || !isFinite(x)) return "–";
  return new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US", {
    style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(x);
}

/** data-i / data-i-title özniteliklerini doldur. */
export function applyStatic(root = document) {
  root.querySelectorAll("[data-i]").forEach((el) => { el.textContent = t(el.dataset.i); });
  root.querySelectorAll("[data-i-title]").forEach((el) => { el.title = t(el.dataset.iTitle); });
}
