// Tümü: aranabilir, süzülebilir, sıralanabilir kablo tablosu. URL: #/all?q=&z=&cls=&m=&f=&sort=&dir=
import { t, lang, fmt } from "../i18n.js";
import * as coax from "../coax.js";
import { el, esc, fmtA, indicators, classLabel, cname, cmfr } from "../util.js";

export function renderAll(view, ctx) {
  const { db } = ctx;
  const p = ctx.params;
  const st = {
    q: p.get("q") || "", z: p.get("z") || "", cls: p.get("cls") || "", m: p.get("m") || "",
    f: Number(p.get("f")) || 144, sort: p.get("sort") || "att", dir: p.get("dir") === "desc" ? -1 : 1,
  };
  const mfrs = [...new Set(db.cables.map((c) => cmfr(mfrGroup(c.m))))].sort((a, b) => a.localeCompare(b));

  view.append(el("div", "page-head", `<h1>${t("all_title")}</h1><p>${t("all_lead", db.cables.length)}</p>`));
  const bar = el("div", "panel filters");
  const q = Object.assign(document.createElement("input"), { type: "search", placeholder: t("search_ph"), value: st.q });
  q.setAttribute("aria-label", t("search_ph"));
  const zSel = select([["", t("all_z")], ["50", "50 Ω"], ["75", "75 Ω"], ["93", "93 Ω"]], st.z);
  const cSel = select([["", t("all_classes")], ...db.classes.map((k) => [k.k, lang === "tr" ? k.tr : k.en])], st.cls);
  const mSel = select([["", t("all_mfrs")], ...mfrs.map((m) => [m, m])], st.m);
  const fSel = select(db.bands.map(([l, f]) => [String(f), `${l} (${f} MHz)`]), String(st.f));
  fSel.setAttribute("aria-label", t("band"));
  const count = el("span", "muted");
  bar.append(q, zSel, cSel, mSel, fSel, count);
  const wrap = el("div", "panel table-wrap");
  view.append(bar, wrap);

  q.addEventListener("input", () => { st.q = q.value; draw(); });
  zSel.addEventListener("change", () => { st.z = zSel.value; draw(); });
  cSel.addEventListener("change", () => { st.cls = cSel.value; draw(); });
  mSel.addEventListener("change", () => { st.m = mSel.value; draw(); });
  fSel.addEventListener("change", () => { st.f = Number(fSel.value); draw(); });

  const COLS = [
    ["s", t("cable"), (c) => c.s, ""],
    ["m", t("manufacturer"), (c) => cmfr(mfrGroup(c.m)), ""],
    ["z", "Z (Ω)", (c) => c.z, "r"],
    ["od", t("od"), (c) => c.od, "r"],
    ["vf", "VF", (c) => c.vf ?? null, "r"],
    ["att", "dB/100 m", (c) => (coax.isShown(c, st.f) ? coax.attenuation(c, st.f) : null), "r"],
    ["pk", t("peak_kw"), (c) => c.pk ?? null, "r"],
    ["cls", t("class"), (c) => db.classes.findIndex((k) => k.k === c.cls), ""],
  ];
  draw();

  function draw() {
    ctx.setParams({ q: st.q || null, z: st.z || null, cls: st.cls || null, m: st.m || null, f: st.f, sort: st.sort, dir: st.dir < 0 ? "desc" : null });
    const needle = norm(st.q);
    const list = db.cables.filter((c) =>
      (!st.z || String(c.z) === st.z) && (!st.cls || c.cls === st.cls) && (!st.m || cmfr(mfrGroup(c.m)) === st.m) &&
      (!needle || norm(`${c.s} ${c.n} ${cname(c)} ${c.m} ${c.fam || ""} ${c.pn || ""}`).includes(needle)));
    const col = COLS.find((x) => x[0] === st.sort) || COLS[5];
    list.sort((a, b) => {
      const va = col[2](a), vb = col[2](b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      return (typeof va === "string" ? va.localeCompare(vb) : va - vb) * st.dir;
    });
    count.textContent = t("n_cables", list.length);
    const tb = el("table", "tbl sortable");
    const head = el("tr");
    for (const [k, label, , cls] of COLS) {
      const th = el("th", cls);
      const b = el("button", "", `${label}${st.sort === k ? (st.dir > 0 ? " ▲" : " ▼") : ""}`);
      b.type = "button";
      b.addEventListener("click", () => { st.dir = st.sort === k ? -st.dir : 1; st.sort = k; draw(); });
      th.append(b);
      th.setAttribute("aria-sort", st.sort === k ? (st.dir > 0 ? "ascending" : "descending") : "none");
      head.append(th);
    }
    const thead = el("thead");
    thead.append(head);
    const body = el("tbody");
    for (const c of list) {
      const att = COLS[5][2](c);
      const tr = el("tr");
      tr.innerHTML =
        `<td><a href="#/cable/${encodeURIComponent(c.id)}"><b>${esc(c.s)}</b></a><div class="sub">${esc(cname(c))}</div></td>` +
        `<td>${esc(cmfr(mfrGroup(c.m)))}</td><td class="r num">${c.z}</td><td class="r num">${fmt(c.od, 1)}</td>` +
        `<td class="r num">${c.vf ? fmt(c.vf, 2) : "–"}</td>` +
        `<td class="r num">${att == null ? "–" : fmtA(att) + indicators(c, st.f)}</td>` +
        `<td class="r num">${c.pk ? fmt(c.pk, c.pk < 10 ? 1 : 0) : "–"}</td>` +
        `<td class="muted">${esc(classLabel(db, c))}</td>`;
      body.append(tr);
    }
    tb.append(thead, body);
    wrap.replaceChildren(list.length ? tb : el("p", "empty", t("no_match")));
  }
}

/** "Times Microwave Systems (Amphenol)" → "Times Microwave Systems"; "CommScope (Andrew)" → "CommScope". */
function mfrGroup(m) {
  return String(m || "").replace(/\s*\(.*\)\s*$/, "");
}
function norm(s) {
  return String(s).toLocaleLowerCase("tr").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]/g, "");
}
function select(opts, value) {
  const s = document.createElement("select");
  for (const [v, l] of opts) s.append(Object.assign(document.createElement("option"), { value: v, textContent: l }));
  s.value = value;
  return s;
}
