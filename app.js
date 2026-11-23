import { VERSION, PLAN, buildDay, fmt, parseHM, dayOfWeek, addDays, weekNumber, daysToStart, bedtime } from './core.js';
import { TIPS, WEEK_TOPICS, pick, byTopic } from './tips.js';
import { TASTE0, MONTH_BOOKS, SERIES, FILMS, MUSIC, MUSIC_CTX, BOOKS, GIFTS, EVENING, WHERE, TEMP, FACES, FACE_NOTE, HAIR, hairFor, SKIN, NAILS, subFor, colorOfDay, outfitOf, pick3, mark as tMark, links as tLinks, norm as tNorm } from './tastes.js';
import { weekMenu, weekShopping, mondayOfDs } from './menu.js';
import { parseListing, shrinkImage, putPhoto, getPhoto, delPhoto, askLocal, icsFromEvents, drawWallpaper, haptic, beep, unlockAudio, lockCfg, setPin, checkPin, bioSupported, bioRegister, bioCheck, lockOff, ghCfg, ghSave, guessRepo, pushFridge } from './extras.js';
const MINI = typeof location !== 'undefined' && /[?&]mini=1/.test(location.search || '');
import { outfit, planMonths, LOOK_ITEMS0, LOOK_STEPS0, REL_Q3, badgeState, CYCLE0, cyclePhase, PH, PH_SAY, PH_NOTE, SYM, phaseEnergy, ENERGY, FEEL, energyValue, moodValue, feelName, feelReply, topFeels, PLAN_OPTS, planOf, needsCheckpoint, CP_CHOICES, MAX_ACTIVE, REL_Q1, REL_Q2, relAdvice, relPattern, relName, MONEY0, monthKey, moneyStats, moneySay, rub, HEALTH0, HEALTH_ADD, CHECK_ADD, EXERCISES, exById, exTotal, ANX_BEST, todayKit, fridgeSorted, fridgeDays, fridgeSay, recipeMatches, INCOME_IDEAS, aptPlan, healthProgress, healthNext, healthOverdue } from './mentor2.js';

const VAPID_PUBLIC = 'BFy_KCTONT2KbTEvVpemnBLUFXrCHJ1q_8DfK7YDW4EY55hwVV9cGTJpZ6_GKJNPZ37ilVnk_te1BpojNKgWTs4';
const KEY = 'moy_ritm_v1';
const DEFAULT_CFG = {
  start: '2026-11-23', workStart: '08:30', workEnd: '17:00', leave: '08:05', wake: '06:30',
  wakeWeekend: ['09:00', '08:30', '08:00'], bedtimes: ['23:45', '23:30', '23:00', '22:30'], weekendBedExtra: 30, quietWeekendUntil: '10:00',
  breakfast: '06:50', lunch: '11:50', dinner: '19:00', lesson: { dow: 4, time: '18:00', minutes: 60 },
  projectDays: [2, 5], freeDays: [1, 3]
};

let cfg = DEFAULT_CFG;
const SM0 = { on: false, base: 20, price: 0, pack: 7, from: '', quit: '', days: {}, last: 0 };
let S = { done: {}, water: {}, sleep: {}, minMode: {}, tasks: null, shop: [], prep: {}, review: {}, diary: {}, projects: [], pa: {}, ci: {}, sm: SM0, rel: {}, money: null, health: null, ideas: [], cycle: null, look: null, fridge: [], inti: [] };
try { const raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw) S = { ...S, ...raw }; } catch (e) {}
function fixS() {
  S.sm = { ...SM0, ...(S.sm || {}) };
  S.money = { ...MONEY0, ...(S.money || {}), months: { ...((S.money && S.money.months) || {}) } };
  if (!Array.isArray(S.health)) S.health = HEALTH0();
  { const have = new Set(S.health.map((x) => x.id)); HEALTH_ADD().forEach((x) => { if (!have.has(x.id)) S.health.push(x); });
    const chk = S.health.find((x) => x.id === 'h-check'); if (chk) CHECK_ADD.forEach(([id, t]) => { if (!chk.steps.some((s) => s.id === id)) chk.steps.push({ id, t, done: false }); }); }
  if (!S.aptInit) { if (!(S.money.goal > 0)) S.money.goal = 900000; S.aptInit = true; }
  if (!Array.isArray(S.fridge)) S.fridge = [];
  if (!S.taste || !S.taste.v) S.taste = TASTE0();
  S.taste = { ...TASTE0(), ...S.taste, ctx: { ...TASTE0().ctx, ...(S.taste.ctx || {}) }, books: { cur: '', done: [], ...(S.taste.books || {}) } };
  if (!Array.isArray(S.apts)) S.apts = [];
  if (!S.apts.length && S.money && S.money.apt && S.money.apt.name) S.apts.push({ id: uid(), name: S.money.apt.name, url: S.money.apt.url || '', price: Number(S.money.apt.price) || 0, area: 0, rooms: '', floor: '', note: '', ph: [] });
  if (!Array.isArray(S.inti)) S.inti = [];
  if (!S.firstSeen) S.firstSeen = Date.now();
  if (S.money && !S.money.apt) S.money.apt = { name: '', url: '', price: '' };
  if (S.sm && S.sm.showNum === undefined) S.sm.showNum = false;
  if (!Array.isArray(S.ideas)) S.ideas = [];
  if (!S.rel || typeof S.rel !== 'object') S.rel = {};
  if (!Array.isArray(S.badges)) S.badges = [];
  S.health.forEach((x) => { x.steps = x.steps.filter((q) => !/^Консультация врача по вейпу/.test(q.t)); });
  const lk = S.look || {};
  S.look = { day: { ...(lk.day || {}) }, budget: lk.budget > 0 ? lk.budget : 5000, items: Array.isArray(lk.items) ? lk.items : LOOK_ITEMS0(), steps: Array.isArray(lk.steps) ? lk.steps : LOOK_STEPS0() };
  const cy = S.cycle || {};
  S.cycle = { ...CYCLE0, ...cy, starts: [...(cy.starts || [])], sym: { ...(cy.sym || {}) }, off: { ...(cy.off || {}) } };
}
fixS();
if (!S.tasks) S.tasks = ['Записаться к стоматологу', 'Сдать анализы', 'Маникюр', 'Парикмахер'].map((t, i) => ({ id: 't' + i, t, done: false }));
const diffDays = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 86400000);
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

const pad = (n) => String(n).padStart(2, '0');
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const DOW = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
const longDate = (ds) => new Date(ds + 'T12:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
const shortDate = (ds) => new Date(ds + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
const mondayOf = (ds) => addDays(ds, -(dayOfWeek(ds) - 1));
const uid = () => 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

const IC = {
  today: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  week: '<rect x="3" y="5" width="18" height="16" rx="4"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  plan: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  food: '<path d="M18 8h1a4 4 0 0 1 0 8h-1M3 8h15v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M7 3v2M11 3v2M15 3v2"/>',
  more: '<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>',
  proj: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6"/>',
  mentor: '<path d="M12 3l2.2 5.6L20 9.3l-4.5 3.8L17 19l-5-3.1L7 19l1.5-5.9L4 9.3l5.8-.7z"/>',
  smoke: '<path d="M5 19c8 0 14-6 14-14C11 5 5 11 5 19z"/><path d="M5 19l8-8"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  drop: '<path d="M12 3.5C9 8 6.5 10.6 6.5 14a5.5 5.5 0 0 0 11 0c0-3.4-2.5-6-5.5-10.5z"/>'
};
const icon = (k) => '<svg viewBox="0 0 24 24">' + IC[k] + '</svg>';
const TABS = [['today', 'Сегодня'], ['week', 'Неделя'], ['proj', 'Проекты'], ['mentor', 'Наставник'], ['more', 'Ещё']];
IC.week = IC.week; IC.more = IC.more;

let tab = 'today';
let privOpen = false;
let sel = todayStr();
let firstScroll = true;
const view = document.getElementById('view');
const tabsEl = document.getElementById('tabs');

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2200);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('Скопировано'); return; } catch (e) {}
  const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); toast('Скопировано'); } catch (e) { toast('Выдели текст и скопируй вручную'); }
  ta.remove();
}

/* ---------- Подсчёты ---------- */
function dayList(ds) {
  const all = buildDay(ds, cfg, ctxFor(ds));
  return S.minMode[ds] ? all.filter((b) => b.essential) : all;
}
function dayStats(ds) {
  const list = dayList(ds).filter((b) => !b.optional);
  const d = S.done[ds] || {};
  const done = list.filter((b) => d[b.id]).length;
  return { done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
}

/* ---------- Вейп: данные ---------- */
const TRIG = ['Стресс', 'После еды', 'Кофе или цикорий', 'Скука', 'Компания', 'Пауза на работе', 'Алкоголь', 'Привычка рук', 'Утро', 'В дороге', 'Вечер', 'Перед сном', 'За проектами', 'После трудного разговора', 'Одна дома', 'Нет настроения', 'Ссора'];
const TRIG_ADV = {
  'Стресс': 'Стресс: стакан воды, потом выйти на 5 минут. Никотин снимает напряжение лишь на минуты, а потом оно возвращается.',
  'После еды': 'После еды: сразу встань, помой посуду или почисти зубы. Связка «поел и взяла вейп» рвётся, если сразу сменить действие.',
  'Кофе или цикорий': 'С напитком: пей его в другом месте и без телефона, или смени кружку. Новое место ломает привычную связку.',
  'Скука': 'Скука: держи под рукой короткое занятие на 10 минут: музыка, рукоделие, звонок близкому.',
  'Компания': 'Компания: заранее придумай фразу «я не курю, спасибо» и выходи вместе, но с водой в руке.',
  'Пауза на работе': 'Рабочая пауза: замени вейп выходом на воздух со стаканом воды. Время то же, меняется только вейп.',
  'Алкоголь': 'Алкоголь: в такие вечера срываются чаще всего. Заранее решай, сколько раз и как уйдёшь домой без вейпа.',
  'Привычка рук': 'Привычка рук: ручка, стресс-мяч, чётки или стакан воды в руке дают рукам другое дело.',
  'Утро': 'Утро: сразу после подъёма стакан воды, потом жвачка или леденец. Телефон и вейп не берём, пока не прошло 15 минут.',
  'В дороге': 'В дороге: жвачка или леденец и громкая музыка. Заранее включи плейлист, чтобы руки и рот были заняты.',
  'Перед сном': 'Перед сном: вейп за час до кровати первым уходит из вечера. Вместо него мятная таблетка, вода, аромалампа с лавандой, тёплый душ. Засыпать без вейпа получается через несколько вечеров.',
  'После трудного разговора': 'После трудного разговора: сначала выйди на воздух со стаканом воды. Резкое сообщение не пиши, черновик подождёт 15 минут.',
  'Нет настроения': 'Когда нет настроения: сначала тёплый напиток или душ, потом короткая прогулка. Вейп настроение не чинит, а откладывает.',
  'Ссора': 'После ссоры: выйди на воздух со стаканом воды и мятной таблеткой, сообщение пиши черновиком и жди 15 минут. В разделе «Спокойствие» есть упражнение «Выплеснуть злость».',
  'Одна дома': 'Когда одна дома: включи музыку или фильм, займи руки рукоделием, чаем или ванной. Вечер без вейпа тоже может быть уютным.',
  'Вечер': 'Вечер: тёплая ванна, аромалампа, чай. Закрепи за вечером новый ритуал вместо вейпа.',
  'За проектами': 'За проектами: подход 50 минут без вейпа, потом пауза 10 минут с водой и леденцом. Вейп не награда за работу.'
};
const smRec = (ds) => S.sm.days[ds] || null;
const smEnsure = (ds) => (S.sm.days[ds] = S.sm.days[ds] || { n: 0, cr: 0, res: 0, tr: {} });
function smLimit(ds) {
  const m = S.sm;
  if (!m.quit || !m.from) return m.base;
  const tot = diffDays(m.from, m.quit);
  if (tot <= 0) return 0;
  const t = Math.min(1, Math.max(0, diffDays(m.from, ds) / tot));
  return Math.max(0, Math.round(m.base * (1 - t)));
}
function smStreak() {
  let n = 0; const t = todayStr();
  for (let i = 0; i < 400; i++) {
    const d = addDays(t, -i), r = smRec(d);
    if (r && r.n === 0) n++; else if (i === 0 && !r) continue; else break;
  }
  return n;
}
function smTotals() {
  const m = S.sm; let saved = 0, frac = 0, res = 0, cr = 0; const tr = {};
  for (const [ds, r] of Object.entries(m.days)) {
    if (m.from && ds < m.from) continue;
    saved += Math.max(0, m.base - r.n); frac += Math.max(0, m.base - r.n) / m.base; res += r.res || 0; cr += r.cr || 0;
    for (const [k, v] of Object.entries(r.tr || {})) tr[k] = (tr[k] || 0) + v;
  }
  const money = m.price > 0 ? Math.round(frac * (m.price / (m.pack || 7))) : 0;
  return { saved, money, res, cr, tr };
}
function ago(ms) {
  if (!ms) return '';
  const m = Math.max(0, Math.floor((Date.now() - ms) / 60000));
  if (m < 60) return m + ' мин';
  const h = Math.floor(m / 60);
  return h < 48 ? h + ' ч ' + (m % 60) + ' мин' : Math.floor(h / 24) + ' дн.';
}

/* ---------- Проекты: данные ---------- */
const ctxFor = (ds) => {
  const p = cyclePhase(S.cycle, ds), mon = mondayOf(ds);
  return { soft: !!(p && p.soft && !S.cycle.off[ds]), phase: p ? p.phase : '', dress: S.look.day[mon] === dayOfWeek(ds) ? outfit(mon, ds) : '' };
};
const phKey = (ds) => { const p = cyclePhase(S.cycle, ds); return p ? p.phase : ''; };
const activeProjects = () => S.projects.filter((p) => !p.arch && !p.park);
const projById = (id) => S.projects.find((p) => p.id === id);
const isSess = (b) => b.cat === 'project' && /^proj\d+$/.test(b.id);
function projStats(pid, from, to) {
  let n = 0, min = 0;
  for (const ds of Object.keys(S.pa)) {
    if ((from && ds < from) || (to && ds > to)) continue;
    const a = S.pa[ds];
    for (const id of Object.keys(a)) {
      if (a[id].pid !== pid || !(S.done[ds] && S.done[ds][id])) continue;
      n++; const b = buildDay(ds, cfg, ctxFor(ds)).find((x) => x.id === id); min += b ? b.dur : 50;
    }
  }
  return { n, min };
}
const hours = (min) => (min >= 60 ? Math.floor(min / 60) + ' ч ' + (min % 60 ? (min % 60) + ' мин' : '') : min + ' мин').trim();

/* ---------- Наставник: логика ---------- */
const CAT_NAME = { sleep: 'Сон', body: 'Тело', food: 'Еда', focus: 'Проекты', calm: 'Спокойствие', people: 'Люди', home: 'Быт', smoke: 'Вейп', money: 'Деньги', health: 'Здоровье', rel: 'Отношения', cycle: 'Цикл' };
function sleepDiff(ds) { // минуты позже/раньше плана, записанные утром ds
  const t = S.sleep[ds]; if (!t) return null;
  let m = parseHM(t); if (m < 12 * 60) m += 1440;
  const pd = addDays(ds, -1);
  return m - bedtime(weekNumber(pd, cfg.start), dayOfWeek(pd), cfg);
}
function dayTip(ds) {
  const w = weekNumber(ds, cfg.start), y = addDays(ds, -1);
  const lastSleep = sleepDiff(ds);
  if (lastSleep !== null && lastSleep > 45) return { why: 'вчера ты легла позже плана', tip: pick(byTopic('sleep'), ds) };
  const cph = cyclePhase(S.cycle, ds);
  if (cph && cph.soft && !S.cycle.off[ds]) return { why: cph.phase === 'pms' ? 'предменструальные дни' : 'первые дни месячных', tip: pick(byTopic('cycle'), ds) };
  if (S.sm.on) {
    const r = smRec(y);
    if (r && r.n > smLimit(y)) return { why: 'вчера вейпа было больше лимита', tip: pick(byTopic('smoke'), ds) };
  }
  const p1 = S.done[y] ? dayStats(y).pct : null, p2 = S.done[addDays(y, -1)] ? dayStats(addDays(y, -1)).pct : null;
  if (p1 !== null && p2 !== null && p1 < 40 && p2 < 40) return { why: 'два дня подряд было тяжело', tip: TIPS.find((x) => x.t === 'Минимум тоже победа') };
  if (S.sm.on && pick(['a', 'b', 'c'], ds) === 'a') return { why: 'про вейп', tip: pick(byTopic('smoke'), ds + 's') };
  const dw = dayOfWeek(ds);
  if (dw === 1 && w % 2 === 0) return { why: 'начало недели: про деньги', tip: pick(byTopic('money'), ds) };
  if (dw === 2) return { why: 'окно для записей: про здоровье', tip: pick(byTopic('health'), ds) };
  const dow = dayOfWeek(ds);
  if (cfg.projectDays.includes(dow)) return { why: 'сегодня проектный вечер', tip: pick(byTopic('focus'), ds) };
  return { why: 'тема недели: ' + PLAN[w - 1].t.toLowerCase(), tip: pick(byTopic(WEEK_TOPICS[w - 1]), ds) };
}
function weekReview(mon) {
  const today = todayStr(), w = weekNumber(mon, cfg.start);
  const days = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(mon, i)).filter((x) => x <= today);
  const withData = days.filter((x) => S.done[x] && Object.values(S.done[x]).some(Boolean));
  const pct = withData.length ? Math.round(withData.reduce((a, x) => a + dayStats(x).pct, 0) / withData.length) : null;
  const diffs = days.map(sleepDiff).filter((x) => x !== null);
  const sleepAvg = diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : null;
  const waterDays = days.filter((x) => (S.water[x] || 0) >= 6).length;
  const smoked = days.reduce((a, x) => a + ((smRec(x) || {}).n || 0), 0);
  const prevMon = addDays(mon, -7);
  const smokedPrev = [0, 1, 2, 3, 4, 5, 6].reduce((a, i) => a + ((smRec(addDays(prevMon, i)) || {}).n || 0), 0);
  const sessions = activeProjects().map((p) => ({ p, ...projStats(p.id, mon, addDays(mon, 6)) }));
  const energy = days.map((x) => (S.ci[x] || {}).e).filter(Boolean);
  const eAvg = energy.length ? energy.reduce((a, b) => a + b, 0) / energy.length : null;
  const obs = [];
  if (sleepAvg === null) obs.push('Записывай по утрам, во сколько легла. Без этого я не вижу, как идёт сон, а он главный.');
  else if (sleepAvg <= 20) obs.push('Отбой почти по плану. Это главное достижение недели, держи.');
  else if (sleepAvg <= 60) obs.push('Ложишься в среднем на ' + sleepAvg + ' минут позже плана. Сдвинь экран-стоп на 15 минут раньше, обычно этого хватает.');
  else obs.push('Отбой сильно позже плана (в среднем на ' + Math.round(sleepAvg / 6) / 10 + ' ч). Первый кандидат на сокращение: последний проектный подход вечером.');
  if (pct !== null) obs.push(pct >= 70 ? 'Выполнено в среднем ' + pct + '%. Очень хороший темп, не форсируй.' : pct >= 40 ? 'Выполнено в среднем ' + pct + '%. Нормально для новых привычек. Продолжай и не добавляй лишнего.' : 'Выполнено в среднем ' + pct + '%. Похоже, план для тебя сейчас плотный. Включай «День без сил» без вины и убери из вечера всё необязательное.');
  if (eAvg !== null && eAvg < 3) obs.push('Энергия на неделе низкая (в среднем ' + eAvg.toFixed(1) + ' из 5). Береги сон и не добавляй новых дел, пока не поднимется.');
  if (S.sm.on) {
    if (smokedPrev > 0) obs.push(smoked < smokedPrev ? 'Вейпа меньше, чем на прошлой неделе: ' + smoked + ' против ' + smokedPrev + '. Это настоящий прогресс.' : smoked === smokedPrev ? 'Вейпа столько же, сколько на прошлой неделе (' + smoked + '). Посмотри на триггеры в разделе «Курение».' : 'Вейпа больше, чем на прошлой неделе (' + smoked + ' против ' + smokedPrev + '). Без самообвинений: найди главный триггер и подготовь замену.');
  } else obs.push('Настрой раздел «Вейп»: там счётчик, кнопка «Тянет» и подсчёт сэкономленных денег.');
  const idle = sessions.filter((x) => x.n === 0);
  if (sessions.length && idle.length && today >= addDays(mon, 3)) obs.push('Проект «' + idle[0].p.name + '» на этой неделе не двигался. Выбери для него один подход.');
  if (!sessions.length) obs.push('Добавь свои проекты во вкладке «Проекты», и вечерние подходы получат конкретные задачи.');
  if (S.cycle.on) {
    const up = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(mon, i)).filter((x) => x >= today && ctxFor(x).soft);
    if (up.length) obs.push('На этой неделе будут предменструальные дни или месячные (с ' + shortDate(up[0]) + '). Не ставь на них сложное: план в эти дни смягчается сам.');
  }
  const feels = topFeels(days.map((x) => S.ci[x]).filter(Boolean));
  const cps = activeProjects().filter((x) => needsCheckpoint(x, projStats(x.id).n));
  if (cps.length) obs.push('Проект «' + cps[0].name + '» на середине пути. Реши, что дальше: дожимаем, меняем подход или откладываем (вкладка «Проекты»).');
  if (activeProjects().length > MAX_ACTIVE) obs.push('Активных проектов больше трёх. Выбери 2–3, остальные убери в парковку: так проще довести до конца.');
  const ov = S.health.filter((x) => healthOverdue(x, today));
  if (ov.length) obs.push('Срок по «' + ov[0].name + '» прошёл. Передвинь его или сделай один маленький шаг.');
  return { w, pct, sleepAvg, waterDays, smoked, smokedPrev, sessions, eAvg, obs, days: days.length, feels };
}
function mentorReply(ci) {
  const out = [];
  const hasF = ci.fe && ci.fe.length;
  if (ci.e && ci.e <= 2) out.push('Сил мало. Это нормально, не героизируй. Сегодня берём минимум: включи «День без сил», вечером без проектов и ранний отбой.');
  else if (ci.e >= 4) out.push('Хорошая энергия. Самое трудное дело дня лучше сделать сейчас.');
  else if (ci.e) out.push('Силы средние. Держи темп ровным и не забывай про перерывы.');
  if (hasF) out.push(feelReply(ci.fe));
  if (PH_NOTE[ci.ph] && ((ci.e && ci.e <= 3) || (ci.m && ci.m <= 3) || hasF)) out.push(PH_NOTE[ci.ph]);
  else if (ci.m && ci.m <= 2) out.push('День был тяжёлым, а ты дошла до его конца. Этого достаточно. Тёплый душ и ранний отбой помогут больше, чем ещё одно дело.');
  else if (ci.m >= 4) out.push('Хороший день. Запомни, что именно его таким сделало, и повтори завтра.');
  else if (ci.m) out.push('Обычный день, и это тоже хорошо. Ритм важнее ярких вспышек.');
  if (ci.next) out.push('Завтрашний шаг записан: «' + ci.next + '». Дальше можно отпустить день.');
  return out.filter(Boolean).join(' ');
}

