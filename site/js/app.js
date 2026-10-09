// Uygulama kabuğu: veri yükleme, hash yönlendirme (#/sayfa?parametreler), dil ve tema, karşılaştırma seçimi.
import { t, lang, setLang, applyStatic } from "./i18n.js";
import { renderPopular } from "./pages/popular.js";
import { renderCalc } from "./pages/calc.js";
import { renderCompare } from "./pages/compare.js";
import { renderAll } from "./pages/all.js";
import { renderCable } from "./pages/cable.js";
import { renderMethod } from "./pages/method.js";

const view = document.getElementById("view");
const ROUTES = { popular: renderPopular, calc: renderCalc, compare: renderCompare, all: renderAll, cable: renderCable, method: renderMethod };
const TAB_OF = { cable: "all", method: null };

const ctx = {
  db: null,
  byId: {},
  route: "popular",
  params: new URLSearchParams(),
  cmp: loadCmp(),
  /** Adres çubuğunu geçmişe kayıt eklemeden güncelle (paylaşılabilir URL). */
  setParams(obj) {
    for (const [k, v] of Object.entries(obj)) {
      if (v == null || v === "") this.params.delete(k);
      else this.params.set(k, v);
    }
    const q = this.params.toString();
    history.replaceState(null, "", `#/${this.route}${this.arg ? "/" + encodeURIComponent(this.arg) : ""}${q ? "?" + q : ""}`);
  },
  setCmp(list) {
    this.cmp = [...list];
    try { localStorage.setItem("cmp", JSON.stringify(this.cmp)); } catch (e) { /* özel pencere */ }
    updateCmpBadge();
  },
  toggleCmp(id) {
    const i = this.cmp.indexOf(id);
    if (i >= 0) this.cmp.splice(i, 1);
    else this.cmp.push(id);
    try { localStorage.setItem("cmp", JSON.stringify(this.cmp)); } catch (e) { /* özel pencere */ }
    updateCmpBadge();
    return i < 0;
  },
};

function loadCmp() {
  try {
    const v = JSON.parse(localStorage.getItem("cmp") || "[]");
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

function updateCmpBadge() {
  const b = document.getElementById("cmp-count");
  const n = ctx.db ? ctx.cmp.filter((id) => ctx.byId[id]).length : 0;
  b.textContent = n;
  b.hidden = n === 0;
}

function parseHash() {
  const h = location.hash.replace(/^#\/?/, "");
  const [path, q] = h.split("?");
  const [route, arg] = path.split("/");
  ctx.route = ROUTES[route] ? route : "popular";
  ctx.arg = arg ? decodeURIComponent(arg) : null;
  ctx.params = new URLSearchParams(q || "");
}

function render() {
  parseHash();
  document.querySelectorAll(".tab-btn").forEach((a) => {
    const tab = ctx.route in TAB_OF ? TAB_OF[ctx.route] : ctx.route;
    const on = a.dataset.route === tab;
    a.classList.toggle("active", on);
    a.setAttribute("aria-selected", on ? "true" : "false");
  });
  if (!ctx.db) return;
  view.replaceChildren();
  ROUTES[ctx.route](view, ctx, ctx.arg);
  window.scrollTo(0, 0);
  // ekran okuyucu ve klavye için: sayfa değişince odak içeriğe (ilk yüklemede değil)
  if (rendered) view.focus({ preventScroll: true });
  rendered = true;
  renderFooter();
}

let rendered = false;

function renderFooter() {
  const d = ctx.db;
  const foot = document.getElementById("foot");
  // aprsagent.com ailesinin ortak alt bilgisi: araçlar satırı (bu site işaretli), sitenin satırı, yasal not
  const tools = [["https://aprsagent.com/", "aprsagent.com"], ["https://coax.aprsagent.com/", t("fam_coax"), true],
    ["https://repeaters.aprsagent.com/", t("fam_rep")], ["https://sinav.aprsagent.com/", t("fam_exam")],
    ["https://contacts.aprsagent.com/", t("fam_contacts")]];
  foot.innerHTML = `<div class="wrap">` +
    `<nav class="fam-tools" aria-label="${t("fam_tools")}"><b>${t("fam_tools")}</b>` +
    tools.map(([u, l, me]) => `<a href="${u}"${me ? ' aria-current="page"' : ""}>${l}</a>`).join("") + `</nav>` +
    `<div class="fam-line"><span>${t("foot", d.v, d.cables.length, Object.keys(d.src).length)}</span><span>${t("foot_license")}</span>` +
    `<a href="#/method">${t("foot_method")}</a><a href="https://github.com/TA3HRJ/coax-cable-database" rel="noopener">GitHub</a>` +
    `<span class="sp"></span><span>${t("fam_op")}</span></div>` +
    `<p class="fam-legal">${t("foot_legal")} <a href="#/method?s=legal">${t("foot_legal_link")}</a></p></div>`;
}

function initHeader() {
  // Atlama bağlantısı: hash yönlendirmesini bozmadan odağı içeriğe taşı
  document.querySelector(".skip").addEventListener("click", (e) => { e.preventDefault(); view.focus(); });
  const langBtns = [...document.querySelectorAll(".lang button")];
  const sync = () => {
    langBtns.forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false"));
    document.title = `${t("app_title")} · TA3HX`;
    document.querySelector('nav.tab-bar').setAttribute("aria-label", t("nav_label"));
    applyStatic();
  };
  langBtns.forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.lang === lang) return;
    setLang(b.dataset.lang); sync(); render();
  }));
  document.getElementById("btn-theme").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) { /* özel pencere */ }
  });
  sync();
}

async function main() {
  initHeader();
  window.addEventListener("hashchange", render);
  try {
    const res = await fetch("data/cables.min.json");
    if (!res.ok) throw new Error(res.status);
    ctx.db = await res.json();
  } catch (e) {
    view.innerHTML = `<p class="empty">${t("load_error")}</p>`;
    return;
  }
  for (const c of ctx.db.cables) ctx.byId[c.id] = c;
  updateCmpBadge();
  render();
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

main();
