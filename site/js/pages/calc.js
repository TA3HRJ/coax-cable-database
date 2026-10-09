// Hesaplayıcı: tek kablo, tek hat. Hesap coax.lineCalc ile yapılır (Excel Calculator sayfasıyla eşlik testli).
// URL: #/calc?c=ID&f=MHz&L=m&u=ft&P=W&s=SWR
import { t, lang, fmt } from "../i18n.js";
import * as coax from "../coax.js";

const FT = coax.FT_PER_M;

export function renderCalc(view, ctx) {
  const { db, byId } = ctx;
  const p = ctx.params;
  const st = {
    c: byId[p.get("c")] ? p.get("c") : "TMS-LMR400",
    f: num(p.get("f"), 145),
    L: num(p.get("L"), 20),
    u: p.get("u") === "ft" ? "ft" : "m",
    P: num(p.get("P"), 100),
    s: Math.max(1, num(p.get("s"), 1)),
  };

  const head = el("div", "page-head");
  head.innerHTML = `<h1>${t("calc_title")}</h1><p>${t("calc_lead")}</p>`;

  const layout = el("div", "calc");
  const form = el("form", "panel calc-form");
  form.addEventListener("submit", (e) => e.preventDefault());
  const out = el("div", "calc-out");
  layout.append(form, out);

  // ---- kablo seçimi (sınıflara göre gruplu; sık önerilenler başta)
  const sel = el("select");
  sel.id = "calc-cable";
  const pop = db.cables.filter((c) => c.pop).sort((a, b) => a.pop - b.pop);
  sel.append(optgroup(t("popular_group"), pop));
  for (const k of db.classes) {
    const list = db.cables.filter((c) => c.cls === k.k).sort((a, b) => a.z - b.z || a.s.localeCompare(b.s));
    if (list.length) sel.append(optgroup(lang === "tr" ? k.tr : k.en, list));
  }
  sel.value = st.c;
  sel.addEventListener("change", () => { st.c = sel.value; update(); });
  form.append(field(t("cable"), sel, "calc-cable"));

  // ---- frekans: bant çipleri + serbest giriş
  const fIn = input("number", { min: 0.1, max: 30000, step: "any" });
  fIn.id = "calc-f";
  const chips = el("div", "chips");
  for (const [label, f] of db.bands) {
    const b = el("button", "chip");
    b.type = "button";
    b.textContent = label;
    b.dataset.f = f;
    b.addEventListener("click", () => { st.f = f; fIn.value = f; update(); });
    chips.append(b);
  }
  fIn.addEventListener("input", () => { const v = Number(fIn.value); if (v > 0) { st.f = v; update(); } });
  const fRow = el("div", "row");
  fRow.append(fIn, Object.assign(el("span", "unit"), { textContent: "MHz" }));
  form.append(field(t("frequency"), fRow, "calc-f"), chips);

  // ---- uzunluk + birim
  const lIn = input("number", { min: 0.1, max: 5000, step: "any" });
  lIn.id = "calc-L";
  const seg = el("div", "seg");
  for (const u of ["m", "ft"]) {
    const b = el("button");
    b.type = "button";
    b.textContent = u;
    b.dataset.u = u;
    b.addEventListener("click", () => { st.u = u; syncInputs(); update(); });
    seg.append(b);
  }
  lIn.addEventListener("input", () => { const v = Number(lIn.value); if (v > 0) { st.L = st.u === "ft" ? v * FT : v; update(); } });
  const lRow = el("div", "row");
  lRow.append(lIn, seg);
  form.append(field(t("length"), lRow, "calc-L"));

  // ---- güç ve SWR
  const pIn = input("number", { min: 0.001, max: 100000, step: "any" });
  pIn.id = "calc-P";
  pIn.addEventListener("input", () => { const v = Number(pIn.value); if (v > 0) { st.P = v; update(); } });
  const pRow = el("div", "row");
  pRow.append(pIn, Object.assign(el("span", "unit"), { textContent: "W" }));
  form.append(field(t("tx_power"), pRow, "calc-P"));

  const sIn = input("number", { min: 1, max: 50, step: 0.1 });
  sIn.id = "calc-s";
  const sRange = input("range", { min: 1, max: 5, step: 0.1 });
  sRange.setAttribute("aria-label", t("load_swr"));
  sIn.addEventListener("input", () => { const v = Number(sIn.value); if (v >= 1) { st.s = v; sRange.value = Math.min(v, 5); update(); } });
  sRange.addEventListener("input", () => { st.s = Number(sRange.value); sIn.value = st.s; update(); });
  const sRow = el("div", "row");
  sRow.append(sIn, sRange);
  form.append(field(t("load_swr"), sRow, "calc-s"));

  const note = el("p", "calc-note");
  note.textContent = t("calc_note");

  view.append(head, layout, note);
  syncInputs();
  update();

  // ------------------------------------------------------------------
  function syncInputs() {
    fIn.value = st.f;
    lIn.value = round(st.u === "ft" ? st.L / FT : st.L, 2);
    pIn.value = st.P;
    sIn.value = st.s;
    sRange.value = Math.min(st.s, 5);
    seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.u === st.u ? "true" : "false"));
  }

  function update() {
    chips.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.f) === st.f ? "true" : "false"));
    ctx.setParams({ c: st.c, f: st.f, L: round(st.L, 3), u: st.u === "ft" ? "ft" : null, P: st.P, s: st.s === 1 ? null : st.s });
    const c = byId[st.c];
    const r = coax.lineCalc(c, { f: st.f, lengthM: st.L, pInW: st.P, swr: st.s });
    out.replaceChildren(resultPanel(c, r), altPanel(c));
  }

  function resultPanel(c, r) {
    const box = el("section", "panel result");
    const ind = indicators(c);
    const per = st.u === "ft" ? r.attDb100ft : r.attDb100m;
    const perU = st.u === "ft" ? t("per100ft") : t("per100m");
    const Ls = st.u === "ft" ? `${fmt(st.L / FT, 1)} ft` : `${fmt(st.L, st.L < 10 ? 1 : 0)} m`;
    const hero = el("div", "hero");
    hero.innerHTML =
      `<div class="hero-k">${t("power_at_antenna")}</div>` +
      `<div class="hero-v num">${fmt(r.pOutW, r.pOutW < 10 ? 2 : 1)} W <small>(${fmt(r.efficiency * 100, 1)} %)</small></div>` +
      `<div class="hero-s">${t("of_power_lost", fmt(st.P - r.pOutW, 1), fmt(r.totalLossDb, 2))}</div>`;
    const bar = el("div", "bar big");
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = `<span style="width:${Math.max(1, r.efficiency * 100)}%"></span>`;

    const rows = [
      [t("attenuation"), `${fmt(per, per < 10 ? 3 : 2)}${ind} ${perU}`],
      [t("matched_loss", Ls), `${fmt(r.matchedLossDb, 2)} dB`],
      [t("swr_loss"), `${fmt(r.swrLossDb, 2)} dB`],
      [t("total_loss"), `<b>${fmt(r.totalLossDb, 2)} dB</b>`],
      [t("swr_tx"), fmt(r.swrTx, 2)],
      [t("max_power"), r.pMaxW == null ? t("no_power_data") : `${fmtW(r.pMaxW)} W`],
      [t("wavelength"), r.wavelengthM == null ? t("no_vf") : `${fmt(r.wavelengthM, 3)} m`],
      [t("quarter_wave"), r.quarterWaveM == null ? "–" : `${fmt(r.quarterWaveM, 3)} m`],
      [t("electrical_length"), r.electricalLengthWl == null ? "–" : `${fmt(r.electricalLengthWl, 2)} λ`],
    ];
    const dl = el("dl", "kv");
    dl.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd class="num">${v}</dd>`).join("");

    const alerts = el("div", "alerts");
    const a = [];
    if (r.overPower) a.push(["warn", t("warn_power", fmtW(r.pMaxW))]);
    if (!coax.isShown(c, st.f)) a.push(["warn", t("warn_far", fmt(c.fb, 0))]);
    else if (r.extrapolated) a.push(["info", t("info_extrap", fmt(c.fa, c.fa < 10 ? 1 : 0), fmt(c.fb, 0))]);
    if (c.val === "max") a.push(["info", t("note_max")]);
    if (c.z !== 50) a.push(["info", t("info_z", c.z)]);
    alerts.innerHTML = a.map(([k, m]) => `<p class="alert ${k}">${m}</p>`).join("");

    const src = db.src[c.src];
    const foot = el("div", "result-foot");
    foot.innerHTML = `<b>${esc(c.n)}</b> · ${esc(lang === "tr" ? classLabel(c).tr : classLabel(c).en)} · ${fmt(c.od, 1)} mm` +
      (src && src.u ? ` · <a href="${esc(src.u)}" target="_blank" rel="noopener" title="${esc(src.p + " — " + src.t)}">${t("source")} ↗</a>` : "");
    box.append(hero, bar, alerts, dl, foot);
    return box;
  }

  function altPanel(c) {
    // Aynı sınıf ve empedansta, aynı koşulda en az kayıplı kablolar
    const box = el("section", "panel alts");
    const peers = db.cables
      .filter((x) => x.cls === c.cls && x.z === c.z && coax.isShown(x, st.f))
      .map((x) => ({ x, r: coax.lineCalc(x, { f: st.f, lengthM: st.L, pInW: st.P, swr: st.s }) }))
      .sort((a, b) => a.r.totalLossDb - b.r.totalLossDb);
    box.innerHTML = `<h2>${t("alts_title")}</h2><p class="muted">${t("alts_lead")}</p>`;
    const ol = el("ol", "alt-list");
    for (const { x, r } of peers) {
      const li = el("li", x.id === c.id ? "me" : "");
      const b = el("button");
      b.type = "button";
      b.innerHTML = `<span class="an">${esc(x.s)}${x.val === "max" ? `<sup class="ind">${t("ind_max")}</sup>` : ""}</span>` +
        `<span class="num">${fmt(r.totalLossDb, 2)} dB</span><span class="num">${fmt(r.pOutW, 1)} W</span>`;
      b.title = x.n;
      b.addEventListener("click", () => { st.c = x.id; sel.value = x.id; update(); });
      li.append(b);
      ol.append(li);
    }
    box.append(ol);
    return box;
  }

  function indicators(c) {
    return (c.val === "max" ? `<sup class="ind" title="${esc(t("ind_max_title"))}">${t("ind_max")}</sup>` : "") +
      (coax.isExtrapolated(c, st.f) ? `<sup class="ind est" title="${esc(t("ind_est_title"))}">~</sup>` : "");
  }

  function classLabel(c) {
    return db.classes.find((k) => k.k === c.cls);
  }

  function optgroup(label, list) {
    const g = document.createElement("optgroup");
    g.label = label;
    for (const c of list) {
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = `${c.s} — ${c.n}${c.z !== 50 ? ` (${c.z} Ω)` : ""}`;
      g.append(o);
    }
    return g;
  }
}

function field(label, control, id) {
  const w = el("div", "field");
  const l = el("label");
  l.textContent = label;
  l.htmlFor = id;
  w.append(l, control);
  return w;
}
function input(type, attrs) {
  const i = document.createElement("input");
  i.type = type;
  Object.assign(i, attrs);
  return i;
}
function num(v, d) {
  const n = Number(v);
  return v != null && v !== "" && isFinite(n) && n > 0 ? n : d;
}
function fmtW(w) {
  return fmt(w, w < 10 ? 2 : w < 100 ? 1 : 0);
}
function round(v, d) {
  const p = Math.pow(10, d);
  return Math.round(v * p) / p;
}
function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}