/* ---------- Окна (листы снизу) ---------- */
const sheetEl = document.getElementById('sheet');
const sheetBody = document.getElementById('sheetBody');
let sh = null, shTimer = null;
function openSheet(html, st) { sh = st || {}; sheetBody.innerHTML = html; sheetEl.classList.add('show'); sheetBody.scrollTop = 0; }
function closeSheet() { sheetEl.classList.remove('show'); sh = null; clearInterval(shTimer); shTimer = null; }
const scale = (id, labels, cur) => '<div class="scale" id="' + id + '">' + labels.map((l, i) => '<button data-act="pickScale" data-k="' + id + '" data-v="' + (i + 1) + '" class="' + (cur === i + 1 ? 'on' : '') + '"><b>' + (i + 1) + '</b><span>' + l + '</span></button>').join('') + '</div>';

function sessSheet(id) {
  const ds = sel, b = buildDay(ds, cfg, ctxFor(ds)).find((x) => x.id === id); if (!b) return;
  const cur = (S.pa[ds] || {})[id];
  const prevPid = cur ? cur.pid : Object.values(S.pa[ds] || {}).slice(-1)[0]?.pid || '';
  const act = activeProjects();
  let h = '<h2>Подход · ' + fmt(b.t) + '–' + fmt(b.t + b.dur) + '</h2>';
  if (!act.length) {
    h += '<p class="muted">Сначала добавь свои проекты, и тут появится выбор.</p><button class="btn" data-act="goProj">Добавить проекты</button>';
    openSheet(h, { t: 'sess', id }); return;
  }
  h += '<div class="muted" style="margin-bottom:8px">Выбери проект</div><div class="chips" id="pjChips">' + act.map((p) => '<button class="chip pick' + (p.id === (cur ? cur.pid : prevPid) ? ' on' : '') + '" data-act="sessPick" data-v="' + p.id + '">' + esc(p.name) + '</button>').join('') + '</div>';
  const pid = cur ? cur.pid : prevPid, pr = pid && projById(pid);
  h += '<div id="pjNote">' + (pr && pr.note ? '<div class="note">В прошлый раз: ' + esc(pr.note) + '</div>' : '') + '</div>';
  h += '<div class="muted" style="margin:12px 0 6px">Что именно сделаю за этот подход</div><input type="text" id="sessTask" value="' + esc(cur ? cur.task || '' : (pr && pr.step) || '') + '" placeholder="Одна конкретная задача">';
  h += '<div class="addrow"><button class="btn" data-act="sessSave">Готово</button>' + (cur ? '<button class="btn g" data-act="sessClear">Убрать</button>' : '') + '</div>';
  h += '<div class="muted" style="margin-top:10px">' + esc(b.hint) + '</div>';
  openSheet(h, { t: 'sess', id, pid });
}
function saveSheet() {
  const ds = sel, act = activeProjects();
  if (!act.length) { openSheet('<h2>Где остановилась</h2><p class="muted">Добавь проекты, и тут можно будет записать заметку.</p><button class="btn" data-act="goProj">Добавить проекты</button>', { t: 'x' }); return; }
  const used = Object.values(S.pa[ds] || {}).map((a) => a.pid);
  const pid = used.length ? used[used.length - 1] : act[0].id;
  let h = '<h2>Где остановилась</h2><div class="chips">' + act.map((p) => '<button class="chip pick' + (p.id === pid ? ' on' : '') + '" data-act="sessPick" data-v="' + p.id + '">' + esc(p.name) + '</button>').join('') + '</div>';
  h += '<div class="muted" style="margin:12px 0 6px">Что сделано и какой первый шаг в следующий раз</div><textarea id="saveTxt" placeholder="Два предложения хватит">' + esc((projById(pid) || {}).note || '') + '</textarea>';
  h += '<div class="addrow"><button class="btn" data-act="saveGo">Записать</button></div>';
  openSheet(h, { t: 'save', pid });
}
function projSheet(id) {
  const p = id ? projById(id) : null;
  openSheet('<h2>' + (p ? 'Проект' : 'Новый проект') + '</h2><div class="muted" style="margin-bottom:6px">Название</div><input type="text" id="pjName" value="' + esc(p ? p.name : '') + '">' +
    '<div class="muted" style="margin:12px 0 6px">Цель: чего хочу добиться</div><input type="text" id="pjGoal" value="' + esc(p ? p.goal || '' : '') + '" placeholder="Например: запустить к 1 марта">' +
    '<div class="muted" style="margin:12px 0 6px">Следующий шаг</div><input type="text" id="pjStep" value="' + esc(p ? p.step || '' : '') + '" placeholder="Что делать первым">' +
    '<div class="muted" style="margin:12px 0 6px">Сколько подходов планирую (напомню про середину)</div><div class="chips">' + PLAN_OPTS.map((n) => '<button class="chip pick' + (n === (p ? p.plan || 0 : 0) ? ' on' : '') + '" data-act="planPick" data-v="' + n + '">' + n + '</button>').join('') + '</div><div class="addrow"><button class="btn" data-act="pjGo">Сохранить</button>' + (p ? '<button class="btn g" data-act="pjArch" data-v="' + p.id + '">' + (p.arch ? 'Вернуть' : 'В архив') + '</button>' : '') + '</div>', { t: 'proj', id, plan: p ? p.plan || 0 : 0 });
}
const tagChips = (list, key, cur) => '<div class="chips" style="margin-bottom:6px">' + list.map((x) => '<button class="chip pick' + ((cur || []).includes(x.k) ? ' on' : '') + '" data-act="ciTag" data-k="' + key + '" data-v="' + x.k + '">' + esc(x.t) + '</button>').join('') + '</div>';
function ciSheet(kind) {
  const ds = todayStr(), c = S.ci[ds] || {};
  let h;
  if (kind === 'm') {
    h = '<h2>Утренняя отметка</h2><div class="muted" style="margin-bottom:8px">Как твои силы сегодня? Можно выбрать несколько.</div>' + tagChips(ENERGY, 'ee', c.ee) +
      '<div class="muted" style="margin:12px 0 8px">Что чувствуешь?</div>' + tagChips(FEEL, 'fm', c.fm) +
      '<div class="muted" style="margin:14px 0 6px">Главное на сегодня (одно дело)</div><input type="text" id="ciFocus" value="' + esc(c.focus || '') + '" placeholder="Что сделаю, даже если всё пойдёт не так">';
  } else {
    h = '<h2>Итог дня</h2><div class="muted" style="margin-bottom:8px">Что ты чувствовала сегодня? Можно несколько.</div>' + tagChips(FEEL, 'fe', c.fe) +
      '<div class="muted" style="margin:14px 0 6px">Что получилось</div><input type="text" id="ciGood" value="' + esc(c.good || '') + '">' +
      '<div class="muted" style="margin:12px 0 6px">Что было трудно</div><input type="text" id="ciHard" value="' + esc(c.hard || '') + '">' +
      '<div class="muted" style="margin:12px 0 6px">Один шаг на завтра</div><input type="text" id="ciNext" value="' + esc(c.next || '') + '">';
  }
  h += '<div class="addrow"><button class="btn" data-act="ciGo" data-v="' + kind + '">Сохранить</button></div>';
  openSheet(h, { t: 'ci', kind, ee: [...(c.ee || [])], fm: [...(c.fm || [])], fe: [...(c.fe || [])] });
}
function trigSheet(after) {
  openSheet('<h2>Что привело к вейпу?</h2><div class="muted" style="margin-bottom:10px">Это не оценка. Так я найду твои главные триггеры и подскажу замену.</div><div class="chips">' +
    TRIG.map((t, i) => '<button class="chip pick" data-act="trig" data-v="' + i + '">' + t + '</button>').join('') + '</div><div class="addrow"><button class="btn g s" data-act="trig" data-v="-1">Пропустить</button></div>', { t: 'trig', after });
}
function craveSheet() {
  const steps = ['Выпей стакан воды, маленькими глотками.', 'Включи музыку в наушниках на одну песню.', 'Смени место: выйди или пройдись 5 минут.', 'Займи руки: ручка, мяч, телефон с музыкой.'];
  openSheet('<h2>Тянет к вейпу</h2><p class="muted" style="margin-top:0">Волна желания обычно длится несколько минут и спадает сама. Твоя задача пережить её, а не победить навсегда.</p>' +
    '<div class="crT" id="crT">10:00</div><div class="addrow" style="justify-content:center"><button class="btn" data-act="crStart" id="crBtn">Запустить таймер на 10 минут</button></div>' +
    '<ol class="steps">' + steps.map((x) => '<li>' + x + '</li>').join('') + '</ol>' +
    '<div class="addrow"><button class="btn" data-act="crWin">Справилась</button><button class="btn g" data-act="crSmoke">Взяла вейп</button></div>', { t: 'crave' });
}




/* ---------- Подборки по вкусам ---------- */
const CATS = { series: SERIES, films: FILMS, books: BOOKS };
function tPicks(kind) {
  const T = S.taste, seed = todayStr() + kind;
  if (kind === 'series') return pick3(T, 'series', SERIES, seed);
  if (kind === 'films') return pick3(T, 'films', FILMS, seed, { keepSeen: false, rewatch: true });
  if (kind === 'books') return pick3(T, 'books', BOOKS, seed);
  if (kind === 'music') return pick3(T, 'music', MUSIC[T.ctx.music] || MUSIC.утро, seed + T.ctx.music, { keepSeen: true });
  if (kind === 'gifts') return pick3(T, 'gifts', GIFTS, seed);
  if (kind === 'ideas') return pick3(T, 'ideas', EVENING.map((x) => x[1]), seed);
  return [];
}
function pickRow(kind, label, names, marks) {
  const lk = tLinks[kind];
  return '<div class="card"><h2>' + label + '</h2>' + names.map((n, i) => '<div class="kv" style="align-items:flex-start;gap:8px"><span>' + (lk ? '<a href="' + esc(lk(n)) + '" target="_blank" rel="noopener">' + esc(n) + '</a>' : esc(n)) + '</span></div>' +
    (marks ? '<div class="addrow" style="margin:2px 0 8px;flex-wrap:wrap">' + marks.map(([how, t]) => '<button class="chip pick" data-act="tmark" data-v="' + kind + '|' + how + '|' + i + '">' + t + '</button>').join('') + '</div>' : '')).join('') +
    '<div class="addrow"><button class="btn g s" data-act="tmore" data-v="' + kind + '">Другие</button></div></div>';
}
function dayPicks(ds) {
  const T = S.taste, dow = dayOfWeek(ds), where = dow >= 6 ? 'выходной' : T.ctx.where === 'выходной' ? 'работа' : T.ctx.where, o = outfitOf(ds, where, T.ctx.temp), [c1, c2] = colorOfDay(ds);
  const fri = dow === 5 || dow === 6, names = fri ? tPicks('films') : tPicks('series');
  return '<div class="card"><h2>Подборка дня</h2><div class="note"><b>Цвет дня:</b> ' + esc(c1 + ' и ' + c2) + '</div><div class="note"><b>Образ:</b> ' + esc(o.base) + (o.outer ? ', ' + esc(o.outer) : '') + '. Акцент: ' + esc(o.colors) + '.</div><div class="note"><b>Вечером ' + (fri ? 'фильм' : 'сериал') + ':</b> ' + esc(names.join(', ')) + '</div><div class="addrow"><button class="btn g s" data-act="goTaste">Все подборки</button></div></div>';
}
function renderTaste() {
  const T = S.taste, c = T.ctx, ds = todayStr();
  let h = '<button class="back" data-act="back">‹ Ещё</button><h1>Подборки</h1><p class="sub">Только названия, решаешь ты. Отмечай «смотрела», «не моё» и «хочу», и я буду точнее.</p>';
  const chips = (arr, key, cur) => '<div class="chips">' + arr.map(([k, t]) => '<button class="chip pick' + (k === cur ? ' on' : '') + '" data-act="tctx" data-v="' + key + '|' + k + '">' + t + '</button>').join('') + '</div>';
  const o = outfitOf(ds, c.where, c.temp), [c1, c2] = colorOfDay(ds);
  h += '<div class="card"><h2>Образ дня</h2><div class="muted" style="margin:6px 0 4px">Куда</div>' + chips(WHERE, 'where', c.where) + '<div class="muted" style="margin:10px 0 4px">Какая погода</div>' + chips(TEMP, 'temp', c.temp) +
    '<div class="note" style="margin-top:10px"><b>' + esc(o.base) + '</b>' + (o.outer ? '<br>Сверху: ' + esc(o.outer) : '') + '<br>Цвета дня: ' + esc(o.colors) + (o.acc ? '<br>Акцент: ' + esc(o.acc) : '') + '</div></div>';
  h += pickRow('series', 'Сериал на вечер', tPicks('series'), [['seen', 'Смотрела'], ['no', 'Не моё'], ['want', 'Хочу']]);
  h += pickRow('films', 'Фильм на выходные', tPicks('films'), [['seen', 'Смотрела'], ['no', 'Не моё'], ['want', 'Хочу']]);
  h += '<div class="card"><h2>Музыка</h2>' + chips(MUSIC_CTX, 'music', c.music) + '</div>' + pickRow('music', 'Включи: ' + (MUSIC_CTX.find((x) => x[0] === c.music) || [0, ''])[1].toLowerCase(), tPicks('music'), [['no', 'Не моё']]);
  h += pickRow('ideas', 'Идея для вечера', tPicks('ideas'), null) + pickRow('gifts', 'Подарок себе', tPicks('gifts'), null);
  const bk = T.books, mk = ds.slice(0, 7), nDone = bk.done.filter((x) => x.ds.slice(0, 7) === mk).length;
  h += '<div class="card"><h2>Книги</h2><div class="kv"><span>В этом месяце</span><span>' + nDone + ' из ' + MONTH_BOOKS + '</span></div>' + (bk.cur ? '<div class="note"><b>Читаю:</b> ' + esc(bk.cur) + '</div><div class="addrow"><button class="btn s" data-act="bookDone">Дочитала</button></div>' : '<div class="muted">Выбери книгу, и она запомнится как текущая. Двадцать страниц перед сном уже хорошо.</div>') + '</div>';
  h += pickRow('books', 'Что почитать', tPicks('books'), null).replace(/<div class="addrow"><button class="btn g s" data-act="tmore" data-v="books">Другие<\/button><\/div>/, '<div class="addrow" style="flex-wrap:wrap">' + tPicks('books').map((x, i) => '<button class="btn g s" data-act="bookCur" data-v="' + i + '">Читать №' + (i + 1) + '</button>').join('') + '<button class="btn g s" data-act="tmore" data-v="books">Другие</button></div>');
  const hs = hairFor(c.face);
  h += '<div class="card"><h2>Прически</h2><div class="muted" style="margin-bottom:6px">Форма лица (по желанию)</div><div class="chips">' + FACES.map(([k, t]) => '<button class="chip pick' + (k === c.face ? ' on' : '') + '" data-act="tface" data-v="' + k + '">' + t + '</button>').join('') + '</div>' + (c.face ? '<div class="note" style="margin-top:8px">' + esc(FACE_NOTE[c.face]) + '</div>' : '') +
    hs.map((x) => '<details class="calm"><summary>' + esc(x.t) + ' · ' + x.min + ' мин</summary><div class="note"><ol class="ul">' + x.steps.map((y) => '<li>' + esc(y) + '</li>').join('') + '</ol></div></details>').join('') + '</div>';
  h += '<div class="card"><h2>Кожа</h2>' + SKIN.map((x) => '<div class="note">' + esc(x) + '</div>').join('') + '</div><div class="card"><h2>Ногти</h2>' + NAILS.map((x) => '<div class="note">' + esc(x) + '</div>').join('') + '</div>';
  h += '<div class="card"><h2>Что я о тебе помню</h2><div class="kv"><span>Сериалы: смотрела / не моё / хочу</span><span>' + T.seen.series.length + ' / ' + T.no.series.length + ' / ' + T.want.series.length + '</span></div><div class="kv"><span>Фильмы</span><span>' + T.seen.films.length + ' / ' + T.no.films.length + ' / ' + T.want.films.length + '</span></div><div class="note">Не люблю: триллеры, ужасы, боевики, аниме, рэп, инди, джаз. Люблю: комедии, фантастику, приключения, мультфильмы, лёгкое.</div></div>';
  view.innerHTML = h;
}

