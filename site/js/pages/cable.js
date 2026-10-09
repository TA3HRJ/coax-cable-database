// Kablo detayı: #/cable/ID - özellikler, bantlarda zayıflama, eğri + datasheet noktaları, kaynaklar, benzerler.
import { t, lang, fmt } from "../i18n.js";
import * as coax from "../coax.js";
import { logLogChart, curve } from "../chart.js";
import { el, esc, fmtF, fmtA, fmtW, indicators, classLabel } from "../util.js";
import { cableSvg, layers } from "../cableart.js";

// Gösterilecek özellikler: [json anahtarı, etiket anahtarı, biçim]
const SPECS = [
  ["m", "manufacturer"], ["pn", "part_number"], ["fam", "family"], ["z", "impedance", (c) => `${c.z}${c.ztol ? " ± " + c.ztol : ""} Ω`],
  ["od", "od", (c) => `${fmt(c.od, 2)} mm`], ["vf", "velocity_factor", (c) => fmt(c.vf, 2)], ["cap", "capacitance", (c) => `${fmt(c.cap, 1)} pF/m`],
  ["ind", "inductance", (c) => `${fmt(c.ind, 3)} µH/m`], ["icm", "inner_material"], ["icc", "inner_construction"],
  ["icd", "inner_od", (c) => `${fmt(c.icd, 2)} mm`], ["dm", "dielectric"], ["dd", "dielectric_od", (c) => `${fmt(c.dd, 2)} mm`],
  ["sh", "shield"], ["bc", "braid_coverage", (c) => `%${c.bc}`], ["jk", "jacket"], ["se", "shielding", (c) => `${c.se} dB`],
  ["dci", "dcr_inner", (c) => `${fmt(c.dci, 2)} Ω/km`], ["dco", "dcr_outer", (c) => `${fmt(c.dco, 2)} Ω/km`],
  ["fmax", "fmax", (c) => fmtF(c.fmax, true)], ["pk", "peak_power", (c) => `${fmt(c.pk, c.pk < 10 ? 1 : 0)} kW`],
  ["v", "voltage", (c) => `${fmt(c.v, 0)} V${c.vn ? " — " + c.vn : ""}`],
  ["br1", "bend_single", (c) => `${fmt(c.br1, 1)} mm`], ["br2", "bend_repeated", (c) => `${fmt(c.br2, 1)} mm`],
  ["w", "weight", (c) => `${fmt(c.w, 1)} kg/km`], ["ten", "tensile", (c) => `${fmt(c.ten, 1)} kg`],
  ["tmin", "temperature", (c) => `${c.tmin} … ${c.tmax} °C`], ["out", "outdoor"], ["bur", "burial"], ["fire", "fire"], ["con", "connectors"],
  ["k1p", "k_published", (c) => `k1 = ${c.k1p}, k2 = ${c.k2p} (dB/100 ft)`],
];

