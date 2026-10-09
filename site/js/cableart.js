// Kablo kesit çizimi: verideki yapıdan (iletken, dielektrik, ekran, kılıf ve çaplar) kademeli, eğik bir SVG.
// Katmanlar dıştan içe kısalır; kesit yüzleri solda, kablo sağ kenardan taşar. DOM'suz, yalnızca metin üretir.

let seq = 0;

// Malzeme renkleri: [koyu, açık, taban, yüz]
const MAT = {
  copper: ["#6a3510", "#f6c08c", "#bd7438", "#d98d4f"],
  silver: ["#62676f", "#fbfcfd", "#b7bcc3", "#d6dade"],
  alu: ["#767b83", "#ffffff", "#c6cad0", "#dfe2e6"],
  steel: ["#4c5158", "#c9cdd2", "#8a9097", "#9da3aa"],
  foam: ["#a29b8a", "#fffdf6", "#e6e1d4", "#f3efe4"],
  pe: ["#8f9ea7", "#ffffff", "#d8e2e7", "#eaf0f3"],
  ptfe: ["#a9a9a9", "#ffffff", "#ececec", "#f7f7f7"],
  black: ["#08090a", "#5d636b", "#25282c", "#3a3e44"],
  brown: ["#3e220c", "#c48a57", "#7e4a22", "#94613a"],
  white: ["#9b9b9b", "#ffffff", "#e9e9e9", "#f4f4f4"],
};

/** Verideki metinlerden katman listesi (dıştan içe). Eksik çaplar empedans/VF'den tahmin edilir. */
export function layers(c) {
  const od = c.od || 5;
  const er = 1 / Math.pow(c.vf || 0.66, 2);
  const ratio = Math.exp(((c.z || 50) * Math.sqrt(er)) / 60); // D/d
  let dd = c.dd, icd = c.icd;
  if (!dd && icd) dd = Math.min(icd * ratio, od * 0.9);
  if (!dd) dd = od * 0.68;
  if (!icd) icd = dd / ratio;
  const sh = c.sh || "örgü";
  const icm = c.icm || "", icc = c.icc || "", dm = c.dm || "", jk = c.jk || "";

  const L = [];
  const rd = dd / 2, ro = od / 2;
  const corr = /oluklu/i.test(sh);
  const corrD = corr ? parseFloat((sh.match(/\(([\d.]+)\s*mm\)/) || [])[1]) : NaN;
  const shOuter = corr && corrD > dd && corrD < od ? corrD / 2 : rd + (ro - rd) * 0.55;

  const jkMat = /kahverengi|brown/i.test(jk) || (/^FEP/.test(jk) && !/siyah/i.test(jk)) ? "brown"
    : /beyaz|white|PTFE bant/i.test(jk) ? "white" : "black";
  L.push({ part: "jacket", r: ro, mat: jkMat });

  if (corr) {
    L.push({ part: "shield", r: shOuter, mat: "copper", tex: "corr" });
  } else {
    const braids = /örgü/i.test(sh) ? (/çift/i.test(sh) ? 2 : 1) : 0;
    const foil = /folyo|bant|foil|duofoil|duobond/i.test(sh);
    const bMat = /gümüş/i.test(sh) ? "silver" : /kalaylı/i.test(sh) ? "silver" : "copper";
    const fMat = /bakır (folyo|bant)|bakır\/poly|copper/i.test(sh) ? "copper" : "alu";
    const n = braids + (foil ? 1 : 0);
    const step = (shOuter - rd) / Math.max(n, 1);
    let r = shOuter;
    for (let i = 0; i < braids; i++, r -= step) L.push({ part: "shield", r, mat: bMat, tex: "braid" });
    if (foil) L.push({ part: "shield", r, mat: fMat, tex: "foil" });
  }

  const dMat = /PTFE/i.test(dm) ? "ptfe" : /köpük|foam|hava|hücre|spiral/i.test(dm) ? "foam" : "pe";
  const dTex = /hücre|hava aralıklı/i.test(dm) ? "cells" : /spiral/i.test(dm) ? "spiral" : dMat === "foam" ? "foam" : "";
  L.push({ part: "dielectric", r: rd, mat: dMat, tex: dTex });

  const tube = /boru/i.test(icm + icc);
  const strands = /(\d+)\s*x/i.test(icc) ? (Number(icc.match(/(\d+)\s*x/i)[1]) >= 19 ? 19 : 7) : /örgülü|telli/i.test(icc) ? 7 : 1;
  const core = /CCA|alüminyum/i.test(icm) ? "alu" : /çelik|CCS/i.test(icm) ? "steel" : null;
  const skin = /gümüş|kalaylı/i.test(icm) ? "silver" : "copper";
  L.push({ part: "conductor", r: icd / 2, mat: skin, core, tube, strands, tex: strands > 1 ? "strand" : "" });
  L.est = { dd: !c.dd, icd: !c.icd };
  return L;
}