/* ---------- Квартиры ---------- */
function renderApts() {
  let h = '<button class="back" data-act="back">‹ Ещё</button><h1>Квартиры</h1><p class="sub">Ссылки и фото я сама не читаю. Поэтому: вставь текст объявления, я вытащу цену, метраж и этаж. Фото сохраняются на телефоне.</p>';
  h += '<div class="card"><h2>Новый вариант</h2><textarea id="apText" rows="3" placeholder="Вставь текст объявления (необязательно)"></textarea><div class="addrow"><button class="btn g s" data-act="aptFill">Разобрать текст</button></div>' +
    '<div class="muted" style="margin:10px 0 4px">Название или адрес</div><input type="text" id="apName"><div class="muted" style="margin:10px 0 4px">Ссылка</div><input type="text" id="apUrl">' +
    '<div class="muted" style="margin:10px 0 4px">Цена, ₽</div><input type="number" inputmode="numeric" id="apPrice"><div class="muted" style="margin:10px 0 4px">Площадь, м²</div><input type="text" inputmode="decimal" id="apArea">' +
    '<div class="muted" style="margin:10px 0 4px">Комнат</div><input type="text" id="apRooms"><div class="muted" style="margin:10px 0 4px">Этаж</div><input type="text" id="apFloor"><div class="muted" style="margin:10px 0 4px">Заметка</div><input type="text" id="apNote"><div class="addrow"><button class="btn" data-act="aptAdd">Добавить</button></div></div>';
  const list = [...S.apts].sort((a, b) => { const pa = a.price && a.area ? a.price / a.area : 1e12, pb = b.price && b.area ? b.price / b.area : 1e12; return pa - pb; });
  list.forEach((a) => {
    const okUrl = /^https?:\/\//i.test(a.url || '');
    h += '<div class="card"><h2>' + esc(a.name || 'Без названия') + '</h2>' +
      (a.price ? '<div class="kv"><span>Цена</span><span>' + rub(a.price) + '</span></div><div class="kv"><span>Взнос 20%</span><span>' + rub(Math.round(a.price * 0.2)) + '</span></div>' : '') +
      (a.area ? '<div class="kv"><span>Площадь</span><span>' + a.area + ' м²</span></div>' : '') + (a.price && a.area ? '<div class="kv"><span>За метр</span><span>' + rub(Math.round(a.price / a.area)) + '</span></div>' : '') +
      (a.rooms ? '<div class="kv"><span>Комнат</span><span>' + esc(a.rooms) + '</span></div>' : '') + (a.floor ? '<div class="kv"><span>Этаж</span><span>' + esc(a.floor) + '</span></div>' : '') +
      (okUrl ? '<div class="kv"><span>Ссылка</span><span class="r"><a href="' + esc(a.url) + '" target="_blank" rel="noopener">открыть</a></span></div>' : '') + (a.note ? '<div class="note">' + esc(a.note) + '</div>' : '') +
      '<div class="phs">' + (a.ph || []).map((id) => '<img data-ph="' + id + '" data-v="' + a.id + '|' + id + '" data-act="phView" alt="Фото">').join('') + '</div>' +
      '<div class="addrow" style="flex-wrap:wrap"><label class="btn g s" style="cursor:pointer">Добавить фото<input type="file" accept="image/*" multiple data-apt="' + a.id + '" style="display:none"></label><button class="btn g s" data-act="aptGoal" data-v="' + a.id + '">Сделать целью</button><button class="btn g s" data-act="aptDel" data-v="' + a.id + '">Убрать</button></div></div>';
  });
  if (!list.length) h += '<div class="card"><div class="muted">Пока вариантов нет. Добавь первый выше.</div></div>';
  else if (list.filter((a) => a.price && a.area).length > 1) { const b = list.find((a) => a.price && a.area); h += '<div class="card"><div class="muted">Дешевле всего за метр: <b>' + esc(b.name || 'без названия') + '</b>, ' + rub(Math.round(b.price / b.area)) + '.</div></div>'; }
  view.innerHTML = h; hydratePhotos();
}
function hydratePhotos() {
  try { view.querySelectorAll('img[data-ph]').forEach((im) => getPhoto(im.dataset.ph).then((d) => { if (d) im.src = d; })); } catch (e) { /* без фото */ }
}
async function aptPhotos(inp) {
  const a = S.apts.find((x) => x.id === inp.dataset.apt); if (!a || !inp.files) return;
  let n = 0;
  for (const f of [...inp.files].slice(0, 8)) { try { const d = await shrinkImage(f), id = uid(); await putPhoto(id, d); (a.ph = a.ph || []).push(id); n++; } catch (e) { /* пропускаю */ } }
  save(); if (n) toast('Фото сохранены: ' + n); else toast('Фото не сохранилось'); render();
}

/* ---------- Отчёт для Claude, календарь, обои ---------- */
function claudeReport(q) {
  const today = todayStr(), L = ['Мой ритм: отчёт за 7 дней на ' + shortDate(today), 'Вопрос: ' + (q || '(без вопроса, просто посмотри и подскажи)'), ''];
  if (S.cycle && S.cycle.on) { const cp = cyclePhase(S.cycle, today); if (cp) L.push('Цикл: день ' + cp.day + ', ' + (PH[cp.phase] || cp.phase), ''); }
  for (let i = 6; i >= 0; i--) {
    const ds = addDays(today, -i), c = S.ci[ds] || {}, st = dayStats(ds);
    const fl = [...(c.fm || []), ...(c.fe || [])].map(feelName).join(', '), en = (c.ee || []).map(feelName).join(', ');
    L.push('- ' + shortDate(ds) + ': легла ' + (S.sleep[ds] || '—') + '; вода ' + (S.water[ds] || 0) + '; дел ' + st.done + ' из ' + st.total + (en ? '; самочувствие: ' + en : '') + (fl ? '; чувства: ' + fl : ''));
  }
  L.push('', 'Дней без вейпа подряд: ' + smStreak());
  const pr = (S.projects || []).filter((p) => !p.arch && !p.park).map((p) => p.name).filter(Boolean);
  if (pr.length) L.push('Проекты в работе: ' + pr.join(', '));
  L.push('', 'Отвечай по-человечески, без давления и без советов про горячие линии и психотерапевтов.');
  return L.join('\n');
}
async function shareFile(name, type, data) {
  const blob = data instanceof Blob ? data : new Blob([data], { type }), file = new File([blob], name, { type });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return true; } } catch (e) { if (e && e.name === 'AbortError') return true; }
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); return true; } catch (e) { return false; }
}
function icsExport() {
  const today = todayStr(), ev = [];
  for (let i = 0; i < 14; i++) { const ds = addDays(today, i); dayList(ds).filter((b) => !b.optional).forEach((b) => ev.push({ uid: ds + '-' + b.id, ds, t: b.t, dur: b.dur || 15, title: b.title, alarm: !!b.remind })); }
  shareFile('moy-ritm-calendar.ics', 'text/calendar', icsFromEvents(ev)).then((ok) => toast(ok ? 'Календарь готов: открой файл и добавь все события' : 'Не получилось'));
}
function wallExport() {
  const ds = todayStr(), n = nowMin(), d = S.done[ds] || {}, st = dayStats(ds);
  const items = dayList(ds).filter((b) => !b.optional && !d[b.id] && b.t >= n - 20).slice(0, 5).map((b) => ({ time: fmt(b.t), title: b.title }));
  const cv = document.createElement('canvas');
  drawWallpaper(cv, { dateLabel: longDate(ds), items, water: S.water[ds] || 0, waterGoal: 8, done: st.done, total: st.total, line: (pick(TIPS, 'wall' + ds) || {}).t || '' });
  cv.toBlob((b) => { if (!b) return toast('Не получилось'); shareFile('moy-ritm-obi.png', 'image/png', b).then(() => toast('Сохрани в «Фото» и поставь на экран блокировки')); }, 'image/png');
}

/* ---------- Мини-экран ---------- */
function miniRest(ds) {
  const list = dayList(ds).filter((b) => !b.optional), d = S.done[ds] || {}, n = nowMin();
  let ni = -1; list.forEach((b, i) => { if (b.t <= n) ni = i; });
  return list.filter((b, i) => i >= Math.max(ni, 0) && !d[b.id]);
}
function renderMini() {
  tabsEl.style.display = 'none'; if (document.body && document.body.dataset) document.body.dataset.v = 'today';
  const ds = todayStr(), rest = miniRest(ds), st = dayStats(ds), wc = S.water[ds] || 0;
  let h = '<div class="mini"><div class="muted">' + esc(longDate(ds)) + '</div>';
  if (rest[0]) h += '<div class="card miniNow"><div class="tagc">Сейчас</div><div class="mt">' + fmt(rest[0].t) + '</div><h2>' + esc(rest[0].title) + '</h2><div class="addrow"><button class="btn" data-act="miniDone">Готово</button></div></div>' + rest.slice(1, 4).map((b) => '<div class="kv"><span>' + fmt(b.t) + '</span><span class="r">' + esc(b.title) + '</span></div>').join('');
  else h += '<div class="card"><h2>На сегодня всё</h2><div class="muted">Можно отдыхать.</div></div>';
  h += '<div class="card row"><div class="grow"><b>Вода: ' + wc + ' из 8</b><div class="muted">Дел: ' + st.done + ' из ' + st.total + '</div></div><button class="btn s" data-act="miniWater">+1 стакан</button></div><a class="muted" href="./">Открыть приложение полностью</a></div>';
  view.innerHTML = h;
}

/* ---------- Блокировка ---------- */
const lockEl = document.getElementById('lock');
let hiddenAt = 0, lkBuf = '', lkFail = 0;
function lockHide() { lockEl.classList.remove('show'); lkBuf = ''; }
function lockDraw(msg) {
  const c = lockCfg(); if (!c) return lockHide();
  const dots = [0, 1, 2, 3].map((i) => '<i class="' + (i < lkBuf.length ? 'f' : '') + '"></i>').join('');
  lockEl.innerHTML = '<div class="lk"><h2>Мой ритм</h2><div class="muted">' + esc(msg || 'Введи PIN') + '</div><div class="dots">' + dots + '</div><div class="pad">' +
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => '<button data-lk="' + k + '">' + k + '</button>').join('') +
    (c.cred && bioSupported() ? '<button data-lk="bio" class="g" aria-label="Face ID">Face ID</button>' : '<span></span>') + '<button data-lk="0">0</button><button data-lk="del" class="g" aria-label="Стереть">⌫</button></div>' +
    (lkFail >= 5 ? '<div class="muted" style="margin-top:12px;font-size:12px">Забыла PIN? Настройки iPhone → Safari → Дополнения → Данные сайтов → удали этот сайт. Записи на телефоне сотрутся, поэтому копию лучше делать заранее.</div>' : '') + '</div>';
  lockEl.classList.add('show');
}
lockEl.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-lk]'); if (!b) return;
  const k = b.dataset.lk;
  if (k === 'bio') { try { if (await bioCheck()) { lockHide(); return; } lockDraw('Не получилось, введи PIN'); } catch (e2) { lockDraw('Face ID недоступен, введи PIN'); } return; }
  if (k === 'del') lkBuf = lkBuf.slice(0, -1); else if (lkBuf.length < 4) lkBuf += k;
  if (lkBuf.length === 4) {
    if (await checkPin(lkBuf)) { lkFail = 0; lockHide(); return; }
    lkFail++; lkBuf = ''; lockDraw('Не тот PIN'); return;
  }
  lockDraw();
});
/* ---------- Сроки годности: отправка списка в репозиторий ---------- */
let frT = null;
function fridgeSync(now) {
  const g = ghCfg(); if (!g.token) return;
  clearTimeout(frT);
  frT = setTimeout(() => pushFridge(S.fridge).then((r) => { ghSave({ last: (r.ok ? 'Отправлено ' : 'Не отправлено: ') + (r.ok ? new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : r.msg) }); if (!r.ok) toast(r.msg); else if (now) toast('Отправлено'); }), now ? 0 : 1500);
}
function setBadge() {
  try {
    const today = todayStr(), n = S.fridge.filter((x) => { const d = fridgeDays(x, today); return d !== null && d <= 1; }).length;
    if (navigator.setAppBadge) { if (n) navigator.setAppBadge(n); else if (navigator.clearAppBadge) navigator.clearAppBadge(); }
  } catch (e) { /* без значка */ }
}

/* ---------- Спокойствие: упражнения с таймером ---------- */
function calmMenu() {
  openSheet('<h2>Спокойствие и злость</h2><div class="muted" style="margin-bottom:8px">Выбери упражнение. Дыхательных практик здесь нет.</div>' +
    EXERCISES.map((x) => '<div class="kv" style="align-items:flex-start;gap:10px"><span><b>' + esc(x.t) + '</b><br><small class="muted">' + esc(x.why) + ' ' + Math.ceil(exTotal(x) / 60) + ' мин.</small></span><button class="btn s" data-act="calmGo" data-v="' + x.k + '">Начать</button></div>').join('') +
    '<div class="addrow"><button class="btn g" data-act="calmStop">Закрыть</button></div>', { t: 'calmMenu' });
}
function calmStart(k) { calmShow(k, 0); }
function calmNext() { if (sh && sh.t === 'calm') calmShow(sh.k, sh.i + 1); }
function calmShow(k, i) {
  const ex = exById(k);
  clearInterval(shTimer); shTimer = null;
  if (i >= ex.steps.length) {
    const rest = EXERCISES.filter((x) => x.k !== k).slice(0, 3);
    openSheet('<h2>Готово</h2><p class="muted" style="margin-top:0">Как ты сейчас? Если напряжение осталось, попробуй другое упражнение: ' + 'разные приёмы работают на разное.</p>' +
      rest.map((x) => '<div class="kv"><span>' + esc(x.t) + '</span><button class="btn g s" data-act="calmGo" data-v="' + x.k + '">Начать</button></div>').join('') + '<div class="addrow"><button class="btn" data-act="calmStop">Закрыть</button></div>', { t: 'calmDone' });
    return;
  }
  const st = ex.steps[i];
  openSheet('<div class="muted">' + esc(ex.t) + ' · шаг ' + (i + 1) + ' из ' + ex.steps.length + '</div><h2 style="margin:8px 0 10px;line-height:1.35">' + esc(st[0]) + '</h2><div class="crT" id="calmT">' + Math.floor(st[1] / 60) + ':' + pad(st[1] % 60) + '</div>' +
    '<div class="addrow" style="justify-content:center"><button class="btn" data-act="calmNext">Дальше</button><button class="btn g" data-act="calmStop">Закрыть</button></div>', { t: 'calm', k, i });
  const end = Date.now() + st[1] * 1000, t = document.getElementById('calmT');
  shTimer = setInterval(() => {
    const left = Math.max(0, end - Date.now());
    if (t) t.textContent = Math.floor(left / 60000) + ':' + pad(Math.floor((left % 60000) / 1000));
    if (!left) { beep(); haptic(); calmShow(k, i + 1); }
  }, 400);
}
function pmsSheet() {
  openSheet('<h2>Советы при ПМС</h2><div class="muted" style="margin-bottom:8px">Только когда нужно.</div><ul class="ul">' + [
    'Еда: белок и сложные углеводы, орехи, тёмный шоколад, меньше соли и кофе.', 'Тепло: грелка, тёплая ванна, мягкая одежда.', 'Движение: прогулка, растяжка или йога вместо тяжёлой тренировки.',
    'Сон: ложись на 30 минут раньше, свет приглушить.', 'Настроение: важные решения и споры отложи на 2–3 дня.', 'Если боль сильная и мешает жить, запишись к гинекологу.'].map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul><div class="addrow"><button class="btn" data-act="calmStop">Закрыть</button></div>', { t: 'pms' });
}

/* ---------- Сегодня для тебя, холодильник, баннеры ---------- */
function kitCard(ds) {
  const c = S.ci[ds] || {}, cx = ctxFor(ds), feels = [...(c.fe || []), ...(c.fm || [])];
  const items = todayKit(ds, { dress: cx.dress, soft: cx.soft, feels });
  return '<div class="card"><h2>Сегодня для тебя</h2>' + items.map((x) => '<div class="note"><b>' + esc(x.h) + ':</b> ' + esc(x.t) + (x.x ? '. ' + esc(x.x) : '') + '</div>').join('') + '</div>';
}
function fridgeNote() {
  const today = todayStr(), soon = fridgeSorted(S.fridge, today).filter((x) => { const d = fridgeDays(x, today); return d !== null && d <= 2; });
  if (!soon.length) return '';
  return '<div class="card row"><div class="grow"><b>Скоро испортится</b><div class="muted">' + esc(soon.slice(0, 4).map((x) => x.name + ' (' + fridgeSay(fridgeDays(x, today)) + ')').join(', ')) + '</div></div><button class="btn g s" data-act="goFridge">Что приготовить</button></div>';
}
let pushStale = false;
function bannersCard() {
  let h = '';
  const since = S.lastBackup || S.firstSeen || Date.now();
  if (Date.now() - since > 30 * 864e5) h += '<div class="card row"><div class="grow"><b>Пора сохранить копию</b><div class="muted">Прошло больше месяца. Ещё → Скопировать копию, вставь в заметки.</div></div><button class="btn g s" data-act="backup">Копия</button></div>';
  if (pushStale) h += '<div class="card"><b>Уведомления давно не приходили</b><div class="muted" style="margin-top:4px">Проверь вкладку Actions в репозитории, срок токена на GitHub и задачу на cron-job.org. Если ничего не помогает, заново включи напоминания в разделе «Ещё» и обнови секрет PUSH_SUBSCRIPTION.</div></div>';
  return h;
}
async function checkPushStale() {
  try {
    if (!('caches' in window) || !('Notification' in window) || Notification.permission !== 'granted') return;
    const c = await caches.open('moy-meta'), r = await c.match('last-push'), t = r ? Number(await r.text()) : 0;
    const base = t || S.pushOnAt || 0;
    const now = base && Date.now() - base > 30 * 3600e3;
    if (now !== pushStale) { pushStale = now; if (tab === 'today') render(); }
  } catch (e) { /* без проверки */ }
}
function renderFridge() {
  const today = todayStr(), items = fridgeSorted(S.fridge, today);
  let h = '<button class="back" data-act="back">‹ Ещё</button><h1>Холодильник</h1><p class="sub">Что есть дома и до какого срока. Подскажу, что приготовить.</p>';
  h += '<div class="card"><h2>Добавить продукты</h2><input type="text" id="frName" placeholder="Например: молоко, яйца, сыр"><div class="muted" style="margin:10px 0 4px">Срок годности (можно пропустить)</div><input type="date" id="frDate">' +
    '<div class="chips" style="margin-top:8px">' + [['3 дня', 3], ['неделя', 7], ['2 недели', 14], ['месяц', 30]].map((x) => '<button class="chip pick" data-act="frQuick" data-v="' + x[1] + '">' + x[0] + '</button>').join('') + '</div>' +
    '<div class="addrow"><button class="btn" data-act="fridgeAdd">Добавить</button></div></div>';
  if (items.length) {
    h += '<div class="card"><h2>Сейчас в холодильнике</h2>' + items.map((x) => { const d = fridgeDays(x, today); return '<div class="kv"><span>' + esc(x.name) + '<br><small class="muted"' + (d !== null && d <= 1 ? ' style="color:var(--pink-d)"' : '') + '>' + esc(fridgeSay(d)) + '</small></span><button class="btn g s" data-act="fridgeDel" data-v="' + x.id + '">Использовала</button></div>'; }).join('') + '</div>';
    const rm = recipeMatches(items, today);
    h += '<div class="card"><h2>Что приготовить</h2>' + (rm.length ? rm.map((m) => '<details class="calm"><summary>' + esc(m.r.t) + ' · ' + esc(m.r.time) + (m.urgent ? ' · спасает продукты' : '') + '</summary><div class="note">' + esc(m.r.x) + '</div></details>').join('') : '<div class="muted">Пока подходящих рецептов нет. Добавь основные продукты: яйца, молоко, мясо, крупы, овощи.</div>') + '</div>';
  } else h += '<div class="card"><div class="muted">Пока пусто. Добавь продукты, и я подберу рецепты и слежу за сроками.</div></div>';
  h += '<div class="card"><h2>Чем заменить</h2><input type="text" id="subIn" placeholder="Например: сливки, яйцо, сметана"><div class="addrow"><button class="btn g s" data-act="subGo">Найти замену</button></div><div id="subOut"></div></div>';
  { const g = ghCfg();
    h += '<div class="card"><h2>Уведомления о сроках</h2><div class="muted" style="margin-bottom:8px">' + (g.token ? 'Подключено. Список продуктов (названия и сроки) отправляется в твой репозиторий в файл fridge.json, и в 9:00 приходит напоминание.' : 'Чтобы напоминания приходили на экран, список продуктов нужно отправлять в твой репозиторий: рассылка работает не на телефоне. Нужен токен GitHub, подробности в инструкции.') + (g.last ? '<br><b>' + esc(g.last) + '</b>' : '') + '</div>' +
      '<details><summary class="muted">' + (g.token ? 'Изменить доступ' : 'Подключить') + '</summary><div class="muted" style="margin:10px 0 4px">Репозиторий (владелец/название)</div><input type="text" id="ghRepo" value="' + esc(g.repo || guessRepo()) + '"><div class="muted" style="margin:10px 0 4px">Токен</div><input type="password" id="ghTok" placeholder="' + (g.token ? 'уже сохранён' : 'github_pat_…') + '" autocomplete="off"><div class="addrow"><button class="btn s" data-act="ghSave">Сохранить</button>' + (g.token ? '<button class="btn g s" data-act="ghSend">Отправить сейчас</button><button class="btn g s" data-act="ghOff">Отключить</button>' : '') + '</div></details></div>'; }
  view.innerHTML = h;
}
function intiSheet() {
  const Q = ['нежно', 'страстно', 'ярко', 'спокойно', 'близко', 'приятно', 'хотелось большего', 'не хватило близости', 'не было желания', 'устала', 'быстро', 'неловко'];
  openSheet('<h2>Близость: запись</h2><div class="muted" style="margin-bottom:8px">Только для тебя, хранится на телефоне. Выбери, что подходит.</div><div class="muted" style="margin:6px 0 4px">Дата</div><input type="date" id="intiDate" value="' + todayStr() + '">' +
    '<div class="chips" style="margin:10px 0">' + Q.map((x) => '<button class="chip pick" data-act="intiTag" data-v="' + esc(x) + '">' + esc(x) + '</button>').join('') + '</div><input type="text" id="intiNote" placeholder="Заметка (необязательно)"><div class="addrow"><button class="btn" data-act="intiGo">Сохранить</button><button class="btn g" data-act="calmStop">Отмена</button></div>', { t: 'inti', q: [] });
}
function intiCard() {
  const today = todayStr(), cut = addDays(today, -30), recent = S.inti.filter((x) => x.ds >= cut).sort((a, b) => (a.ds < b.ds ? 1 : -1));
  const cnt = {}; recent.forEach((x) => x.q.forEach((q) => { cnt[q] = (cnt[q] || 0) + 1; }));
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 3);
  let h = '<div class="card"><h2>Близость</h2><div class="muted" style="margin-bottom:8px">Записи по желанию, видны только тебе.</div>';
  h += '<div class="kv"><span>За 30 дней</span><span>' + recent.length + '</span></div>';
  if (top.length) h += '<div class="kv"><span>Чаще всего</span><span class="r">' + esc(top.map((x) => x[0]).join(', ')) + '</span></div>';
  if (recent[0]) h += '<div class="kv"><span>Последняя запись</span><span>' + esc(shortDate(recent[0].ds)) + ' <button class="btn g s" data-act="intiDel" data-v="' + recent[0].id + '">Убрать</button></span></div>';
  h += '<div class="addrow"><button class="btn s" data-act="intiOpen">Записать</button></div></div>';
  return h;
}
function cycleInsights() {
  const c = S.cycle, by = {};
  Object.entries(c.sym || {}).forEach(([ds, arr]) => { const cp = cyclePhase(c, ds); if (!cp) return; (arr || []).forEach((k) => { if (k === 'none') return; by[cp.phase] = by[cp.phase] || {}; by[cp.phase][k] = (by[cp.phase][k] || 0) + 1; }); });
  const rows = Object.entries(by).map(([ph, o]) => { const top = Object.entries(o).filter((x) => x[1] >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3); return top.length ? [ph, top.map((x) => (SYM.find((y) => y.k === x[0]) || {}).t || x[0])] : null; }).filter(Boolean);
  let h = '<div class="card"><h2>Что я заметила по твоим записям</h2>';
  if (!rows.length) return h + '<div class="muted">Отмечай, что чувствуешь. После пары циклов здесь появятся закономерности и выводы для расписания.</div></div>';
  h += rows.map(([ph, t]) => '<div class="kv"><span>' + esc(PH[ph]) + '</span><span class="r">' + esc(t.join(', ')) + '</span></div>').join('');
  const adv = [];
  if (by.pms && (by.pms.sweet || 0) >= 2) adv.push('Перед месячными тянет к сладкому: в такие дни в расписании стоит сытный перекус в 15:30.');
  if (by.pms && ((by.pms.mood || 0) >= 2 || (by.pms.weak || 0) >= 2)) adv.push('В предменструальные дни планируй меньше проектов и больше отдыха: расписание уже смягчается.');
  if (by.period && ((by.period.pain || 0) >= 2 || (by.period.back || 0) >= 2)) adv.push('В первые дни месячных боль повторяется: держи грелку и тёплый душ в плане вечера.');
  return h + adv.map((x) => '<div class="note">' + esc(x) + '</div>').join('') + '</div>';
}
function exportCsv() {
  const keys = new Set([...Object.keys(S.done), ...Object.keys(S.water), ...Object.keys(S.sleep), ...Object.keys(S.ci)]);
  const rows = [['Дата', 'Легла', 'Выполнено дел', 'Стаканов воды', 'Силы утром', 'Настроение вечером', 'Утро: самочувствие', 'Вечер: чувства']];
  const tg = (a) => (a || []).map(feelName).join(', ');
  [...keys].sort().forEach((ds) => { const c = S.ci[ds] || {}, d = S.done[ds] || {}; rows.push([ds, S.sleep[ds] || '', Object.values(d).filter(Boolean).length, S.water[ds] || 0, c.e || '', c.m || '', tg(c.ee) + (c.fm && c.fm.length ? '; ' + tg(c.fm) : ''), tg(c.fe)]); });
  const csv = '﻿' + rows.map((r) => r.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(';')).join('\n');
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'moy-ritm.csv'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { /* без скачивания */ }
  copy(csv);
}
/* ---------- Цвет по настроению ---------- */
const MOOD = { pos: [48, 95, 88], calm: [150, 55, 88], tired: [250, 30, 86], anx: [200, 70, 88], sad: [215, 55, 88], ang: [10, 80, 90] };
const MOOD_OF = { joy: 'pos', grat: 'pos', proud: 'pos', inspired: 'pos', sure: 'pos', free: 'pos', tender: 'pos', cozy: 'pos', int: 'pos', drive: 'pos', focus: 'pos', wait: 'pos', full: 'pos', bodr: 'pos', light: 'pos', calm: 'calm', tir: 'tired', sleepy: 'tired', heavy: 'tired', none: 'tired', nosleep: 'tired', overw: 'tired', anx: 'anx', nerv: 'anx', tense2: 'anx', wired: 'anx', lost: 'anx', sad: 'sad', long: 'sad', empty: 'sad', lone: 'sad', indiff: 'sad', ang: 'ang', irr: 'ang', resent: 'ang' };
function applyMood() {
  try {
    const c = S.ci[todayStr()] || {}, keys = [...(c.fe || []), ...(c.fm || []), ...(c.ee || [])];
    const k = keys.map((x) => MOOD_OF[x]).find(Boolean);
    const dark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    if (!k) { document.body.style.removeProperty('--mood'); return; }
    const [h, sat, l] = MOOD[k];
    document.body.style.setProperty('--mood', 'hsl(' + h + ' ' + sat + '% ' + (dark ? 26 : l) + '%)');
  } catch (e) { /* без цвета */ }
}

