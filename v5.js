// Мой ритм ver. 5.1: окна-подсказки к делам, тренировка с подружкой, «Хочу…», эффекты опросов.
import { detailFor, WORKOUTS, TIDY_PROBLEMS, tidyPlan, some } from './details.js';
import { fimg, face } from './friend.js';
import { ico } from './icons.js';
import { pick3, mark, links, SERIES, FILMS, MUSIC, MUSIC_CTX, BOOKS, EVENING } from './tastes.js';
import { weekShopping, mondayOfDs } from './menu.js';

let C = null, g = null, iv = null, tmr = null;
const V = () => C.S.v4;
export const initV5 = (ctx) => { C = ctx; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const tm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
const key = (id) => String(id).replace(/\d+$/, '');
export const isLight = (ds) => !!(V().light && V().light[ds]);

/* ---------- Окно-подсказка у дела ---------- */
export function info(id, ds) {
  ds = ds || C.sel();
  const b = C.dayList(ds).find((x) => x.id === id); if (!b) return false;
  const d = detailFor(b, { ds, v4: V(), health: C.S.health, light: isLight(ds) });
  const done = !!(C.S.done[ds] || {})[id];
  let h = '<div class="dtHead"><span class="pgI" style="--th:' + hue(b.cat) + '">' + ico(icoOf(d.key, b.cat), { size: 30, sw: 1.5 }) + '</span><div><div class="muted">' + tm(b.t) + (b.dur ? ' · ' + b.dur + ' мин' : '') + '</div><h2 style="margin:2px 0 0">' + esc(b.title) + '</h2></div></div>';
  if (d.lead) h += '<div class="dtLead">' + esc(d.lead) + '</div>';
  if (d.guided) h += '<button class="btn dtBig" data-act="gStart" data-v="' + d.guided + '|' + id + '|' + ds + '">' + ico('spark', { size: 20 }) + ' Тренироваться с подружкой</button>';
  if (d.steps.length) h += '<ol class="dtSteps">' + d.steps.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol>';
  if (d.tasks) {
    const td = ((V().tidyDone || {})[ds + id]) || {};
    h += '<div class="dtTasks">' + d.tasks.map((t, i) => '<div class="item' + (td[i] ? ' done' : '') + '"><button class="chk" data-act="dtTask" data-v="' + ds + '|' + id + '|' + i + '" aria-label="Отметить">' + ico('check', { size: 18 }) + '</button><div class="grow t">' + esc(t.t) + '</div>' + (t.min ? '<span class="muted">' + t.min + ' мин</span>' : '') + '</div>').join('') + '</div>';
    if (d.timer) h += '<div class="addrow"><button class="btn s" data-act="dtTimer" data-v="' + d.timer + '">Таймер ' + Math.round(d.timer / 60) + ' мин</button><span id="dtTm" class="bigNum" style="font-size:22px"></span></div>';
  }
  if (d.opts && d.opts.length) h += '<div class="dtOptT">' + esc(d.optTitle || 'Варианты') + '</div><div class="dtOpts">' + d.opts.map((o) => '<div class="dtOpt">' + esc(o) + '</div>').join('') + '</div>';
  if (d.shop) { const mon = mondayOfDs(ds); h += '<div class="dtOpts">' + weekShopping(mon).slice(0, 18).map((o) => '<div class="dtOpt">' + esc(o) + '</div>').join('') + '</div>'; }
  if (d.recs || d.recMusic) h += '<div class="dtOptT">Подсказать</div><div class="chips">' + [['film', 'Фильм'], ['series', 'Сериал'], ['music', 'Музыка'], ['book', 'Почитать'], ['idea', 'Идея']].map(([k, t]) => '<button class="chip pick" data-act="want" data-v="' + k + '">' + t + '</button>').join('') + '</div>';
  if (d.note) h += '<div class="dtNote">' + esc(d.note) + '</div>';
  h += '<div class="addrow">' + (d.opts && d.opts.length ? '<button class="btn g s" data-act="dtAlt" data-v="' + ds + '|' + id + '">Другой вариант</button>' : '') + (d.actHealth ? '<button class="btn g s" data-act="go" data-v="health">Здоровье</button>' : '') + '<button class="btn s" data-act="dtDone" data-v="' + ds + '|' + id + '">' + (done ? 'Вернуть' : 'Сделано') + '</button></div>';
  C.openSheet(h, { t: 'info' });
  return true;
}
const HUE = { morning: 48, move: 150, food: 25, work: 210, break: 175, rest: 265, home: 335, sleep: 235, project: 300, lesson: 205, people: 345 };
const hue = (c) => HUE[c] == null ? 265 : HUE[c];
const ICO = { wake: 'sun', stretch: 'spark', breakfast: 'mug', dress: 'heart', leave: 'clock', work: 'target', br: 'sun', lunch: 'mug', rest: 'sun', move: 'heartbeat', chores: 'house', noeve: 'bell', noeve0: 'bell', noeve1: 'bell', dinner: 'mug', free: 'clapper', shower: 'moon', screen: 'bell', half: 'moon', bed: 'moon', prep: 'notebook', dental: 'heartbeat', walk: 'sun', flowers: 'lotus', cook: 'mug', joy: 'palette', people: 'heart', clean: 'house', bath: 'moon', shop: 'coin', nonap: 'sun', nonap2: 'sun', errands: 'calendar', lesson: 'notebook', lessonprep: 'notebook', prepmat: 'notebook' };
const icoOf = (k, cat) => ICO[k] || ({ food: 'mug', move: 'heartbeat', rest: 'sun', sleep: 'moon', home: 'house', work: 'target' }[cat]) || 'spark';

export function infoAct(a, v) {
  if (a === 'info') { return info(v); }
  if (a === 'dtDone') { const [ds, id] = v.split('|'); const d = (C.S.done[ds] = C.S.done[ds] || {}); d[id] = !d[id]; C.save(); C.closeSheet(); C.redraw(); return true; }
  if (a === 'dtAlt') { const [ds, id] = v.split('|'); V().dtSeed = V().dtSeed || {}; const k = ds + key(id); V().dtSeed[k] = (V().dtSeed[k] || 0) + 1; C.save(); info(id, ds); return true; }
  if (a === 'dtTask') { const [ds, id, i] = v.split('|'); V().tidyDone = V().tidyDone || {}; const o = (V().tidyDone[ds + id] = V().tidyDone[ds + id] || {}); o[i] = !o[i]; C.save(); info(id, ds); return true; }
  if (a === 'dtTimer') { startTimer(Number(v)); return true; }
  if (a === 'gStart') { const [k, id, ds] = v.split('|'); guidedStart(k, id, ds); return true; }
  if (/^g(Next|Pause|Stop)$/.test(a)) return guidedAct(a);
  if (a === 'train') { trainSheet(); return true; }
  if (a === 'want') { wantSheet(v); return true; }
  if (/^want[A-Z]/.test(a)) return wantAct(a, v);
  return false;
}
function startTimer(sec) {
  clearInterval(tmr); let left = sec; const el = () => document.getElementById('dtTm');
  const tick = () => { const e = el(); if (!e) { clearInterval(tmr); return; } e.textContent = mmss(left); if (left-- <= 0) { clearInterval(tmr); e.textContent = 'Время вышло'; C.haptic && C.haptic(); } };
  tick(); tmr = setInterval(tick, 1000);
}

/* ---------- Тренировка: подружка ведёт ---------- */
export function guidedStart(k, id, ds) {
  const w = WORKOUTS[k]; if (!w) return;
  clearInterval(iv); g = { k, id, ds, steps: w[1], i: 0, left: w[1][0].sec, paused: false, title: w[0] };
  drawG(); iv = setInterval(tickG, 1000);
}
function tickG() {
  if (!g || g.paused) return;
  if (!document.getElementById('gTime')) { clearInterval(iv); g = null; return; }
  g.left--;
  if (g.left <= 0) { nextG(); return; }
  document.getElementById('gTime').textContent = mmss(g.left);
  if (g.left <= 3) C.haptic && C.haptic();
}
function nextG() {
  g.i++;
  if (g.i >= g.steps.length) { finishG(); return; }
  g.left = g.steps[g.i].sec; drawG();
}
function drawG() {
  const s = g.steps[g.i], n = g.steps.length, nx = g.steps[g.i + 1];
  let h = '<div class="gWrap"><div class="gFig">' + fimg(s.pose || 'cheer') + '</div><div class="tagc">' + esc(g.title) + ' · ' + (g.i + 1) + ' из ' + n + '</div><h2 class="gT">' + esc(s.t) + '</h2>' +
    '<div class="gTime" id="gTime">' + mmss(g.left) + '</div><div class="gHow">' + esc(s.how) + '</div>' +
    '<div class="gDots">' + g.steps.map((x, i) => '<i class="' + (i < g.i ? 'd' : i === g.i ? 'c' : '') + '"></i>').join('') + '</div>' +
    (nx ? '<div class="muted gNext">Дальше: ' + esc(nx.t) + '</div>' : '') +
    '<div class="addrow"><button class="btn g s" data-act="gPause">' + (g.paused ? 'Продолжить' : 'Пауза') + '</button><button class="btn s" data-act="gNext">Дальше</button><button class="btn g s" data-act="gStop">Закончить</button></div></div>';
  C.openSheet(h, { t: 'guided' });
}
function finishG() {
  clearInterval(iv); const { id, ds } = g; if (id && id !== 'x') { const d = (C.S.done[ds] = C.S.done[ds] || {}); d[id] = true; C.save(); } g = null;
  C.openSheet('<div class="gWrap"><div class="gFig">' + fimg('cheer') + '</div><h2>Готово, ты молодец</h2><div class="muted">Дело отмечено. Выпей воды.</div><div class="addrow"><button class="btn" data-act="gStop">Закрыть</button></div></div>', { t: 'guidedEnd' });
  C.redraw();
}
function guidedAct(a) {
  if (a === 'gPause') { if (g) { g.paused = !g.paused; drawG(); } return true; }
  if (a === 'gNext') { if (g) nextG(); return true; }
  if (a === 'gStop') { clearInterval(iv); g = null; C.closeSheet(); return true; }
  return false;
}

/* ---------- «Хочу…»: фильм, сериал, музыка, книга, идея ---------- */
const KIND = {
  film: ['films', 'Фильм', () => FILMS, { keepSeen: false, rewatch: true }], series: ['series', 'Сериал', () => SERIES, {}],
  book: ['books', 'Почитать', () => BOOKS, {}], idea: ['ideas', 'Идея на вечер', () => EVENING.map((x) => x[1]), {}],
  music: ['music', 'Музыка', () => MUSIC[ctxMusic()] || MUSIC.утро, { keepSeen: true }]
};
const ctxMusic = () => V().musicCtx || ((m) => (m < 660 ? 'утро' : m < 1000 ? 'бодрость' : 'вечер'))(C.nowMin());
export function wantSheet(kind) {
  const k = KIND[kind]; if (!k) return;
  const T = C.S.taste, names = pick3(T, k[0], k[2](), C.todayStr() + k[0] + (kind === 'music' ? ctxMusic() : ''), k[3]), n = names[0];
  const lk = links[k[0]];
  let h = '<div class="dtHead"><span class="pgI" style="--th:300">' + ico({ film: 'clapper', series: 'clapper', music: 'note', book: 'notebook', idea: 'spark' }[kind] || 'spark', { size: 30, sw: 1.5 }) + '</span><div><div class="muted">Хочу</div><h2 style="margin:2px 0 0">' + k[1] + '</h2></div></div>';
  if (kind === 'music') h += '<div class="chips">' + MUSIC_CTX.map(([c, t]) => '<button class="chip pick' + (ctxMusic() === c ? ' on' : '') + '" data-act="wantCtx" data-v="' + c + '">' + esc(t) + '</button>').join('') + '</div>';
  h += n ? '<div class="wantBig">' + esc(n) + '</div>' : '<div class="muted">Список закончился, нажми «Другой вариант».</div>';
  if (names.length > 1) h += '<div class="muted">Ещё: ' + names.slice(1).map(esc).join(' · ') + '</div>';
  h += '<div class="addrow">' + (n && lk ? '<a class="btn s" href="' + esc(lk(n)) + '" target="_blank" rel="noopener">Открыть</a>' : '') + '<button class="btn g s" data-act="wantAlt" data-v="' + kind + '">Другой вариант</button></div>';
  if (n && kind !== 'idea') h += '<div class="addrow"><button class="btn g s" data-act="wantMark" data-v="' + kind + '|seen|' + esc(n) + '">' + (kind === 'music' ? 'Уже слушала' : kind === 'book' ? 'Уже читала' : 'Уже видела') + '</button><button class="btn g s" data-act="wantMark" data-v="' + kind + '|no|' + esc(n) + '">Не моё</button><button class="btn g s" data-act="wantMark" data-v="' + kind + '|want|' + esc(n) + '">Позже</button></div>';
  C.openSheet(h, { t: 'want' });
}
function wantAct(a, v) {
  const T = C.S.taste;
  if (a === 'wantAlt') { const k = KIND[v]; T.r = T.r || {}; T.r[k[0]] = (T.r[k[0]] || 0) + 1; C.save(); wantSheet(v); return true; }
  if (a === 'wantCtx') { V().musicCtx = v; C.save(); wantSheet('music'); return true; }
  if (a === 'wantMark') { const [kind, how, ...rest] = v.split('|'); const k = KIND[kind]; mark(T, k[0], rest.join('|'), how); C.save(); wantSheet(kind); return true; }
  return false;
}
export const wantRow = () => '<div class="sect">' + ico('spark', { size: 22 }) + '<h2>Хочу…</h2></div><div class="wantRow">' + [['film', 'clapper', 'Фильм'], ['series', 'clapper', 'Сериал'], ['music', 'note', 'Музыка'], ['book', 'notebook', 'Почитать'], ['idea', 'spark', 'Идея']].map(([k, i, t]) => '<button class="wantB" data-act="want" data-v="' + k + '">' + ico(i, { size: 26, sw: 1.5 }) + '<b>' + t + '</b></button>').join('') + '</div>';

/* ---------- Эффекты опросов: что поменялось от ответов ---------- */
export function surveyEffects(slot, ds, a) {
  const out = [], next = C.addDays(ds, 1); V().light = V().light || {};
  if (slot === 'morning') {
    const t = Array.isArray(a.tidy) ? a.tidy : [];
    if (t.length) { const p = tidyPlan(ds, t); out.push('Вечером порядок: ' + p.zone.toLowerCase()); }
    if (['тяжело', 'нет сил'].includes(a.wake) || ['болит спина', 'недомогание'].includes(a.body)) { V().light[ds] = 1; out.push('Зарядка и тренировка сегодня в лёгкой версии'); }
  }
  if (slot === 'day') {
    if (['на нуле', 'падают'].includes(a.nrg)) { V().light[ds] = 1; out.push('Вечерняя тренировка станет лёгкой'); }
    if (['мало', 'почти нет'].includes(a.wat)) out.push('Выпей стакан воды прямо сейчас');
  }
  if (slot === 'evening' && a.day === 'тяжело') { V().light[next] = 1; out.push('Завтра зарядка и тренировка будут лёгкими'); }
  if (slot === 'night' && a.go === 'ещё полчаса') out.push('Напомню про отбой чуть позже');
  C.save();
  return out;
}

/* ---------- Что показывают ответы ---------- */
export function insights() {
  const sv = V().sv || {}, days = Object.keys(sv).sort().slice(-30), cnt = {}, add = (k, v) => { if (!v) return; cnt[k] = cnt[k] || {}; cnt[k][v] = (cnt[k][v] || 0) + 1; };
  const wdBad = [0, 0, 0, 0, 0, 0, 0], wdAll = [0, 0, 0, 0, 0, 0, 0], tidy = {};
  days.forEach((d) => { const m = sv[d].morning || {}, dy = sv[d].day || {}, e = sv[d].evening || {}; add('wake', m.wake); add('nrg', dy.nrg); add('mood', e.mood || m.mood); add('day', e.day); const w = new Date(d + 'T12:00:00').getDay(); if (m.wake) { wdAll[w]++; if (['тяжело', 'нет сил'].includes(m.wake)) wdBad[w]++; } (Array.isArray(m.tidy) ? m.tidy : []).forEach((t) => { tidy[t] = (tidy[t] || 0) + 1; }); });
  const top = (k) => Object.entries(cnt[k] || {}).sort((a, b) => b[1] - a[1])[0];
  const names = ['воскресеньям', 'понедельникам', 'вторникам', 'средам', 'четвергам', 'пятницам', 'субботам'], lines = [];
  const bw = wdBad.map((x, i) => [i, wdAll[i] ? x / wdAll[i] : 0, wdAll[i]]).filter((x) => x[2] >= 2).sort((a, b) => b[1] - a[1])[0];
  if (bw && bw[1] >= 0.5) lines.push('Тяжелее всего просыпаться по ' + names[bw[0]] + ': можно ставить на это утро меньше дел.');
  const w = top('wake'); if (w) lines.push('Утром чаще всего: ' + w[0] + ' (' + w[1] + ' раз)');
  const n = top('nrg'); if (n) lines.push('Днём силы чаще: ' + n[0]);
  const tt = Object.entries(tidy).sort((a, b) => b[1] - a[1])[0]; if (tt) lines.push('Чаще всего в порядке не хватает: ' + ((TIDY_PROBLEMS.find((x) => x[0] === tt[0]) || [0, tt[0]])[1]).toLowerCase());
  return { days: days.length, lines };
}
export function insightsCard() {
  const r = insights();
  if (r.days < 2) return '<div class="card"><h2>Что показывают ответы</h2><div class="muted keep">Появится после нескольких дней опросов. Уже сейчас ответы меняют порядок вечером и делают тренировку легче в тяжёлые дни.</div></div>';
  return '<div class="card"><h2>Что показывают ответы</h2>' + r.lines.map((l) => '<div class="dtOpt">' + esc(l) + '</div>').join('') + '</div>';
}
export const plans = { tidyPlan };

export function trainSheet() {
  const ds = C.todayStr(), light = isLight(ds);
  C.openSheet('<div class="gWrap"><div class="gFig">' + fimg('cheer') + '</div><h2>Потренируемся?</h2><div class="muted">' + (light ? 'Сегодня силы на нуле, начни с лёгкой.' : 'Я буду вести по таймеру и говорить, что делать.') + '</div><div class="trainList">' +
    [['stretch', 'Зарядка', '5 минут'], ['move', 'Бёдра и осанка', '15 минут'], ['light', 'Лёгкая версия', '3 минуты']].map(([k, t, m]) => '<button class="btn' + (k === 'light' && light ? '' : ' g') + '" data-act="gStart" data-v="' + k + '|x|' + ds + '">' + t + ' · ' + m + '</button>').join('') + '</div></div>', { t: 'train' });
}
