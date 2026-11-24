// Мой ритм ver. 4.0: меню, «Сейчас», подружка, мини-опросы, правка расписания, цель «без сна днём», звуки, ИИ, виджет.
import { ico, patternUrl, SECTION_ART } from './icons.js';
import { fimg, face, say, slotOf, sayNow, persona } from './friend.js';
import { PRESETS, EVENTS, SND0, play, fire } from './sounds.js';
import { SLOTS, pickQs, QALL, WEEKLY } from './survey.js';
import { gcCfg, gcSave, gcReady, gcAsk, gcTest } from './gigachat.js';

let C = null; // контекст из app.js
export const initV4 = (c) => { C = c; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const pad = (n) => String(n).padStart(2, '0');
const tm = (m) => pad(Math.floor((m % 1440) / 60)) + ':' + pad(m % 60);
const NO_SHIFT = new Set(['bed', 'screen', 'wake', 'wakeup']);

/* ---------- Состояние ---------- */
export function fixV4(S) {
  const d = { name: '', fname: 'Подружка', goals: ['rhythm', 'projects', 'vape', 'nap'], sv: {}, svWeekly: {}, nav: ['today', 'week', 'friend'], theme: 'lav', books: [], svDone: {}, svSkip: {}, ed: {}, extra: {}, learn: {}, shift: {}, skips: {}, nap: {}, chat: [], fpose: 'wave', snd: SND0(), wAuto: false, wLast: '' };
  S.v4 = { ...d, ...(S.v4 || {}) }; S.v4.snd = { ...SND0(), ...(S.v4.snd || {}), ev: { ...SND0().ev, ...((S.v4.snd || {}).ev || {}) } };
  ['sv', 'svWeekly', 'svDone', 'svSkip', 'ed', 'extra', 'learn', 'shift', 'skips', 'nap'].forEach((k) => { if (!S.v4[k] || typeof S.v4[k] !== 'object') S.v4[k] = {}; });
  if (!Array.isArray(S.v4.chat)) S.v4.chat = [];
  if (!Array.isArray(S.v4.books)) S.v4.books = [];
  if (!S.v4.read || typeof S.v4.read !== 'object') S.v4.read = {};
  // 4.1: проект «Фотосессия» добавляется один раз
  try {
    if (!S.v4.photoPj && Array.isArray(S.projects)) {
      S.v4.photoPj = 1;
      if (!S.projects.some((p) => /фотосесси/i.test(p.name))) S.projects.push({ id: 'pj' + Date.now().toString(36), name: 'Фотосессия', goal: 'Провести фотосессию и получить 20 хороших кадров', step: 'Выбрать стиль и 3 референса', note: 'Шаги: референсы, образ и одежда, место и фотограф, макияж и причёска, съёмка, отбор кадров.', arch: false, plan: 12, park: false });
    }
  } catch (e) { /* без проекта */ }
}
const V = () => C.S.v4;
export const sound = (ev) => { try { fire(C.S.v4 && C.S.v4.snd ? C.S.v4 : { snd: null }, ev); } catch (e) { /* без звука */ } };
const sfx = (ev) => { const s = V().snd; if (s && s.on) play((s.ev || {})[ev], s.vol); };
export const playEv = sfx;

/* ---------- Расписание с правками «по факту» ---------- */
export function applyDay(ds, list) {
  const ed = V().ed[ds] || {}, sh = V().shift || {};
  const out = list.map((b) => {
    const e = ed[b.id];
    const t = e && e.t != null ? e.t : b.t + (NO_SHIFT.has(b.id) ? 0 : sh[b.id] || 0);
    return { ...b, t, planT: b.t, dur: e && e.dur != null ? e.dur : b.dur, title: e && e.title ? e.title : b.title, hint: e && e.note ? e.note : b.hint, skipped: !!(e && e.skip), edited: !!e };
  });
  (V().extra[ds] || []).forEach((x) => out.push({ id: x.id, t: x.t, planT: x.t, title: x.title, hint: x.note || '', cat: x.cat || 'home', dur: x.dur || 0, custom: true }));
  return out.sort((a, b) => a.t - b.t);
}
const REASONS = ['устала', 'некогда', 'передумала', 'плохо себя чувствую', 'поменялись планы'];
let ex = null; // состояние открытой правки
export function editSheet(id) {
  const ds = C.sel(), list = C.dayList(ds), b = list.find((x) => x.id === id); if (!b) return;
  const e = (V().ed[ds] || {})[id] || {};
  ex = { id, ds, reason: e.reason || '' };
  C.openSheet('<div class="muted">Правка по факту</div><h2 style="margin:4px 0 10px">' + esc(b.title) + '</h2>' +
    '<div class="two"><label>Начало<input type="time" id="edT" value="' + tm(b.t) + '"></label><label>Длительность, мин<input type="number" id="edD" min="0" step="5" value="' + (b.dur || 0) + '"></label></div>' +
    '<label>Название<input type="text" id="edN" value="' + esc(b.title) + '"></label>' +
    '<label>Заметка<input type="text" id="edNote" placeholder="по желанию" value="' + esc(e.note || '') + '"></label>' +
    '<div class="muted" style="margin:10px 0 6px">Если пропустила, почему?</div><div class="chips">' + REASONS.map((r) => '<button class="chip pick' + (ex.reason === r ? ' on' : '') + '" data-act="edReason" data-v="' + esc(r) + '">' + esc(r) + '</button>').join('') + '</div>' +
    '<div class="addrow"><button class="btn" data-act="edSave">Сохранить</button><button class="btn g" data-act="edSkip">Пропустила</button></div>' +
    '<div class="addrow">' + (e.t != null || e.skip || e.title ? '<button class="btn g s" data-act="edReset">Вернуть как было</button>' : '') + (b.custom ? '<button class="btn g s" data-act="edDel">Удалить дело</button>' : '') + '<button class="btn g s" data-act="calmStop">Закрыть</button></div>', { t: 'edit' });
}
const parseT = (s) => { const m = /^(\d{1,2}):(\d{2})$/.exec(s || ''); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
const learn = (id, delta) => { if (!delta) return; const a = (V().learn[id] = V().learn[id] || []); a.push(delta); if (a.length > 10) a.shift(); };
export function editAct(act, v) {
  const val = (i) => { const x = document.getElementById(i); return x ? x.value : ''; };
  const ds = ex ? ex.ds : C.sel(), id = ex && ex.id;
  if (act === 'edReason') { ex.reason = v; (document.querySelectorAll ? document.querySelectorAll('[data-act="edReason"]') : []).forEach((b) => b.classList.toggle('on', b.dataset.v === v)); return true; }
  if (act === 'edSave' || act === 'edSkip') {
    const b = C.dayList(ds).find((x) => x.id === id); const t = parseT(val('edT')); const ed = (V().ed[ds] = V().ed[ds] || {}); const o = { ...(ed[id] || {}) };
    if (b && b.custom) { const x = (V().extra[ds] || []).find((y) => y.id === id); if (x) { if (t != null) x.t = t; x.dur = Number(val('edD')) || 0; x.title = val('edN') || x.title; x.note = val('edNote'); } }
    else {
      if (t != null && t !== b.t) { o.t = t; learn(id, t - b.planT); } else if (t != null && t === b.t) { /* без изменений */ }
      const d = Number(val('edD')); if (!isNaN(d) && d !== b.dur) o.dur = d; if (val('edN') && val('edN') !== b.title) o.title = val('edN'); o.note = val('edNote');
      if (act === 'edSkip') { o.skip = true; o.reason = ex.reason; const k = (V().skips[id] = V().skips[id] || { n: 0, r: {} }); k.n++; if (ex.reason) k.r[ex.reason] = (k.r[ex.reason] || 0) + 1; }
      ed[id] = o;
    }
    C.save(); C.closeSheet(); C.redraw(); sfx('done'); C.toast(act === 'edSkip' ? say('skip', id).text : say('late', id).text); return true;
  }
  if (act === 'edReset') { if (V().ed[ds]) delete V().ed[ds][id]; C.save(); C.closeSheet(); C.redraw(); return true; }
  if (act === 'edDel') { V().extra[ds] = (V().extra[ds] || []).filter((x) => x.id !== id); C.save(); C.closeSheet(); C.redraw(); return true; }
  return false;
}
export function addSheet() {
  const n = C.nowMin(); ex = { id: '', ds: C.sel() };
  C.openSheet('<h2 style="margin:0 0 10px">Новое дело</h2><label>Название<input type="text" id="adN" placeholder="Например: созвон"></label><div class="two"><label>Начало<input type="time" id="adT" value="' + tm(Math.ceil(n / 5) * 5) + '"></label><label>Длительность, мин<input type="number" id="adD" min="0" step="5" value="30"></label></div><div class="addrow"><button class="btn" data-act="adSave">Добавить</button><button class="btn g" data-act="calmStop">Отмена</button></div>', { t: 'add' });
}
export function addSave() {
  const val = (i) => { const x = document.getElementById(i); return x ? x.value : ''; }, ds = ex.ds || C.sel();
  if (!val('adN').trim()) { C.toast('Напиши название'); return; }
  (V().extra[ds] = V().extra[ds] || []).push({ id: 'x' + Date.now().toString(36), t: parseT(val('adT')) || 600, dur: Number(val('adD')) || 0, title: val('adN').trim(), cat: 'home' });
  C.save(); C.closeSheet(); C.redraw(); C.toast('Добавила');
}
// Что приложение заметило по правкам
export function suggestions() {
  const out = []; const L = V().learn;
  Object.keys(L).forEach((id) => {
    const a = L[id]; if (a.length < 3 || (V().shift[id] || 0) !== 0) return;
    const s = [...a].sort((x, y) => x - y), med = s[Math.floor(s.length / 2)], same = a.filter((x) => Math.sign(x) === Math.sign(med)).length;
    if (Math.abs(med) >= 10 && same >= Math.ceil(a.length * 0.7)) out.push({ id, d: Math.round(med / 5) * 5, n: a.length });
  });
  return out;
}
const blockName = (id) => { const b = C.dayList(C.todayStr()).find((x) => x.id === id) || C.allBlocks(C.todayStr()).find((x) => x.id === id); return b ? b.title : id; };
const shiftTxt = (d) => (d > 0 ? 'на ' + d + ' мин позже' : 'на ' + -d + ' мин раньше');

/* ---------- «Сейчас» ---------- */
export function nowIndex(list, ds) { if (ds !== C.todayStr()) return -1; const n = C.nowMin(); let k = -1; list.forEach((b, i) => { if (!b.skipped && b.t <= n) k = i; }); if (k >= 0 && list[k].id === 'bed' && n < list[k].t) k = -1; return k; }
export function hero(list, ds) {
  const n = C.nowMin(); let i = nowIndex(list, ds); const slot = slotOf(n);
  const cur = i >= 0 ? list[i] : null; const nxt = list.slice(i + 1).find((b) => !b.skipped) || null;
  const st = C.dayStats(ds), allDone = st.total && st.done === st.total;
  const bedB = list.find((b) => b.id === 'bed'), bedIn = bedB ? bedB.t - n : null;
  const f = allDone ? say('all', ds + slot) : sayNow(cur ? cur.cat : '', cur ? cur.id : '', n, bedIn, ds + (cur ? cur.id : slot)), nm = V().name;
  const d = C.S.done[ds] || {};
  let h = '<div class="card hero"><div class="heroTop"><div class="heroF">' + fimg(f.pose) + '</div><div class="heroT"><div class="tagc">' + (cur ? 'Сейчас · ' + tm(cur.t) + (cur.dur ? '–' + tm(cur.t + cur.dur) : '') : nxt ? 'Дальше · ' + tm(nxt.t) : 'На сегодня всё') + '</div>';
  h += '<div class="heroName">' + esc(cur ? cur.title : nxt ? nxt.title : 'Свободный вечер') + '</div>';
  if (cur && cur.hint) h += '<div class="heroHint">' + esc(cur.hint) + '</div>';
  h += '</div></div>';
  h += '<div class="bubble sm">' + esc(nm ? nm + ', ' + f.text.charAt(0).toLowerCase() + f.text.slice(1) : f.text) + '</div>';
  if (cur) h += '<div class="addrow"><button class="btn" data-act="done" data-v="' + esc(cur.id) + '">' + (d[cur.id] ? 'Готово ✓' : 'Сделала') + '</button><button class="btn g" data-act="edit" data-v="' + esc(cur.id) + '">' + ico('pencil', { size: 18 }) + ' Правка</button></div>';
  if (cur && nxt) h += '<div class="heroNext">' + ico('clock', { size: 16 }) + ' Дальше в ' + tm(nxt.t) + ': ' + esc(nxt.title) + '</div>';
  return h + '</div>';
}
const SW = { 'лавандовый': '#c4b0ee', 'белый': '#fbf9ff', 'чёрный': '#2d2a33', 'бордовый': '#7d2c47', 'графитовый': '#4b4955', 'голубой': '#a9d3f2', 'коричневый': '#8b6b5b', 'пудровый': '#f2d0da' };
export const swatches = (c1, c2, small) => '<div class="sw' + (small ? ' sm' : '') + '"><span class="dot" style="background:' + (SW[c1] || '#ccc') + '"></span><span class="dot" style="background:' + (SW[c2] || '#ccc') + '"></span><span class="swn">' + esc(c1) + ' + ' + esc(c2) + '</span></div>';

export const colorStrip = (ds) => { const [a, b] = C.colors(ds); return '<div class="card colorStrip"><span class="muted">Цвет дня</span>' + swatches(a, b) + '<button class="btn g s" data-act="go" data-v="look">Образ</button></div>'; };

/* ---------- Нижняя панель: настраиваемый набор ---------- */
export const NAVOPTS = [['today', 'Сейчас', 'clock'], ['week', 'План', 'calendar'], ['friend', 'Подружка', 'heart'], ['food', 'Еда', 'apple'], ['proj', 'Проекты', 'rocket'], ['habits', 'Привычки', 'spark'], ['look', 'Образ', 'dress'], ['fridge', 'Холодильник', 'milk'], ['health', 'Здоровье', 'heartbeat'], ['taste', 'Подборки', 'clapper']];
export function navTabs() { const sel = (V().nav && V().nav.length ? V().nav : ['today', 'week', 'friend']).slice(0, 4); return sel.map((k) => NAVOPTS.find((x) => x[0] === k)).filter(Boolean); }
function navSheet() {
  const sel = navTabs().map((x) => x[0]);
  C.openSheet('<h2>Нижняя панель</h2><div class="muted">Выбери до четырёх разделов. Кнопка «Меню» останется всегда.</div><div class="chips">' + NAVOPTS.map(([k, t]) => '<button class="chip pick' + (sel.includes(k) ? ' on' : '') + '" data-act="navTog" data-v="' + k + '">' + esc(t) + '</button>').join('') + '</div><div class="addrow"><button class="btn" data-act="navDone">Готово</button><button class="btn g" data-act="navReset">Как было</button></div>', { t: 'nav' });
}
function navAct(a, v) {
  if (a === 'navTog') { const sel = navTabs().map((x) => x[0]); const i = sel.indexOf(v); if (i >= 0) { if (sel.length > 1) sel.splice(i, 1); } else if (sel.length < 4) sel.push(v); else { C.toast('Максимум четыре'); return true; } V().nav = sel; C.save(); navSheet(); return true; }
  if (a === 'navReset') { V().nav = ['today', 'week', 'friend']; C.save(); C.closeSheet(); C.redraw(); return true; }
  if (a === 'navDone') { C.closeSheet(); C.redraw(); return true; }
  return false;
}

/* ---------- Мини-опрос ---------- */
let svState = null;
export function maybeSurvey() {
  try { if (C.mini || (document.querySelector && document.querySelector('#lock.show'))) return; } catch (e) { return; }
  const ds = C.todayStr(), slot = slotOf(C.nowMin()), key = ds + slot;
  if (V().svDone[key]) return; const sk = V().svSkip[key]; if (sk && Date.now() - sk < 45 * 60000) return;
  try { const sh = document.getElementById('sheet'); if (sh && sh.classList && sh.classList.contains && sh.classList.contains('show')) return; } catch (e) { return; }
  surveySheet(slot);
}
export function surveySheet(slot) {
  const ds = C.todayStr(); slot = slot || slotOf(C.nowMin()); const wd = new Date(ds + 'T12:00:00').getDay(), weekend = wd === 0 || wd === 6, wk = C.addDays ? ds.slice(0, 7) + Math.floor(Number(ds.slice(8)) / 7) : ds;
  const weeklyDue = slot === 'evening' && wd === 0 && !V().svWeekly[wk];
  const qs = pickQs(slot, ds, { weekly: weeklyDue }).filter((q) => weekend || q.k !== 'nap'), a = (V().sv[ds] = V().sv[ds] || {}), cur = (a[slot] = a[slot] || {});
  svState = { slot, ds }; const f = say(slot, ds + 'sv');
  let h = '<div class="svHead">' + face(f.pose) + '<div><div class="tagc">' + ico(SLOTS[slot][1], { size: 16 }) + ' ' + SLOTS[slot][0] + ' · быстро</div><h2 style="margin:2px 0 0">' + (V().name ? esc(V().name) + ', ' : '') + 'пара вопросов</h2></div></div>';
  qs.forEach((q) => { h += '<div class="q"><div class="qt">' + esc(q.q) + '</div><div class="chips">' + q.o.map((o) => '<button class="chip pick' + (cur[q.k] === o ? ' on' : '') + '" data-act="svA" data-v="' + q.k + '|' + esc(o) + '">' + esc(o) + '</button>').join('') + '</div></div>'; });
  if (slot === 'night') h += '<div class="q"><div class="qt">Что хорошего было? Одной строкой</div><input type="text" id="svGood" placeholder="по желанию" value="' + esc(cur.text || '') + '"></div>';
  h += '<div class="addrow"><button class="btn" data-act="svDone">Готово</button><button class="btn g" data-act="svLater">Позже</button></div>';
  C.openSheet(h, { t: 'survey' });
}
export function svAct(act, v) {
  if (!svState) return false; const { slot, ds } = svState;
  if (act === 'svA') {
    const [k, o] = v.split('|'); if (k === 'int') V().svWeekly[ds.slice(0, 7) + Math.floor(Number(ds.slice(8)) / 7)] = 1; const cur = ((V().sv[ds] = V().sv[ds] || {})[slot] = V().sv[ds][slot] || {}); cur[k] = cur[k] === o ? '' : o;
    const q = QALL[slot].find((x) => x.k === k); if (q && q.ci && q.ci[o]) { const c = (C.S.ci[ds] = C.S.ci[ds] || {}); if (slot === 'morning') c.e = q.ci[o]; if (slot === 'evening') c.m = q.ci[o]; }
    if (k === 'nap') { const n = (V().nap[ds] = V().nap[ds] || {}); n.day = o !== 'не было' && cur[k] === o; n.src = 'sv'; }
    if (k === 'eve') { const n = (V().nap[ds] = V().nap[ds] || {}); n.eve = o === 'вздремнула' && cur[k] === o; }
    C.save(); (document.querySelectorAll ? document.querySelectorAll('[data-act="svA"]') : []).forEach((b) => { const [kk, oo] = b.dataset.v.split('|'); if (kk === k) b.classList.toggle('on', cur[k] === oo); });
    sfx('done'); if (q && q.tool && cur[k] && cur[k] !== 'нет') { svState.tool = q.tool; } return true;
  }
  if (act === 'svDone') { const g = document.getElementById('svGood'); if (g) { V().sv[ds][slot].text = g.value; } V().svDone[ds + slot] = 1; C.save(); const tool = svState.tool; svState = null; C.closeSheet(); sfx('survey'); C.redraw(); if (tool === 'nap') napTool(); else if (tool === 'calm') C.calmStart('anger'); else C.toast(say('save', ds).text); return true; }
  if (act === 'svLater') { V().svSkip[ds + slot] = Date.now(); C.save(); svState = null; C.closeSheet(); return true; }
  return false;
}

/* ---------- Цель: без дневного и вечернего сна ---------- */
export function napStreak() {
  const today = C.todayStr(); let n = 0; for (let i = 0; i < 60; i++) { const ds = C.addDays(today, -i), r = V().nap[ds]; if (!r) { if (i === 0) continue; break; } if (r.day || r.eve) break; n++; } return n;
}
export function renderNap() {
  const ds = C.todayStr(), r = V().nap[ds] || {}, st = napStreak();
  let h = '<button class="back" data-act="go" data-v="menu">‹ Меню</button><h1>Без дневного сна</h1><p class="sub">Бодрый день и крепкий ночной сон</p>';
  h += '<div class="card hero"><div class="heroTop"><div class="heroF">' + fimg(st >= 3 ? 'cheer' : 'thumbs') + '</div><div class="heroT"><div class="tagc">Серия</div><div class="bigNum">' + st + '</div><div class="muted">' + (st ? 'дн. без сна днём и вечером' : 'начнём с сегодняшнего дня') + '</div></div></div></div>';
  const wd0 = new Date(ds + 'T12:00:00').getDay(), wend = wd0 === 0 || wd0 === 6;
  h += '<div class="card"><h2>Сегодня</h2>' + (wend ? '' : '<div class="muted" style="margin-bottom:6px">В будни днём ты работаешь, считаем только вечер.</div>') + (wend ? '<div class="rowB"><button class="tileB' + (r.day === false ? ' on' : '') + '" data-act="napSet" data-v="day|0">' + ico('sun', { size: 30 }) + '<b>Днём не спала</b></button><button class="tileB bad' + (r.day ? ' on' : '') + '" data-act="napSet" data-v="day|1">' + ico('bed', { size: 30 }) + '<b>Днём спала</b></button></div>' : '') + '<div class="rowB"><button class="tileB' + (r.eve === false ? ' on' : '') + '" data-act="napSet" data-v="eve|0">' + ico('moon', { size: 30 }) + '<b>Вечером не спала</b></button><button class="tileB bad' + (r.eve ? ' on' : '') + '" data-act="napSet" data-v="eve|1">' + ico('sleepy', { size: 30 }) + '<b>Вечером спала</b></button></div></div>';
  h += '<div class="card"><h2>Тянет в сон?</h2><div class="muted">Короткий набор на ногах: умыться, подвигаться, свет, вода и таймер на 15 минут.</div><div class="addrow"><button class="btn" data-act="napTool">Попробовать сейчас</button></div></div>';
  h += '<div class="card"><h2>Эта неделя</h2><div class="weekDots">';
  for (let i = 6; i >= 0; i--) { const d = C.addDays(C.todayStr(), -i), x = V().nap[d]; h += '<div class="wd"><span class="dot ' + (!x ? 'n' : x.day || x.eve ? 'bad' : 'ok') + '"></span><small>' + C.shortDate(d) + '</small></div>'; }
  h += '</div><div class="muted">Зелёная точка: без сна. Розовая: сон был. Пустая: нет отметки.</div></div>';
  h += '<div class="card"><h2>Как это работает</h2><div class="steps4">' +
    [['sun', 'В выходные в 13:20 напомню выйти на свет и размяться'], ['mug', 'В будни в 18:30 вечерний подъём: свет и движение'], ['bell', 'В 20:45 напомню про вечерний «якорь»'], ['moon', 'Сон на ночь не сдвигаем: отбой по плану']].map(([i, t]) => '<div class="st4">' + ico(i, { size: 26 }) + '<span>' + esc(t) + '</span></div>').join('') + '</div></div>';
  return h;
}
export function napSet(v) { const [k, x] = v.split('|'), ds = C.todayStr(), r = (V().nap[ds] = V().nap[ds] || {}); r[k] = x === '1'; C.save(); sfx('done'); C.redraw(); }
const NAP_SETS = {
  mix: ['Набор по порядку', [
    ['Умойся холодной водой и протри шею', 'tap', 'Сделала'], ['Встань и сделай 15 приседаний', 'count', 15], ['Выйди к окну или на улицу: свет на лицо на 3 минуты', 'timer', 180], ['Выпей стакан воды', 'tap', 'Выпила'], ['Включи бодрую песню и пройдись', 'song', '']]],
  move: ['Подвигаться', [
    ['Встань и потянись вверх 10 раз', 'count', 10], ['Попрыгай на месте', 'count', 20], ['Пройдись по квартире быстрым шагом 3 минуты', 'timer', 180], ['Сделай 10 наклонов к носкам', 'count', 10], ['Выпей воды', 'tap', 'Выпила']]],
  cold: ['Холод и вода', [
    ['Умойся холодной водой', 'tap', 'Сделала'], ['Промой холодной водой запястья на 30 секунд', 'timer', 30], ['Открой окно на 2 минуты', 'timer', 120], ['Выпей холодной воды', 'tap', 'Выпила']]],
  mind: ['Занять голову', [
    ['Назови вслух 10 городов на одну букву', 'count', 10], ['Реши в уме 7 + 8, 14 + 9, 23 + 18 и скажи ответы вслух', 'tap', 'Решила'], ['Напиши список из пяти дел на завтра', 'tap', 'Записала'], ['Выпей чай или воду', 'tap', 'Выпила']]],
  talk: ['Написать или позвонить', [
    ['Напиши подруге или маме просто «как ты?»', 'tap', 'Отправила'], ['Позвони кому-то на 5 минут и пройдись по комнате', 'timer', 300], ['Выпей воды', 'tap', 'Выпила']]],
  light: ['Свет и улица', [
    ['Включи весь верхний свет', 'tap', 'Включила'], ['Выйди на улицу на 10 минут, телефон в кармане', 'timer', 600], ['Купи или возьми что-то вкусное по дороге', 'tap', 'Взяла']]],
  home: ['Лёгкое дело', [
    ['Выбери одно маленькое дело: посуда, стол, цветы', 'tap', 'Выбрала'], ['Делай его ровно 5 минут', 'timer', 300], ['Выпей воды', 'tap', 'Выпила']]]
};
let NAP_STEPS = NAP_SETS.mix[1];
let nap = null, napIv = null;
export function napTool(i, set) {
  if (i === undefined && !set) { C.openSheet('<h2>Тянет в сон</h2><div class="muted">Выбери способ. Сонливость волной приходит и уходит.</div><div class="chips">' + Object.entries(NAP_SETS).map(([k, x]) => '<button class="chip pick" data-act="napWay" data-v="' + k + '">' + esc(x[0]) + '</button>').join('') + '<button class="chip pick" data-act="napWay" data-v="rand">Случайный</button></div><div class="addrow"><button class="btn g s" data-act="calmStop">Закрыть</button></div>', { t: 'napPick' }); return; }
  if (set) { const ks = Object.keys(NAP_SETS); NAP_STEPS = NAP_SETS[set === 'rand' ? ks[Date.now() % ks.length] : set][1]; }
  i = i || 0; clearInterval(napIv); nap = { i, n: 0 };
  if (i >= NAP_STEPS.length) { C.openSheet('<div class="center">' + fimg('cheer', 'big') + '<h2>Волна проходит</h2><div class="muted">Сонливость приходит волнами. Если через 15 минут всё равно тянет, поставь будильник на 20 минут, но лучше остаться на ногах и сделать лёгкое дело.</div></div><div class="addrow"><button class="btn" data-act="napEnd">Не сплю</button><button class="btn g" data-act="napWait">Таймер 15 минут</button></div>', { t: 'nap' }); sfx('cheer'); return; }
  const s = NAP_STEPS[i]; let w = '';
  if (s[1] === 'tap') w = '<button class="btn big" data-act="napNext">' + s[2] + '</button>';
  if (s[1] === 'count') w = '<div class="counter"><span id="napN">0</span> / ' + s[2] + '</div><button class="btn big" data-act="napTap">+1</button>';
  if (s[1] === 'timer') w = '<div class="crT" id="napT">' + Math.floor(s[2] / 60) + ':' + pad(s[2] % 60) + '</div><button class="btn big" data-act="napNext">Готово</button>';
  if (s[1] === 'song') { const m = C.songs('бодрость'); w = '<div class="songs">' + m.map((x) => '<a class="lnk" target="_blank" rel="noopener" href="' + x.href + '">' + esc(x.t) + '</a>').join('') + '</div><button class="btn big" data-act="napNext">Пошла</button>'; }
  C.openSheet('<div class="muted">Шаг ' + (i + 1) + ' из ' + NAP_STEPS.length + '</div><div class="stepRow">' + face('think') + '<h2>' + esc(s[0]) + '</h2></div><div class="center">' + w + '</div><div class="addrow"><button class="btn g s" data-act="calmStop">Закрыть</button></div>', { t: 'nap', k: 'nap', i });
  if (s[1] === 'timer') { const end = Date.now() + s[2] * 1000; napIv = setInterval(() => { const l = Math.max(0, end - Date.now()), t = document.getElementById('napT'); if (t) t.textContent = Math.floor(l / 60000) + ':' + pad(Math.floor((l % 60000) / 1000)); if (!l) { clearInterval(napIv); sfx('timer'); napTool(nap.i + 1); } }, 400); }
}
export function napAct(act, v) {
  if (act === 'napNext') { sfx('step'); napTool(nap.i + 1); return true; }
  if (act === 'napTap') { nap.n++; const el = document.getElementById('napN'); if (el) el.textContent = nap.n; C.haptic(); if (nap.n >= NAP_STEPS[nap.i][2]) { sfx('step'); napTool(nap.i + 1); } return true; }
  if (act === 'napEnd') { const ds = C.todayStr(), r = (V().nap[ds] = V().nap[ds] || {}); if (r.day === undefined && slotOf(C.nowMin()) !== 'night') r.day = false; C.save(); C.closeSheet(); C.redraw(); C.toast('Умница'); return true; }
  if (act === 'napWait') { C.closeSheet(); C.toast('Через 15 минут посмотрим, как ты'); setTimeout(() => { sfx('timer'); C.toast('15 минут прошло. Как ты?'); }, 15 * 60000); return true; }
  if (act === 'napWay') { napTool(0, v); return true; }
  if (act === 'napSet') { napSet(v); return true; }
  return false;
}

/* ---------- Меню ---------- */
const TILES = [
  ['Каждый день', [['proj', 'Проекты', 'rocket', 150], ['food', 'Еда', 'apple', 95], ['fridge', 'Холодильник', 'milk', 195], ['plan', 'План на 12 недель', 'target', 205], ['habits', 'Мои привычки', 'spark', 265]]],
  ['Для меня', [['look', 'Образ', 'dress', 15], ['taste', 'Подборки', 'clapper', 300], ['cycle', 'Цикл', 'moon', 345], ['health', 'Здоровье', 'heartbeat', 175], ['mentor', 'Итоги и советы', 'bulb', 330], ['books', 'Книги', 'notebook', 25]]],
  ['Цели', [['smoke', 'Без вейпа', 'smoke', 275], ['nap', 'Без дневного сна', 'sleepy', 235], ['calm', 'Спокойствие', 'lotus', 160]]],
  ['Дом и деньги', [['money', 'Деньги', 'coin', 48], ['apts', 'Квартиры', 'house', 210]]],
  ['Настройки', [['sounds', 'Звуки', 'bell', 320], ['ai', 'ИИ GigaChat', 'robot', 255], ['widget', 'Виджет', 'widget', 190], ['me', 'Обо мне', 'user', 340], ['navSet', 'Нижняя панель', 'grid', 220], ['theme', 'Оформление', 'palette', 300], ['set', 'Защита и копия', 'gear', 265]]]
];
export function renderMenu() {
  const f = say('save', 'menu');
  let h = '<div class="menuHead">' + face('wave') + '<div><h1 style="margin:0">Меню</h1><p class="sub" style="margin:2px 0 0">Всё в одном месте</p></div></div>';
  TILES.forEach(([title, items]) => {
    h += '<div class="mh">' + esc(title) + '</div><div class="tiles">';
    items.forEach(([k, t, i, hue]) => { h += '<button class="tile" style="--th:' + hue + '" data-act="' + (k === 'navSet' ? 'navSet' : 'go') + '" data-v="' + k + '"><span class="ti">' + ico(i, { size: 34, sw: 1.5 }) + '</span><b>' + esc(t) + '</b></button>'; });
    h += '</div>';
  });
  return h + '<p class="muted" style="text-align:center;margin-top:16px">' + esc(C.version) + '</p>';
}

/* ---------- Книги и чтение ---------- */
const BSTAT = [['want', 'Хочу прочитать'], ['now', 'Читаю'], ['done', 'Прочитала']];
export function renderBooks() {
  const bk = V().books; let h = '<button class="back" data-act="go" data-v="menu">‹ Меню</button><h1>Книги и чтение</h1><p class="sub">Читай понемногу: 15 минут в день тоже считаются</p>';
  const now = bk.filter((b) => b.s === 'now'), done = bk.filter((b) => b.s === 'done').length, today = C.todayStr();
  const days = Object.keys(V().read || {}).filter((d) => V().read[d] > 0).length;
  h += '<div class="card hero"><div class="heroTop"><div class="heroF">' + fimg(now.length ? 'thumbs' : 'wave') + '</div><div class="heroT"><div class="tagc">Статистика</div><div class="kv"><span>Прочитано книг</span><span class="r">' + done + '</span></div><div class="kv"><span>Дней с чтением</span><span class="r">' + days + '</span></div></div></div>';
  h += '<div class="addrow"><button class="btn' + ((V().read || {})[today] ? ' g' : '') + '" data-act="bkRead">' + ((V().read || {})[today] ? 'Сегодня читала ✓' : 'Сегодня читала') + '</button></div></div>';
  h += '<div class="card"><h2>Добавить книгу</h2><input type="text" id="bkIn" placeholder="Название и автор"><div class="addrow"><button class="btn s" data-act="bkAdd">Добавить</button></div></div>';
  BSTAT.forEach(([k, t]) => { const l = bk.filter((b) => b.s === k); if (!l.length) return; h += '<div class="card"><h2>' + t + '</h2>' + l.map((b) => '<div class="kv" style="align-items:center;gap:8px"><span>' + esc(b.t) + '</span><span class="r" style="display:flex;gap:6px">' + (k !== 'now' ? '<button class="btn g s" data-act="bkSet" data-v="' + b.id + '|now">Читаю</button>' : '') + (k !== 'done' ? '<button class="btn g s" data-act="bkSet" data-v="' + b.id + '|done">Готово</button>' : '') + '<button class="btn g s" data-act="bkDel" data-v="' + b.id + '">×</button></span></div>').join('') + '</div>'; });
  const mine = new Set(bk.map((b) => b.t));
  h += '<div class="card"><h2>Идеи, что почитать</h2><div class="muted" style="margin-bottom:6px">Нажми, чтобы добавить в список. Без биографий, истории и манги.</div>' + (C.bookIdeas ? C.bookIdeas() : []).filter((x) => !mine.has(x)).slice(0, 8).map((x) => '<button class="chip pick" data-act="bkAdd" data-v="' + esc(x) + '">' + esc(x) + '</button>').join(' ') + '</div>';
  return h;
}
function bookAct(a, v) {
  const bk = V().books, id = () => 'b' + Date.now().toString(36) + Math.floor(Math.random() * 99);
  if (a === 'bkAdd') { const i = document.getElementById('bkIn'), t = (v || (i ? i.value : '')).trim(); if (!t) return true; bk.push({ id: id(), t, s: 'want' }); if (i) i.value = ''; C.save(); C.redraw(); return true; }
  if (a === 'bkSet') { const [i, st] = v.split('|'), b = bk.find((x) => x.id === i); if (b) b.s = st; C.save(); sfx('done'); C.redraw(); return true; }
  if (a === 'bkDel') { V().books = bk.filter((x) => x.id !== v); C.save(); C.redraw(); return true; }
  if (a === 'bkRead') { V().read = V().read || {}; const d = C.todayStr(); V().read[d] = V().read[d] ? 0 : 1; C.save(); sfx('done'); C.redraw(); return true; }
  return false;
}

/* ---------- Оформление ---------- */
const THEMES = [['auto', 'По разделам', ''], ['lav', 'Лаванда', 265], ['pink', 'Розовый', 335], ['mint', 'Мята', 150], ['butter', 'Масло', 48], ['sky', 'Небо', 205]];
export function renderTheme() {
  const cur = V().themeHue == null || V().themeHue === '' ? '' : Number(V().themeHue);
  let h = '<button class="back" data-act="go" data-v="menu">‹ Меню</button><h1>Оформление</h1><p class="sub">Свои цвета приложения</p>';
  h += '<div class="card"><h2>Тема</h2><div class="chips">' + THEMES.map(([k, t, hue]) => '<button class="chip pick' + (cur === hue ? ' on' : '') + '" data-act="thSet" data-v="' + hue + '"><span class="dot" style="display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:6px;background:' + (hue === '' ? 'linear-gradient(90deg,#f6cddc,#e0d8f5)' : 'hsl(' + hue + ' 70% 80%)') + '"></span>' + t + '</button>').join('') + '</div>';
  h += '<div class="muted" style="margin:14px 0 4px">Свой оттенок</div><input type="range" id="thHue" min="0" max="360" value="' + (cur === '' ? 265 : cur) + '" data-act="thRange" style="width:100%"></div>';
  h += '<div class="card"><h2>Фоновый рисунок</h2><div class="kv"><span>Иконки на фоне</span><button class="btn g s" data-act="thPat">' + (V().noPat ? 'Выключены' : 'Включены') + '</button></div></div>';
  return h;
}
function themeAct(a, v) {
  if (a === 'thSet') { V().themeHue = v === '' ? '' : Number(v); C.save(); C.redraw(); return true; }
  if (a === 'thRange') { const e = document.getElementById('thHue'); V().themeHue = e ? Number(e.value) : 265; C.save(); try { applyBg('theme'); } catch (x) { /* ок */ } return true; }
  if (a === 'thPat') { V().noPat = !V().noPat; C.save(); C.redraw(); return true; }
  return false;
}

/* ---------- Подружка: экран и чат ---------- */
const QUICK = [['Что у меня сейчас?', 'now'], ['Мне тревожно', 'calm'], ['Бесит всё', 'anger'], ['Тянет в сон', 'nap'], ['Что на ужин?', 'dinner'], ['Что надеть?', 'wear'], ['Включить песню', 'song'], ['Поболтать', 'chat']];
export function renderFriend() {
  const fn = V().fname || 'Подружка', last = V().chat.filter((m) => m.r === 'f').slice(-1)[0];
  let h = '<div class="menuHead"><div><h1 style="margin:0">' + esc(fn) + '</h1><p class="sub" style="margin:2px 0 0">' + (gcReady() ? 'Болтаем с ИИ' : 'Подсказки по приложению') + '</p></div></div>';
  h += '<div class="fstage" data-act="fpose">' + fimg(V().fpose || 'wave', 'huge') + '<div class="bubble">' + esc(last ? last.t : say(slotOf(C.nowMin()), C.todayStr()).text) + '</div></div>';
  h += '<div class="chips quick">' + QUICK.map(([t, k]) => '<button class="chip pick" data-act="fq" data-v="' + k + '">' + esc(t) + '</button>').join('') + '</div>';
  const log = V().chat.slice(-10);
  if (log.length) h += '<div class="chat">' + log.map((m) => '<div class="msg ' + m.r + '">' + (m.r === 'f' ? face(m.p || 'wave') : '') + '<div class="mb">' + esc(m.t) + (m.a ? '<div class="addrow">' + m.a.map(([t, a, v]) => '<button class="btn g s" data-act="' + a + '" data-v="' + esc(v || '') + '">' + esc(t) + '</button>').join('') + '</div>' : '') + '</div></div>').join('') + '</div>';
  h += '<div class="chatIn"><input type="text" id="chatIn" placeholder="Напиши ей…" enterkeyhint="send"><button class="btn" data-act="fsend" aria-label="Отправить">' + ico('send', { size: 20, c: '#fff', af: 'none' }) + '</button></div>';
  h += '<div class="addrow"><button class="btn g s" data-act="svNow">Мини-опрос</button>' + (V().chat.length ? '<button class="btn g s" data-act="fclear">Очистить чат</button>' : '') + '</div>';
  return h;
}
const push = (m) => { V().chat.push(m); if (V().chat.length > 40) V().chat.splice(0, V().chat.length - 40); if (m.p) V().fpose = m.p; };
function localReply(q) {
  const t = q.toLowerCase(), ds = C.todayStr();
  const R = (p, text, a) => ({ r: 'f', p, t: text, ...(a ? { a } : {}) });
  const sayR = (k, p) => { const f = say(k, t + ds + (V().chat || []).length); return R(p || f.pose, f.text); };
  if (/^\s*(привет|приветик|хай|хей|здравствуй|добрый (день|вечер|утро)|доброе утро|ку|здарова)[\s!.,)]*$/.test(t)) return sayR('hello', 'wave');
  if (/^\s*(спасибо|благодарю|спс|мерси)[\s!.)]*$/.test(t)) return sayR('thanks', 'thumbs');
  if (/^\s*(пока|до свидания|спокойной ночи|споки|до завтра)[\s!.)]*$/.test(t)) return sayR('bye', 'wave');
  if (/^\s*(как дела|как ты|что нового|как жизнь)[\s?!.]*$/.test(t)) return R('wave', 'У меня всё хорошо, я же в телефоне. А как ты? Выбери: нормально, устала или тяжело.', [['Нормально', 'fsend', 'у меня всё нормально'], ['Устала', 'fsend', 'я устала'], ['Тяжело', 'fsend', 'мне тяжело']]);
  if (/^\s*(норм|нормально|хорошо|отлично|супер|ок|окей|всё хорошо)[\s!.)]*$/.test(t) || /у меня всё нормально/.test(t)) return sayR('fine', 'cheer');
  if (/устал|нет сил|выгор|тяжело|грустно|плохо|одинок|одиноко/.test(t)) { const f = say('sad', t + ds); return R('shy', f.text, [['Упражнение', 'calmMenu', ''], ['Песни', 'fsend', 'включи песню'], ['Только выслушать', 'fsend', 'просто хочу выговориться']]); }
  if (/выговор|просто послуша/.test(t)) return R('shy', 'Я слушаю. Пиши как есть, без советов, если сама не попросишь.');
  if (/итог.* дня|как прош[её]л день|разбор дня|подведи/.test(t)) { const st = C.dayStats(ds); return R('think', 'Сегодня сделано ' + st.done + ' из ' + st.total + '. ' + (st.total && st.done / st.total >= 0.7 ? 'Хороший день.' : 'Нормально, завтра новый.') + ' Одно хорошее за день назови себе вслух.', [['Опрос вечера', 'svNow', '']]); }
  if (/мотивац|нет желания|лень|не могу начать|прокрастин/.test(t)) return R('cheer', 'Договоримся на пять минут. Включи таймер, сделай самый маленький шаг, остановиться можно будет после.', [['Таймер 5 минут', 'go', 'today']]);
  if (/идеи? для проект|что делать в проект|проект/.test(t) && /идея|идеи|придума|что/.test(t)) return R('think', 'Идеи на проект: 1) 20 минут на черновик без правок; 2) собрать 5 референсов; 3) написать список из трёх шагов; 4) записать голосом мысли и разобрать позже.', [['Открыть проекты', 'go', 'projects']]);
  if (/план.* недел|неделя|на неделю/.test(t)) return R('wave', 'Загляни во вкладку «План»: там неделя по дням. Могу напомнить про меню и список покупок.', [['План недели', 'go', 'week'], ['Меню', 'go', 'food']]);
  if (/тревож|страшно|паник|накрыва/.test(t)) return R('think', 'Давай вернёмся в «здесь и сейчас». Это займёт минуту-две.', [['Заземление', 'calmGo', 'ground'], ['Другие упражнения', 'calmMenu', '']]);
  if (/бесит|злю|злость|раздраж|ярост/.test(t)) return R('angry', 'Злость имеет право на выход. Выпустим пар безопасно: движение, смятая бумага, злое письмо.', [['Выплеснуть', 'calmGo', 'anger']]);
  if (/сон|спать|засып|клонит|тянет лечь|вздремн/.test(t)) return R('think', 'Сонливость волной приходит и уходит. Попробуем взбодриться на ногах.', [['Набор «не уснуть»', 'napTool', '']]);
  if (/вейп|курит|курить|затянуться/.test(t)) return R('shrug', 'Тянет, бывает. Сначала вода и минута движения, потом посмотрим, как волна.', [['Открыть «Без вейпа»', 'go', 'smoke'], ['Упражнение', 'calmGo', 'anger']]);
  if (/ужин|поесть|еда|готов|голодн/.test(t)) { const b = C.dayList(ds).find((x) => x.id === 'dinner'); return R('thumbs', b ? 'На ужин по плану: ' + b.hint : 'Загляни в «Еду»: там меню на неделю и список покупок.', [['Меню недели', 'go', 'food'], ['Что в холодильнике', 'go', 'fridge']]); }
  if (/надеть|образ|одежд|вещ/.test(t)) return R('wave', C.outfitText(), [['Образ и цвета', 'go', 'look']]);
  if (/песн|музык|включ|послуш/.test(t)) { const m = C.songs(/спокой|тих/.test(t) ? 'спокойствие' : /груст|плох/.test(t) ? 'грусть' : /трен|спорт/.test(t) ? 'тренировка' : 'утро'); return R('cheer', 'Вот три песни под настроение: ' + m.map((x) => x.t).join('; ') + '.', m.slice(0, 2).map((x) => ['▶ ' + x.t.split(' — ')[0], 'open_url', x.href])); }
  if (/сейчас|план|расписан|дальше/.test(t)) { const l = C.dayList(ds), i = nowIndex(l, ds), b = l[i >= 0 ? i : 0], n = l.slice((i >= 0 ? i : 0) + 1).find((x) => !x.skipped); return R('wave', b ? 'Сейчас в плане: ' + b.title + ' (' + tm(b.t) + ').' + (n ? ' Дальше в ' + tm(n.t) + ': ' + n.title + '.' : '') : 'На сегодня пусто.', [['Открыть «Сегодня»', 'go', 'today']]); }
  const hit = C.ask(q).find((x) => x.s >= 3);
  if (hit) return R('think', hit.t + (hit.x ? '. ' + hit.x : ''), hit.kind === 'ex' ? [['Начать', 'calmGo', hit.k]] : null);
  return R('shrug', 'Тут я без подсказки, но могу помочь с планом, едой, образом, музыкой и упражнениями. Хочешь болтать свободно? Подключи ИИ в меню «ИИ GigaChat».', [['Подключить ИИ', 'go', 'ai']]);
}
let sending = false;
export async function friendSend(text) {
  const q = String(text || '').trim(); if (!q || sending) return; sending = true;
  push({ r: 'u', t: q }); C.save(); C.redraw();
  let rep;
  if (gcReady()) {
    try {
      const msgs = [{ role: 'system', content: persona(V().fname, { name: V().name }, C.report('')) }, ...V().chat.slice(-9).map((m) => ({ role: m.r === 'u' ? 'user' : 'assistant', content: m.t }))];
      const t = await gcAsk(msgs); const loc = localReply(q); rep = { r: 'f', p: loc.p, t: t || loc.t, ...(loc.a && /тревож|бесит|сон|вейп|ужин|надеть/i.test(q) ? { a: loc.a } : {}) };
    } catch (e) { rep = { ...localReply(q) }; rep.t = rep.t + ' (ИИ сейчас недоступен: ' + String(e.message || e).slice(0, 70) + ')'; }
  } else rep = localReply(q);
  push(rep); sending = false; C.save(); C.redraw(); try { window.scrollTo(0, (document.body || {}).scrollHeight || 0); } catch (e) { /* без прокрутки */ }
}
export function friendQuick(k) {
  const m = { now: 'что у меня сейчас', calm: 'мне тревожно', anger: 'всё бесит', nap: 'тянет в сон', dinner: 'что на ужин', wear: 'что надеть', song: 'включи песню', chat: '' }[k];
  if (k === 'chat') { push({ r: 'f', p: 'wave', t: gcReady() ? 'Рассказывай, как день?' : 'Рассказывай. Без ИИ я лучше всего отвечаю на вопросы про план, еду, образ, музыку и спокойствие.' }); C.save(); C.redraw(); const i = document.getElementById('chatIn'); if (i) i.focus(); return; }
  friendSend(m);
}

