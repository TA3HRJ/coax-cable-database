// Henüz yapılmamış sayfalar için yer tutucu (M3/M4).
import { t } from "../i18n.js";

export function renderSoon(view, ctx) {
  const box = document.createElement("div");
  box.className = "soon";
  const msg = { calc: "soon_calc", compare: "soon_compare", all: "soon_all" }[ctx.route];
  box.innerHTML = `<p><b>${t("soon_title")}</b></p><p>${t(msg)}</p>`;
  if (ctx.route === "compare") {
    const names = ctx.cmp.filter((id) => ctx.byId[id]).map((id) => ctx.byId[id].s);
    const p = document.createElement("p");
    p.textContent = names.length ? names.join(" · ") : t("none_selected");
    box.append(p);
  }
  view.append(box);
}