/* ---------- Экран «Сегодня» ---------- */
function ring(pct) {
  const r = 27, c = 2 * Math.PI * r;
  return '<div class="ring"><svg viewBox="0 0 64 64"><circle class="bg" cx="32" cy="32" r="' + r + '" fill="none" stroke-width="7"/><circle class="fg" cx="32" cy="32" r="' + r + '" fill="none" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - pct / 100)).toFixed(1) + '"/></svg><i>' + pct + '%</i></div>';
}

function renderToday() {
  const ds = sel, today = todayStr();
  const dow = dayOfWeek(ds), w = weekNumber(ds, cfg.start);
  const list = dayList(ds), d = S.done[ds] || {};
  const st = dayStats(ds);
  const B = bedtime(w, dow, cfg);
  const toStart = daysToStart(today, cfg.start);
  const hr = new Date().getHours();
  const greet = hr < 5 ? 'Доброй ночи' : hr < 12 ? 'Доброе утро' : hr < 18 ? 'Добрый день' : 'Добрый вечер';
  const mon = mondayOf(ds);

  let nowIdx = -1;
  if (ds === today) { const n = nowMin(); list.forEach((b, i) => { if (b.t <= n) nowIdx = i; }); if (nowIdx >= 0 && list[nowIdx].id === 'bed' && n < list[nowIdx].t) nowIdx = -1; }

  let h = '<h1>' + (ds === today ? greet : esc(longDate(ds))) + '</h1>';
  h += '<p class="sub">' + (ds === today ? esc(longDate(ds)) + ' · ' : '') + (toStart > 0 ? 'старт плана через ' + toStart + ' дн. (' + esc(shortDate(cfg.start)) + ')' : 'неделя ' + w + ' из 12: ' + esc(PLAN[w - 1].t)) + '</p>';

  h += '<div class="strip">';
  for (let i = 0; i < 7; i++) {
    const x = addDays(mon, i);
    h += '<button class="day' + (x === ds ? ' on' : '') + (x === today ? ' today' : '') + '" data-act="day" data-v="' + x + '"><b>' + DOW[i] + '</b><span>' + Number(x.slice(8)) + '</span></button>';
  }
  h += '</div>';
  { const cp = cyclePhase(S.cycle, ds); if (cp) { const off = S.cycle.off[ds]; h += '<div class="card"><div class="tagc">Цикл · день ' + cp.day + '</div>' + (cp.phase === 'pms' ? '<h2 style="margin:4px 0 6px">Мягкий режим</h2><div class="muted">Нагрузок меньше, вечер спокойнее.</div><div class="addrow"><button class="btn g s" data-act="pmsTips">Советы при ПМС</button></div>' : '<h2 style="margin:4px 0 6px">' + esc(PH[cp.phase]) + '</h2><div class="muted">' + esc(PH_SAY[cp.phase]) + '</div>') + (cp.soft ? '<div class="note">' + (off ? 'Сегодня обычный режим.' : 'Расписание на сегодня смягчено: проектов меньше, добавлены тепло и сытный перекус.') + '</div><div class="addrow"><button class="btn g s" data-act="cyOff" data-v="' + ds + '">' + (off ? 'Вернуть мягкий режим' : 'Обычный режим сегодня') + '</button></div>' : '') + '</div>'; } }

  h += '<div class="addrow" style="margin:0 0 14px;flex-wrap:wrap"><button class="btn" data-act="calmGo" data-v="' + ANX_BEST + '">Мне тревожно</button><button class="btn g" data-act="calmMenu">Спокойствие и злость</button></div>';
  h += '<div class="seg"><button data-act="mode" data-v="0" class="' + (!S.minMode[ds] ? 'on' : '') + '">Обычный день</button><button data-act="mode" data-v="1" class="' + (S.minMode[ds] ? 'on' : '') + '">День без сил</button></div>';

  h += '<div class="card row">' + ring(st.pct) + '<div class="grow"><h2 style="margin:0">Сделано ' + st.done + ' из ' + st.total + '</h2><div class="muted">Отбой сегодня в ' + fmt(B) + (S.minMode[ds] ? ' · показано только главное' : '') + '</div></div></div>';

  if (ds === today) h += bannersCard() + mentorMini(ds) + kitCard(ds) + dayPicks(ds) + fridgeNote();

  if (ds <= today && !S.sleep[ds]) {
    h += '<div class="card"><h2>Во сколько легла вчера?</h2><div class="addrow"><input type="time" id="sleepIn" value="' + fmt(B > 1440 ? B - 1440 : B) + '"><button class="btn s" data-act="sleep">Записать</button></div></div>';
  } else if (S.sleep[ds]) {
    h += '<div class="card row"><div class="grow"><b>Вчера легла в ' + esc(S.sleep[ds]) + '</b><div class="muted">Записано. Это помогает двигать отбой мягко.</div></div></div>';
  }

  const wc = S.water[ds] || 0;
  h += '<div class="card"><div class="row" style="margin-bottom:10px"><h2 style="margin:0" class="grow">Вода</h2><span class="muted">' + wc + ' из 8 стаканов</span></div><div class="water">';
  for (let i = 1; i <= 8; i++) h += '<button class="drop' + (i <= wc ? ' on' : '') + '" data-act="water" data-v="' + i + '" aria-label="Стакан ' + i + '">' + icon('drop') + '</button>';
  h += '</div></div>';

  list.forEach((b, i) => {
    const isDone = !!d[b.id];
    const past = ds < today || (ds === today && nowMin() > b.t + Math.max(b.dur, 15) && i !== nowIdx);
    const sess = isSess(b), asg = sess ? (S.pa[ds] || {})[b.id] : null, pr = asg && projById(asg.pid);
    const title = pr ? pr.name + ' · ' + b.title.replace('Проект: ', '') : b.title;
    const act = sess ? 'sess' : b.id === 'save' ? 'saveSheet' : 'open';
    const extra = sess ? (pr ? (asg.task ? '<div class="task">' + esc(asg.task) + '</div>' : '') : '<div class="task pick">Выбрать проект и задачу</div>') : '';
    h += '<div class="blk c-' + b.cat + (isDone ? ' done' : '') + (i === nowIdx ? ' now' : '') + (past ? ' past' : '') + '" data-act="' + act + '" data-v="' + b.id + '">' +
      '<div class="tm">' + fmt(b.t) + (b.dur ? '<small>' + fmt(b.t + b.dur) + '</small>' : '') + '</div>' +
      '<div class="grow">' + (i === nowIdx ? '<div class="nowtag">сейчас</div>' : '') +
      '<div class="ttl">' + esc(title) + (b.optional ? '<span class="tag">по желанию</span>' : '') + '</div>' + extra +
      (b.hint && !sess ? '<div class="hint">' + esc(b.hint) + '</div>' : '') + '</div>' +
      '<button class="chk" data-act="done" data-v="' + b.id + '" aria-label="Отметить">' + icon('check') + '</button></div>';
  });

  view.innerHTML = h;
  if (ds === today && firstScroll) {
    firstScroll = false;
    const el = view.querySelector('.blk.now');
    if (el) setTimeout(() => el.scrollIntoView({ block: 'center' }), 60);
  }
}

/* ---------- Экран «Проекты» ---------- */
function renderProj() {
  const act = activeProjects(), arch = S.projects.filter((p) => p.arch), parked = S.projects.filter((p) => p.park && !p.arch), mon = mondayOf(todayStr());
  let h = '<h1>Проекты</h1><p class="sub">Вечерние подходы: пн, ср и суббота. Один проект и одна задача за подход.</p>';
  if (!S.seedP) h += '<div class="card"><h2>Мои проекты из анкеты</h2><div class="muted">Рюкзак из кожи, приложение для растений, список требований к квартире. Клетка для крыс и баночки для лекарств уйдут в парковку до своего времени.</div><div class="addrow"><button class="btn" data-act="seedProj">Добавить</button></div></div>';
  if (!act.length) h += '<div class="card"><h2>Добавь свои проекты</h2><div class="muted">Названия видишь только ты, они хранятся на телефоне. Потом в проектный вечер выберешь, чем займёшься.</div></div>';
  if (act.length > MAX_ACTIVE) h += '<div class="card"><div class="note">Активных проектов ' + act.length + '. Лучше держать 2–3, остальные убрать в парковку: так проще доводить до конца.</div></div>';
  act.forEach((p) => {
    const all = projStats(p.id), wk = projStats(p.id, mon, addDays(mon, 6)), pl = planOf(p), pc = Math.min(100, Math.round((all.n / pl) * 100));
    h += '<div class="card pj"><div class="row"><div class="grow"><h2 style="margin:0">' + esc(p.name) + '</h2>' + (p.goal ? '<div class="muted">Цель: ' + esc(p.goal) + '</div>' : '') + '</div><button class="btn g s" data-act="pjEdit" data-v="' + p.id + '">Изменить</button></div>' +
      (p.step ? '<div class="note">Следующий шаг: ' + esc(p.step) + '</div>' : '') + (p.note ? '<div class="note">Где остановилась: ' + esc(p.note) + '</div>' : '') +
      '<div class="kv"><span>На этой неделе</span><span>' + wk.n + ' подх. · ' + hours(wk.min) + '</span></div><div class="kv"><span>Всего</span><span>' + all.n + ' подх. · ' + hours(all.min) + '</span></div>' +
      '<div class="kv"><span>Путь к цели</span><span>' + all.n + ' из ' + pl + (p.plan ? '' : ' (примерно)') + '</span></div><div class="pbar"><i style="width:' + pc + '%"></i></div>';
    if (needsCheckpoint(p, all.n)) h += '<div class="note"><b>Ты на середине пути.</b> Это момент, когда интерес часто падает. Что дальше?</div><div class="chips">' + CP_CHOICES.map((x) => '<button class="chip pick" data-act="cp" data-v="' + p.id + '" data-c="' + x.k + '">' + esc(x.t) + '</button>').join('') + '</div>';
    h += '</div>';
  });
  h += '<div class="card"><h2>Новый проект</h2><div class="addrow" style="margin-top:0"><input type="text" id="pjNew" placeholder="Название"><button class="btn s" data-act="pjAdd">Добавить</button></div></div>';
  h += '<div class="card"><h2>Отложенные проекты</h2><div class="muted" style="margin-bottom:8px">Идеи хранятся в твоём планере, здесь только проекты в очереди.</div>' +
    (parked.length ? '<div class="muted" style="margin:12px 0 6px">Отложенные проекты</div>' + parked.map((p) => '<div class="kv"><span>' + esc(p.name) + '</span><button class="btn g s" data-act="unpark" data-v="' + p.id + '">Вернуть</button></div>').join('') : '') + '</div>';
  if (arch.length) h += '<div class="card"><h2>Архив</h2>' + arch.map((p) => '<div class="kv"><span>' + esc(p.name) + '</span><button class="btn g s" data-act="pjEdit" data-v="' + p.id + '">Открыть</button></div>').join('') + '</div>';
  view.innerHTML = h;
}

/* ---------- Отношения: вопрос недели ---------- */
function relCard(mon) {
  const r = S.rel[mon];
  let h = '<div class="card"><h2>Моя неделя в отношениях</h2><div class="muted" style="margin-bottom:8px">Без оценок. Ответы видны только на этом телефоне, цель одна: поддержать тебя.</div>';
  if (r) {
    const ad = relAdvice(r.q1, r.q2, r.q3);
    h += '<div class="kv"><span>Как было</span><span class="r">' + esc((r.q1 || []).map(relName).join(', ') || 'без ответа') + '</span></div>';
    if ((r.q2 || []).length) h += '<div class="kv"><span>Не хватило</span><span class="r">' + esc(r.q2.map(relName).join(', ')) + '</span></div>';
    if (ad.head) h += '<div class="note">' + esc(ad.head) + '</div>';
    ad.tips.forEach((t) => { h += '<div class="note">' + esc(t) + '</div>'; });
    if (ad.self.length) h += '<div class="muted" style="margin:8px 0 4px">Что ты даёшь себе на этой неделе</div>' + ad.self.map((t) => '<div class="note">' + esc(t) + '</div>').join('');
  }
  const last = [0, 1, 2, 3].map((i) => S.rel[addDays(mon, -7 * i)]).filter(Boolean);
  const pat = relPattern(last);
  if (pat.length) h += '<div class="note">За последние недели повторяется: ' + esc(pat.map(relName).join(', ')) + '. Что могло бы поддержать тебя в эти дни?</div>';
  h += '<div class="addrow"><button class="btn s" data-act="relOpen">' + (r ? 'Изменить ответ' : 'Ответить') + '</button></div></div>';
  return h;
}
function relSheet() {
  const mon = mondayOf(todayStr()), r = S.rel[mon] || {};
  const ch = (list, key, cur) => '<div class="chips" style="margin-bottom:6px">' + list.map((x) => '<button class="chip pick' + ((cur || []).includes(x.k) ? ' on' : '') + '" data-act="relTag" data-k="' + key + '" data-v="' + x.k + '">' + esc(x.t) + '</button>').join('') + '</div>';
  openSheet('<h2>Как тебе было на этой неделе в отношениях?</h2><div class="muted" style="margin-bottom:8px">Выбери всё, что подходит.</div>' + ch(REL_Q1, 'q1', r.q1) +
    '<div class="muted" style="margin:12px 0 8px">Чего не хватило?</div>' + ch(REL_Q2, 'q2', r.q2) +
    '<div class="muted" style="margin:12px 0 8px">Что ты можешь дать себе на этой неделе?</div>' + ch(REL_Q3, 'q3', r.q3) +
    '<div class="addrow"><button class="btn" data-act="relGo">Сохранить</button></div>', { t: 'rel', q1: [...(r.q1 || [])], q2: [...(r.q2 || [])], q3: [...(r.q3 || [])] });
}