/* ---------- Звуки ---------- */
export function renderSounds() {
  const s = V().snd;
  let h = '<button class="back" data-act="go" data-v="menu">‹ Меню</button><h1>Звуки</h1><p class="sub">Свои звуки для действий в приложении</p>';
  h += '<div class="card"><div class="row"><b class="grow">Звуки включены</b><button class="switch' + (s.on ? ' on' : '') + '" data-act="sndOn" aria-label="Переключить"><i></i></button></div><div class="muted" style="margin:10px 0 6px">Громкость</div><div class="chips">' + [30, 50, 70, 100].map((x) => '<button class="chip pick' + (s.vol === x ? ' on' : '') + '" data-act="sndVol" data-v="' + x + '">' + x + '%</button>').join('') + '</div></div>';
  EVENTS.forEach(([ev, name]) => {
    h += '<div class="card"><h2 style="margin:0 0 8px">' + esc(name) + '</h2><div class="chips">' + Object.entries(PRESETS).map(([k, p]) => '<button class="chip pick' + (s.ev[ev] === k ? ' on' : '') + '" data-act="sndPick" data-v="' + ev + '|' + k + '">' + esc(p.t) + '</button>').join('') + '</div></div>';
  });
  h += '<div class="card"><h2>Про уведомления</h2><div class="muted">Звук пуш-уведомлений на iPhone выбирает сама система, приложение его изменить не может. Громкость и тип можно настроить в «Настройках» → «Уведомления» → «Мой ритм». Здесь звуки для действий внутри приложения.</div></div>';
  return h;
}
export function sndAct(act, v) {
  const s = V().snd;
  if (act === 'sndOn') { s.on = !s.on; C.save(); if (s.on) play('chime', s.vol); C.redraw(); return true; }
  if (act === 'sndVol') { s.vol = Number(v); C.save(); play('drop', s.vol); C.redraw(); return true; }
  if (act === 'sndPick') { const [ev, k] = v.split('|'); s.ev[ev] = k; C.save(); play(k, s.vol); C.redraw(); return true; }
  return false;
}

