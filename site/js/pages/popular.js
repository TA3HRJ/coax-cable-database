// Popüler kablolar (ara sayfa): öne çıkan 8 kart + çap sınıflarına göre sık önerilenler.
// Bant, uzunluk ve birim değişince kartlar yeniden kurulmaz, yalnızca değerleri güncellenir.
import { t, lang, fmt } from "../i18n.js";
import * as coax from "../coax.js";
import { fmtMm, sizeClassLabel } from "../util.js";

const FT = coax.FT_PER_M;

export function renderPopular(view, ctx) {
  const { db } = ctx;
  const bands = db.bands; // [["160 m", 1.8], ...]
  const st = {
    f: Number(ctx.params.get("f")) || 144,
    L: Number(ctx.params.get("L")) || 20,
    u: ctx.params.get("u") === "ft" ? "ft" : "m",
  };
  if (!bands.some((b) => b[1] === st.f)) st.f = 144;

  const pop = db.cables.filter((c) => c.pop).sort((a, b) => a.pop - b.pop);
  const featured = pop.filter((c) => c.pop <= db.featured);
  const classOf = Object.fromEntries(db.classes.map((k) => [k.k, k]));

  // ---- başlık
  const head = el("div", "page-head");
  head.innerHTML = `<h1>${t("pop_title")}</h1><p>${t("pop_lead")}</p>`;

  // ---- denetimler
  const controls = el("div", "controls");
  const bandGroup = el("div", "ctl-group");
  bandGroup.innerHTML = `<span class="ctl-label">${t("band")}</span>`;
  const chips = el("div", "chips");
  for (const [label, f] of bands) {
    const b = el("button", "chip");
    b.type = "button";
    b.innerHTML = `${label}<small>${fmtF(f)}</small>`;
    b.setAttribute("aria-pressed", f === st.f ? "true" : "false");
    b.addEventListener("click", () => {
      st.f = f;
      chips.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      update();
    });
    chips.append(b);
  }
  bandGroup.append(chips);

  const lenGroup = el("div", "ctl-group len");
  const range = Object.assign(document.createElement("input"), { type: "range", min: 1, max: 100, step: 1 });
  const num = Object.assign(document.createElement("input"), { type: "number", min: 0.1, max: 2000, step: "any" });
  const unitLbl = el("span", "ctl-label");
  lenGroup.append(Object.assign(el("span", "ctl-label"), { textContent: t("length") }), range, num, unitLbl);
  range.setAttribute("aria-label", t("length"));
  num.setAttribute("aria-label", t("length"));
  const setLenInputs = () => {
    const shown = st.u === "ft" ? st.L / FT : st.L;
    num.value = round(shown, 1);
    range.max = st.u === "ft" ? 330 : 100;
    range.value = Math.min(shown, Number(range.max));
    unitLbl.textContent = st.u;
  };
  range.addEventListener("input", () => { st.L = toM(Number(range.value)); num.value = range.value; update(); });
  num.addEventListener("input", () => {
    const v = Number(num.value);
    if (v > 0) { st.L = toM(v); range.value = Math.min(v, Number(range.max)); update(); }
  });

  const unitGroup = el("div", "ctl-group");
  const seg = el("div", "seg");
  for (const u of ["m", "ft"]) {
    const b = el("button");
    b.type = "button";
    b.textContent = u === "m" ? "dB/100 m · m" : "dB/100 ft · ft";
    b.setAttribute("aria-pressed", u === st.u ? "true" : "false");
    b.addEventListener("click", () => {
      st.u = u;
      seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      setLenInputs();
      groups.forEach((g) => g.cards.forEach(paintDims));
      update();
    });
    seg.append(b);
  }
  unitGroup.append(Object.assign(el("span", "ctl-label"), { textContent: t("unit") }), seg);
  controls.append(bandGroup, lenGroup, unitGroup);

  // ---- bölümler
  const groups = [];
  const featSec = section(t("featured"), t("featured_note"), featured, false);
  const classSecs = db.classes
    .map((k) => {
      const list = pop.filter((c) => c.cls === k.k);
      return list.length ? section(lang === "tr" ? k.tr : k.en, lang === "tr" ? k.use_tr : k.use_en, list, true) : null;
    })
    .filter(Boolean);

  const notes = el("div", "notes");
  notes.innerHTML =
    `<p><sup>${t("ind_max")}</sup> ${t("note_max")}</p>` +
    `<p><sup class="est">~</sup> ${t("note_est")}</p>` +
    `<p>${t("note_basis")} ${t("note_conn")}</p>`;

  view.append(head, controls, featSec, ...classSecs, notes);
  setLenInputs();
  update();

  // ------------------------------------------------------------------ yardımcılar
  function section(title, sub, list, sortable) {
    const sec = el("section", "section");
    const h = el("div", "section-head");
    h.innerHTML = `<h2>${esc(title)}</h2><p>${esc(sub)}</p>`;
    const grid = el("div", "grid");
    const cards = list.map((c) => card(c));
    grid.append(...cards.map((x) => x.root));
    groups.push({ grid, cards, sortable });
    sec.append(h, grid);
    return sec;
  }

  function card(c) {
    const root = el("article", "card" + (c.std ? " is-std" : ""));
    const cls = el("div", "c-class");
    const title = el("a", "c-title");
    title.textContent = c.s;
    title.href = `#/cable/${encodeURIComponent(c.id)}`;
    const sub = el("div", "c-sub");
    sub.textContent = c.n;
    const value = el("div", "c-value");
    const bar = el("div", "bar");
    bar.setAttribute("aria-hidden", "true");
    const fill = el("span");
    bar.append(fill);
    const line = el("div", "c-line");
    const meta = el("div", "c-meta");

    const actions = el("div", "c-actions");
    const calc = Object.assign(el("a", "btn primary"), { textContent: `${t("calc")} →` });
    const cmp = el("button", "btn");
    cmp.type = "button";
    cmp.textContent = `+ ${t("compare_add")}`;
    cmp.setAttribute("aria-pressed", ctx.cmp.includes(c.id) ? "true" : "false");
    cmp.addEventListener("click", () => cmp.setAttribute("aria-pressed", ctx.toggleCmp(c.id) ? "true" : "false"));
    actions.append(calc, cmp);
    const s = db.src[c.src];
    if (s && s.u) {
      const a = Object.assign(el("a", "src"), { href: s.u, target: "_blank", rel: "noopener", textContent: `${t("source")} ↗` });
      a.title = `${s.p} — ${s.t}`;
      actions.append(a);
    }
    root.append(cls, title, sub, value, bar, line, meta, actions);
    const x = { c, root, cls, meta, value, fill, bar, line, calc };
    paintDims(x);
    return x;
  }

  /** Çap ve bükülme: m biriminde mm, ft biriminde inç. Yalnızca birim değişince yeniden yazılır. */
  function paintDims(x) {
    const { c, cls, meta } = x;
    cls.innerHTML = `<span>${esc(sizeClassLabel(classOf[c.cls], st.u))} · ${fmtMm(c.od, st.u)}</span>` +
      (c.std ? `<span class="tag" title="${esc(t("std_title"))}">${t("standard")}</span>` : "");
    const m = [];
    if (c.vf) m.push(`${t("vf")} ${fmt(c.vf, 2)}`);
    if (c.pk) m.push(`${fmt(c.pk, c.pk < 10 ? 1 : 0)} kW ${t("peak")}`);
    // Bükülme: tekrarlı değer varsa o (pratikte önemli olan), yoksa tek seferlik değer açık etiketle.
    // Üreticiler iki ayrı değer yayımlar; tek seferlik/kurulum değeri LMR ve süper esnek tiplerde çapın ~2,5 katı olabilir.
    if (c.br2) m.push([`${t("bend_rep")} ${fmtMm(c.br2, st.u, 0, 1)}`, t("bend_rep_title")]);
    else if (c.br1 && /^Times/.test(c.m)) m.push([`${t("bend_once")} ${fmtMm(c.br1, st.u, 0, 1)}`, t("bend_once_title")]);
    else if (c.br1) m.push([`${t("bend_min")} ${fmtMm(c.br1, st.u, 0, 1)}`, t("bend_min_title")]);
    if (c.bur && /evet|uygun/i.test(c.bur)) m.push(t("burial"));
    meta.innerHTML = m.map((x) => Array.isArray(x) ? `<span title="${esc(x[1])}">${esc(x[0])}</span>` : `<span>${esc(x)}</span>`).join("");
  }

  function update() {
    ctx.setParams({ f: st.f, L: round(st.L, 2), u: st.u === "ft" ? "ft" : null });
    for (const g of groups) {
      const vals = g.cards.map((x) => (coax.isShown(x.c, st.f) ? coax.attenuation(x.c, st.f) : null));
      const max = Math.max(...vals.filter((v) => v != null), 1e-9);
      g.cards.forEach((x, i) => paint(x, vals[i], max));
      if (g.sortable) {
        const order = g.cards
          .map((x, i) => ({ x, v: vals[i] }))
          .sort((a, b) => (b.x.c.std ? 1 : 0) - (a.x.c.std ? 1 : 0) || (a.v ?? 1e9) - (b.v ?? 1e9));
        g.grid.append(...order.map((o) => o.x.root));
      }
    }
  }

  function paint(x, att, max) {
    const { c } = x;
    x.calc.href = `#/calc?c=${encodeURIComponent(c.id)}&f=${st.f}&L=${round(st.L, 2)}${st.u === "ft" ? "&u=ft" : ""}`;
    if (att == null) {
      x.value.className = "c-value na";
      x.value.innerHTML = `<span class="v">${t("no_data")}</span>`;
      x.bar.hidden = true;
      x.line.textContent = "";
      return;
    }
    const per = st.u === "ft" ? att * FT : att;
    const ind =
      (c.val === "max" ? `<sup class="ind" title="${esc(t("ind_max_title"))}">${t("ind_max")}</sup>` : "") +
      (coax.isExtrapolated(c, st.f) ? `<sup class="ind est" title="${esc(t("ind_est_title"))}">~</sup>` : "");
    x.value.className = "c-value";
    x.value.innerHTML = `<span class="v">${fmt(per, per < 10 ? 2 : 1)}${ind}</span>` +
      `<span class="u">${st.u === "ft" ? t("per100ft") : t("per100m")}</span>`;
    x.bar.hidden = false;
    x.fill.style.width = `${Math.max(2, (att / max) * 100)}%`;
    const db = coax.matchedLoss(att, st.L);
    const pct = 100 * Math.pow(10, -db / 10);
    const Ls = st.u === "ft" ? `${fmt(st.L / FT, st.L / FT < 10 ? 1 : 0)} ft` : `${fmt(st.L, st.L < 10 ? 1 : 0)} m`;
    x.line.innerHTML = t("line_loss", Ls, fmt(db, db < 10 ? 2 : 1), fmt(pct, pct < 10 ? 1 : 0));
  }

  function toM(v) {
    return st.u === "ft" ? v * FT : v;
  }
}

/** Bant çipindeki frekans: 2 GHz altı MHz, üstü GHz; gereksiz sıfır ve binlik ayraç yok. */
function fmtF(f) {
  const nf = (x) => new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US", { maximumFractionDigits: 2, useGrouping: false }).format(x);
  return f >= 2000 ? `${nf(f / 1000)} GHz` : `${nf(f)} MHz`;
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
