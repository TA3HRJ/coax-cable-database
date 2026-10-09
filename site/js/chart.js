// Log-log zayıflama grafiği (SVG, kütüphanesiz). Fareyle/dokunarak gezinince dikey çizgi ve değer kutusu.
// Renkler: dataviz referans paleti, kategorik 8 slot (açık/koyu ayrı adımlar, sabit sıra). Kimlik yalnızca
// renge kalmasın diye her seriye kesik çizgi deseni ve açıklama (legend) eklenir; ≤4 seride sağ uçta doğrudan etiket.

const NS = "http://www.w3.org/2000/svg";
export const SERIES = 8;
const DASH = ["", "6 3", "2 3", "8 3 2 3", "", "6 3", "2 3", "8 3 2 3"];

export function seriesColor(i) {
  return `var(--series-${(i % SERIES) + 1})`;
}

/**
 * series: [{ label, i (renk sırası), pts: [[f, y], ...], markers?: [[f, y], ...], est?: (f) => bool }]
 * opts: { xmin, xmax, unit, fmt(y), fmtX(f), height }
 */
export function logLogChart(series, opts) {
  const W = 760, H = opts.height || 380, M = { l: 52, r: series.length <= 4 ? 96 : 16, t: 12, b: 34 };
  const iw = W - M.l - M.r, ih = H - M.t - M.b;
  const ys = series.flatMap((s) => [...s.pts, ...(s.markers || [])].map((p) => p[1])).filter((y) => y > 0);
  let ymin = Math.pow(10, Math.floor(Math.log10(Math.min(...ys))));
  let ymax = Math.pow(10, Math.ceil(Math.log10(Math.max(...ys))));
  if (ymax / ymin < 10) ymax = ymin * 10;
  const lx0 = Math.log10(opts.xmin), lx1 = Math.log10(opts.xmax), ly0 = Math.log10(ymin), ly1 = Math.log10(ymax);
  const X = (f) => M.l + ((Math.log10(f) - lx0) / (lx1 - lx0)) * iw;
  const Y = (y) => M.t + ih - ((Math.log10(y) - ly0) / (ly1 - ly0)) * ih;

  const wrap = document.createElement("div");
  wrap.className = "chart";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", opts.ariaLabel || "");
  wrap.append(svg);

  // ızgara: on katlar belirgin, 2 ve 5 silik
  const grid = g(svg, "grid");
  for (let d = Math.floor(lx0); d <= Math.ceil(lx1); d++) {
    for (const m of [1, 2, 5]) {
      const f = m * Math.pow(10, d);
      if (f < opts.xmin || f > opts.xmax) continue;
      line(grid, X(f), M.t, X(f), M.t + ih, m === 1 ? "g-major" : "g-minor");
      if (m === 1 || iw > 500) text(grid, X(f), H - M.b + 18, opts.fmtX(f), "ax", "middle");
    }
  }
  for (let d = Math.round(ly0); d <= Math.round(ly1); d++) {
    for (const m of [1, 2, 5]) {
      const y = m * Math.pow(10, d);
      if (y < ymin || y > ymax) continue;
      line(grid, M.l, Y(y), M.l + iw, Y(y), m === 1 ? "g-major" : "g-minor");
      if (m === 1 || ly1 - ly0 <= 2) text(grid, M.l - 6, Y(y) + 4, axisNum(y), "ax", "end");
    }
  }
  text(svg, M.l + iw, H - 4, opts.xTitle || "MHz", "ax-t", "end");
  text(svg, 4, M.t + 10, opts.unit, "ax-t", "start");

  // seriler
  series.forEach((s) => {
    const d = s.pts.map((p, k) => `${k ? "L" : "M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join("");
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "s-line");
    path.style.stroke = seriesColor(s.i);
    if (DASH[s.i % SERIES]) path.setAttribute("stroke-dasharray", DASH[s.i % SERIES]);
    svg.append(path);
    for (const p of s.markers || []) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", X(p[0]));
      c.setAttribute("cy", Y(p[1]));
      c.setAttribute("r", 4);
      c.setAttribute("class", "s-mark");
      c.style.fill = seriesColor(s.i);
      svg.append(c);
    }
  });

  // ≤4 seride sağ uçta doğrudan etiket; çakışmasın diye dikeyde en az 14px aralıkla itilir
  if (series.length <= 4) {
    const labs = series.filter((s) => s.pts.length).map((s) => {
      const last = s.pts[s.pts.length - 1];
      return { s, x: X(last[0]) + 6, y: Y(last[1]) + 4 };
    }).sort((a, b) => a.y - b.y);
    // Grafik henüz sayfada değil (getBBox sıfır döner); kutu yazı uzunluğundan tahmin edilir (12px yazı ≈ 6.8px/karakter).
    const placed = [];
    for (const l of labs) {
      const w = l.s.label.length * 6.8, h = 13;
      let y = l.y;
      for (let k = 0; k < 6; k++) {
        const hit = placed.some((p) => l.x < p.x + p.w && p.x < l.x + w && y - h < p.y && p.y - h < y);
        if (!hit) break;
        y += 14;
      }
      placed.push({ x: l.x, y, w });
      text(svg, l.x, y, l.s.label, "s-label", "start");
    }
  }

  // açıklama (≥2 seri)
  if (series.length >= 2) {
    const lg = document.createElement("div");
    lg.className = "legend";
    lg.innerHTML = series.map((s) =>
      `<span><svg width="22" height="8" aria-hidden="true"><line x1="0" y1="4" x2="22" y2="4" stroke="${seriesColor(s.i)}" stroke-width="2.5" ${DASH[s.i % SERIES] ? `stroke-dasharray="${DASH[s.i % SERIES]}"` : ""}/></svg>${esc(s.label)}</span>`).join("");
    wrap.append(lg);
  }

  // gezinme: dikey çizgi + değer kutusu
  const cross = line(svg, 0, M.t, 0, M.t + ih, "cross");
  cross.style.display = "none";
  const tip = document.createElement("div");
  tip.className = "tip";
  tip.hidden = true;
  wrap.append(tip);
  const move = (ev) => {
    const r = svg.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * W;
    if (px < M.l || px > M.l + iw) { leave(); return; }
    const f = Math.pow(10, lx0 + ((px - M.l) / iw) * (lx1 - lx0));
    cross.setAttribute("x1", px);
    cross.setAttribute("x2", px);
    cross.style.display = "";
    const rows = series
      .map((s) => ({ s, y: valueAt(s.pts, f) }))
      .filter((o) => o.y != null)
      .sort((a, b) => a.y - b.y);
    tip.innerHTML = `<b>${opts.fmtX(f, true)}</b>` + rows.map((o) =>
      `<div><i style="background:${seriesColor(o.s.i)}"></i>${esc(o.s.label)}<span>${opts.fmt(o.y)}${o.s.est && o.s.est(f) ? " ~" : ""}</span></div>`).join("");
    tip.hidden = false;
    const left = ((px / W) * r.width);
    tip.style.left = `${Math.min(left + 12, r.width - tip.offsetWidth - 4)}px`;
    tip.style.top = `${8}px`;
  };
  const leave = () => { cross.style.display = "none"; tip.hidden = true; };
  svg.addEventListener("pointermove", move);
  svg.addEventListener("pointerdown", move);
  svg.addEventListener("pointerleave", leave);
  return wrap;
}

/** Eksen etiketi: 1 ve üstü tam sayı (binlik ayraçsız), altı en fazla 2 ondalık. */
function axisNum(y) {
  const loc = document.documentElement.lang === "en" ? "en-US" : "tr-TR";
  return new Intl.NumberFormat(loc, { maximumFractionDigits: y >= 1 ? 0 : 2, useGrouping: false }).format(y);
}

function valueAt(pts, f) {
  if (!pts.length || f < pts[0][0] || f > pts[pts.length - 1][0]) return null;
  for (let k = 1; k < pts.length; k++) {
    if (pts[k][0] >= f) {
      const [x0, y0] = pts[k - 1], [x1, y1] = pts[k];
      const t = (Math.log(f) - Math.log(x0)) / (Math.log(x1) - Math.log(x0));
      return Math.exp(Math.log(y0) + t * (Math.log(y1) - Math.log(y0)));
    }
  }
  return pts[pts.length - 1][1];
}
function g(parent, cls) {
  const e = document.createElementNS(NS, "g");
  e.setAttribute("class", cls);
  parent.append(e);
  return e;
}
function line(parent, x1, y1, x2, y2, cls) {
  const e = document.createElementNS(NS, "line");
  Object.entries({ x1, y1, x2, y2 }).forEach(([k, v]) => e.setAttribute(k, v));
  e.setAttribute("class", cls);
  parent.append(e);
  return e;
}
function text(parent, x, y, s, cls, anchor) {
  const e = document.createElementNS(NS, "text");
  e.setAttribute("x", x);
  e.setAttribute("y", y);
  e.setAttribute("class", cls);
  if (anchor) e.setAttribute("text-anchor", anchor);
  e.textContent = s;
  parent.append(e);
  return e;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

/** Bir kablonun çizilecek eğrisi: veri aralığının yarısından iki katına (ve xmin..xmax içinde) log-aralıklı noktalar. */
export function curve(cable, attFn, xmin = 1, xmax = 10000, n = 60) {
  const a = Math.max(xmin, cable.fa / 2), b = Math.min(xmax, cable.fb * 2);
  const pts = [];
  for (let k = 0; k <= n; k++) {
    const f = Math.pow(10, Math.log10(a) + (k / n) * (Math.log10(b) - Math.log10(a)));
    pts.push([f, attFn(cable, f)]);
  }
  return pts;
}