/* ---------- ИИ ---------- */
export function renderAI() {
  const c = gcCfg(), mode = c.proxy || !c.key ? 'proxy' : 'direct';
  let h = '<button class="back" data-act="go" data-v="menu">‹ Меню</button><h1>ИИ GigaChat</h1><p class="sub">Подружка сможет болтать свободно</p>';
  h += '<div class="card"><div class="tagc">Статус</div><h2 style="margin:4px 0">' + (gcReady() ? 'Настроено' : 'Не подключено') + '</h2><div class="muted">Без ИИ подружка отвечает по готовым подсказкам. С ИИ отвечает на любые вопросы, зная твой день.</div></div>';
  h += '<div class="card"><h2>Через прокси (надёжно)</h2><div class="muted" style="margin-bottom:8px">Ключ GigaChat хранится в твоей облачной функции, а не в телефоне. Как её создать: в инструкции, раздел «ИИ».</div><label>Адрес функции<input type="url" id="gcProxy" placeholder="https://functions.yandexcloud.net/…" value="' + esc(c.proxy || '') + '"></label><label>Пароль приложения<input type="password" id="gcSecret" placeholder="слово-пароль из функции" value="' + esc(c.secret || '') + '"></label></div>';
  h += '<div class="card"><h2>Напрямую (может не сработать)</h2><div class="muted" style="margin-bottom:8px">Ключ авторизации из кабинета GigaChat хранится на этом телефоне. Safari может не принять сертификат Сбера; тогда используй прокси.</div><label>Ключ авторизации<input type="password" id="gcKey" placeholder="Authorization key" value="' + esc(c.key || '') + '"></label></div>';
  h += '<div class="addrow"><button class="btn" data-act="gcSave">Сохранить и проверить</button><button class="btn g" data-act="gcOff">Отключить</button></div><div id="gcMsg" class="note" style="display:none"></div>';
  return h;
}
export async function aiAct(act) {
  const val = (i) => { const x = document.getElementById(i); return x ? x.value.trim() : ''; }, box = document.getElementById('gcMsg');
  if (act === 'gcOff') { localStorage.removeItem('moy_ritm_gc'); C.redraw(); C.toast('ИИ отключён'); return true; }
  if (act === 'gcSave') { gcSave({ proxy: val('gcProxy'), secret: val('gcSecret'), key: val('gcKey') }); if (box) { box.style.display = 'block'; box.textContent = 'Проверяю…'; } const r = await gcTest(); if (box) { box.style.display = 'block'; box.textContent = r.msg; } return true; }
  return false;
}