/* ---------- Экран «Наставник» ---------- */
function renderMentor() {
  const ds = todayStr(), w = weekNumber(ds, cfg.start), tip = dayTip(ds), c = S.ci[ds] || {}, mon = mondayOf(ds), rv = weekReview(mon);
  let h = '<h1>Наставник</h1><p class="sub">Совет дня, отметки и итоги недели</p>';
  h += '<div class="card tipc"><div class="tagc">' + esc(CAT_NAME[tip.tip.c] || '') + ' · ' + esc(tip.why) + '</div><h2 style="margin:4px 0 6px">' + esc(tip.tip.t) + '</h2><div>' + esc(tip.tip.x) + '</div></div>';
  h += '<div class="card"><h2>Сегодня</h2>';
  const tags = (a) => (a || []).map(feelName).join(', ');
  h += (c.e || (c.ee && c.ee.length)) ? '<div class="kv"><span>Силы утром</span><span class="r">' + esc([tags(c.ee), tags(c.fm)].filter(Boolean).join('; ') || c.e + ' из 5') + '</span></div>' + (c.focus ? '<div class="kv"><span>Главное</span><span class="r">' + esc(c.focus) + '</span></div>' : '') : '<div class="muted" style="margin-bottom:8px">Утром отметь силы и выбери одно главное дело.</div>';
  h += (c.m || (c.fe && c.fe.length)) ? '<div class="kv"><span>Вечером</span><span class="r">' + esc(tags(c.fe) || c.m + ' из 5') + '</span></div>' + (c.next ? '<div class="kv"><span>Шаг на завтра</span><span class="r">' + esc(c.next) + '</span></div>' : '') : '';
  const rp = mentorReply({ e: c.e, m: c.m, next: c.next, fe: c.fe && c.fe.length ? c.fe : c.fm, ph: phKey(ds) }); if (rp) h += '<div class="note">' + esc(rp) + '</div>';
  h += '<div class="addrow" style="flex-wrap:wrap"><button class="btn s" data-act="ci" data-v="m">' + (c.e ? 'Изменить утро' : 'Утренняя отметка') + '</button><button class="btn s g" data-act="ci" data-v="e">' + (c.m ? 'Изменить итог' : 'Итог дня') + '</button></div></div>';
  h += '<div class="card"><h2>Фокус недели ' + w + ': ' + esc(PLAN[w - 1].t) + '</h2><ul class="ul">' + PLAN[w - 1].add.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul><div class="addrow"><button class="btn g s" data-act="goPlan">Весь план на 12 недель</button></div></div>';
  h += '<div class="card"><h2>Эта неделя</h2>';
  h += [['Выполнено в среднем', rv.pct === null ? 'нет данных' : rv.pct + '%'], ['Отбой относительно плана', rv.sleepAvg === null ? 'нет данных' : (rv.sleepAvg > 0 ? '+' : '') + rv.sleepAvg + ' мин'], ['Дней с водой 6+ стаканов', rv.waterDays], ['Проектных подходов', rv.sessions.reduce((a, x) => a + x.n, 0)]].concat(S.sm.on ? [['Раз с вейпом за неделю', rv.smoked]] : []).map(([a, b]) => '<div class="kv"><span>' + a + '</span><span>' + b + '</span></div>').join('');
  h += '<div style="margin-top:10px">' + rv.obs.map((x) => '<div class="note">' + esc(x) + '</div>').join('') + '</div></div>';
  if (rv.feels.length) h += '<div class="card"><h2>Что ты чувствовала на этой неделе</h2><div class="chips">' + rv.feels.map((x) => '<span class="chip">' + esc(x.t) + ' · ' + x.n + '</span>').join('') + '</div></div>';
  h += '<div class="card"><h2>Спросить наставника</h2><div class="muted" style="margin-bottom:8px">Без интернета: ищу ответ среди своих советов и упражнений. Если вопрос сложный, нажми «Для Claude»: я соберу твой отчёт за неделю, останется вставить его в чат.</div><textarea id="askIn" rows="2" placeholder="Например: не могу уснуть, или что делать, когда злюсь"></textarea><div class="addrow"><button class="btn s" data-act="askGo">Найти ответ</button><button class="btn g s" data-act="claudeGo">Для Claude</button></div></div>';
  h += '<div class="card"><h2>Спокойствие</h2><div class="muted" style="margin-bottom:8px">Упражнения с таймером по шагам. Дыхательных практик здесь нет.</div>' + EXERCISES.map((x) => '<div class="kv" style="align-items:flex-start;gap:10px"><span><b>' + esc(x.t) + '</b><br><small class="muted">' + esc(x.why) + '</small></span><button class="btn g s" data-act="calmGo" data-v="' + x.k + '">Начать</button></div>').join('') + '</div>';
  h += badgeCard();
  h += relCard(mon) + intiCard() + cycleCard();
  { const hn = healthNext(S.health); h += '<div class="card"><h2>Деньги и здоровье</h2>' + (hn ? '<div class="note">Ближайший шаг по здоровью: «' + esc(hn.s.t) + '» (' + esc(hn.p.name) + ')</div>' : '') + '<div class="addrow" style="flex-wrap:wrap"><button class="btn g s" data-act="goMoney">Деньги</button><button class="btn g s" data-act="goHealth">Здоровье</button></div></div>'; }
  const cis = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(mon, i));
  if (cis.some((x) => S.ci[x])) {
    h += '<div class="card"><h2>Силы и настроение</h2><div class="bars">';
    cis.forEach((x, i) => { const r = S.ci[x] || {}; h += '<div class="b"><i style="height:' + Math.max(4, (r.e || 0) * 14) + 'px"></i><i class="alt" style="height:' + Math.max(4, (r.m || 0) * 14) + 'px"></i><span>' + DOW[i] + '</span></div>'; });
    h += '</div><div class="muted" style="margin-top:6px">Розовый столбик: силы утром, лавандовый: настроение вечером.</div></div>';
  }
  h += '<div class="card"><h2>Если сорвалось</h2><ul class="ul">' + ['Не два дня подряд: пропустила день, завтра делаешь минимум.', 'Возвращайся с того же дня, а не с понедельника.', '«Не моё» значит «не тот способ». Меняем время или формат, цель остаётся.', 'Нет сил: включи «День без сил» на экране «Сегодня».', 'Сорвалась с вейпом: запиши триггер и иди дальше. Один срыв не обнуляет прогресс.'].map((x) => '<li>' + x + '</li>').join('') + '</ul></div>';
  view.innerHTML = h;
}

/* ---------- Экран «Вейп» ---------- */
function smForm() {
  const m = S.sm, q = m.quit || addDays(todayStr(), 56);
  return '<div class="card"><h2>' + (m.on ? 'Настройки' : 'Давай настроим') + '</h2><div class="muted" style="margin-bottom:10px">Цифры нужны только тебе: считаю лимит на день, деньги и прогресс. Всё хранится на телефоне.</div>' +
    '<div class="muted" style="margin:0 0 6px">Сколько раз в день сейчас берёшь вейп</div><input type="number" inputmode="numeric" id="smBase" value="' + m.base + '">' +
    '<div class="muted" style="margin:12px 0 6px">Цена жидкости или картриджа, ₽ (для подсчёта экономии)</div><input type="number" inputmode="numeric" id="smPrice" value="' + (m.price || '') + '" placeholder="Можно пропустить">' +
    '<div class="muted" style="margin:12px 0 6px">На сколько дней хватает одной заправки</div><input type="number" inputmode="numeric" id="smPack" value="' + m.pack + '">' +
    '<div class="muted" style="margin:12px 0 6px">Хочу бросить к дате (лимит снижается плавно до нуля)</div><input type="date" id="smQuit" value="' + q + '">' +
    '<div class="muted" style="margin-top:6px">Очисти дату, если пока хочешь только считать.</div>' +
    '<div class="addrow"><button class="btn" data-act="smSave">Сохранить</button>' + (m.on ? '<button class="btn g" data-act="smCancel">Отмена</button>' : '') + '</div></div>';
}
function smPlanCard() {
  const m = S.sm;
  let h = '<div class="card"><h2>Мой набор замены</h2><div class="muted" style="margin-bottom:8px">Положи в сумку и на рабочий стол, чтобы под рукой было другое дело для рук и рта.</div><div class="chips">' +
    ['мятные таблетки', 'бутылка воды', 'жвачка', 'леденцы', 'чётки или стресс-мяч'].map((x) => '<span class="chip">' + esc(x) + '</span>').join('') + '</div>' +
    '<div class="note">Утром: вода и жвачка сразу после подъёма. После еды: почистить зубы или леденец. В дороге: жвачка и музыка. За проектами: подход 50 минут, пауза 10 минут с водой и леденцом.</div></div>';
  h += '<div class="card"><h2>Вейп и сон</h2><div class="muted" style="margin-bottom:8px">Вечер самое трудное время, поэтому идём мягко, по ступеням.</div>' +
    [['Ступень 1', 'Последний вейп за час до сна. В этот час мятная таблетка, вода, лаванда.'], ['Ступень 2', 'Последний вейп за два часа до сна, вечерний ритуал: ванна или душ, чай, дневник.'], ['Ступень 3', 'Вечер без вейпа, засыпаешь без него. Утром первые 15 минут без вейпа и без телефона.']].map((x) => '<div class="note"><b>' + x[0] + '.</b> ' + esc(x[1]) + '</div>').join('') + '<div class="note">План знаешь только ты и приложение. Двигайся на следующую ступень, когда прошлая получается три вечера подряд.</div></div>';
  if (m.quit && m.from && diffDays(m.from, m.quit) > 0) {
    const weeks = Math.min(12, Math.ceil(diffDays(m.from, m.quit) / 7)), today = todayStr();
    h += '<div class="card"><h2>Мои ступени</h2>';
    for (let i = 0; i < weeks; i++) {
      const st = addDays(m.from, i * 7), cur = today >= st && today < addDays(st, 7);
      h += '<div class="kv"><span>' + (cur ? '<b>' : '') + 'Неделя ' + (i + 1) + ' · с ' + esc(shortDate(st)) + (cur ? '</b>' : '') + '</span><span>до ' + smLimit(st) + ' раз в день</span></div>';
    }
    h += '<div class="kv"><span>День без вейпа</span><span>' + esc(shortDate(m.quit)) + '</span></div><div class="note">Не получилось удержать ступень? Остаёмся на ней ещё несколько дней, назад не откатываемся. Лимит это ориентир, а не экзамен.</div></div>';
  }
  return h;
}
let smEditing = false;
function renderSmoke() {
  const m = S.sm, ds = todayStr();
  let h = '<h1>Вейп</h1><p class="sub">Без давления: считаем, понимаем причины и снижаем шаг за шагом</p>';
  if (!m.on || smEditing) { h += smForm(); view.innerHTML = h; return; }
  const r = smRec(ds) || { n: 0, cr: 0, res: 0 }, lim = smLimit(ds), tot = smTotals(), st = smStreak();
  const over = r.n > lim;
  let numCard = '<div class="card center"><div class="muted">Сегодня раз с вейпом</div><div class="bignum' + (over ? ' over' : '') + '">' + r.n + '<small> из ' + lim + '</small></div>' +
    (m.last ? '<div class="muted">Последний раз: ' + ago(m.last) + ' назад</div>' : '') +
    '<div class="addrow" style="justify-content:center;flex-wrap:wrap"><button class="btn g s" data-act="smPlus">Брала вейп +1</button><button class="btn g s" data-act="smMinus">Отменить +1</button>' + (r.n === 0 && !smRec(ds) ? '<button class="btn g s" data-act="smZero">Сегодня без вейпа</button>' : '') + '</div></div>';
  h += m.showNum ? numCard + '<div class="addrow" style="margin:-4px 0 14px"><button class="btn g s" data-act="smNum">Скрыть цифры</button></div>' : '<div class="card center"><div class="muted">Дней подряд без вейпа</div><div class="bignum">' + st + '</div><div class="muted">Цифры затяжек спрятаны.</div><div class="addrow" style="justify-content:center;flex-wrap:wrap"><button class="btn s" data-act="smZero">Сегодня без вейпа</button><button class="btn g s" data-act="smNum">Показать цифры</button></div></div>';
  h += '<div class="card"><h2>Прогресс</h2>' +
    '<div class="kv"><span>Дней подряд без вейпа</span><span>' + st + '</span></div>' +
    (m.showNum ? '<div class="kv"><span>Раз пропущено по записям</span><span>' + tot.saved + ' раз</span></div>' : '') +
    (m.showNum && m.price > 0 ? '<div class="kv"><span>Сэкономлено</span><span>' + tot.money + ' ₽</span></div>' : '') +
    (m.quit ? '<div class="kv"><span>День без вейпа</span><span>' + esc(shortDate(m.quit)) + '</span></div>' : '') + '</div>';
  if (m.showNum) { h += '<div class="card"><h2>Последние 7 дней</h2><div class="bars">';
  for (let i = 6; i >= 0; i--) { const x = addDays(ds, -i), rr = smRec(x), n = rr ? rr.n : 0; h += '<div class="b"><i style="height:' + Math.max(4, Math.min(90, n * 8)) + 'px' + (rr ? '' : ';opacity:.25') + '"></i><span>' + DOW[dayOfWeek(x) - 1] + '</span></div>'; }
  h += '</div><div class="muted" style="margin-top:6px">Бледный столбик: нет записи.</div></div>'; }
  h += smPlanCard();
  const top = Object.entries(tot.tr).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (top.length) {
    h += '<div class="card"><h2>Твои главные триггеры</h2>' + top.map(([k, v]) => '<div class="kv"><span>' + esc(k) + '</span><span>' + v + '</span></div>').join('') + '<div class="note">' + esc(TRIG_ADV[top[0][0]]) + '</div></div>';
  }
  const t = pick(byTopic('smoke'), ds);
  h += '<div class="card"><h2>' + esc(t.t) + '</h2><div>' + esc(t.x) + '</div></div>';
  h += '<div class="addrow" style="margin-bottom:14px"><button class="btn g s" data-act="smEdit">Изменить настройки</button></div>';
  view.innerHTML = h;
}

/* ---------- Мини-карточки на «Сегодня» ---------- */
function mentorMini(ds) {
  const tip = dayTip(ds), c = S.ci[ds] || {}, hr = new Date().getHours();
  let h = '<div class="card tipc"><div class="tagc">Наставник · ' + esc(tip.why) + '</div><b>' + esc(tip.tip.t) + '</b><div class="muted" style="margin-top:2px">' + esc(tip.tip.x) + '</div>';
  const btns = [];
  if (!c.e && hr < 15) btns.push('<button class="btn s" data-act="ci" data-v="m">Утренняя отметка</button>');
  if (!c.m && hr >= 18) btns.push('<button class="btn s" data-act="ci" data-v="e">Итог дня</button>');
  if (btns.length) h += '<div class="addrow">' + btns.join('') + '</div>';
  h += '</div>';
  if (S.sm.on) {
    const r = smRec(ds) || { n: 0 };
    h += '<div class="card row"><div class="grow"><b>Без вейпа: ' + smStreak() + ' дн. подряд</b><div class="muted">' + (S.sm.showNum ? 'Сегодня ' + r.n + ' из ' + smLimit(ds) : 'Мятная таблетка, вода или прогулка под рукой') + '</div></div><button class="btn g s" data-act="goSmoke">Открыть</button></div>';
  }
  return h;
}

/* ---------- Экран «Неделя» ---------- */
function renderWeek() {
  const today = todayStr(), mon = mondayOf(sel), w = weekNumber(mon, cfg.start);
  let h = '<h1>Неделя ' + w + '</h1><p class="sub">' + esc(shortDate(mon)) + ' – ' + esc(shortDate(addDays(mon, 6))) + ' · ' + esc(PLAN[w - 1].t) + '</p>';
  h += '<div class="card"><h2>Что нового на этой неделе</h2><ul style="margin:0;padding-left:20px">' + PLAN[w - 1].add.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
    '<div class="muted" style="margin-top:8px">Цель отбоя: ' + fmt(bedtime(w, 2, cfg)) + ' в будни, ' + fmt(bedtime(w, 5, cfg)) + ' в пятницу и субботу.</div></div>';

  h += '<div class="card"><h2>Выполнено по дням</h2><div class="bars">';
  for (let i = 0; i < 7; i++) {
    const x = addDays(mon, i), st = dayStats(x);
    h += '<div class="b"><i style="height:' + Math.max(4, st.pct * 0.7) + 'px"></i><span>' + DOW[i] + '</span></div>';
  }
  h += '</div></div>';

  h += '<div class="card"><h2>Во сколько ложилась</h2>';
  let any = false;
  for (let i = 0; i < 7; i++) {
    const x = addDays(mon, i);
    if (S.sleep[x]) { any = true; h += '<div class="kv"><span>' + DOW[i] + ', ' + Number(x.slice(8)) + '</span><span>' + esc(S.sleep[x]) + '</span></div>'; }
  }
  if (!any) h += '<div class="muted">Пока пусто. Утром на экране «Сегодня» запиши, во сколько легла.</div>';
  h += '</div>';

  h += '<div class="card"><h2>Дела месяца</h2>';
  S.tasks.forEach((t) => {
    h += '<div class="item' + (t.done ? ' done' : '') + '"><button class="chk" data-act="task" data-v="' + t.id + '">' + icon('check') + '</button><div class="grow t">' + esc(t.t) + '</div><button class="x" data-act="taskdel" data-v="' + t.id + '" aria-label="Удалить">×</button></div>';
  });
  h += '<div class="addrow"><input type="text" id="taskIn" placeholder="Новое дело"><button class="btn s" data-act="taskadd">Добавить</button></div></div>';

  h += '<div class="card"><h2>Разбор недели</h2><div class="muted" style="margin-bottom:8px">Что получилось, что упростить, 3 главных дела на следующую неделю.</div><textarea data-in="review">' + esc(S.review[mon] || '') + '</textarea></div>';
  view.innerHTML = h;
}

/* ---------- Экран «План» ---------- */
function renderPlan() {
  const w0 = weekNumber(todayStr(), cfg.start), toStart = daysToStart(todayStr(), cfg.start);
  let h = '<button class="back" data-act="back">‹ Ещё</button><h1>План на 12 недель</h1><p class="sub">По одному новому шагу. Старые остаются, новые добавляются.</p><div class="card">';
  PLAN.forEach((p) => {
    const cls = toStart > 0 ? '' : p.w < w0 ? 'past' : p.w === w0 ? 'cur' : '';
    const st = addDays(cfg.start, (p.w - 1) * 7);
    h += '<div class="wk ' + cls + '"><div class="n">' + (cls === 'past' ? icon('check').replace('<svg', '<svg style="width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2.4;stroke-linecap:round"') : p.w) + '</div><div class="grow"><b>' + esc(p.t) + '</b><div class="muted">с ' + esc(shortDate(st)) + ' · отбой ' + fmt(bedtime(p.w, 2, cfg)) + '</div><ul>' + p.add.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div></div>';
  });
  h += '</div><div class="card"><h2>Если сорвалось</h2><ul style="margin:0;padding-left:20px">' +
    ['Не два дня подряд: пропустила день, завтра делаешь минимум.', 'Возвращайся с того же дня, а не с понедельника.', '«Не моё» значит «не тот способ». Меняем время или формат, цель остаётся.', 'Нет сил: включи «День без сил» на экране «Сегодня».', 'Часы проектов не режем, а переносим на субботу.']
      .map((x) => '<li>' + x + '</li>').join('') + '</ul></div>';
  view.innerHTML = h;
}

