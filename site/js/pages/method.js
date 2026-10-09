// Yöntem ve kaynaklar: hesap yöntemi, değer türleri, tüm kaynak belgeler, veri ve lisans.
import { t } from "../i18n.js";
import { el } from "../util.js";
import { srcItem } from "./cable.js";

export function renderMethod(view, ctx) {
  const { db } = ctx;
  view.append(el("div", "page-head", `<h1>${t("method_title")}</h1><p>${t("method_lead")}</p>`));
  const box = el("div", "panel prose");
  box.innerHTML = t("method_body");
  view.append(box);

  const src = el("div", "panel");
  src.append(el("h2", "h2", t("all_sources", Object.keys(db.src).length)));
  const ul = el("ul", "src-list");
  ul.innerHTML = Object.keys(db.src).sort().map((sid) => srcItem(db, sid)).join("");
  src.append(ul);
  view.append(src);

  const data = el("div", "panel prose");
  data.innerHTML = t("data_body");
  view.append(data);
}