/* ---------- Виджет ---------- */
const base = () => String(location.href || '').replace(/[?#].*$/, '').replace(/[^/]*$/, '');
const WCAT = new Set(['morning', 'move', 'food', 'work', 'project', 'home', 'break', 'lesson', 'rest', 'sleep']);
export function widgetData() {
  const today = C.todayStr(), days = {};
  for (let i = 0; i < 4; i++) { const ds = C.addDays(today, i), d = C.S.done[ds] || {}; days[ds] = C.dayList(ds).filter((b) => !b.skipped && WCAT.has(b.cat)).map((b) => [b.t, b.title.replace(/^Проект: /, ''), C.emo(b.id), d[b.id] ? 1 : 0]); }
  const [c1, c2] = C.colors(today), st = C.dayStats(today);
  return { gen: new Date().toISOString(), today, pct: st.pct, water: C.S.water[today] || 0, color: [SW[c1], SW[c2]], days };
}
export function renderWidget() {
  const g = C.gh(), nm = base() + 'widget.json';
  let h = '<button class="back" data-act="go" data-v="menu">‹ Меню</button><h1>Виджет</h1><p class="sub">На рабочем столе и на экране блокировки</p>';
  h += '<div class="card"><div class="steps4">' + [['download', 'Поставь бесплатное приложение Scriptable из App Store'], ['copy', 'Скопируй скрипт кнопкой ниже и создай в Scriptable новый скрипт'], ['gear', 'Вставь, сохрани и добавь виджет Scriptable на экран'], ['send', 'Нажми «Отправить данные» здесь: виджет возьмёт расписание']].map(([i, t], k) => '<div class="st4"><span class="num">' + (k + 1) + '</span><span>' + esc(t) + '</span></div>').join('') + '</div></div>';
  h += '<div class="card"><div class="muted">Адрес данных для скрипта:</div><div class="mono">' + esc(nm) + '</div><div class="addrow"><button class="btn" data-act="wCopy">Скопировать скрипт</button><button class="btn g" data-act="wUrl">Скопировать адрес</button></div></div>';
  h += '<div class="card"><h2>Данные виджета</h2><div style="color:var(--soft);font-size:14px">' + (g.token ? (V().wLast ? 'Последняя отправка: ' + esc(V().wLast) : 'Токен GitHub есть, данные ещё не отправлялись.') : 'Нужен токен GitHub (тот же, что для холодильника: Меню → Холодильник → отправка).') + '</div><div class="addrow"><button class="btn" data-act="wPush">Отправить данные</button></div><div class="row" style="margin-top:12px"><b class="grow">Обновлять само при изменениях</b><button class="switch' + (V().wAuto ? ' on' : '') + '" data-act="wAuto" aria-label="Автообновление"><i></i></button></div></div>';
  h += '<div class="card"><h2>Что увидишь</h2><div class="muted">Экран блокировки: ближайшее дело, процент дня, воды. Рабочий стол: «Сейчас» и «Дальше» в пастельных цветах дня. Личные разделы (цикл, отношения, здоровье) в виджет не попадают.</div></div>';
  return h;
}
let wT = null;
export function widgetSync(now) {
  if (!C.gh().token || (!V().wAuto && !now)) return Promise.resolve(null);
  clearTimeout(wT);
  return new Promise((res) => { wT = setTimeout(async () => { const d = widgetData(), hs = JSON.stringify({ ...d, gen: 0 }); if (!now && hs === V().wHash) { res(null); return; } const r = await C.pushFile('widget.json', d, 'Виджет'); if (r.ok) V().wHash = hs; if (r.ok) { V().wLast = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); C.save(); } res(r); }, now ? 0 : 4000); });
}
export async function widgetAct(act) {
  if (act === 'wAuto') { V().wAuto = !V().wAuto; C.save(); if (V().wAuto) widgetSync(); C.redraw(); return true; }
  if (act === 'wPush') { C.toast('Отправляю…'); const r = await widgetSync(true); C.toast(r && r.ok ? 'Готово' : (r && r.msg) || 'Нужен токен GitHub'); C.redraw(); return true; }
  if (act === 'wCopy') { try { const t = await (await fetch('widget/Moy_ritm_widget.js')).text(); C.copy(t); } catch (e) { C.toast('Не удалось загрузить скрипт'); } return true; }
  if (act === 'wUrl') { C.copy(base() + 'widget.json'); return true; }
  return false;
}

/* ---------- Обо мне ---------- */
const GOALS = [['rhythm', 'Режим дня', 'clock'], ['projects', 'Проекты', 'rocket'], ['vape', 'Без вейпа', 'smoke'], ['nap', 'Без дневного сна', 'sleepy'], ['water', 'Вода', 'drop'], ['move', 'Движение', 'dumbbell'], ['money', 'Накопить на квартиру', 'house'], ['look', 'Образ и уход', 'dress']];
export function renderMe() {
  const v = V();
  let h = '<button class="back" data-act="go" data-v="menu">‹ Меню</button><h1>Обо мне</h1><p class="sub">Чтобы приложение было про тебя</p>';
  h += '<div class="card"><label>Как к тебе обращаться<input type="text" id="meName" placeholder="Имя" value="' + esc(v.name) + '"></label><label>Как зовут подружку<input type="text" id="meFr" placeholder="Подружка" value="' + esc(v.fname) + '"></label><div class="addrow"><button class="btn" data-act="meSave">Сохранить</button></div></div>';
  h += '<div class="card"><h2>Мои цели</h2><div class="goals">' + GOALS.map(([k, t, i]) => '<button class="goal' + (v.goals.includes(k) ? ' on' : '') + '" data-act="goal" data-v="' + k + '">' + ico(i, { size: 28 }) + '<span>' + esc(t) + '</span></button>').join('') + '</div></div>';
  return h;
}
export function meAct(act, v) {
  const val = (i) => { const x = document.getElementById(i); return x ? x.value.trim() : ''; };
  if (act === 'meSave') { V().name = val('meName'); V().fname = val('meFr') || 'Подружка'; C.save(); C.toast('Сохранила'); C.redraw(); return true; }
  if (act === 'goal') { const g = V().goals, i = g.indexOf(v); if (i >= 0) g.splice(i, 1); else g.push(v); C.save(); C.redraw(); return true; }
  return false;
}

/* ---------- Мои привычки ---------- */
function bars(vals, max, cls) { return '<div class="bars">' + vals.map(([l, v]) => '<div class="bar"><i class="' + (cls || '') + '" style="height:' + Math.round(Math.min(1, (v || 0) / max) * 100) + '%"></i><small>' + l + '</small></div>').join('') + '</div>'; }
function analytics() {
  const today = C.todayStr(), days = []; for (let i = 13; i >= 0; i--) days.push(C.addDays(today, -i));
  const lab = (d) => d.slice(8);
  const pct = days.map((d) => { let st; try { st = C.dayStats(d); } catch (e) { st = null; } return [lab(d), st && st.total ? Math.round(st.done / st.total * 100) : 0]; });
  const water = days.map((d) => [lab(d), Number((C.S.water || {})[d]) || 0]);
  const en = days.map((d) => [lab(d), ((C.S.ci || {})[d] || {}).e || 0]), mo = days.map((d) => [lab(d), ((C.S.ci || {})[d] || {}).m || 0]);
  const filled = pct.filter((x) => x[1] > 0), avg = filled.length ? Math.round(filled.reduce((a, x) => a + x[1], 0) / filled.length) : 0;
  const best = [...pct].sort((a, b) => b[1] - a[1])[0];
  const slp = days.filter((d) => V().nap[d] && (V().nap[d].day || V().nap[d].eve)).length, free = days.filter((d) => V().nap[d] && !V().nap[d].day && !V().nap[d].eve).length;
  const dowN = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'], byDow = [0, 1, 2, 3, 4, 5, 6].map((w) => { const x = days.filter((d) => new Date(d + 'T12:00:00').getDay() === w).map((d) => pct.find((p) => p[0] === lab(d))[1]); return [dowN[w], x.length ? Math.round(x.reduce((a, b) => a + b, 0) / x.length) : 0]; });
  const bd = [...byDow].sort((a, b) => b[1] - a[1])[0], wd = [...byDow].filter((x) => x[1] > 0).sort((a, b) => a[1] - b[1])[0];
  if (!filled.length) return '<div class="card"><h2>Графики</h2><div class="muted">Появятся после первых отмеченных дел.</div></div>';
  let h = '<div class="card"><h2>Выполнение дел за 14 дней</h2>' + bars(pct, 100) + '<div class="muted">В среднем ' + avg + '%. Лучший день: ' + (best ? best[0] + ' число, ' + best[1] + '%' : 'пока нет') + '.</div></div>';
  h += '<div class="card"><h2>По дням недели</h2>' + bars(byDow, 100, 'lv') + '<div class="muted">' + (bd && bd[1] ? 'Легче всего идёт ' + bd[0] + '. ' : '') + (wd && wd[1] < (bd ? bd[1] : 0) ? 'Сложнее ' + wd[0] + ': можно запланировать меньше.' : '') + '</div></div>';
  h += '<div class="card"><h2>Вода, стаканы</h2>' + bars(water, 8, 'bl') + '</div>';
  if (en.some((x) => x[1]) || mo.some((x) => x[1])) h += '<div class="card"><h2>Силы утром</h2>' + bars(en, 4) + '<h2 style="margin-top:12px">Настроение вечером</h2>' + bars(mo, 4, 'lv') + '</div>';
  h += '<div class="card"><h2>Сон днём и вечером</h2><div class="kv"><span>Дней без сна</span><span class="r">' + free + '</span></div><div class="kv"><span>Дней со сном</span><span class="r">' + slp + '</span></div></div>';
  return h;
}
export function renderHabits() {
  const sg = suggestions(); let h = '<button class="back" data-act="go" data-v="menu">‹ Меню</button><h1>Мои привычки</h1><p class="sub">Что приложение заметило по твоим правкам и опросам</p>';
  if (sg.length) h += '<div class="card"><h2>Подстроить расписание</h2>' + sg.map((x) => '<div class="kv" style="align-items:center;gap:8px"><span>«' + esc(blockName(x.id)) + '» чаще идёт ' + shiftTxt(x.d) + ' (' + x.n + ' раз)</span><button class="btn s" data-act="shiftYes" data-v="' + x.id + '|' + x.d + '">Сдвинуть</button></div>').join('') + '</div>';
  const sh = Object.keys(V().shift).filter((k) => V().shift[k]);
  if (sh.length) h += '<div class="card"><h2>Уже сдвинуто</h2>' + sh.map((k) => '<div class="kv"><span>' + esc(blockName(k)) + '</span><span class="r">' + shiftTxt(V().shift[k]) + '</span><button class="btn g s" data-act="shiftNo" data-v="' + k + '">Вернуть</button></div>').join('') + '</div>';
  const sk = Object.entries(V().skips).sort((a, b) => b[1].n - a[1].n).slice(0, 4);
  if (sk.length) h += '<div class="card"><h2>Что чаще пропускается</h2>' + sk.map(([k, x]) => '<div class="kv"><span>' + esc(blockName(k)) + '</span><span class="r">' + x.n + ' раз' + (Object.keys(x.r).length ? ', чаще «' + esc(Object.entries(x.r).sort((a, b) => b[1] - a[1])[0][0]) + '»' : '') + '</span></div>').join('') + '</div>';
  const sv = Object.entries(V().sv); const cnt = {}; sv.forEach(([ds, o]) => Object.values(o).forEach((q) => { if (q.sleepy && q.sleepy !== 'нет') cnt.sl = (cnt.sl || 0) + 1; if (q.vape && q.vape !== 'нет') cnt.vp = (cnt.vp || 0) + 1; if (q.day === 'тяжело') cnt.hd = (cnt.hd || 0) + 1; }));
  h += '<div class="card"><h2>По опросам</h2><div class="kv"><span>Дней, когда тянуло в сон</span><span class="r">' + (cnt.sl || 0) + '</span></div><div class="kv"><span>Дней, когда тянуло к вейпу</span><span class="r">' + (cnt.vp || 0) + '</span></div><div class="kv"><span>Тяжёлых дней</span><span class="r">' + (cnt.hd || 0) + '</span></div><div class="muted" style="margin-top:8px">Опросы идут утром, днём, вечером и перед сном. Чем больше отметок, тем точнее подсказки.</div></div>';
  if (!sg.length && !sh.length && !sk.length) h += '<div class="card"><div class="muted">Пока мало данных. Когда будешь править время дел или пропускать их, здесь появятся наблюдения и предложения.</div></div>';
  h += analytics();
  return h;
}
export function habitAct(act, v) {
  if (act === 'shiftYes') { const [id, d] = v.split('|'); V().shift[id] = Number(d); V().learn[id] = []; C.save(); C.redraw(); C.toast('Сдвинула'); return true; }
  if (act === 'shiftNo') { delete V().shift[v]; C.save(); C.redraw(); return true; }
  return false;
}

/* ---------- Упражнения: не только таймер ---------- */
const FEELS = ['тревога', 'обида', 'усталость', 'злость', 'грусть', 'пустота', 'стыд', 'напряжение'];
const PARTS = ['грудь', 'горло', 'живот', 'плечи', 'голова', 'руки'];
const NEEDS = ['отдых', 'тишина', 'объятия', 'движение', 'еда', 'поговорить', 'сделать дело', 'побыть одной'];
const SMALL = ['стакан воды', 'тёплый чай', 'прогулка 10 минут', 'написать подруге', 'душ', 'музыка', 'плед и фильм', 'проветрить'];
const IX = {
  focus: [['list', 'Что крутится в голове'], ['choose', ['работа', 'проект', 'дом', 'отношения', 'тело', 'деньги']], ['write', 'Мой первый шаг на 10 минут'], ['count', 8, 'Убрала предмет'], ['hold', 6], ['tap', 'Начинаю']],
  reset: [['count', 20, 'Встряхни'], ['count', 15, 'Поворот'], ['choose', SMALL], ['tap', 'Сделала'], ['write', 'Сейчас я чувствую…']],
  joy: [['list', 'Приятная мелочь'], ['choose', ['тёплый чай', 'сообщение от близкого', 'красивое небо', 'вкусная еда', 'удачное дело', 'музыка']], ['write', 'Когда повторю'], ['write', 'Что получилось у меня сегодня']],
  ground: [['count', 5, 'Назвала'], ['count', 4, 'Коснулась'], ['count', 3, 'Услышала'], ['count', 2, 'Нашла'], ['tap', 'Сделала глоток'], ['tap', 'Я здесь']],
  thought: [['write', 'Моя тревожная мысль'], ['write', 'Знаю точно / только думаю'], ['write', 'Самый вероятный исход'], ['write', 'Маленький шаг на сегодня'], ['write', 'Что бы сказала подруге']],
  defuse: [['write', 'Я замечаю мысль, что…'], ['cloud'], ['tap', 'Сделала'], ['tap', 'Вернулась к делу']],
  body: [['choose', ['тепло', 'напряжение', 'лёгкость', 'ничего']], ['choose', ['тепло', 'напряжение', 'лёгкость', 'ничего']], ['choose', ['тепло', 'напряжение', 'лёгкость', 'ничего']], ['choose', ['тепло', 'напряжение', 'лёгкость', 'ничего']], ['choose', ['тепло', 'напряжение', 'лёгкость', 'ничего']], ['choose', ['тепло', 'напряжение', 'лёгкость', 'ничего']], ['choose', ['тепло', 'напряжение', 'лёгкость', 'ничего']], ['tap', 'Почувствовала']],
  pmr: [['hold', 5], ['hold', 5], ['hold', 5], ['hold', 5], ['hold', 5], ['hold', 5]],
  place: [['choose', ['море', 'лес', 'горы', 'уютный дом', 'озеро', 'кафе в дождь']], ['write', 'Цвета и свет'], ['write', 'Звуки'], ['choose', ['тепло', 'мягкость', 'ветер', 'тишина']], ['tap', 'Запомнила']],
  label: [['choose', FEELS], ['choose', PARTS], ['choose', NEEDS], ['choose', SMALL]],
  kind: [['tap', 'Сказала'], ['tap', 'Сказала'], ['write', 'Что бы сказала подруга'], ['choose', SMALL]],
  worry: [['list', 'Что тревожит'], ['tap', 'Назначила время'], ['tap', 'Закрыла список']],
  anger: [['count', 25, 'Встряхни'], ['count', 20, 'Присед'], ['count', 12, 'Сомни'], ['write', 'Скажи или напиши всё, что хочешь'], ['write', 'Злое письмо, его никто не увидит', 'tear'], ['tap', 'Стало легче']]
};
let ix = null, holdT = null;
export const stop = () => { clearInterval(napIv); clearInterval(holdT); };
const stepsOf = (k) => IX[k] || [];
export function calm(k, i) {
  clearInterval(holdT); C.stopTimer && C.stopTimer();
  const E = C.exById(k); if (!E) return; i = i || 0;
  if (ix && ix.k === k && i > 0 && ix.cur) { const w = document.getElementById('ixW'); if (w && w.value && ix.q) ix.notes.push([ix.q, w.value]); }
  if (!ix || ix.k !== k || i === 0) ix = { k, i: 0, n: 0, notes: [], items: [], sel: '' };
  ix.i = i; ix.n = 0; ix.sel = ''; ix.items = []; ix.cur = true;
  if (i >= E.steps.length) { const rest = C.exercises().filter((x) => x.k !== k).slice(0, 3); sfx('cheer');
    C.openSheet('<div class="center">' + fimg('cheer', 'big') + '<h2>Готово</h2></div>' + (ix.notes.length ? '<div class="recap">' + ix.notes.map(([q, a]) => '<div class="kv"><span class="muted">' + esc(q) + '</span><span class="r">' + esc(a) + '</span></div>').join('') + '</div>' : '') + '<div class="muted" style="margin:8px 0">Как ты сейчас? Если напряжение осталось, попробуй другое упражнение.</div>' + rest.map((x) => '<div class="kv"><span>' + esc(x.t) + '</span><button class="btn g s" data-act="calmGo" data-v="' + x.k + '">Начать</button></div>').join('') + '<div class="addrow"><button class="btn" data-act="calmStop">Закрыть</button></div>', { t: 'calmDone' }); ix = null; return; }
  const st = E.steps[i], d = stepsOf(k)[i] || ['tap', 'Сделала'], ty = d[0]; ix.q = (ty === 'write' || ty === 'list') ? d[1] : ''; let w = '';
  if (ty === 'tap') w = '<button class="btn big" data-act="ixNext">' + esc(d[1]) + '</button>';
  if (ty === 'count') w = '<div class="counter"><span id="ixN">0</span> / ' + d[1] + '</div><button class="btn big" data-act="ixTap" data-v="' + d[1] + '">' + esc(d[2]) + '</button>';
  if (ty === 'write') w = '<textarea id="ixW" rows="3" placeholder="' + esc(d[1]) + '"></textarea>' + (d[2] === 'tear' ? '<button class="btn g" data-act="ixTear">Порвать и выбросить</button>' : '');
  if (ty === 'choose') w = '<div class="chips">' + d[1].map((o) => '<button class="chip pick" data-act="ixChip" data-v="' + esc(o) + '">' + esc(o) + '</button>').join('') + '</div>';
  if (ty === 'hold') w = '<button class="holdBtn" data-act="ixHold" data-sec="' + d[1] + '" style="--p:0"><span>Держи</span></button><div class="muted center">Нажми и держи ' + d[1] + ' секунд, потом отпусти</div>';
  if (ty === 'cloud') w = '<div class="cloudBox"><div class="cloud" id="ixCloud">' + ico('cloud', { size: 80, sw: 1.2 }) + '<span id="ixCT">' + esc((ix.notes.slice(-1)[0] || ['', 'мысль'])[1]) + '</span></div></div><button class="btn big" data-act="ixFloat">Отпустить облако</button>';
  if (ty === 'list') w = '<div class="addrow"><input type="text" id="ixL" placeholder="' + esc(d[1]) + '"><button class="btn s" data-act="ixAdd">+</button></div><div id="ixItems" class="chips"></div>';
  C.openSheet('<div class="muted">' + esc(E.t) + ' · шаг ' + (i + 1) + ' из ' + E.steps.length + '</div><div class="stepRow">' + face(['think', 'wave', 'thumbs'][i % 3]) + '<h2>' + esc(st[0]) + '</h2></div><div class="exW">' + w + '</div><div class="addrow" style="justify-content:space-between"><button class="btn g s" data-act="calmStop">Закрыть</button><button class="btn s' + (ty === 'tap' ? ' g' : '') + '" data-act="ixNext">Дальше</button></div>', { t: 'calm', k, i });
}
export function ixAct(act, v, el) {
  if (!ix && !/^ix/.test(act)) return false;
  if (act === 'ixNext') { sfx('step'); calm(ix.k, ix.i + 1); return true; }
  if (act === 'ixTap') { ix.n++; const e = document.getElementById('ixN'); if (e) e.textContent = ix.n; C.haptic(); if (ix.n >= Number(v)) { sfx('step'); setTimeout(() => calm(ix.k, ix.i + 1), 350); } return true; }
  if (act === 'ixChip') { ix.sel = v; ix.notes.push([stepsOf(ix.k)[ix.i] ? (C.exById(ix.k).steps[ix.i][0].slice(0, 40)) : '', v]); (document.querySelectorAll ? document.querySelectorAll('[data-act="ixChip"]') : []).forEach((b) => b.classList.toggle('on', b.dataset.v === v)); sfx('done'); return true; }
  if (act === 'ixTear') { const w = document.getElementById('ixW'); if (w) { w.classList.add('tear'); setTimeout(() => { w.value = ''; w.classList.remove('tear'); ix.q = ''; sfx('pop'); }, 600); } return true; }
  if (act === 'ixFloat') { const c = document.getElementById('ixCloud'); if (c) c.classList.add('go'); setTimeout(() => calm(ix.k, ix.i + 1), 1300); return true; }
  if (act === 'ixAdd') { const i = document.getElementById('ixL'); if (i && i.value.trim()) { ix.items.push(i.value.trim()); ix.notes.push(['Тревожит', i.value.trim()]); i.value = ''; document.getElementById('ixItems').innerHTML = ix.items.map((x) => '<span class="chip on">' + esc(x) + '</span>').join(''); } return true; }
  return false;
}
export function holdBind() {
  let t0 = 0, iv = null, btn = null;
  const stop = (ok) => { clearInterval(iv); iv = null; if (btn) { btn.style.setProperty('--p', ok ? 100 : 0); btn.classList.remove('hold'); } btn = null; };
  document.addEventListener('pointerdown', (e) => { const b = e.target.closest('[data-act="ixHold"]'); if (!b || !ix) return; e.preventDefault(); btn = b; t0 = performance.now(); b.classList.add('hold'); const sec = Number(b.dataset.sec) * 1000; iv = setInterval(() => { const p = Math.min(100, ((performance.now() - t0) / sec) * 100); b.style.setProperty('--p', p); if (p >= 100) { stop(true); C.haptic(); sfx('step'); setTimeout(() => calm(ix.k, ix.i + 1), 500); } }, 50); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((n) => document.addEventListener(n, () => { if (iv) stop(false); }));
}

/* ---------- Фон, страницы, действия ---------- */
const HUE = { today: 265, week: 205, plan: 205, proj: 150, mentor: 330, friend: 330, menu: 265, food: 90, fridge: 95, money: 48, health: 175, cycle: 345, look: 15, taste: 300, apts: 200, smoke: 275, nap: 235, habits: 265, sounds: 320, ai: 255, widget: 190, me: 340, set: 265, more: 265 };
const ART = { plan: 'week', friend: 'mentor', nap: 'sleep', habits: 'menu', ai: 'more', widget: 'more', me: 'mentor', set: 'more' };
export function applyBg(tab) {
  try {
    const th = V() && V().themeHue, h = th != null && th !== '' ? Number(th) : HUE[tab] == null ? 265 : HUE[tab], dark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches, st = document.body.style;
    const stroke = dark ? 'hsl(' + h + ' 55% 75% / .26)' : 'hsl(' + h + ' 42% 55% / .30)', fill = dark ? 'hsl(' + h + ' 55% 75% / .06)' : 'hsl(' + h + ' 60% 70% / .14)';
    st.setProperty('--h', h); st.setProperty('--pink', dark ? 'hsl(' + h + ' 25% 25%)' : 'hsl(' + h + ' 75% 91%)'); st.setProperty('--lav', dark ? 'hsl(' + (h + 25) + ' 22% 28%)' : 'hsl(' + (h + 25) + ' 60% 92%)'); st.setProperty('--lav-d', dark ? 'hsl(' + h + ' 60% 78%)' : 'hsl(' + h + ' 38% 48%)'); st.setProperty('--af', dark ? 'hsl(' + h + ' 40% 45% / .35)' : 'hsl(' + h + ' 70% 82% / .55)');
    st.setProperty('--pat', V().noPat ? 'none' : patternUrl(SECTION_ART[ART[tab] || tab] || SECTION_ART.menu, stroke, fill));
    if (th != null && th !== '') st.setProperty('--bg', dark ? 'hsl(' + h + ' 14% 12%)' : 'hsl(' + h + ' 55% 97%)'); else st.removeProperty('--bg');
  } catch (e) { /* без фона */ }
}
const PAGES = { books: renderBooks, theme: renderTheme, menu: renderMenu, friend: renderFriend, nap: renderNap, sounds: renderSounds, ai: renderAI, widget: renderWidget, me: renderMe, habits: renderHabits };
export const pageOf = (tab) => (PAGES[tab] ? PAGES[tab]() : null);
export const isPage = (tab) => !!PAGES[tab];
export async function act(a, v, el) {
  if (a === 'go') { C.closeSheet(); if (v === 'calm') { C.calmMenu(); return true; } C.setTab(v === 'projects' ? 'proj' : v); return true; }
  if (a === 'edit') { editSheet(v); return true; }
  if (/^bk[A-Z]/.test(a)) return bookAct(a, v);
  if (/^th[A-Z]/.test(a)) return themeAct(a, v);
  if (a === 'navSet') { navSheet(); return true; }
  if (/^nav[A-Z]/.test(a)) return navAct(a, v);
  if (a === 'calmMenu') { C.calmMenu(); return true; }
  if (a === 'fpose') { const ks = ['wave', 'think', 'cheer', 'wow', 'angry', 'shrug', 'shy', 'thumbs']; V().fpose = ks[(ks.indexOf(V().fpose || 'wave') + 1) % ks.length]; C.redraw(); return true; }
  if (a === 'addDo') { addSheet(); return true; }
  if (a === 'adSave') { addSave(); return true; }
  if (/^ed[A-Z]/.test(a)) return editAct(a, v);
  if (/^sv[A-Z]/.test(a)) { if (a === 'svNow') { surveySheet(); return true; } return svAct(a, v); }
  if (a === 'napTool') { napTool(); return true; }
  if (/^nap[A-Z]/.test(a)) return napAct(a, v);
  if (/^snd[A-Z]/.test(a)) return sndAct(a, v);
  if (a === 'gcSave' || a === 'gcOff') return aiAct(a);
  if (/^w[A-Z]/.test(a) && a !== 'wx') return widgetAct(a);
  if (a === 'meSave' || a === 'goal') return meAct(a, v);
  if (a === 'shiftYes' || a === 'shiftNo') return habitAct(a, v);
  if (a === 'fq') { friendQuick(v); return true; }
  if (a === 'fsend') { if (v) { friendSend(v); return true; } const i = document.getElementById('chatIn'); if (i) { const t = i.value; i.value = ''; friendSend(t); } return true; }
  if (a === 'fclear') { V().chat = []; C.save(); C.redraw(); return true; }
  if (a === 'open_url') { window.open(v, '_blank', 'noopener'); return true; }
  if (a === 'calmGo') { calm(v, 0); return true; }
  if (/^ix[A-Z]/.test(a)) return ixAct(a, v, el);
  if (a === 'showPast') { C.togglePast(); return true; }
  return false;
}
export function after(tab) {
  applyBg(tab);
  const i = document.getElementById('chatIn'); if (i && i.dataset && !i.dataset.b && i.addEventListener) { i.dataset.b = 1; i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const t = i.value; i.value = ''; friendSend(t); } }); }
}
