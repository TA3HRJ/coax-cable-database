// Koaksiyel kablo hesap çekirdeği - TA3HX_Coax_Database.xlsx ile birebir aynı yöntem.
// DOM'a bağımlı değildir; hem tarayıcıda hem Node'da (testler) çalışır.
// Eşlik testi: tests/parity.test.mjs (Node) ve tests/parity.html (tarayıcı).

export const FT_PER_M = 0.3048;      // dB/100 m -> dB/100 ft
export const C_MPS_MHZ = 299.792458; // ışık hızı / 1e6 -> λ(m) = C / f(MHz)

/**
 * log-log doğrusal interpolasyon. points: [[f, y, ...], ...] frekansa göre artan.
 * Excel karşılığı: MATCH(LN(f), LN(f_i), 1) ile segment seçimi (f < f_min ise ilk, f > f_max ise son segment),
 * ardından FORECAST ile ln(y)-ln(f) düzleminde doğru. Aralık dışında uç segmentin eğimiyle ekstrapolasyon yapar.
 */
export function interpLogLog(points, f) {
  const n = points.length;
  if (n < 2 || !(f > 0)) return NaN;
  let k = -1;
  for (let j = 0; j < n; j++) {
    if (points[j][0] <= f) k = j;
    else break;
  }
  const i = Math.min(Math.max(k, 0), n - 2);
  const x0 = Math.log(points[i][0]), x1 = Math.log(points[i + 1][0]);
  const y0 = Math.log(points[i][1]), y1 = Math.log(points[i + 1][1]);
  return Math.exp(y0 + (y1 - y0) * (Math.log(f) - x0) / (x1 - x0));
}

/** Zayıflama, dB/100 m. */
export function attenuation(cable, f) {
  return interpLogLog(cable.a, f);
}

/** Datasheet frekans aralığı dışında mı (sonuç tahmini). */
export function isExtrapolated(cable, f) {
  return f < cable.fa || f > cable.fb;
}

/** Ham_Bands kuralı: en yüksek veri frekansının 2 katından yukarısı gösterilmez. */
export function isShown(cable, f) {
  return f <= 2 * cable.fb;
}

/** Ortalama güç sınırı (W) - datasheet güç noktaları yoksa null. */
export function maxPower(cable, f) {
  return cable.p && cable.p.length >= 2 ? interpLogLog(cable.p, f) : null;
}

/** Uyumlu yükte hat kaybı (dB). */
export function matchedLoss(dbPer100m, lengthM) {
  return (dbPer100m * lengthM) / 100;
}

/** Yansıma katsayısı |Γ| = (SWR-1)/(SWR+1). */
export function gammaFromSwr(swr) {
  return (swr - 1) / (swr + 1);
}

/** SWR'li toplam hat kaybı (dB) - ARRL Antenna Book: TL = 10·log10[(a² − |Γ|²) / (a·(1 − |Γ|²))], a = 10^(ML/10). */
export function totalLoss(matchedLossDb, swr) {
  const g = gammaFromSwr(swr);
  const a = Math.pow(10, matchedLossDb / 10);
  return 10 * Math.log10((a * a - g * g) / (a * (1 - g * g)));
}

/** Verici ucunda görülen SWR. */
export function swrAtTransmitter(matchedLossDb, swr) {
  const g = gammaFromSwr(swr) / Math.pow(10, matchedLossDb / 10);
  return (1 + g) / (1 - g);
}

/** Kablo içindeki dalga boyu (m); VF yoksa null. */
export function wavelength(f, vf) {
  return vf ? (C_MPS_MHZ / f) * vf : null;
}

/** Hesaplayıcının tamamı: Excel Calculator sayfasıyla aynı çıktılar. */
export function lineCalc(cable, { f, lengthM, pInW, swr = 1 }) {
  const att = attenuation(cable, f);
  const ml = matchedLoss(att, lengthM);
  const tl = totalLoss(ml, swr);
  const pOut = pInW * Math.pow(10, -tl / 10);
  const pMax = maxPower(cable, f);
  const lambda = wavelength(f, cable.vf);
  return {
    attDb100m: att,
    attDb100ft: att * FT_PER_M,
    matchedLossDb: ml,
    swrLossDb: tl - ml,
    totalLossDb: tl,
    pOutW: pOut,
    efficiency: pOut / pInW,
    swrTx: swrAtTransmitter(ml, swr),
    pMaxW: pMax,
    overPower: pMax != null && pInW > pMax,
    wavelengthM: lambda,
    quarterWaveM: lambda != null ? lambda / 4 : null,
    electricalLengthWl: lambda != null ? lengthM / lambda : null,
    extrapolated: isExtrapolated(cable, f),
  };
}
