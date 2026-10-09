// Karşılaştır: en fazla 8 kablo, log-log grafik + seçili frekans/uzunluk/güç/SWR'de tablo.
// URL: #/compare?c=ID,ID&f=&L=&P=&s=  (c yoksa Popüler'deki seçim kullanılır)
import { t, fmt, fmtPct } from "../i18n.js";
import * as coax from "../coax.js";
import { logLogChart, curve, seriesColor, SERIES } from "../chart.js";
import { el, esc, num, round, fmtF, fmtA, fmtW, indicators, cableSelect, bandChips } from "../util.js";

export function renderCompare(view, ctx) {
  const { db, byId } = ctx;
  const p = ctx.params;
  const fromUrl = (p.get("c") || "").split(",").filter((id) => byId[id]);
  const st = {
    ids: (fromUrl.length ? fromUrl : ctx.cmp.filter((id) => byId[id])).slice(0, SERIES),
    f: num(p.get("f"), 144), L: num(p.get("L"), 20), P: num(p.get("P"), 100), s: Math.max(1, num(p.get("s"), 1)),
  };
  if (!st.ids.length) st.ids = ["BEL-8259", "BEL-8267", "TMS-LMR400"];
  ctx.setCmp(st.ids); // paylaşılan bağlantıdaki seçim, Popüler kartlarındaki seçimle aynı olsun

  view.append(el("div", "page-head", `<h1>${t("cmp_title")}</h1><p>${t("cmp_lead")}</p>`));
  const picker = el("div", "panel picker");
  const controls = el("div", "panel cmp-ctl");
  const chartBox = el("div", "panel");
  const tableBox = el("div", "panel table-wrap");
  view.append(picker, controls, chartBox, tableBox);

  // ---- denetimler: frekans, uzunluk, güç, SWR
  const chips = bandChips(db, st.f, (f) => { st.f = f; fIn.value = f; update(); });
  const fIn = numIn(st.f, (v) => { st.f = v; update(); });
  const lIn = numIn(st.L, (v) => { st.L = v; update(); });
  const pIn = numIn(st.P, (v) => { st.P = v; update(); });
  const sIn = numIn(st.s, (v) => { st.s = Math.max(1, v); update(); });
  sIn.min = 1;
  sIn.step = 0.1;
  const row = el("div", "ctl-row");
  for (const [lab, inp, u] of [[t("frequency"), fIn, "MHz"], [t("length"), lIn, "m"], [t("tx_power"), pIn, "W"], [t("load_swr"), sIn, ""]]) {
    const f = el("label", "mini");
    f.append(el("span", "", lab), inp);
    if (u) f.append(el("span", "unit", u));
    row.append(f);
  }
  controls.append(chips, row);

  drawPicker();
  update();

  function drawPicker() {
    picker.replaceChildren();
    const list = el("div", "sel-list");
    st.ids.forEach((id, i) => {
      const c = byId[id];
      const b = el("span", "sel-chip", `<i style="background:${seriesColor(i)}"></i><a href="#/cable/${encodeURIComponent(id)}">${esc(c.s)}</a>`);
      const x = el("button", "x", "×");
      x.type = "button";
      x.title = t("remove");
      x.addEventListener("click", () => { st.ids.splice(st.ids.indexOf(id), 1); save(); drawPicker(); update(); });
      b.append(x);
      list.append(b);
    });
    picker.append(list);
    if (st.ids.length < SERIES) {
      const sel = cableSelect(db, null, st.ids);
      sel.prepend(Object.assign(document.createElement("option"), { value: "", textContent: `+ ${t("add_cable")}`, selected: true }));
      sel.addEventListener("change", () => { if (sel.value) { st.ids.push(sel.value); save(); drawPicker(); update(); } });
      picker.append(sel);
    } else {
      picker.append(el("span", "muted", t("max_series", SERIES)));
    }
  }

  function save() {
    ctx.setCmp(st.ids);
  }

  function update() {
    chips.sync(st.f);
    ctx.setParams({ c: st.ids.join(","), f: st.f, L: round(st.L, 3), P: st.P, s: st.s === 1 ? null : st.s });
    const cabs = st.ids.map((id) => byId[id]);
    // grafik
    chartBox.replaceChildren(el("h2", "h2", t("cmp_chart")));
    if (cabs.length) {
      const series = cabs.map((c, i) => ({ label: c.s, i, pts: curve(c, coax.attenuation), est: (f) => coax.isExtrapolated(c, f) }));
      chartBox.append(logLogChart(series, {
        xmin: 1, xmax: 10000, unit: "dB/100 m", fmt: fmtA, fmtX: (f, long) => fmtF(f, long), ariaLabel: t("cmp_chart"),
      }));
    } else chartBox.append(el("p", "empty", t("none_selected")));
    // tablo
    const rows = cabs.map((c, i) => ({ c, i, r: coax.isShown(c, st.f) ? coax.lineCalc(c, { f: st.f, lengthM: st.L, pInW: st.P, swr: st.s }) : null }));
    const best = Math.min(...rows.filter((x) => x.r).map((x) => x.r.totalLossDb));
    rows.sort((a, b) => (a.r ? a.r.totalLossDb : 1e9) - (b.r ? b.r.totalLossDb : 1e9));
    tableBox.replaceChildren(el("h2", "h2", t("cmp_table", fmtF(st.f, true), fmt(st.L, st.L < 10 ? 1 : 0), fmtW(st.P), fmt(st.s, 1))));
    const tb = el("table", "tbl");
    tb.innerHTML = `<thead><tr><th>${t("cable")}</th><th class="r">dB/100 m</th><th class="r">${t("total_loss")}</th>` +
      `<th class="r">${t("power_at_antenna")}</th><th class="r">${t("vs_best")}</th><th class="r">${t("max_power")}</th></tr></thead>`;
    const body = el("tbody");
    for (const { c, i, r } of rows) {
      const tr = el("tr");
      if (!r) {
        tr.innerHTML = `<td><i class="dot" style="background:${seriesColor(i)}"></i><a href="#/cable/${encodeURIComponent(c.id)}">${esc(c.s)}</a></td><td colspan="5" class="muted">${t("no_data")}</td>`;
      } else {
        tr.innerHTML = `<td><i class="dot" style="background:${seriesColor(i)}"></i><a href="#/cable/${encodeURIComponent(c.id)}">${esc(c.s)}</a></td>` +
          `<td class="r num">${fmtA(r.attDb100m)}${indicators(c, st.f)}</td>` +
          `<td class="r num"><b>${fmt(r.totalLossDb, 2)} dB</b></td>` +
          `<td class="r num">${fmtW(r.pOutW)} W <small>(${fmtPct(r.efficiency)})</small></td>` +
          `<td class="r num">${r.totalLossDb - best < 0.005 ? "—" : "+" + fmt(r.totalLossDb - best, 2) + " dB"}</td>` +
          `<td class="r num${r.overPower ? " warn-t" : ""}">${r.pMaxW == null ? "–" : fmtW(r.pMaxW) + " W"}</td>`;
      }
      body.append(tr);
    }
    tb.append(body);
    tableBox.append(tb);
  }
}

function numIn(v, on) {
  const i = document.createElement("input");
  i.type = "number";
  i.step = "any";
  i.min = 0.001;
  i.value = v;
  i.addEventListener("input", () => { const n = Number(i.value); if (n > 0) on(n); });
  return i;
}