/* ---------- Экран «Еда» ---------- */
const PREP = [['rice', 'Рис или другой гарнир на 2–3 дня'], ['meat', 'Мясо, курица или котлеты (мясорубка и мультиварка)'], ['pot', 'Запечённая картошка'], ['veg', 'Овощи или салат нарезаны'], ['snack', 'Перекусы: творог, йогурт, фрукты'], ['box', 'Контейнеры на 3 рабочих дня собраны']];
const IDEAS = [
  ['Рис и запечённая курица', 'Духовка 40 минут, рис в мультиварке. Лук и чеснок не нужны.'],
  ['Котлеты через мясорубку', 'Без лука и чеснока. Мультиварка или духовка, потом заморозка порциями.'],
  ['Картошка с мясом', 'Запекать на противне, пока делаешь другие дела.'],
  ['Макароны с тушёным мясом', 'Подливка из томатной пасты и мяса. Мультиварка.'],
  ['Салаты с курицей и овощами', 'Овощи нарезать в воскресенье, заправлять в день еды.'],
  ['Бутерброды и творожные перекусы', 'Хлеб, творожный сыр и второй компонент. Творог и йогурт для перекусов на работе.'],
  ['Выпечка в выходные', 'Для настроения, без обязательств.']
];
function renderFood() {
  const mon = mondayOf(todayStr()), p = S.prep[mon] || {};
  let h = '<button class="back" data-act="back">‹ Ещё</button><h1>Еда</h1><p class="sub">Простые заготовки на неделю по твоим вкусам.</p>';
  h += '<div class="card"><h2>Люблю</h2><div class="chips">' + ['паста', 'пицца', 'суши и роллы', 'бургеры', 'салаты', 'сырники и блины', 'плов', 'пельмени', 'котлеты', 'хинкали', 'сэндвичи', 'выпечка', 'фрукты', 'сыр', 'шоколад', 'мороженое', 'овощи'].map((x) => '<span class="chip">' + x + '</span>').join('') +
    '</div><h2 style="margin-top:14px">Не берём</h2><div class="chips">' + ['лук', 'чеснок', 'кинза', 'острое', 'рыба', 'супы', 'брокколи', 'нут', 'чечевица', 'перловка'].map((x) => '<span class="chip no">' + x + '</span>').join('') + '</div></div>';
  { const wm = weekMenu(mon, cfg.lesson ? cfg.lesson.dow : 4), names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    h += '<div class="card"><h2>Меню ужинов на неделю</h2><div class="muted" style="margin-bottom:8px">Без лука, чеснока, острого, рыбы и супов. Если на ужин мясо, утром придёт напоминание достать его из морозилки. В четверг быстрый ужин перед занятием.</div>' +
      wm.map((d, i) => '<details class="calm"><summary><b>' + names[i] + '</b> · ' + esc(d.t) + (d.meat ? ' · мясо' : '') + ' · ' + d.min + ' мин</summary><div class="note">' + esc(d.x) + '<br><small class="muted">Нужно: ' + esc(d.ing.join('; ')) + '</small></div></details>').join('') +
      '<div class="addrow"><button class="btn s" data-act="menuShop">Добавить продукты в покупки</button></div></div>'; }
  h += '<div class="card"><h2>Заготовки на неделю</h2><div class="muted" style="margin-bottom:6px">Воскресенье, 60–75 минут. Список сбрасывается каждую неделю.</div>';
  PREP.forEach(([id, t]) => { h += '<div class="item' + (p[id] ? ' done' : '') + '"><button class="chk" data-act="prep" data-v="' + id + '">' + icon('check') + '</button><div class="grow t">' + t + '</div></div>'; });
  h += '</div><div class="card"><h2>Идеи</h2>' + IDEAS.map(([a, b]) => '<div class="idea"><b>' + a + '</b><span class="muted">' + b + '</span></div>').join('') + '</div>';
  h += '<div class="card"><h2>Покупки</h2>';
  S.shop.forEach((s) => { h += '<div class="item' + (s.done ? ' done' : '') + '"><button class="chk" data-act="shop" data-v="' + s.id + '">' + icon('check') + '</button><div class="grow t">' + esc(s.t) + '</div><button class="x" data-act="shopdel" data-v="' + s.id + '" aria-label="Удалить">×</button></div>'; });
  if (!S.shop.length) h += '<div class="muted">Список пуст. Закупки в субботу.</div>';
  h += '<div class="addrow"><input type="text" id="shopIn" placeholder="Что купить"><button class="btn s" data-act="shopadd">Добавить</button></div>' +
    (S.shop.some((s) => s.done) ? '<div style="margin-top:10px"><button class="btn g s" data-act="shopclear">Убрать купленное</button></div>' : '') + '</div>';
  view.innerHTML = h;
}

/* ---------- Экран «Ещё» ---------- */
/* ---------- Значки ---------- */
function wornCount() {
  let n = 0; const today = todayStr();
  for (const [mon, dw] of Object.entries(S.look.day)) { const ds = addDays(mon, dw - 1); if (ds <= today && S.done[ds] && (S.done[ds].dress || S.done[ds].dresswear)) n++; }
  return n;
}
function badgeStats() {
  let nights = 0; for (const ds of Object.keys(S.sleep)) { const d = sleepDiff(ds); if (d !== null && d <= 20) nights++; }
  let sessions = 0; for (const ds of Object.keys(S.pa)) for (const id of Object.keys(S.pa[ds])) if (S.done[ds] && S.done[ds][id]) sessions++;
  return {
    nights,
    water: Object.keys(S.water).filter((ds) => S.water[ds] >= 6).length,
    vape: S.sm.on ? smStreak() : 0,
    craves: S.sm.on ? smTotals().res : 0,
    sessions,
    cps: S.projects.filter((p) => p.cp).length,
    saturdays: Object.keys(S.done).filter((ds) => S.done[ds] && S.done[ds].clean).length,
    health: S.health.reduce((a, x) => a + x.steps.filter((q) => q.done).length, 0),
    reviews: Object.keys(S.done).filter((ds) => S.done[ds] && S.done[ds].review).length,
    checkins: Object.keys(S.ci).filter((ds) => S.ci[ds] && (S.ci[ds].e || S.ci[ds].m)).length,
    months: Object.values(S.money.months).filter((v) => v > 0).length,
    dresses: wornCount(),
    looksteps: S.look.steps.filter((q) => q.done).length
  };
}
function checkBadges() {
  const ids = badgeState(badgeStats()).earned.map((x) => x.id);
  if (!S.badgesInit) { S.badges = ids; S.badgesInit = true; save(); return; }
  const fresh = ids.filter((x) => !S.badges.includes(x));
  if (fresh.length) { S.badges = ids; save(); const t = badgeState(badgeStats()).earned.find((x) => x.id === fresh[fresh.length - 1]); if (t) toast('Новый значок: ' + t.title); }
}
function badgeCard() {
  const bs = badgeState(badgeStats());
  let h = '<div class="card"><h2>Значки</h2>';
  h += bs.earned.length ? '<div class="chips">' + bs.earned.map((x) => '<span class="chip pick on">★ ' + esc(x.title) + '</span>').join('') + '</div>' : '<div class="muted">Пока пусто. Первый значок совсем рядом.</div>';
  const nx = bs.next.slice(0, 3);
  if (nx.length) h += '<div class="muted" style="margin:12px 0 4px">Ближайшие</div>' + nx.map((x) => '<div class="kv"><span>' + esc(x.t) + '</span><span>' + x.cur + ' из ' + x.goal + '</span></div>').join('');
  return h + '</div>';
}

/* ---------- Цикл ---------- */
function cycleCard() {
  const cp = cyclePhase(S.cycle, todayStr());
  let h = '<div class="card"><h2>Цикл</h2>';
  if (!cp) h += '<div class="muted">Отметь первый день последних месячных, и расписание станет мягче в трудные дни.</div><div class="addrow"><button class="btn s" data-act="goCycle">Настроить</button></div></div>';
  else h += '<div class="kv"><span>Сейчас</span><span class="r">' + esc(PH[cp.phase]) + ', день ' + cp.day + '</span></div><div class="kv"><span>Следующие месячные</span><span>≈ ' + esc(shortDate(cp.nextStart)) + '</span></div><div class="addrow"><button class="btn g s" data-act="goCycle">Открыть</button></div></div>';
  return h;
}
let cyArm = false;
function renderCycle() {
  const c = S.cycle, ds = todayStr(), cp = cyclePhase(c, ds);
  const lastStart = [...c.starts].sort().slice(-1)[0] || '';
  let h = '<button class="back" data-act="back">‹ Ещё</button><h1>Цикл</h1><p class="sub">Расписание подстраивается под фазы. Данные хранятся только на этом телефоне и не попадают на GitHub.</p>';
  if (cp) {
    h += '<div class="card"><div class="tagc">Сегодня · день ' + cp.day + ' из ' + cp.L + '</div><h2 style="margin:4px 0 6px">' + esc(PH[cp.phase]) + '</h2><div class="muted">' + esc(PH_SAY[cp.phase]) + '</div>' +
      '<div class="kv"><span>Следующие месячные</span><span>≈ ' + esc(shortDate(cp.nextStart)) + '</span></div><div class="kv"><span>Овуляция</span><span>≈ ' + esc(shortDate(addDays(cp.nextStart, -14))) + '</span></div>' +
      '<div class="addrow"><button class="btn s" data-act="cyToday">Месячные начались сегодня</button></div></div>';
    const sy = c.sym[ds] || [];
    h += '<div class="card"><h2>Что чувствуешь сегодня</h2><div class="chips">' + SYM.map((x) => '<button class="chip pick' + (sy.includes(x.k) ? ' on' : '') + '" data-act="cySym" data-v="' + x.k + '">' + esc(x.t) + '</button>').join('') + '</div></div>';
    h += cycleInsights();
    const pe = phaseEnergy(c, S.ci);
    h += '<div class="card"><h2>Твои силы по фазам</h2>' + (pe.n < 8 ? '<div class="muted">Пока мало отметок: нужно хотя бы 8 утренних отметок сил. Через пару циклов здесь будет твоя личная картина.</div>' : pe.rows.map((r) => '<div class="kv"><span>' + esc(PH[r.k]) + '</span><span>' + esc(r.rel) + '</span></div>').join('')) + '</div>';
  }
  h += '<div class="card"><h2>' + (cp ? 'Настройки' : 'Подключить цикл') + '</h2><div class="muted" style="margin:6px 0 4px">Первый день последних месячных</div><input type="date" id="cyStart" value="' + esc(lastStart) + '">' +
    '<div class="muted" style="margin:10px 0 4px">Длина цикла, дней</div><input type="number" inputmode="numeric" id="cyLen" value="' + c.len + '">' +
    '<div class="muted" style="margin:10px 0 4px">Сколько дней идут месячные</div><input type="number" inputmode="numeric" id="cyPer" value="' + c.per + '">' +
    '<div class="addrow"><button class="btn" data-act="cySave">Сохранить</button>' + (c.on ? '<button class="btn g" data-act="cyWipe">' + (cyArm ? 'Точно удалить?' : 'Удалить данные') + '</button>' : '') + '</div></div>';
  h += '<div class="card"><div class="muted">Расчёты приблизительные. Это не метод контрацепции и не замена врачу. Сильная боль, задержка, цикл короче 21 или длиннее 40 дней — повод записаться к гинекологу.</div></div>';
  view.innerHTML = h;
}

/* ---------- Экран «Образ» ---------- */
function renderLook() {
  const L = S.look, ds = todayStr(), mon = mondayOf(ds), cur = L.day[mon] || 0;
  const plan = planMonths(L.items, L.budget);
  let h = '<button class="back" data-act="back">‹ Ещё</button><h1>Образ</h1><p class="sub">Красиво, но спокойно: одно платье в неделю, мягкий уход и бюджет без нервов.</p>';
  h += '<div class="card"><h2>Платье недели</h2><div class="muted" style="margin-bottom:8px">В какой день наденешь платье на этой неделе?</div><div class="chips">' +
    DOW.slice(0, 6).map((x, i) => '<button class="chip pick' + (cur === i + 1 ? ' on' : '') + '" data-act="lookDay" data-v="' + (i + 1) + '">' + x + '</button>').join('') + '</div>';
  if (cur) h += '<div class="note"><b>' + DOW[cur - 1] + ':</b> ' + esc(outfit(mon, addDays(mon, cur - 1))) + '</div><div class="muted">Образ меняется каждую неделю. Утром в этот день блок «Сборы» напомнит про платье.</div>';
  h += '<div class="kv" style="margin-top:8px"><span>Платьев надето</span><span>' + wornCount() + '</span></div></div>';
  h += '<div class="card"><h2>Хочу сделать и купить</h2><div class="muted" style="margin-bottom:8px">Впиши примерную цену, и я разложу всё по месяцам в пределах ' + rub(L.budget) + '. Считать траты не нужно.</div>';
  h += L.items.map((it) => '<div class="kv"><span style="' + (it.done ? 'opacity:.55;text-decoration:line-through' : '') + '">' + esc(it.t) + '</span><span style="display:flex;gap:6px;align-items:center"><input type="number" inputmode="numeric" style="width:92px;padding:6px 10px" data-in="lprice" data-id="' + it.id + '" value="' + (it.price === '' ? '' : it.price) + '" placeholder="₽"><button class="btn g s" data-act="lookDone" data-v="' + it.id + '">' + (it.done ? 'Вернуть' : 'Готово') + '</button><button class="btn g s" data-act="lookDel" data-v="' + it.id + '">×</button></span></div>').join('');
  h += '<div class="addrow"><input type="text" id="lookNew" placeholder="Что ещё хочется"><button class="btn s" data-act="lookAdd">Добавить</button></div></div>';
  h += '<div class="card"><h2>По месяцам</h2>';
  if (!plan.months.length) h += '<div class="muted">Впиши цены напротив пунктов, и здесь появится план.</div>';
  plan.months.slice(0, 4).forEach((mo) => { h += '<div class="kv"><span><b>Месяц ' + mo.n + '</b></span><span>' + rub(mo.sum) + ' из ' + rub(L.budget) + '</span></div>' + mo.items.map((x) => '<div class="muted" style="padding:2px 0 2px 8px">' + esc(x.t) + (x.over ? ' · дороже месячного бюджета, можно копить несколько месяцев' : '') + '</div>').join(''); });
  if (plan.unpriced.length) h += '<div class="note">Без цены пока: ' + esc(plan.unpriced.map((x) => x.t).join(', ')) + '.</div>';
  h += '<details style="margin-top:10px"><summary class="muted">Изменить месячный бюджет</summary><div class="addrow"><input type="number" inputmode="numeric" id="lookBudget" value="' + L.budget + '"><button class="btn s" data-act="lookBudget">Сохранить</button></div></details></div>';
  h += '<div class="card"><h2>Шаги по гардеробу и уходу</h2>' + L.steps.map((st) => '<div class="kv"><span style="' + (st.done ? 'opacity:.55;text-decoration:line-through' : '') + '">' + esc(st.t) + '</span><button class="btn g s" data-act="lookStep" data-v="' + st.id + '">' + (st.done ? 'Вернуть' : 'Готово') + '</button></div>').join('') +
    '<div class="addrow"><input type="text" id="lookStepNew" placeholder="Новый шаг"><button class="btn s" data-act="lookStepAdd">Добавить</button></div></div>';
  h += '<div class="card"><h2>Мои ритуалы</h2><ul class="ul"><li>Суббота: уборка, ванна с маской, уход за руками.</li><li>Каждый день: одно украшение и духи.</li><li>Раз в неделю: платье и один красивый кадр.</li></ul><div class="muted" style="margin-top:8px">Без каблуков каждый день и без давления: только то, что приятно.</div></div>';
  view.innerHTML = h;
}

/* ---------- Экран «Деньги» ---------- */
function renderMoney() {
  const m = S.money, ds = todayStr(), st = moneyStats(m, ds), say = moneySay(st, m);
  const inp = (id, label, v, ph) => '<div class="muted" style="margin:10px 0 4px">' + label + '</div><input type="number" inputmode="numeric" id="' + id + '" value="' + (v || '') + '" placeholder="' + (ph || '') + '">';
  let h = '<button class="back" data-act="back">‹ Ещё</button><h1>Деньги</h1><p class="sub">Две цифры раз в месяц, больше ничего считать не нужно.</p>';
  h += '<div class="card"><h2>Этот месяц</h2><div class="kv"><span>Цель в месяц</span><span>' + rub(m.target) + '</span></div><div class="kv"><span>Пришло</span><span>' + rub(st.cur) + '</span></div><div class="pbar"><i style="width:' + st.pct + '%"></i></div>' + say.map((x) => '<div class="note">' + esc(x) + '</div>').join('') + '</div>';
  if (m.goal > 0) h += '<div class="card"><h2>Копилка на квартиру</h2><div class="kv"><span>Накоплено</span><span>' + rub(m.saved) + '</span></div><div class="kv"><span>Цель</span><span>' + rub(m.goal) + '</span></div><div class="pbar"><i style="width:' + st.savePct + '%"></i></div></div>';
  if (m.goal > 0) { const ap = aptPlan(m, 24); h += '<div class="card"><h2>План по квартире</h2><div class="muted" style="margin-bottom:8px">Цель копилки это первый взнос: обычно около 20% цены, для 4–5 млн это 0,8–1 млн.</div><div class="kv"><span>Осталось накопить</span><span>' + rub(ap.left) + '</span></div>' + (m.monthly > 0 ? '<div class="kv"><span>Откладываю в месяц</span><span>' + rub(m.monthly) + '</span></div>' + (ap.atPace ? '<div class="kv"><span>В таком темпе</span><span>' + ap.atPace + ' мес.</span></div>' : '') : '') + (ap.left > 0 ? '<div class="kv"><span>Чтобы за 24 месяца</span><span>' + rub(ap.need) + ' в месяц</span></div><div class="note">Это арифметика, а не оценка. Двигать можно срок, сумму или источники, например помощь семьи.</div>' : '<div class="note">Цель копилки достигнута.</div>') + '</div>'; }
  { const ap2 = m.apt || { name: '', url: '', price: '' }, okUrl = /^https?:\/\//i.test(ap2.url || '');
    h += '<div class="card"><h2>Моя квартира</h2>' + (ap2.name ? '<div class="kv"><span>Какая</span><span class="r">' + esc(ap2.name) + '</span></div>' : '<div class="muted">Запиши конкретную квартиру, к которой идёшь. Купишь ты в итоге эту или другую, цель перед глазами помогает.</div>') +
      (okUrl ? '<div class="kv"><span>Ссылка</span><span class="r"><a href="' + esc(ap2.url) + '" target="_blank" rel="noopener">открыть</a></span></div>' : '') +
      (Number(ap2.price) > 0 ? '<div class="kv"><span>Цена</span><span>' + rub(Number(ap2.price)) + '</span></div><div class="kv"><span>Взнос 20%</span><span>' + rub(Math.round(Number(ap2.price) * 0.2)) + '</span></div>' : '') +
      '<div class="addrow"><button class="btn g s" data-act="goApts">Мои варианты и фото</button></div><details style="margin-top:10px"><summary class="muted">' + (ap2.name ? 'Изменить' : 'Записать квартиру') + '</summary><div class="muted" style="margin:10px 0 4px">Описание: район, метраж, этаж</div><input type="text" id="aptName" value="' + esc(ap2.name || '') + '"><div class="muted" style="margin:10px 0 4px">Ссылка на объявление</div><input type="text" id="aptUrl" value="' + esc(ap2.url || '') + '"><div class="muted" style="margin:10px 0 4px">Цена, ₽</div><input type="number" inputmode="numeric" id="aptPrice" value="' + (ap2.price || '') + '"><div class="addrow"><button class="btn s" data-act="aptSave">Сохранить</button></div></details></div>';
    h += '<div class="card"><h2>Как приблизиться к цели быстрее</h2><div class="muted" style="margin-bottom:8px">Варианты дополнительного дохода под твои навыки.</div>' + INCOME_IDEAS.map((x) => '<details class="calm"><summary>' + esc(x.t) + '</summary><div class="note">' + esc(x.x) + '</div></details>').join('') + '</div>'; }
  h += '<div class="card"><h2>Внести цифры</h2>' + inp('monCur', 'Сколько пришло в этом месяце, ₽', st.cur, '') + inp('monSaved', 'Сколько накоплено всего, ₽', m.saved, '') +
    '<details style="margin-top:12px"><summary class="muted">Изменить цели</summary>' + inp('monTarget', 'Цель дохода в месяц, ₽', m.target, '500000') + inp('monGoal', 'Цель копилки на квартиру, ₽', m.goal, 'Можно пропустить') + inp('monMonthly', 'Откладываю в месяц, ₽', m.monthly, '5000') + '</details>' +
    '<div class="addrow"><button class="btn" data-act="monSave">Сохранить</button></div></div>';
  if (st.hist.some((x) => x.v)) h += '<div class="card"><h2>Последние месяцы</h2>' + st.hist.filter((x) => x.v).map((x) => '<div class="kv"><span>' + esc(x.k) + '</span><span>' + rub(x.v) + '</span></div>').join('') + '</div>';
  view.innerHTML = h;
}

