// Eşlik denetimleri - Node (parity.test.mjs) ve tarayıcı (parity.html) aynı kodu kullanır.
// Referanslar Excel'in hesapladığı değerlerdir:
//   export/csv/ham_bands.csv            (Ham_Bands sayfası, 12 bant x tüm kablolar)
//   tests/fixtures/excel_calculator.json (Calculator sayfası + tüm kabloların karşılaştırma tablosu)
// JSON'daki noktalar 6 anlamlı basamağa yuvarlandığı için göreli tolerans 2e-5.

const REL_TOL = 2e-5;

function close(a, b, tol = REL_TOL) {
  if (a == null || b == null) return a == b;
  return Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b), 1e-12);
}

export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const hdr = lines[0].split(",");
  return lines.slice(1).map((l) => Object.fromEntries(l.split(",").map((v, i) => [hdr[i], v])));
}

export function runParity({ db, hamCsv, fixture, coax }) {
  const failures = [];
  let checks = 0;
  const byId = Object.fromEntries(db.cables.map((c) => [c.id, c]));
  const check = (ok, msg) => {
    checks++;
    if (!ok) failures.push(msg);
  };

  // 1) Veri bütünlüğü
  for (const c of db.cables) {
    for (const [arr, name] of [[c.a, "a"], [c.p, "p"]]) {
      if (!arr) continue;
      for (let i = 1; i < arr.length; i++) check(arr[i][0] > arr[i - 1][0], `${c.id}.${name}: frekans sırası bozuk (${arr[i][0]})`);
      for (const pt of arr) check(pt[2] in db.src, `${c.id}.${name}: tanımsız kaynak ${pt[2]}`);
    }
    check(db.classes.some((k) => k.k === c.cls), `${c.id}: tanımsız sınıf ${c.cls}`);
    check(c.val === "typ" || c.val === "max", `${c.id}: değer türü ${c.val}`);
  }
  const pops = db.cables.filter((c) => c.pop).map((c) => c.pop).sort((x, y) => x - y);
  check(pops.every((p, i) => p === i + 1), `popular_rank 1..N kesintisiz değil: ${pops.join(",")}`);

  // 2) Ham_Bands (Excel) = JS interpolasyonu
  for (const r of parseCsv(hamCsv)) {
    const c = byId[r.cable_id];
    const f = Number(r.freq_mhz);
    if (!c) { check(false, `ham_bands: bilinmeyen kablo ${r.cable_id}`); continue; }
    const js = coax.attenuation(c, f);
    check(close(js, Number(r.att_db_100m)), `${r.cable_id} @${f} MHz: JS ${js} ≠ Excel ${r.att_db_100m}`);
    check(coax.isExtrapolated(c, f) === (r.extrapolated === "1"), `${r.cable_id} @${f}: ekstrapolasyon bayrağı farklı`);
    check(coax.isShown(c, f), `${r.cable_id} @${f}: Excel gösteriyor, JS gizliyor`);
  }

  // 3) Calculator (Excel) = JS lineCalc
  const inp = fixture.inputs;
  const opt = { f: inp.f_mhz, lengthM: inp.length_m, pInW: inp.p_in_w, swr: inp.swr };
  const r = coax.lineCalc(byId[inp.cable_id], opt);
  const o = fixture.outputs;
  for (const [js, xl, name] of [
    [r.attDb100m, o.att_db_100m, "zayıflama"], [r.matchedLossDb, o.matched_loss_db, "uyumlu kayıp"],
    [r.totalLossDb, o.total_loss_db, "toplam kayıp"], [r.pOutW, o.p_out_w, "antene güç"],
    [r.swrTx, o.swr_tx, "verici SWR"], [r.pMaxW, o.p_max_w, "maks. güç"], [r.wavelengthM, o.wavelength_m, "dalga boyu"],
  ]) check(close(js, xl), `Calculator ${name}: JS ${js} ≠ Excel ${xl}`);

  // 4) Karşılaştırma tablosu: tüm kablolar aynı f/uzunluk/güç/SWR ile
  for (const row of fixture.compare) {
    const rr = coax.lineCalc(byId[row.cable_id], opt);
    check(close(rr.attDb100m, row.att_db_100m), `${row.cable_id} karşılaştırma zayıflama: ${rr.attDb100m} ≠ ${row.att_db_100m}`);
    check(close(rr.totalLossDb, row.total_loss_db), `${row.cable_id} toplam kayıp: ${rr.totalLossDb} ≠ ${row.total_loss_db}`);
    check(close(rr.pOutW, row.p_out_w), `${row.cable_id} antene güç: ${rr.pOutW} ≠ ${row.p_out_w}`);
    check(close(rr.pMaxW, row.p_max_w), `${row.cable_id} maks. güç: ${rr.pMaxW} ≠ ${row.p_max_w}`);
  }
  check(fixture.compare.length === db.cables.length, `karşılaştırma ${fixture.compare.length} kablo, veri ${db.cables.length}`);

  return { checks, failures };
}
