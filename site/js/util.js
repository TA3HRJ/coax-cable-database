// Sayfaların ortak yardımcıları.
import { t, lang, fmt } from "./i18n.js";
import * as coax from "./coax.js";
import { dataEn } from "./datatr.js";

/** Kablonun uzun adı ve üreticisi arayüz dilinde (veri Türkçe; ör. "köpük PE" -> "foam PE"). */
export const cname = (c) => (lang === "en" ? dataEn(c.n) : c.n);
export const cmfr = (m) => (lang === "en" ? dataEn(m) : m);

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

export function round(v, d) {
  const p = Math.pow(10, d);
  return Math.round(v * p) / p;
}

export function num(v, d) {
  const n = Number(v);
  return v != null && v !== "" && isFinite(n) && n > 0 ? n : d;
}

/** Frekans: 2 GHz altı MHz, üstü GHz; binlik ayraç yok. */
export function fmtF(f, long) {
  const nf = (x, d = 2) => new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US", { maximumFractionDigits: d, useGrouping: false }).format(x);
  if (long) return f >= 1000 ? `${nf(f / 1000, 3)} GHz` : `${nf(f, f < 10 ? 2 : 1)} MHz`;
  return f >= 2000 ? `${nf(f / 1000)} GHz` : `${nf(f)} MHz`;
}

/** Zayıflama için uygun basamak. */
export function fmtA(v) {
  return fmt(v, v < 1 ? 3 : v < 10 ? 2 : 1);
}

export function fmtW(w) {
  return fmt(w, w < 10 ? 2 : w < 100 ? 1 : 0);
}

/** Maksimum değer ve tahmini değer üst simgeleri. */
export function indicators(c, f) {
  return (c.val === "max" ? `<sup class="ind" title="${esc(t("ind_max_title"))}">${t("ind_max")}</sup>` : "") +
    (f != null && coax.isExtrapolated(c, f) ? `<sup class="ind est" title="${esc(t("ind_est_title"))}">~</sup>` : "");
}

/**
 * Ticari marka işaretleri: yalnızca sahibinin kendi belgesinde ® ile gösterdiği adlar (bkz. Yöntem > Ticari markalar).
 * Sayfadaki ilk belirgin kullanımda (kablo detayı başlığı ve özellikler) gösterilir; veri dosyalarında işaret yoktur.
 */
export const MARKS = [
  [/\bLMR(?=[-\s]|$)/, "®"], [/\bHELIAX\b/i, "®"], [/\bCELLFLEX\b/i, "®"], [/\bCommScope\b/, "®"],
  [/\bEcoflex\b/, "®"], [/\bAircell\b/, "®"], [/\bDuofoil\b/, "®"], [/\bDuobond\b/, "®"], [/\bMessi &amp; Paoloni\b/, "®"],
];

/** Metni kaçışlayıp bilinen markaların ilk geçişine üst simge ekler. */
export function markHtml(s) {
  let out = esc(s);
  for (const [re, sym] of MARKS) out = out.replace(re, (m) => `${m}<sup class="tm">${sym}</sup>`);
  return out;
}

export const MM_PER_IN = 25.4;

/** Uzunluk (mm); ft biriminde inç (inçte varsayılan olarak iki basamak fazla). */
export function fmtMm(mm, u, d = 1, di = d + 2) {
  return u === "ft" ? `${fmt(mm / MM_PER_IN, di)} in` : `${fmt(mm, d)} mm`;
}

/** Çap sınıfı etiketi; ft biriminde "(~5 mm)" -> "(~0,20 in)", "7 mm sınıfı" -> "7 mm sınıfı (~0,28 in)". */
export function sizeClassLabel(k, u) {
  if (!k) return "";
  const s = lang === "tr" ? k.tr : k.en;
  if (u !== "ft") return s;
  const inch = (v) => fmt(parseFloat(v.replace(",", ".")) / MM_PER_IN, 2);
  return s.replace(/~(\d+(?:[.,]\d+)?) mm/, (_, v) => `~${inch(v)} in`)
    .replace(/^(\d+(?:[.,]\d+)?) mm (sınıfı|class)$/, (m, v) => `${m} (~${inch(v)} in)`);
}

export function classLabel(db, c, u) {
  return sizeClassLabel(db.classes.find((x) => x.k === c.cls), u);
}

/** Kablo seçme listesi: sık önerilenler başta, sonra sınıflar. */
export function cableSelect(db, value, exclude = []) {
  const sel = document.createElement("select");
  const group = (label, list) => {
    const g = document.createElement("optgroup");
    g.label = label;
    for (const c of list) {
      if (exclude.includes(c.id)) continue;
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = `${c.s} — ${cname(c)}${c.z !== 50 ? ` (${c.z} Ω)` : ""}`;
      g.append(o);
    }
    if (g.children.length) sel.append(g);
  };
  group(t("popular_group"), db.cables.filter((c) => c.pop).sort((a, b) => a.pop - b.pop));
  for (const k of db.classes) {
    group(lang === "tr" ? k.tr : k.en, db.cables.filter((c) => c.cls === k.k).sort((a, b) => a.z - b.z || a.s.localeCompare(b.s)));
  }
  if (value) sel.value = value;
  return sel;
}

/** Bant çipleri; seçili frekansı aria-pressed ile işaretler. onPick(f) çağrılır. */
export function bandChips(db, current, onPick) {
  const chips = el("div", "chips");
  for (const [label, f] of db.bands) {
    const b = el("button", "chip");
    b.type = "button";
    b.textContent = label;
    b.dataset.f = f;
    b.addEventListener("click", () => onPick(f));
    chips.append(b);
  }
  chips.sync = (f) => chips.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.f) === f ? "true" : "false"));
  chips.sync(current);
  return chips;
}