/* ---------- Экран «Здоровье» ---------- */
function renderHealth() {
  const today = todayStr();
  let h = '<button class="back" data-act="back">‹ Ещё</button><h1>Здоровье</h1><p class="sub">Каждое дело разбито на шаги. Отмечай по одному, срок можно поставить для себя.</p>';
  S.health.forEach((x) => {
    const pr = healthProgress(x), od = healthOverdue(x, today);
    h += '<div class="card"><div class="row"><div class="grow"><h2 style="margin:0">' + esc(x.name) + '</h2><div class="muted">' + pr.d + ' из ' + pr.n + ' шагов</div></div><span class="muted">' + pr.pct + '%</span></div><div class="pbar"><i style="width:' + pr.pct + '%"></i></div>';
    h += x.steps.map((st) => '<div class="kv"><span style="' + (st.done ? 'opacity:.55;text-decoration:line-through' : '') + '">' + esc(st.t) + '</span><button class="btn g s" data-act="hstep" data-v="' + x.id + '" data-s="' + st.id + '">' + (st.done ? 'Вернуть' : 'Готово') + '</button></div>').join('');
    h += '<div class="addrow"><input type="text" id="hs-' + x.id + '" placeholder="Новый шаг"><button class="btn s" data-act="hsadd" data-v="' + x.id + '">Добавить</button></div>';
    h += '<div class="muted" style="margin:10px 0 4px">Срок для себя' + (od ? ' (прошёл, передвинь или сделай один шаг)' : '') + '</div><input type="date" data-in="hdue" data-id="' + x.id + '" value="' + esc(x.due || '') + '"></div>';
  });
  h += '<div class="card"><h2>Новое дело о здоровье</h2><div class="addrow" style="margin-top:0"><input type="text" id="hpNew" placeholder="Например: подобрать очки"><button class="btn s" data-act="hpadd">Добавить</button></div></div>';
  view.innerHTML = h;
}
function isStandalone() { return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches; }
async function pushState() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return { ok: false, text: 'Уведомления недоступны в этом режиме. Добавь приложение на экран «Домой» и открой с иконки.' };
  if (!isStandalone()) return { ok: false, text: 'Сначала добавь приложение на экран «Домой» и открой его с иконки.' };
  const perm = Notification.permission;
  let sub = null;
  try { const reg = await navigator.serviceWorker.ready; sub = await reg.pushManager.getSubscription(); } catch (e) {}
  if (perm === 'denied') return { ok: false, text: 'Уведомления запрещены. Разреши в Настройки iPhone → Уведомления → Мой ритм.' };
  if (perm === 'granted' && sub) return { ok: true, text: 'Включены. Данные подписки готовы к копированию.', sub };
  return { ok: true, text: 'Не включены. Нажми «Включить напоминания».', sub: null };
}
async function renderMore() {
  let h = '<h1>Ещё</h1><p class="sub">Мой ритм · ' + VERSION + '</p><div class="card"><h2>Разделы</h2><div class="addrow" style="flex-wrap:wrap;margin-top:0"><button class="btn g" data-act="goFood">Еда на неделю</button><button class="btn g" data-act="goPlan">План на 12 недель</button><button class="btn g" data-act="goMoney">Деньги</button><button class="btn g" data-act="goHealth">Здоровье</button><button class="btn g" data-act="goCycle">Цикл</button><button class="btn g" data-act="goLook">Образ</button><button class="btn g" data-act="goTaste">Подборки</button><button class="btn g" data-act="goFridge">Холодильник</button><button class="btn g" data-act="goSmoke">Без вейпа</button></div></div><div class="card"><h2>Напоминания</h2><div class="muted" id="pushTxt">Проверяю…</div>' +
    '<div class="addrow" style="flex-wrap:wrap"><button class="btn s" data-act="pushOn">Включить напоминания</button><button class="btn g s" data-act="pushTest">Тест</button></div><div id="pushSub"></div></div>';
  { const lk = lockCfg();
    h += '<div class="card"><h2>Защита</h2><div class="muted" style="margin-bottom:8px">' + (lk ? 'Блокировка включена' + (lk.cred ? ': Face ID или PIN.' : ': PIN.') : 'Можно закрывать приложение PIN-кодом и Face ID. Это защита экрана от любопытных глаз, а не шифрование данных.') + '</div><div class="addrow">' + (lk ? '<button class="btn g s" data-act="lockOffAsk">Выключить</button>' : '<button class="btn s" data-act="lockSetup">Включить блокировку</button>') + '</div></div>';
    h += '<div class="card"><h2>Календарь, обои, мини-экран</h2><div class="muted" style="margin-bottom:8px">Виджетов у приложения нет, поэтому три замены.</div><div class="addrow" style="flex-wrap:wrap;margin-top:0"><button class="btn s" data-act="icsGo">Расписание в календарь</button><button class="btn s" data-act="wallGo">Обои на сегодня</button><button class="btn g s" data-act="miniInfo">Мини-экран</button></div></div>'; }
  h += '<div class="card"><h2>Моё расписание</h2>' +
    [['Старт плана', shortDate(cfg.start)], ['Подъём в будни', cfg.wake], ['Выезд на работу', cfg.leave], ['Работа', cfg.workStart + '–' + cfg.workEnd], ['Обед', cfg.lunch], ['Ужин', cfg.dinner], ['Занятие', 'чт ' + cfg.lesson.time + ', ' + cfg.lesson.minutes + ' мин'], ['Проектные вечера', 'пн, ср и суббота']]
      .map(([a, b]) => '<div class="kv"><span>' + esc(a) + '</span><span>' + esc(b) + '</span></div>').join('') +
    '<div class="muted" style="margin-top:8px">Чтобы изменить время, правится файл config.json в твоём репозитории на GitHub. Приложение и напоминания подхватят его сами.</div></div>';
  h += '<div class="card"><h2>Резервная копия</h2><div class="muted" style="margin-bottom:8px">Отметки, вода, холодильник и списки хранятся только на этом телефоне. Раз в месяц сохраняй копию.</div><div class="addrow" style="flex-wrap:wrap"><button class="btn g s" data-act="backup">Скопировать копию</button><button class="btn g s" data-act="csv">Таблица (CSV)</button><button class="btn g s" data-act="restore">Вставить копию</button></div><textarea id="bk" style="display:none;margin-top:10px" placeholder="Вставь сюда текст копии и нажми «Восстановить»"></textarea><button class="btn s" id="bkGo" data-act="restoreGo" style="display:none;margin-top:8px">Восстановить</button></div>';
  h += '<div class="card"><h2>О программе</h2><div class="muted">Мой ритм ' + VERSION + '. Расписание собрано по твоим ответам. Напоминания мягкие: перерывы, еда, вечерний ритуал.</div></div>';
  view.innerHTML = h;
  const st = await pushState();
  const el = document.getElementById('pushTxt');
  if (el) el.textContent = st.text;
  showSub(st.sub);
}
function showSub(sub) {
  const box = document.getElementById('pushSub');
  if (!box) return;
  if (!sub) { box.innerHTML = ''; return; }
  const json = JSON.stringify(sub);
  box.innerHTML = '<div class="muted" style="margin:12px 0 6px">Данные подписки. Нужны один раз для GitHub (секрет PUSH_SUBSCRIPTION):</div><textarea id="subTxt" readonly>' + esc(json) + '</textarea><button class="btn s" style="margin-top:8px" data-act="copySub">Скопировать данные подписки</button>';
}
const b64 = (s) => { const p = '='.repeat((4 - (s.length % 4)) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map((c) => c.charCodeAt(0))); };
async function pushOn() {
  try {
    if (!isStandalone()) { toast('Сначала добавь на экран «Домой»'); return; }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { toast('Разрешение не получено'); return; }
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID_PUBLIC) });
    S.pushOnAt = Date.now(); save();
    document.getElementById('pushTxt').textContent = 'Включены. Теперь скопируй данные подписки ниже.';
    showSub(sub);
  } catch (e) { toast('Не получилось включить: ' + (e.message || e)); }
}
async function pushTest() {
  try {
    if (Notification.permission !== 'granted') { toast('Сначала включи напоминания'); return; }
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification('Мой ритм', { body: 'Так будут выглядеть мягкие напоминания.', icon: 'icons/icon-192.png', tag: 'test' });
  } catch (e) { toast('Тест не получился'); }
}

/* ---------- Отрисовка и события ---------- */
async function render() {
  checkBadges(); setBadge();
  if (MINI) { renderMini(); return; }
  const cur = ['plan', 'food', 'money', 'health', 'cycle', 'look', 'smoke', 'fridge', 'apts', 'taste'].includes(tab) ? 'more' : tab;
  if (document.body && document.body.dataset) document.body.dataset.v = tab;
  applyMood();
  tabsEl.innerHTML = TABS.map(([k, t]) => '<button class="tab' + (k === cur ? ' on' : '') + '" data-tab="' + k + '" aria-label="' + t + '" title="' + t + '">' + icon(k) + '<span>' + t + '</span></button>').join('');
  if (tab === 'today') renderToday(); else if (tab === 'week') renderWeek(); else if (tab === 'proj') renderProj(); else if (tab === 'mentor') renderMentor(); else if (tab === 'smoke') renderSmoke(); else if (tab === 'fridge') renderFridge(); else if (tab === 'apts') renderApts(); else if (tab === 'taste') renderTaste(); else if (tab === 'plan') renderPlan(); else if (tab === 'food') renderFood(); else if (tab === 'money') renderMoney(); else if (tab === 'health') renderHealth(); else if (tab === 'cycle') renderCycle(); else if (tab === 'look') renderLook(); else await renderMore();
}
setTimeout(checkPushStale, 1500);
tabsEl.addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]'); if (!b) return;
  tab = b.dataset.tab; privOpen = false; window.scrollTo(0, 0); render();
});
view.addEventListener('change', (e) => {
  if (e.target.dataset && e.target.dataset.apt) { aptPhotos(e.target); return; }
  if (e.target.dataset && e.target.dataset.in === 'lprice') { const it = S.look.items.find((y) => y.id === e.target.dataset.id); if (it) { it.price = e.target.value === '' ? '' : Math.max(0, Number(e.target.value) || 0); save(); render(); } } if (e.target.dataset && e.target.dataset.in === 'hdue') { const x = S.health.find((y) => y.id === e.target.dataset.id); if (x) { x.due = e.target.value; save(); } } });
