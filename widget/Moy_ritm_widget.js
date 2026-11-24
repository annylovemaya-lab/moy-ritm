// Мой ритм: виджет для Scriptable (iOS). Главный экран, экран блокировки (iOS 16+).
// 1) Впиши адрес своего widget.json ниже. 2) Сохрани скрипт. 3) Добавь виджет Scriptable и выбери этот скрипт.
const URL_JSON = "https://ВАШ-ЛОГИН.github.io/moy-ritm/widget.json";
const fm = FileManager.local();
const cache = fm.joinPath(fm.cacheDirectory(), "moy_ritm_widget.json");
async function load() {
  try { const j = await new Request(URL_JSON + "?t=" + Date.now()).loadJSON(); fm.writeString(cache, JSON.stringify(j)); return j; }
  catch (e) { try { return JSON.parse(fm.readString(cache)); } catch (e2) { return null; } }
}
const pad = (n) => String(n).padStart(2, "0");
const hm = (m) => pad(Math.floor(m / 60)) + ":" + pad(m % 60);
const hex = (h, d) => new Color(h || d);
function pick(j) {
  const now = new Date(), ds = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()), n = now.getHours() * 60 + now.getMinutes();
  const list = (j && j.days && j.days[ds]) || [];
  let ci = -1; list.forEach((b, i) => { if (b[0] <= n) ci = i; });
  const cur = ci >= 0 ? list[ci] : null, nxt = list[ci + 1] || null;
  return { cur, nxt, today: j && j.today === ds };
}
async function build() {
  const j = await load(), w = new ListWidget(), fam = config.widgetFamily || "medium";
  if (!j) { w.addText("Нет данных. Открой «Мой ритм» и нажми «Отправить данные»."); return w; }
  const { cur, nxt, today } = pick(j), c1 = hex(j.color && j.color[0], "#c4b0ee"), c2 = hex(j.color && j.color[1], "#f2d0da");
  if (fam === "accessoryInline") { w.addText((cur ? cur[2] + " " + hm(cur[0]) + " " + cur[1] : "Мой ритм") + ""); return w; }
  if (fam === "accessoryCircular") {
    const t = w.addText((j.pct || 0) + "%"); t.font = Font.boldSystemFont(18); t.centerAlignText();
    const s = w.addText("дня"); s.font = Font.systemFont(9); s.centerAlignText(); return w;
  }
  if (fam === "accessoryRectangular") {
    const a = w.addText(cur ? cur[2] + " " + hm(cur[0]) + " " + cur[1] : "Свободно"); a.font = Font.boldSystemFont(13); a.lineLimit = 2;
    if (nxt) { const b = w.addText("→ " + hm(nxt[0]) + " " + nxt[1]); b.font = Font.systemFont(11); b.lineLimit = 1; }
    const c = w.addText("Сделано " + (j.pct || 0) + "% · вода " + (j.water || 0) + "/8"); c.font = Font.systemFont(10); return w;
  }
  const g = new LinearGradient(); g.colors = [new Color("#fbf6ff"), new Color("#f4eafc")]; g.locations = [0, 1]; w.backgroundGradient = g; w.setPadding(14, 16, 12, 16);
  const tag = w.addText(cur ? "СЕЙЧАС · " + hm(cur[0]) : "ДАЛЬШЕ"); tag.font = Font.boldSystemFont(11); tag.textColor = new Color("#8a72c0");
  w.addSpacer(3);
  const t = w.addText(cur ? cur[2] + " " + cur[1] : nxt ? nxt[2] + " " + nxt[1] : "Свободный вечер"); t.font = Font.boldSystemFont(fam === "small" ? 16 : 20); t.textColor = new Color("#2d2a33"); t.lineLimit = 3;
  w.addSpacer();
  if (nxt) { const n2 = w.addText("Дальше " + hm(nxt[0]) + ": " + nxt[1]); n2.font = Font.systemFont(12); n2.textColor = new Color("#6d6679"); n2.lineLimit = 1; }
  const row = w.addStack(); row.centerAlignContent(); row.spacing = 6; row.setPadding(6, 0, 0, 0);
  [c1, c2].forEach((c) => { const s = row.addStack(); s.size = new Size(14, 14); s.cornerRadius = 7; s.backgroundColor = c; });
  const p = row.addText("  " + (j.pct || 0) + "% дня · вода " + (j.water || 0) + "/8"); p.font = Font.systemFont(11); p.textColor = new Color("#6d6679");
  w.refreshAfterDate = new Date(Date.now() + 10 * 60000);
  return w;
}
const w = await build();
if (config.runsInWidget) Script.setWidget(w); else await w.presentMedium();
Script.complete();
