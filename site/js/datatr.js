// Verideki Türkçe yapı metinleri (iletken, dielektrik, ekran, kılıf, kullanım, yangın, aile) için İngilizce karşılıklar.
// Veri tek dilde (Türkçe) tutulur; çeviri yalnızca İngilizce arayüzde görünümde yapılır. Kurallar sırayla uygulanır:
// uzun ifadeler önce, tek kelimeler en sonda ("örgülü" -> stranded, "örgü" -> braid'den önce gelmeli).

const RULES = [
  // iletken
  ["gümüş kaplı bakır kaplı çelik", "silver-plated copper-clad steel"],
  ["bakır kaplı alüminyum", "copper-clad aluminum"],
  ["bakır kaplı çelik", "copper-clad steel"],
  ["gümüş kaplı bakır", "silver-plated copper"],
  ["oluklu bakır boru", "corrugated copper tube"],
  ["oluklu bakır", "corrugated copper"],
  ["elektrolitik bakır", "electrolytic copper"],
  ["oksijensiz bakır", "oxygen-free copper"],
  ["masif bakır", "solid copper"],
  ["kalaylı bakır", "tinned copper"],
  ["çıplak bakır", "bare copper"],
  ["çıplak", "bare"],
  [/(\d+) telli örgülü/g, "$1-strand"],
  ["örgülü", "stranded"],
  ["tek tel", "solid"],
  [/\((\d+) tel\)/g, "($1 wires)"],
  // dielektrik
  ["fiziksel köpük", "physical foam"],
  ["gaz enjeksiyonlu köpük", "gas-injected foam"],
  [/(\d+) katlı/g, "$1-layer"],
  ["gaz oranı", "gas ratio"],
  ["iletkene yapışık", "bonded to conductor"],
  ["dielektriğe yapışık", "bonded to dielectric"],
  ["yapışık değil", "not bonded"],
  ["yarı hava aralıklı", "semi-air-spaced"],
  [/(\d+) hücreli ekstrüzyon/g, "$1-cell extrusion"],
  ["yarı dolu", "semi-solid"],
  ["(dolu)", "(solid)"],
  ["tüp", "tube"],
  // ekran
  ["toplam %100 kaplama", "100% total coverage"],
  ["dış iletken", "outer conductor"],
  ["pe kaplı", "PE-backed"],
  ["pe katmanlı", "PE-laminated"],
  ["yapışık", "bonded"],
  ["folyo", "foil"],
  ["bant", "tape"],
  ["çift", "double"],
  // kılıf
  ["uv korumalı", "UV-protected"],
  ["uv dayanımlı", "UV-resistant"],
  ["uv stabilize", "UV-stabilized"],
  ["seçenekleri var", "options available"],
  ["kirletmeyen", "non-contaminating"],
  ["halojensiz", "halogen-free"],
  ["kahverengi", "brown"],
  ["siyah", "black"],
  // kullanım
  ["iç (plenum) / dış mekan", "indoor (plenum) / outdoor"],
  ["iç/dış mekan", "indoor/outdoor"],
  ["dış mekan", "outdoor"],
  ["iç mekan", "indoor"],
  ["güneş ışığına dayanıklı", "sunlight-resistant"],
  ["taşıyıcı tel ile", "with messenger wire"],
  ["sadece black", "black only"],
  ["havai", "aerial"],
  ["açık hava", "open air"],
  ["üreticiye göre pe kılıf yeraltı uygulamalarına uygun", "PE jacket suitable for direct burial (per manufacturer)"],
  ["üreticiye göre pe kılıf yeraltına uygun", "PE jacket suitable for direct burial (per manufacturer)"],
  ["pe kılıf", "PE jacket"],
  ["evet", "yes"],
  ["hayır", "no"],
  // gerilim notu
  ["maks. çalışma gerilimi", "max. operating voltage"],
  ["maks. gerilim", "max. voltage"],
  ["anma gerilimi", "rated voltage"],
  ["dc test gerilimi", "DC test voltage"],
  ["test gerilimi", "test voltage"],
  ["dielektrik dayanım", "dielectric strength"],
  ["rf tepe gerilimi", "RF peak voltage"],
  ["gerilim değeri", "voltage rating"],
  ["ul dışı değer", "non-UL rating"],
  ["delinme", "breakdown"],
  ["değeri", "rating"],
  // yangın
  ["segregasyon sınıfı", "segregation class"],
  // kaynak türü ve tarih (Kaynaklar listesi); özgün belge başlıkları çevrilmez, yalnızca eklenen açıklamalar
  ["distribütör veri sayfası, topluluk arşivi", "distributor data sheet, community archive"],
  ["distribütör kopyası", "distributor copy"],
  ["distribütör web sayfası", "distributor web page"],
  ["topluluk arşivi", "community archive"],
  ["satıcı ürün sayfası", "seller product page"],
  ["satıcı kopyası", "seller copy"],
  ["(satıcı)", "(seller)"],
  ["üretici web sayfası", "manufacturer web page"],
  ["ürün sayfası", "product page"],
  ["katalog sayfası", "catalog page"],
  [/\(katalog s\.(\d)/g, "(catalog p.$1"],
  [/s\.(\d+) karşılaştırma tablosu/g, "p.$1 comparison table"],
  ["(pdf tarihi", "(PDF date"],
  ["değişiklik", "modified"],
  [/(\d{4}) dönemi/g, "c. $1"],
  ["o dönemki çağrı işareti", "callsign at the time"],
  ["(işaret:", "(marking:"],
  ["(veri:", "(data:"],
  ["kullanıcı", "user"],
  ["numune spesifikasyonu", "sample specification"],
  // üretici / konnektör
  ["belirtilmemiş", "unspecified"],
  ["üretici metni", "manufacturer's wording"],
  // aile
  ["süper esnek", "superflexible"],
  ["düşük kayıplı", "low-loss"],
  ["jıs boyut tanımı", "JIS size designation"], // "JIS" tr küçük harfte "jıs" olur
  ["boyutu", "size"],
  ["alternatifi", "alternative"],
  ["muadili", "equivalent"],
  ["modifiye", "modified"],
  ["hafif", "lightweight"],
  ["(köpük)", "(foam)"],
  ["köpük", "foam"],
  ["(oluklu)", "(corrugated)"],
  ["üretici", "manufacturer"],
  ["boru", "tube"],
  ["bakır", "copper"],
  ["örgü", "braid"],
  ["çelik", "steel"],
  [" ve ", " and "],
  [/%(\d+(?:\.\d+)?)/g, "$1%"],
];

const trLower = (s) => s.toLocaleLowerCase("tr");
const cap = (s) => s.charAt(0).toLocaleUpperCase("en") + s.slice(1);

/** Türkçe veri metnini İngilizceye çevirir (bilinen ifadeler); bilinmeyen kısımlar olduğu gibi kalır. */
export function dataEn(s) {
  if (s == null || s === "") return s;
  let out = String(s);
  for (const [from, to] of RULES) {
    if (from instanceof RegExp) { out = out.replace(from, to); continue; }
    // Türkçe büyük/küçük harf duyarsız düz metin araması; eşleşme büyük harfle başlıyorsa karşılığı da öyle başlar.
    let low = trLower(out), i = low.indexOf(from), guard = 0;
    while (i >= 0 && guard++ < 20) {
      const orig = out.slice(i, i + from.length);
      const rep = orig.charAt(0) !== trLower(orig.charAt(0)) ? cap(to) : to;
      out = out.slice(0, i) + rep + out.slice(i + from.length);
      low = trLower(out);
      i = low.indexOf(from, i + rep.length);
    }
  }
  return out;
}