view.addEventListener('input', (e) => {
  const k = e.target.dataset.in;
  if (k === 'diary') { S.diary[sel] = e.target.value; save(); }
  if (k === 'review') { S.review[mondayOf(sel)] = e.target.value; save(); }
  if (k === 'hdue') { const x = S.health.find((y) => y.id === e.target.dataset.id); if (x) { x.due = e.target.value; save(); } }
});
const HAP = new Set(['done', 'water', 'calmNext', 'calmGo', 'fridgeAdd', 'smZero', 'miniWater', 'miniDone', 'taskadd', 'aptAdd', 'ghSave']);
async function onClick(e) {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, v = el.dataset.v;
  if (HAP.has(act)) haptic();
  const val = (id) => { const x = document.getElementById(id); return x ? x.value : ''; };
  const redraw = () => { const y = window.scrollY; const r = render(); Promise.resolve(r).then(() => window.scrollTo(0, y)); };
  switch (act) {
    case 'day': sel = v; firstScroll = v === todayStr(); render(); window.scrollTo(0, 0); break;
    case 'mode': S.minMode[sel] = v === '1'; save(); redraw(); break;
    case 'open': el.classList.toggle('open'); break;
    case 'done': e.stopPropagation(); { const d = (S.done[sel] = S.done[sel] || {}); d[v] = !d[v]; save(); redraw(); } break;
    case 'water': { const c = S.water[sel] || 0; S.water[sel] = Number(v) === c ? c - 1 : Number(v); save(); redraw(); } break;
    case 'sleep': { const t = document.getElementById('sleepIn').value; if (t) { S.sleep[sel] = t; save(); redraw(); toast('Записано'); } } break;
    case 'task': { const t = S.tasks.find((x) => x.id === v); if (t) t.done = !t.done; save(); redraw(); } break;
    case 'taskdel': S.tasks = S.tasks.filter((x) => x.id !== v); save(); redraw(); break;
    case 'taskadd': { const i = document.getElementById('taskIn'); if (i.value.trim()) { S.tasks.push({ id: uid(), t: i.value.trim(), done: false }); save(); redraw(); } } break;
    case 'prep': { const mon = mondayOf(todayStr()); const p = (S.prep[mon] = S.prep[mon] || {}); p[v] = !p[v]; save(); redraw(); } break;
    case 'shop': { const t = S.shop.find((x) => x.id === v); if (t) t.done = !t.done; save(); redraw(); } break;
    case 'shopdel': S.shop = S.shop.filter((x) => x.id !== v); save(); redraw(); break;
    case 'shopadd': { const i = document.getElementById('shopIn'); if (i.value.trim()) { S.shop.push({ id: uid(), t: i.value.trim(), done: false }); save(); redraw(); } } break;
    case 'shopclear': S.shop = S.shop.filter((x) => !x.done); save(); redraw(); break;
    case 'pushOn': pushOn(); break;
    case 'pushTest': pushTest(); break;
    case 'copySub': copy(document.getElementById('subTxt').value); break;
    case 'backup': S.lastBackup = Date.now(); save(); copy(JSON.stringify(S)); break;
    case 'csv': exportCsv(); break;
    case 'restore': document.getElementById('bk').style.display = 'block'; document.getElementById('bkGo').style.display = 'inline-block'; break;
    case 'restoreGo': try { const o = JSON.parse(document.getElementById('bk').value); S = { ...S, ...o }; fixS(); save(); toast('Восстановлено'); render(); } catch (err) { toast('Не получилось прочитать копию'); } break;
    case 'sclose': closeSheet(); break;
    case 'back': tab = 'more'; window.scrollTo(0, 0); render(); break;
    case 'goPlan': closeSheet(); tab = 'plan'; window.scrollTo(0, 0); render(); break;
    case 'goFood': tab = 'food'; window.scrollTo(0, 0); render(); break;
    case 'goProj': closeSheet(); tab = 'proj'; window.scrollTo(0, 0); render(); break;
    case 'goMoney': tab = 'money'; window.scrollTo(0, 0); render(); break;
    case 'privOpen': privOpen = true; redraw(); break;
    case 'privClose': privOpen = false; redraw(); break;
    case 'goLook': tab = 'look'; window.scrollTo(0, 0); render(); break;
    case 'lookDay': { const mon = mondayOf(todayStr()); if (S.look.day[mon] === Number(v)) delete S.look.day[mon]; else S.look.day[mon] = Number(v); save(); redraw(); } break;
    case 'lookDone': { const it = S.look.items.find((y) => y.id === v); if (it) { it.done = !it.done; save(); redraw(); } } break;
    case 'lookDel': S.look.items = S.look.items.filter((y) => y.id !== v); save(); redraw(); break;
    case 'lookAdd': { const t = val('lookNew').trim(); if (t) { S.look.items.push({ id: uid(), t, price: '', done: false }); save(); redraw(); } } break;
    case 'lookBudget': { const b = Number(val('lookBudget')); if (b > 0) { S.look.budget = b; save(); redraw(); toast('Сохранено'); } } break;
    case 'lookStep': { const st = S.look.steps.find((y) => y.id === v); if (st) { st.done = !st.done; save(); redraw(); if (st.done) toast('Шаг сделан. Красиво'); } } break;
    case 'lookStepAdd': { const t = val('lookStepNew').trim(); if (t) { S.look.steps.push({ id: uid(), t, done: false }); save(); redraw(); } } break;
    case 'goCycle': tab = 'cycle'; window.scrollTo(0, 0); render(); break;
    case 'cySave': {
      const st = val('cyStart'); if (!st) { toast('Укажи первый день последних месячных'); break; }
      const c = S.cycle; c.on = true; c.len = Math.min(40, Math.max(21, Number(val('cyLen')) || 28)); c.per = Math.min(10, Math.max(2, Number(val('cyPer')) || 5));
      if (!c.starts.includes(st)) c.starts.push(st); c.starts.sort(); save(); redraw(); toast('Сохранено');
    } break;
    case 'cyToday': { const c = S.cycle, t = todayStr(), last = [...c.starts].sort().slice(-1)[0]; if (!last || diffDays(last, t) > 10) c.starts.push(t); c.starts.sort(); c.on = true; save(); redraw(); toast('Записано. Цикл пересчитан'); } break;
    case 'cyOff': S.cycle.off[v] = !S.cycle.off[v]; save(); redraw(); break;
    case 'cySym': { const d = todayStr(), a = (S.cycle.sym[d] = S.cycle.sym[d] || []), ix = a.indexOf(v); if (ix >= 0) a.splice(ix, 1); else a.push(v); save(); redraw(); } break;
    case 'cyWipe': if (!cyArm) { cyArm = true; setTimeout(() => { cyArm = false; }, 4000); redraw(); } else { cyArm = false; S.cycle = { ...CYCLE0, starts: [], sym: {}, off: {} }; save(); redraw(); toast('Данные цикла удалены'); } break;
    case 'goHealth': tab = 'health'; window.scrollTo(0, 0); render(); break;
    case 'aptSave': { S.money.apt = { name: val('aptName').trim(), url: val('aptUrl').trim(), price: Math.max(0, Number(val('aptPrice')) || 0) }; save(); redraw(); toast('Сохранено'); } break;
    case 'monSave': {
      const num = (id) => Math.max(0, Number(String(val(id)).replace(/\s/g, '').replace(',', '.')) || 0);
      const m = S.money, key = monthKey(todayStr());
      if (val('monTarget') !== '') m.target = num('monTarget') || m.target;
      if (val('monGoal') !== '') m.goal = num('monGoal');
      if (val('monSaved') !== '') m.saved = num('monSaved');
      if (val('monMonthly') !== '') m.monthly = num('monMonthly');
      if (val('monCur') !== '') m.months[key] = num('monCur');
      save(); redraw(); toast('Сохранено');
    } break;
    case 'hstep': { const x = S.health.find((y) => y.id === v), st = x && x.steps.find((q) => q.id === el.dataset.s); if (st) { st.done = !st.done; save(); redraw(); if (st.done) toast('Шаг сделан. Хорошо'); } } break;
    case 'hsadd': { const x = S.health.find((y) => y.id === v), t = val('hs-' + v).trim(); if (x && t) { x.steps.push({ id: uid(), t, done: false }); save(); redraw(); } } break;
    case 'hpadd': { const t = val('hpNew').trim(); if (t) { S.health.push({ id: uid(), name: t, due: '', steps: [] }); save(); redraw(); } } break;
    case 'relOpen': relSheet(); break;
    case 'relTag': { if (!sh || !sh[el.dataset.k]) break; const arr = sh[el.dataset.k], ix = arr.indexOf(v); if (ix >= 0) arr.splice(ix, 1); else arr.push(v); el.classList.toggle('on', ix < 0); } break;
    case 'relGo': { if (!sh) break; S.rel[mondayOf(todayStr())] = { q1: [...sh.q1], q2: [...sh.q2], q3: [...sh.q3], ds: todayStr() }; save(); closeSheet(); redraw(); toast('Записано'); } break;
    case 'planPick': { if (!sh) break; sh.plan = Number(v); sheetBody.querySelectorAll('.chip.pick').forEach((c) => c.classList.toggle('on', c.dataset.v === v)); } break;
    case 'cp': {
      const p = projById(v), c = CP_CHOICES.find((x) => x.k === el.dataset.c); if (!p || !c) break;
      p.cp = { ds: todayStr(), c: c.k }; if (c.k === 'park') p.park = true; save();
      if (c.k === 'change') { projSheet(p.id); } else { openSheet('<h2>' + esc(c.t) + '</h2><p>' + esc(c.say) + '</p><div class="addrow"><button class="btn g" data-act="sclose">Закрыть</button></div>', { t: 'x' }); redraw(); }
    } break;
    case 'unpark': { const p = projById(v); if (p) { p.park = false; save(); redraw(); } } break;
    case 'ideaAdd': { const t = val('ideaIn').trim(); if (t) { S.ideas.push({ id: uid(), t }); save(); redraw(); } } break;
    case 'ideaDel': S.ideas = S.ideas.filter((x) => x.id !== v); save(); redraw(); break;
    case 'ideaProj': { const x = S.ideas.find((y) => y.id === v); if (x) { S.projects.push({ id: uid(), name: x.t, goal: '', step: '', note: '', arch: false }); S.ideas = S.ideas.filter((y) => y.id !== v); save(); redraw(); toast('Идея стала проектом'); } } break;
    // проекты
    case 'sess': sessSheet(v); break;
    case 'saveSheet': saveSheet(); break;
    case 'sessPick': {
      if (!sh) break; sh.pid = v;
      sheetBody.querySelectorAll('.chip.pick').forEach((c) => c.classList.toggle('on', c.dataset.v === v));
      const pr = projById(v), n = document.getElementById('pjNote'), tk = document.getElementById('sessTask');
      if (n) n.innerHTML = pr && pr.note ? '<div class="note">В прошлый раз: ' + esc(pr.note) + '</div>' : '';
      if (tk && !tk.value && pr && pr.step) tk.value = pr.step;
      const st = document.getElementById('saveTxt'); if (st) st.value = (pr && pr.note) || '';
    } break;
    case 'sessSave': if (sh && sh.pid) { const a = (S.pa[sel] = S.pa[sel] || {}); a[sh.id] = { pid: sh.pid, task: val('sessTask').trim() }; save(); closeSheet(); redraw(); } else toast('Выбери проект'); break;
    case 'sessClear': if (sh && S.pa[sel]) { delete S.pa[sel][sh.id]; save(); closeSheet(); redraw(); } break;
    case 'saveGo': if (sh && sh.pid) { const p = projById(sh.pid); if (p) { p.note = val('saveTxt').trim(); p.noteDs = sel; } const d = (S.done[sel] = S.done[sel] || {}); d.save = true; save(); closeSheet(); redraw(); toast('Записано. Теперь можно отпустить проект'); } break;
    case 'seedProj': {
      const mk = (name, goal, step, plan, park) => ({ id: uid(), name, goal, step, note: '', arch: false, plan, park: !!park });
      S.projects.push(mk('Рюкзак из кожи', 'Готовый рюкзак', 'Найти или нарисовать выкройку', 16), mk('Приложение для растений', 'Рабочая версия для себя', 'Записать, что оно должно уметь, в три пункта', 10), mk('Квартира: список требований', 'Список, с которого начнётся поиск', 'Написать 10 пунктов: район, метраж, бюджет, что обязательно', 5), mk('Клетка для крыс', 'Готовая клетка', 'Измерить место и сделать эскиз', 10, true), mk('Баночки для лекарств', 'Набор баночек с подписями', 'Решить, из чего делать', 5, true));
      S.seedP = true; save(); redraw(); toast('Проекты добавлены');
    } break;
    case 'pjAdd': { const n = val('pjNew').trim(); if (n) { S.projects.push({ id: uid(), name: n, goal: '', step: '', note: '', arch: false }); save(); redraw(); } } break;
    case 'pjEdit': projSheet(v); break;
    case 'pjGo': { const n = val('pjName').trim(); if (!n) { toast('Нужно название'); break; } if (sh && sh.id) { const p = projById(sh.id); if (p) { p.name = n; p.goal = val('pjGoal').trim(); p.step = val('pjStep').trim(); p.plan = sh.plan || p.plan || 0; } } save(); closeSheet(); redraw(); } break;
    case 'pjArch': { const p = projById(v); if (p) p.arch = !p.arch; save(); closeSheet(); redraw(); } break;
    // наставник
    case 'ci': ciSheet(v); break;
    case 'pickScale': { const k = el.dataset.k; if (sh) sh[k] = Number(v); sheetBody.querySelectorAll('#' + k + ' button').forEach((b) => b.classList.toggle('on', b.dataset.v === v)); } break;
    case 'ciTag': {
      if (!sh || !sh[el.dataset.k]) break;
      const arr = sh[el.dataset.k], k = v, ix = arr.indexOf(k);
      if (ix >= 0) arr.splice(ix, 1); else arr.push(k);
      el.classList.toggle('on', ix < 0);
    } break;
    case 'ciGo': {
      const ds = todayStr(), c = (S.ci[ds] = S.ci[ds] || {});
      if (v === 'm') { c.ee = [...sh.ee]; c.fm = [...sh.fm]; c.e = energyValue(c.ee) || c.e || 0; c.focus = val('ciFocus').trim(); }
      else { c.fe = [...sh.fe]; c.m = moodValue(c.fe) || c.m || 0; c.good = val('ciGood').trim(); c.hard = val('ciHard').trim(); c.next = val('ciNext').trim(); }
      save();
      const rp = mentorReply(v === 'm' ? { e: c.e, focus: c.focus, fe: c.fm, ph: phKey(ds) } : { m: c.m, next: c.next, fe: c.fe, ph: phKey(ds) });
      openSheet('<h2>Записано</h2>' + (rp ? '<p>' + esc(rp) + '</p>' : '<p class="muted">Спасибо, что отметилась.</p>') + '<div class="addrow">' + (v === 'm' && c.e && c.e <= 2 ? '<button class="btn" data-act="minOn">Включить «День без сил»</button>' : '') + '<button class="btn g" data-act="sclose">Закрыть</button></div>', { t: 'x' });
      render();
    } break;
    case 'minOn': S.minMode[todayStr()] = true; save(); closeSheet(); sel = todayStr(); tab = 'today'; render(); toast('Показано только главное'); break;
    // вейп
    case 'smSave': {
      const base = Math.max(1, Number(val('smBase')) || 1), q = val('smQuit');
      S.sm = { ...S.sm, on: true, base, price: Math.max(0, Number(val('smPrice')) || 0), pack: Math.max(1, Number(val('smPack')) || 7), quit: q, from: S.sm.from || todayStr() };
      smEditing = false; save(); redraw(); toast('Сохранено');
    } break;
    case 'smEdit': smEditing = true; render(); break;
    case 'smCancel': smEditing = false; render(); break;
    case 'smPlus': trigSheet('plus'); break;
    case 'smMinus': { const r = smRec(todayStr()); if (r && r.n > 0) { r.n--; save(); redraw(); } } break;
    case 'smZero': { const r = smEnsure(todayStr()); r.z = true; save(); redraw(); toast('Записано. Отличный день'); } break;
    case 'crave': craveSheet(); break;
    case 'smNum': S.sm.showNum = !S.sm.showNum; save(); redraw(); break;
    case 'goSmoke': tab = 'smoke'; window.scrollTo(0, 0); render(); break;
    case 'goTaste': tab = 'taste'; window.scrollTo(0, 0); render(); break;
    case 'menuShop': { const have = new Set(S.shop.map((x) => x.t.toLowerCase())); let n = 0; weekShopping(mondayOf(todayStr()), cfg.lesson ? cfg.lesson.dow : 4).forEach((x) => { if (!have.has(x.toLowerCase())) { S.shop.push({ id: uid(), t: x, done: false }); n++; } }); save(); redraw(); toast('Добавлено: ' + n); } break;
    case 'subGo': { const r = subFor(val('subIn')), o = document.getElementById('subOut'); if (o) o.innerHTML = r.length ? r.map((x) => '<div class="note"><b>' + esc(x[0]) + ':</b> ' + esc(x[1]) + '</div>').join('') : '<div class="muted" style="margin-top:8px">Не нашла. Попробуй другое слово.</div>'; } break;
    case 'tmore': { const k = v; S.taste.r[k] = (S.taste.r[k] || 0) + 1; save(); redraw(); } break;
    case 'tctx': { const [k, x] = v.split('|'); S.taste.ctx[k] = x; S.taste.r[k === 'music' ? 'music' : 'x'] = 0; save(); redraw(); } break;
    case 'tmark': {
      const [kind, how, i] = v.split('|'), name = tPicks(kind)[Number(i)]; if (!name) break;
      if (how === 'no') { openSheet('<h2>Что не так?</h2><div class="muted" style="margin-bottom:8px">Выбери причину, я запомню и буду учитывать.</div><div class="chips">' + ['слишком жестоко', 'скучно', 'не люблю этот жанр', 'уже надоело', 'не моё по другой причине'].map((x) => '<button class="chip pick" data-act="twhy" data-v="' + kind + '|' + esc(name).replace(/\|/g, '/') + '|' + esc(x) + '">' + x + '</button>').join('') + '</div><div class="addrow"><button class="btn g" data-act="calmStop">Отмена</button></div>', { t: 'twhy' }); break; }
      tMark(S.taste, kind, name, how); save(); redraw(); toast(how === 'seen' ? 'Запомнила: смотрела' : 'Хорошо, добавила в «хочу»');
    } break;
    case 'twhy': { const [kind, name, why] = v.split('|'); tMark(S.taste, kind, name, 'no'); S.taste.why.push({ kind, name, why, ds: todayStr() }); save(); closeSheet(); redraw(); toast('Больше не предложу'); } break;
    case 'tface': S.taste.ctx.face = v === S.taste.ctx.face ? '' : v; save(); redraw(); break;
    case 'bookCur': { const x = tPicks('books')[Number(v)]; if (x) { S.taste.books.cur = x; tMark(S.taste, 'books', x, 'want'); save(); redraw(); toast('Читаю: ' + x.split(',')[0]); } } break;
    case 'bookDone': { const b = S.taste.books; if (b.cur) { b.done.push({ t: b.cur, ds: todayStr() }); tMark(S.taste, 'books', b.cur, 'seen'); b.cur = ''; save(); redraw(); toast('Книга прочитана'); } } break;
    case 'goApts': tab = 'apts'; window.scrollTo(0, 0); render(); break;
    case 'aptFill': { const p = parseListing(val('apText')); const set = (id, x) => { const e2 = document.getElementById(id); if (e2 && x) e2.value = x; }; set('apPrice', p.price); set('apArea', p.area); set('apRooms', p.rooms); set('apFloor', p.floor); set('apName', p.addr); toast(p.price || p.area ? 'Нашла: проверь цифры' : 'Ничего не нашла, впиши вручную'); } break;
    case 'aptAdd': {
      const a = { id: uid(), name: val('apName').trim(), url: val('apUrl').trim(), price: Math.max(0, Number(val('apPrice')) || 0), area: Math.max(0, Number(String(val('apArea')).replace(',', '.')) || 0), rooms: val('apRooms').trim(), floor: val('apFloor').trim(), note: val('apNote').trim(), ph: [] };
      if (!a.name && !a.url && !a.price) { toast('Впиши хотя бы название или цену'); break; }
      S.apts.push(a); save(); redraw(); toast('Добавлено');
    } break;
    case 'aptDel': { const a = S.apts.find((x) => x.id === v); if (a) { (a.ph || []).forEach((id) => delPhoto(id)); S.apts = S.apts.filter((x) => x.id !== v); save(); redraw(); } } break;
    case 'aptGoal': { const a = S.apts.find((x) => x.id === v); if (a) { S.money.apt = { name: a.name || 'Квартира', url: a.url, price: a.price }; save(); toast('Это теперь цель'); } } break;
    case 'phDel': { const [aid, pid] = v.split('|'); const a = S.apts.find((x) => x.id === aid); if (a) { a.ph = (a.ph || []).filter((x) => x !== pid); delPhoto(pid); save(); closeSheet(); redraw(); } } break;
    case 'phView': { const [aid, pid] = v.split('|'); getPhoto(pid).then((d) => { if (d) openSheet('<img src="' + d + '" alt="" style="width:100%;border-radius:18px"><div class="addrow"><button class="btn g s" data-act="phDel" data-v="' + esc(v) + '">Удалить фото</button><button class="btn" data-act="calmStop">Закрыть</button></div>', { t: 'ph' }); }); } break;
    case 'askGo': {
      const q = val('askIn').trim(); if (!q) { toast('Напиши вопрос'); break; }
      const r = askLocal(q);
      openSheet('<h2>Что я нашла</h2>' + (r.length ? r.map((x) => '<div class="note"><b>' + esc(x.t) + '</b><br>' + esc(x.x) + (x.kind === 'ex' ? '<div class="addrow"><button class="btn s" data-act="calmGo" data-v="' + x.k + '">Начать упражнение</button></div>' : '') + '</div>').join('') : '<div class="muted">Ничего подходящего не нашла. Попробуй другими словами или нажми «Для Claude».</div>') + '<div class="addrow"><button class="btn g" data-act="calmStop">Закрыть</button></div>', { t: 'ask' });
    } break;
    case 'claudeGo': {
      const txt = claudeReport(val('askIn').trim()); copy(txt);
      openSheet('<h2>Отчёт для Claude</h2><div class="muted" style="margin-bottom:8px">Уже скопирован. Открой чат с Claude и вставь текст.</div><textarea readonly rows="9">' + esc(txt) + '</textarea><div class="addrow"><a class="btn" href="https://claude.ai/new" target="_blank" rel="noopener">Открыть Claude</a><button class="btn g" data-act="calmStop">Закрыть</button></div>', { t: 'claude' });
    } break;
    case 'icsGo': icsExport(); break;
    case 'wallGo': wallExport(); break;
    case 'miniInfo': openSheet('<h2>Мини-экран</h2><p class="muted" style="margin-top:0">Короткая страница: что сейчас, что дальше, вода. Как добавить на экран «Домой»:</p><ol class="ul"><li>Открой в Safari адрес своего приложения и допиши в конце <b>?mini=1</b></li><li>Нажми «Поделиться» → «На экран “Домой”»</li><li>Если откроется обычный экран, оставь адрес закладкой в Safari</li></ol><div class="addrow"><button class="btn s" data-act="miniCopy">Скопировать адрес</button><button class="btn g" data-act="calmStop">Закрыть</button></div>', { t: 'mini' }); break;
    case 'miniCopy': copy(location.origin + location.pathname + '?mini=1'); break;
    case 'miniWater': { const ds = todayStr(); S.water[ds] = Math.min(12, (S.water[ds] || 0) + 1); save(); render(); } break;
    case 'miniDone': { const ds = todayStr(), m = miniRest(ds)[0]; if (m) { (S.done[ds] = S.done[ds] || {})[m.id] = true; save(); render(); } } break;
    case 'lockSetup': openSheet('<h2>Блокировка</h2><div class="muted" style="margin-bottom:8px">Придумай PIN из 4 цифр. Face ID по желанию: он откроет приложение вместо PIN.</div><input type="password" inputmode="numeric" maxlength="4" id="lkPin" placeholder="PIN"><input type="password" inputmode="numeric" maxlength="4" id="lkPin2" placeholder="Ещё раз" style="margin-top:8px">' + (bioSupported() ? '<label class="kv" style="margin-top:10px"><span>Включить Face ID</span><input type="checkbox" id="lkBio" checked></label>' : '') + '<div class="addrow"><button class="btn" data-act="lockSave">Включить</button><button class="btn g" data-act="calmStop">Отмена</button></div>', { t: 'lock' }); break;
    case 'lockSave': {
      const p1 = val('lkPin'), p2 = val('lkPin2'), bx = document.getElementById('lkBio');
      if (!/^\d{4}$/.test(p1)) { toast('PIN: ровно 4 цифры'); break; }
      if (p1 !== p2) { toast('PIN не совпал'); break; }
      let cred = ''; if (bx && bx.checked) { try { cred = await bioRegister(); } catch (e2) { toast('Face ID не включился, останется PIN'); } }
      try { await setPin(p1, cred); toast('Блокировка включена'); } catch (e2) { toast('Не получилось включить'); }
      closeSheet(); redraw();
    } break;
    case 'lockOffAsk': openSheet('<h2>Выключить блокировку</h2><input type="password" inputmode="numeric" maxlength="4" id="lkOff" placeholder="PIN"><div class="addrow"><button class="btn" data-act="lockOffGo">Выключить</button><button class="btn g" data-act="calmStop">Отмена</button></div>', { t: 'lockoff' }); break;
    case 'lockOffGo': if (await checkPin(val('lkOff'))) { lockOff(); closeSheet(); redraw(); toast('Выключено'); } else toast('Не тот PIN'); break;
    case 'ghSave': { const t = val('ghTok').trim(); ghSave({ repo: val('ghRepo').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, ''), ...(t ? { token: t } : {}) }); toast('Сохранено, отправляю'); fridgeSync(true); redraw(); } break;
    case 'ghSend': fridgeSync(true); break;
    case 'ghOff': ghSave({ token: '', last: '' }); redraw(); break;
    case 'goFridge': tab = 'fridge'; window.scrollTo(0, 0); render(); break;
    case 'calmMenu': calmMenu(); break;
    case 'calmGo': calmStart(v); break;
    case 'calmNext': calmNext(); break;
    case 'calmStop': closeSheet(); break;
    case 'pmsTips': pmsSheet(); break;
    case 'frQuick': { const x = document.getElementById('frDate'); if (x) x.value = addDays(todayStr(), Number(v)); } break;
    case 'fridgeAdd': {
      const names = val('frName').split(/[,;\n]/).map((x) => x.trim()).filter(Boolean), d = val('frDate');
      if (!names.length) { toast('Впиши название'); break; }
      names.forEach((n) => S.fridge.push({ id: uid(), name: n, exp: d || '' })); save(); redraw(); toast('Добавлено'); fridgeSync();
    } break;
    case 'fridgeDel': S.fridge = S.fridge.filter((x) => x.id !== v); save(); redraw(); fridgeSync(); break;
    case 'intiOpen': intiSheet(); break;
    case 'intiTag': { if (!sh || !sh.q) break; const ix = sh.q.indexOf(v); if (ix >= 0) sh.q.splice(ix, 1); else sh.q.push(v); el.classList.toggle('on', ix < 0); } break;
    case 'intiGo': { if (!sh || !sh.q) break; S.inti.push({ id: uid(), ds: val('intiDate') || todayStr(), q: [...sh.q], note: val('intiNote').trim() }); save(); closeSheet(); redraw(); toast('Записано'); } break;
    case 'intiDel': S.inti = S.inti.filter((x) => x.id !== v); save(); redraw(); break;
    case 'crStart': {
      clearInterval(shTimer); const end = Date.now() + 600000, t = document.getElementById('crT'), bt = document.getElementById('crBtn');
      if (bt) bt.disabled = true;
      const tick = () => { const left = Math.max(0, end - Date.now()), m = Math.floor(left / 60000), sc = Math.floor((left % 60000) / 1000); if (t) t.textContent = pad(m) + ':' + pad(sc); if (!left) { clearInterval(shTimer); if (t) t.textContent = 'Прошло!'; } };
      tick(); shTimer = setInterval(tick, 500);
    } break;
    case 'crWin': { const r = smEnsure(todayStr()); r.cr = (r.cr || 0) + 1; r.res = (r.res || 0) + 1; save(); closeSheet(); redraw(); toast('Ты справилась. Это очень весомо'); } break;
    case 'crSmoke': { const r = smEnsure(todayStr()); r.cr = (r.cr || 0) + 1; save(); trigSheet('crave'); } break;
    case 'trig': {
      const ds = todayStr(), r = smEnsure(ds); r.n++; S.sm.last = Date.now();
      if (Number(v) >= 0) { const k = TRIG[Number(v)]; r.tr = r.tr || {}; r.tr[k] = (r.tr[k] || 0) + 1; }
      save(); closeSheet(); redraw(); toast('Записано. Это данные, а не оценка');
    } break;
  }
}
view.addEventListener('click', onClick);
sheetEl.addEventListener('click', onClick);

/* ---------- Запуск ---------- */
async function boot() {
  if (lockCfg()) lockDraw();
  try { const r = await fetch('config.json', { cache: 'no-cache' }); if (r.ok) { cfg = { ...DEFAULT_CFG, ...(await r.json()) }; localStorage.setItem(KEY + '_cfg', JSON.stringify(cfg)); } } catch (e) {
    try { const c = JSON.parse(localStorage.getItem(KEY + '_cfg') || 'null'); if (c) cfg = { ...DEFAULT_CFG, ...c }; } catch (e2) {}
  }
  if ('serviceWorker' in navigator) { try { await navigator.serviceWorker.register('sw.js'); } catch (e) {} }
  await render();
  document.addEventListener('pointerdown', unlockAudio, { once: true });
  setInterval(() => {
    const a = document.activeElement;
    if (tab === 'today' && sel === todayStr() && !(a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA'))) render();
  }, 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && lockCfg()) { hiddenAt = Date.now(); lockDraw(); }
    if (document.visibilityState === 'visible' && lockCfg() && Date.now() - hiddenAt < 30000) lockHide();
    if (document.visibilityState === 'visible') { sel = todayStr(); firstScroll = true; render(); }
  });
}
boot();