export function renderCable(view, ctx, id) {
  const { db, byId } = ctx;
  const c = byId[id];
  if (!c) {
    view.append(el("p", "empty", t("not_found")));
    return;
  }
  const head = el("div", "page-head detail-head");
  head.innerHTML =
    `<div class="c-class">${esc(classLabel(db, c))} · ${fmt(c.od, 1)} mm · ${c.z} Ω${c.std ? ` <span class="tag">${t("standard")}</span>` : ""}` +
    `${c.val === "max" ? ` <span class="tag warn-tag" title="${esc(t("ind_max_title"))}">${t("max_values")}</span>` : ""}</div>` +
    `<h1>${esc(c.s)}</h1><p>${esc(c.n)}</p>`;
  const actions = el("div", "c-actions top-actions");
  const calc = el("a", "btn primary", `${t("calc")} →`);
  calc.href = `#/calc?c=${encodeURIComponent(c.id)}`;
  const cmp = el("button", "btn", `+ ${t("compare_add")}`);
  cmp.type = "button";
  cmp.setAttribute("aria-pressed", ctx.cmp.includes(c.id) ? "true" : "false");
  cmp.addEventListener("click", () => cmp.setAttribute("aria-pressed", ctx.toggleCmp(c.id) ? "true" : "false"));
  actions.append(calc, cmp);
  head.append(actions);
  view.append(head);

  // bantlar
  const bands = el("div", "panel");
  bands.append(el("h2", "h2", t("bands_title")));
  const bt = el("div", "band-grid");
  bt.innerHTML = db.bands.map(([l, f]) => {
    const shown = coax.isShown(c, f);
    const a = shown ? coax.attenuation(c, f) : null;
    return `<div class="bcell"><span class="bl">${l}</span><span class="bv num">${a == null ? "–" : fmtA(a) + indicators(c, f)}</span></div>`;
  }).join("");
  bands.append(bt, el("p", "muted", `dB/100 m · ${t("bands_note")}`));

  // eğri + datasheet noktaları
  const chart = el("div", "panel");
  chart.append(el("h2", "h2", t("curve_title")));
  chart.append(logLogChart([{ label: c.s, i: 0, pts: curve(c, coax.attenuation), markers: c.a.map((pt) => [pt[0], pt[1]]),
    est: (f) => coax.isExtrapolated(c, f) }], {
    xmin: Math.max(1, Math.min(c.fa / 2, 1)), xmax: 10000, unit: "dB/100 m", fmt: fmtA, fmtX: (f, long) => fmtF(f, long),
    ariaLabel: t("curve_title"), height: 320,
  }));
  chart.append(el("p", "muted", t("curve_note", c.a.length, fmtF(c.fa, true), fmtF(c.fb, true))));

  // yapı: verideki katmanlardan çizim + numaralı açıklama
  const art = el("figure", "panel art-panel");
  art.append(el("h2", "h2", t("structure_title")));
  const Ls = layers(c);
  const dia = (v, est) => (v ? ` · Ø ${fmt(v, 2)} mm${est ? ` (${t("estimated")})` : ""}` : "");
  const legend = [
    [t("part_jacket"), [c.jk], c.od],
    [t("part_shield"), [c.sh], null],
    [t("part_dielectric"), [c.dm], c.dd, Ls.est.dd],
    [t("part_conductor"), [c.icm, c.icc], c.icd, Ls.est.icd],
  ];
  const fig = el("div", "art-fig");
  fig.innerHTML = cableSvg(c, { w: 360, h: 132, fit: false, numbered: true, span: 0.66 });
  fig.firstChild.setAttribute("role", "img");
  fig.firstChild.setAttribute("aria-label", t("structure_title"));
  const ol = el("ol", "art-legend");
  ol.innerHTML = legend.map(([lab, txt, d, est]) =>
    `<li><b>${lab}</b> ${esc(txt.filter(Boolean).join(", ") || "–")}${dia(d, est)}</li>`).join("");
  art.append(fig, ol, el("figcaption", "muted", t("structure_note")));

  // özellikler
  const specs = el("div", "panel");
  specs.append(el("h2", "h2", t("specs_title")));
  const dl = el("dl", "kv specs");
  dl.innerHTML = SPECS.filter(([k]) => c[k] != null && c[k] !== "")
    .map(([k, lab, f]) => `<dt>${t("f_" + lab)}</dt><dd>${f ? f(c) : esc(c[k])}</dd>`).join("");
  specs.append(dl);
  if (c.note) specs.append(el("p", "note-box", `<b>${t("notes")}:</b> ${esc(c.note)}`));
  if (lang === "en") specs.append(el("p", "muted", t("data_lang_note")));

  // nokta tabloları
  const pts = el("div", "panel table-wrap");
  pts.append(el("h2", "h2", t("points_title")));
  pts.append(pointTable(c.a, (v) => `${fmtA(v)}`, (v) => fmtA(v * coax.FT_PER_M), ["dB/100 m", "dB/100 ft"]));
  if (c.p) {
    pts.append(el("h3", "h3", t("power_points")));
    pts.append(pointTable(c.p, (v) => `${fmtW(v)} W`, null, [t("max_power"), null]));
  }

  // kaynaklar
  const used = [...new Set([c.src, ...c.a.map((x) => x[2]), ...(c.p || []).map((x) => x[2])])];
  const srcs = el("div", "panel");
  srcs.append(el("h2", "h2", t("sources_title")));
  const ul = el("ul", "src-list");
  ul.innerHTML = used.map((sid) => srcItem(db, sid)).join("");
  srcs.append(ul);
  if (c.rms != null) srcs.append(el("p", "muted", t("qa_note", fmt(c.rms * 100, 1))));
  const issue = "https://github.com/TA3HRJ/coax-cable-database/issues/new?template=data-correction.yml"
    + `&cable=${encodeURIComponent(c.id)}&title=${encodeURIComponent("[Veri] " + c.s)}`;
  srcs.append(el("p", "muted", `<a href="${esc(issue)}" rel="noopener">${t("report_error")}</a>`));

  // benzerler
  const sim = db.cables.filter((x) => x.cls === c.cls && x.z === c.z && x.id !== c.id && coax.isShown(x, 144))
    .sort((a, b) => coax.attenuation(a, 144) - coax.attenuation(b, 144));
  const simBox = el("div", "panel");
  simBox.append(el("h2", "h2", t("similar_title")));
  simBox.append(el("div", "sim", sim.map((x) => `<a class="sel-chip" href="#/cable/${encodeURIComponent(x.id)}">${esc(x.s)} <small>${fmtA(coax.attenuation(x, 144))}</small></a>`).join("") || `<span class="muted">–</span>`));
  simBox.append(el("p", "muted", t("similar_note")));

  const grid = el("div", "detail-grid");
  const left = el("div", "col");
  const right = el("div", "col");
  left.append(bands, chart, pts);
  right.append(art, specs, srcs, simBox);
  grid.append(left, right);
  view.append(grid);

  function pointTable(list, f1, f2, heads) {
    const tb = el("table", "tbl compact");
    tb.innerHTML = `<thead><tr><th class="r">${t("frequency")}</th><th class="r">${heads[0]}</th>${f2 ? `<th class="r">${heads[1]}</th>` : ""}<th>${t("source")}</th></tr></thead>` +
      `<tbody>${list.map(([f, v, sid]) => `<tr><td class="r num">${fmtF(f, true)}</td><td class="r num">${f1(v)}</td>${f2 ? `<td class="r num">${f2(v)}</td>` : ""}` +
        `<td><a href="#src-${sid}" class="sid" data-sid="${sid}">${sid}</a></td></tr>`).join("")}</tbody>`;
    tb.querySelectorAll("a.sid").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("src-" + a.dataset.sid)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }));
    return tb;
  }
}

export function srcItem(db, sid) {
  const s = db.src[sid] || {};
  const meta = [s.r, s.d].filter(Boolean).join(" · ");
  const title = s.u ? `<a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)} ↗</a>` : esc(s.t);
  return `<li id="src-${sid}"><span class="sid">${sid}</span><div><b>${esc(s.p || "")}</b> — ${title}` +
    `<div class="muted">${esc([meta, s.h].filter(Boolean).join(" · "))}</div>${s.x ? `<div class="muted small">${esc(s.x)}</div>` : ""}</div></li>`;
}