/**
 * SVG metni. o: { w, h, tilt, numbered, fit }
 * fit: kablo yüksekliği gerçek çapla (logaritmik) ölçeklenir; false ise kutuyu doldurur.
 */
export function cableSvg(c, o = {}) {
  const w = o.w || 150, h = o.h || 72, tilt = o.tilt ?? -9;
  const id = `ca${++seq}`;
  const Ls = layers(c);
  const Rmax = h * 0.4;
  const t = o.fit === false ? 1 : Math.min(1, Math.max(0, Math.log((c.od || 5) / 2.5) / Math.log(30 / 2.5)));
  const R = Rmax * (0.5 + 0.5 * t);

  // Görünür halka kalınlığı: gerçek oran korunur ama çok ince katmanlar en az bir çizgi kadar kalır.
  const sc = R / Ls[0].r;
  const rs = Ls.map((l) => l.r * sc);
  const minGap = Math.max(1.1, R * 0.07);
  for (let i = rs.length - 2; i >= 0; i--) rs[i] = Math.max(rs[i], rs[i + 1] + minGap);
  const k = R / rs[0];
  for (let i = 0; i < rs.length; i++) rs[i] *= k;

  const K = 0.32; // kesit elipsinin yatay basıklığı
  const cy = h / 2;
  const n = Ls.length;
  const left = 4 + rs[n - 1] * K;
  const avail = (o.span || 0.62) * w - left;
  const step = Math.max(avail / (n - 1), rs[0] * K * 1.6);
  const xs = Ls.map((_, i) => left + (n - 1 - i) * step);
  xs[n - 1] = left;
  const xEnd = w + rs[0] + 20;

  const defs = [];
  const body = [];
  const grad = (name, m) => {
    const [dk, lt, base] = MAT[m];
    defs.push(`<linearGradient id="${id}${name}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${dk}"/><stop offset=".2" stop-color="${lt}"/><stop offset=".42" stop-color="${base}"/>` +
      `<stop offset=".82" stop-color="${dk}"/><stop offset="1" stop-color="${dk}"/></linearGradient>`);
    return `url(#${id}${name})`;
  };
  const p = Math.max(2.4, R * 0.16);
  defs.push(`<pattern id="${id}braid" width="${p}" height="${p}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
    `<path d="M0 0H${p}M0 0V${p}" stroke="rgba(0,0,0,.42)" stroke-width="${p * 0.22}"/>` +
    `<path d="M0 ${p / 2}H${p}M${p / 2} 0V${p}" stroke="rgba(255,255,255,.35)" stroke-width="${p * 0.12}"/></pattern>`);
  defs.push(`<pattern id="${id}foam" width="3" height="3" patternUnits="userSpaceOnUse">` +
    `<circle cx=".8" cy=".9" r=".42" fill="rgba(0,0,0,.09)"/><circle cx="2.2" cy="2.1" r=".32" fill="rgba(0,0,0,.07)"/></pattern>`);
  const cp = Math.max(3, R * 0.3);
  defs.push(`<pattern id="${id}corr" width="${cp}" height="${cp}" patternUnits="userSpaceOnUse">` +
    `<rect width="${cp * 0.38}" height="${cp}" fill="rgba(0,0,0,.32)"/><rect x="${cp * 0.55}" width="${cp * 0.14}" height="${cp}" fill="rgba(255,255,255,.35)"/></pattern>`);
  defs.push(`<pattern id="${id}spiral" width="${p * 2}" height="${p * 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(60)">` +
    `<path d="M0 ${p}H${p * 2}" stroke="rgba(0,0,0,.18)" stroke-width="${p * 0.5}"/></pattern>`);

  const sp = Math.max(1.6, rs[n - 1] * 0.7);
  defs.push(`<pattern id="${id}strand" width="${sp}" height="${sp}" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">` +
    `<path d="M0 ${sp / 2}H${sp}" stroke="rgba(0,0,0,.38)" stroke-width="${sp * 0.18}"/></pattern>`);

  const edge = `stroke="var(--art-edge)" stroke-width=".6"`;
  const capsule = (xa, xb, r) => {
    const rx = r * K;
    return `M${f(xa)} ${f(cy - r)}H${f(xb)}A${f(rx)} ${f(r)} 0 0 1 ${f(xb)} ${f(cy + r)}H${f(xa)}A${f(rx)} ${f(r)} 0 0 1 ${f(xa)} ${f(cy - r)}Z`;
  };
  const ell = (x, r, fill, extra = "") => `<ellipse cx="${f(x)}" cy="${f(cy)}" rx="${f(r * K)}" ry="${f(r)}" fill="${fill}" ${extra}/>`;

  Ls.forEach((l, i) => {
    const r = rs[i], x = xs[i], xb = i === 0 ? xEnd : xs[i - 1];
    const d = capsule(x, xb, r);
    body.push(`<path d="${d}" fill="${grad("g" + i, l.mat)}" ${edge}/>`);
    if (l.tex && l.tex !== "cells") body.push(`<path d="${d}" fill="url(#${id}${l.tex})"/>`);
    // kesit yüzü
    const face = MAT[l.mat][3];
    if (l.part === "conductor") body.push(conductorFace(l, x, r));
    else {
      body.push(ell(x, r, face, edge));
      if (l.tex === "braid") body.push(ell(x, r, `url(#${id}braid)`));
      if (l.tex === "foam") body.push(ell(x, r, `url(#${id}foam)`));
      if (l.tex === "corr") body.push(ell(x, r * 0.97, "none", `stroke="rgba(0,0,0,.35)" stroke-width="${f(r * 0.05)}" stroke-dasharray="${f(r * 0.12)} ${f(r * 0.08)}"`));
      if (l.tex === "cells") {
        const ri = rs[n - 1] * 1.25;
        for (let a = 0; a < 5; a++) {
          const th = (a / 5) * 2 * Math.PI - Math.PI / 2;
          body.push(`<line x1="${f(x + Math.cos(th) * ri * K)}" y1="${f(cy + Math.sin(th) * ri)}" x2="${f(x + Math.cos(th) * r * 0.96 * K)}" y2="${f(cy + Math.sin(th) * r * 0.96)}" stroke="rgba(0,0,0,.28)" stroke-width="${f(Math.max(0.6, r * 0.05))}"/>`);
        }
      }
    }
  });

  function conductorFace(l, x, r) {
    const [, , , faceSkin] = MAT[l.mat];
    let s = ell(x, r, faceSkin, edge);
    if (l.tube) return s + ell(x, r * 0.62, "#2b1a0e");
    if (l.strands > 1) {
      const pts = l.strands === 19 ? hex(2) : hex(1);
      const sr = r / (l.strands === 19 ? 5 : 3);
      s = ell(x, r, "rgba(0,0,0,.35)");
      for (const [px, py] of pts) {
        s += `<ellipse cx="${f(x + px * sr * 2 * K)}" cy="${f(cy + py * sr * 2)}" rx="${f(sr * K * 0.95)}" ry="${f(sr * 0.95)}" fill="${faceSkin}"/>`;
      }
      return s;
    }
    if (l.core) s += ell(x, r * 0.8, MAT[l.core][3]);
    return s;
  }

  // numaralı etiketler (detay sayfası): her katmanın görünen bölümünün üstünde
  const marks = [];
  if (o.numbered) {
    const rad = (tilt * Math.PI) / 180, cx0 = w / 2;
    const rot = (x, y) => [cx0 + (x - cx0) * Math.cos(rad) - (y - cy) * Math.sin(rad), cy + (x - cx0) * Math.sin(rad) + (y - cy) * Math.cos(rad)];
    let num = 0;
    Ls.forEach((l, i) => {
      if (i > 0 && Ls[i - 1].part === l.part) return; // aynı parçanın iç katmanları aynı numarayı paylaşır
      num++;
      const xa = xs[i], xb = i === 0 ? Math.min(xEnd, w - 14) : xs[i - 1];
      const mx = i === 0 ? (xa + xb) / 2 + rs[0] * K : (xa + xb) / 2;
      const [ax, ay] = rot(mx, cy - rs[i]);
      const [bx, by] = [ax, Math.max(9, ay - 14 - (num % 2) * 8)];
      marks.push(`<line x1="${f(ax)}" y1="${f(ay)}" x2="${f(bx)}" y2="${f(by + 7)}" stroke="var(--dim)" stroke-width=".8"/>` +
        `<circle cx="${f(bx)}" cy="${f(by)}" r="7" fill="var(--card)" stroke="var(--dim)" stroke-width=".8"/>` +
        `<text x="${f(bx)}" y="${f(by + 3.2)}" text-anchor="middle" font-size="9" font-weight="700" fill="var(--fg)">${num}</text>`);
    });
  }

  return `<svg class="cable-art" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${o.numbered ? "" : 'aria-hidden="true" '}focusable="false">` +
    `<defs>${defs.join("")}</defs><g transform="rotate(${tilt} ${w / 2} ${cy})">${body.join("")}</g>${marks.join("")}</svg>`;
}

/** Altıgen yerleşim: 1 halka -> 7 tel, 2 halka -> 19 tel (birim: tel çapı). */
function hex(rings) {
  const pts = [[0, 0]];
  for (let k = 1; k <= rings; k++) {
    for (let s = 0; s < 6; s++) {
      for (let j = 0; j < k; j++) {
        const a0 = (s * Math.PI) / 3, a1 = ((s + 1) * Math.PI) / 3;
        const x = k * Math.cos(a0) + (j / k) * k * (Math.cos(a1) - Math.cos(a0));
        const y = k * Math.sin(a0) + (j / k) * k * (Math.sin(a1) - Math.sin(a0));
        pts.push([x, y]);
      }
    }
  }
  return pts;
}

function f(v) {
  return Math.round(v * 10) / 10;
}
