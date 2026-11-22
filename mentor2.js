// Мой ритм ver. 2.2 — отметки с вариантами, проверка проектов, вопрос про отношения, деньги, здоровье.
// Чистые функции без обращения к экрану: их можно проверять в Node.
import { addDays } from './core.js';
import { hash } from './tips.js';

// ---------- Отметки с вариантами ----------
// v — скрытое число для старых расчётов (силы или настроение от 1 до 5). Пользователь его не видит.
export const ENERGY = [
  { k: 'full', t: 'полна сил', v: 5 }, { k: 'bodr', t: 'бодрая', v: 4 }, { k: 'norm', t: 'нормально', v: 3 },
  { k: 'tired', t: 'устала', v: 2 }, { k: 'none', t: 'нет сил', v: 1 }, { k: 'nosleep', t: 'не выспалась', v: 2 },
  { k: 'head', t: 'болит голова', v: 2 }, { k: 'tense', t: 'зажата спина и шея', v: 3 }
];
export const FEEL = [
  { k: 'joy', t: 'радость', v: 5 }, { k: 'calm', t: 'спокойствие', v: 4 }, { k: 'int', t: 'интерес', v: 4 }, { k: 'grat', t: 'благодарность', v: 5 },
  { k: 'drive', t: 'азарт', v: 4 }, { k: 'bore', t: 'скука', v: 3 }, { k: 'tir', t: 'усталость', v: 2 }, { k: 'anx', t: 'тревога', v: 2 },
  { k: 'ang', t: 'злость', v: 2 }, { k: 'sad', t: 'грусть', v: 2 }, { k: 'lone', t: 'одиночество', v: 2 }, { k: 'guilt', t: 'вина', v: 2 },
  { k: 'empty', t: 'пустота', v: 1 }, { k: 'irr', t: 'раздражение', v: 2 }
];
const mean = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
export const energyValue = (keys) => mean((keys || []).map((k) => (ENERGY.find((x) => x.k === k) || {}).v).filter(Boolean));
export const moodValue = (keys) => mean((keys || []).map((k) => (FEEL.find((x) => x.k === k) || {}).v).filter(Boolean));
export const feelName = (k) => (FEEL.find((x) => x.k === k) || ENERGY.find((x) => x.k === k) || {}).t || k;

// Ответ наставника на выбранные чувства. Без оценок и диагнозов.
const FEEL_REPLY = {
  anx: 'Тревога есть, и это нормально. Три вдоха: на четыре счёта вдох и на шесть выдох. Потом запиши одну мысль, которая крутится, и одно маленькое действие по ней.',
  ang: 'Злость показывает, что что-то задело границу. Не решай сейчас ничего важного: выйди на воздух на пять минут и только потом отвечай.',
  irr: 'Раздражение часто про усталость. Проверь, ела ли ты и пила ли воду, и убери из вечера лишнее.',
  sad: 'Грусть можно просто прожить. Тёплый душ, аромалампа и ранний отбой подойдут больше, чем борьба с ней.',
  lone: 'Одиночество кажется постоянным, но проходит. Напиши одному близкому человеку одно сообщение, даже короткое. Не обязательно объяснять, что случилось.',
  guilt: 'Вина про отдых и про недоделанное часто преувеличена. Спроси себя: что бы я сказала подруге на моём месте?',
  empty: 'Пустота бывает после долгого напряжения. Не требуй от себя смысла сегодня, сделай только самое простое: вода, еда, сон.',
  bore: 'Скука у тебя может быть сигналом, что нужна новая задача или движение. Пятнадцать минут того, что давно хотелось попробовать.',
  tir: 'Усталость учитывай как данные, а не как слабость. Возьми «День без сил» и сократи вечер.',
  joy: 'Хорошо. Запомни, что именно сегодня это дало, и повтори в ближайшие дни.',
  calm: 'Спокойный день тоже достижение. Что помогло такому состоянию?',
  grat: 'Запиши, за что именно. Благодарность лучше закрепляется, когда она названа.',
  int: 'Интерес надо использовать: самое творческое дело дня ставь на этот момент.',
  drive: 'Азарт помогает начинать. Выбери одно дело и доведи до конца, пока энергия есть.'
};
const NEG = ['anx', 'ang', 'irr', 'sad', 'lone', 'guilt', 'empty', 'tir'];
export function feelReply(keys) {
  const ks = keys || [];
  const hit = NEG.find((k) => ks.includes(k)) || ks[0];
  return hit ? FEEL_REPLY[hit] || '' : '';
}
// Частота выбранных состояний за дни (для «Эмоции недели»)
export function topFeels(ciList, n = 3) {
  const c = {};
  for (const r of ciList) for (const k of [...(r.fe || []), ...(r.fm || [])]) c[k] = (c[k] || 0) + 1;
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ k, t: feelName(k), n: v }));
}

// ---------- Проекты: середина и парковка ----------
export const PLAN_OPTS = [5, 10, 16, 24, 40];
export const planOf = (p) => (p.plan > 0 ? p.plan : 16);
// Нужна ли проверка на середине: сделано не меньше половины запланированных подходов и ещё не решали
export const needsCheckpoint = (p, sessionsDone) => !p.arch && !p.park && !p.cp && sessionsDone >= Math.ceil(planOf(p) / 2);
export const CP_CHOICES = [
  { k: 'push', t: 'Дожимаем', say: 'Решено: идём до конца. Запиши, что сделает финиш понятным: результат, срок, что считается готовым.' },
  { k: 'change', t: 'Меняю подход', say: 'Хорошо. Поменяй следующий шаг так, чтобы он стал интереснее или проще. Остановка на середине часто значит, что способ не тот, а не что цель не нужна.' },
  { k: 'park', t: 'Откладываю', say: 'Проект уходит в парковку. Это решение, а не провал: ты освободила место для того, что сейчас живее.' }
];
export const MAX_ACTIVE = 3;

// ---------- Отношения: вопрос недели ----------
// Без оценок и давления: только то, что поддерживает тебя саму.
export const REL_Q1 = [
  { k: 'warm', t: 'тепло и спокойно' }, { k: 'heard', t: 'меня слышали' }, { k: 'chosen', t: 'чувствовала себя выбранной' },
  { k: 'fun', t: 'было весело' }, { k: 'passion', t: 'была близость и страсть' }, { k: 'adjust', t: 'я подстраивалась' },
  { k: 'unheard', t: 'меня не услышали' }, { k: 'anx', t: 'тревожилась в ожидании' }, { k: 'lone', t: 'чувствовала одиночество' },
  { k: 'fight', t: 'были ссоры' }, { k: 'little', t: 'было мало внимания' }, { k: 'unsure', t: 'не хватало определённости' }
];
export const REL_Q2 = [
  { k: 'att', t: 'внимания' }, { k: 'def', t: 'определённости' }, { k: 'sup', t: 'поддержки' }, { k: 'time', t: 'времени вместе' },
  { k: 'resp', t: 'уважения' }, { k: 'tender', t: 'тепла и нежности' }, { k: 'honest', t: 'открытости' }, { k: 'none', t: 'ничего, всё хватало' }
];
export const REL_Q3 = [
  { k: 'friend', t: 'встреча с подругой' }, { k: 'walk', t: 'прогулка' }, { k: 'sleep', t: 'ранний отбой' }, { k: 'proj', t: 'свой проект или хобби' },
  { k: 'bath', t: 'ванна и уход' }, { k: 'dress', t: 'красивая одежда, платье' }, { k: 'write', t: 'выписать мысли на бумагу' }, { k: 'rest', t: 'просто отдых' }
];
const ADV = {
  unsure: 'Неопределённость тяжело носить. Запиши одной строкой, чего именно в ней не хватает, и выбери одно дело, которое поддержит тебя независимо от чужих ответов.',
  def: 'Неопределённость тяжело носить. Запиши одной строкой, чего именно в ней не хватает, и выбери одно дело, которое поддержит тебя независимо от чужих ответов.',
  adjust: 'Ты подстраивалась. Заметь, в чём именно: время, планы, чувства. Хотя бы один вечер на этой неделе сделай по своему желанию.',
  unheard: 'Когда не слышат, важно, чтобы слышала хотя бы ты сама. Запиши, что хотела сказать. Письмо можно никому не отправлять.',
  anx: 'Тревога часто растёт от ожидания. Занять время ожидания помогают свои дела: проект, ванна, прогулка, подруга. Когда у тебя есть своё расписание, ждать легче.',
  lone: 'Одиночество в ожидании или после встречи знакомо многим. Назначь на ближайший вечер встречу или прогулку, чтобы вечер не зависел от других.',
  fight: 'После ссоры ты отдаляешься и молчишь. Дай себе остыть и вернись к мысли на следующий день. Решать всё сразу не нужно.',
  little: 'Внимания было мало. Дай его себе: один час только для тебя, без ожидания сообщений.',
  att: 'Внимания не хватило. Дай его себе: один час только для тебя, без ожидания сообщений.',
  time: 'Времени вместе было мало. Заполни свободные часы тем, что любишь, чтобы ориентиром вечера были не только встречи.',
  resp: 'Если не хватило уважения, запиши, в какой момент это было. Границы начинаются с того, что ты сама их замечаешь.',
  sup: 'Поддержку можно собирать из разных источников: подруга, семья, музыка, твои дела. Выбери сегодня один.',
  tender: 'Нежность можно давать и себе: тёплая ванна, мягкая одежда, уход. Это тоже забота.',
  honest: 'Если не хватило открытости, запиши, как это отзывается в тебе. Решать ничего не нужно, достаточно назвать.'
};
const SELF = {
  friend: 'Встреча с подругой: назначь её сегодня, пусть даже на час.',
  walk: 'Прогулка: полчаса в парке, который в пяти минутах от дома.',
  sleep: 'Ранний отбой: сон делает любую неделю легче.',
  proj: 'Свой проект: один подход на 50 минут в проектный вечер.',
  bath: 'Ванна и уход: горячая вода, аромалампа, спокойная музыка.',
  dress: 'Красивая одежда: выбери день и надень платье, чтобы почувствовать себя собой.',
  write: 'Выписать мысли: десять минут на бумаге, без цензуры.',
  rest: 'Просто отдых: без вины и без плана.'
};
const GOOD = ['warm', 'heard', 'chosen', 'fun', 'passion'];
export function relAdvice(q1, q2, q3) {
  const a = [...(q1 || []), ...(q2 || [])];
  const out = [];
  for (const k of ['unsure', 'adjust', 'unheard', 'fight', 'lone', 'anx', 'little', 'resp', 'time', 'sup', 'tender', 'honest']) if (a.includes(k) && ADV[k] && !out.includes(ADV[k])) out.push(ADV[k]);
  const good = (q1 || []).filter((k) => GOOD.includes(k)).length;
  const bad = (q1 || []).filter((k) => !GOOD.includes(k)).length;
  const head = good && !bad ? 'Неделя была хорошей. Запомни, что именно в ней сработало.' : good && bad ? 'Неделя смешанная: было и хорошее, и трудное. Это нормально.' : bad ? 'Неделя была непростой. Начни с шага для себя.' : '';
  const self = (q3 || []).map((k) => SELF[k]).filter(Boolean);
  return { head, tips: out.slice(0, 2), self };
}
export function relPattern(weeks) {
  const c = {};
  for (const w of weeks) for (const k of new Set([...(w.q1 || []), ...(w.q2 || [])])) c[k] = (c[k] || 0) + 1;
  return Object.entries(c).filter(([k, n]) => n >= 3 && !GOOD.includes(k) && k !== 'none').map(([k]) => k);
}
export const relName = (k) => (REL_Q1.find((x) => x.k === k) || REL_Q2.find((x) => x.k === k) || REL_Q3.find((x) => x.k === k) || {}).t || k;

// ---------- Деньги ----------
// Минимум: одна цифра дохода в месяц и одна цифра накоплений.
export const MONEY0 = { target: 500000, months: {}, spend: 0, saved: 0, goal: 0, cushionMonths: 6, monthly: 5000 };
// Копилка на квартиру: сколько осталось, как долго при своём темпе и какой темп нужен на выбранный срок
export function aptPlan(m, months = 24) {
  const left = Math.max(0, (m.goal || 0) - (m.saved || 0));
  const monthly = m.monthly > 0 ? m.monthly : 0;
  return { left, atPace: monthly > 0 && left > 0 ? Math.ceil(left / monthly) : 0, need: left > 0 ? Math.ceil(left / months / 1000) * 1000 : 0, months };
}
export const monthKey = (ds) => ds.slice(0, 7);
export function moneyStats(m, ds) {
  const key = monthKey(ds);
  const cur = m.months[key] || 0;
  const keys = [];
  for (let i = 0; i < 6; i++) { const [y, mo] = key.split('-').map(Number); const d = new Date(Date.UTC(y, mo - 1 - i, 1)); keys.push(d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0')); }
  const hist = keys.map((k) => ({ k, v: m.months[k] || 0 }));
  const last3 = hist.slice(0, 3).filter((x) => x.v > 0);
  const avg3 = last3.length ? Math.round(last3.reduce((a, x) => a + x.v, 0) / last3.length) : 0;
  const pct = m.target > 0 ? Math.min(100, Math.round((cur / m.target) * 100)) : 0;
  const savePct = m.goal > 0 ? Math.min(100, Math.round((m.saved / m.goal) * 100)) : 0;
  return { cur, hist, avg3, pct, savePct };
}
export const rub = (n) => Math.round(n).toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' ₽';
export function moneySay(st, m) {
  const out = [];
  if (!st.cur) out.push('Раз в месяц впиши одну цифру: сколько пришло. Больше ничего не нужно.');
  else if (st.pct >= 100) out.push('Цель месяца достигнута. Отложи часть в копилку сразу.');
  else out.push('Месяц на ' + st.pct + '% от цели. Это движение, а не оценка.');
  if (m.goal > 0) out.push('Копилка на квартиру: ' + st.savePct + '% от цели.');
  if (st.avg3 && m.target) out.push('Среднее за последние месяцы: ' + rub(st.avg3) + ', это ' + Math.round((st.avg3 / m.target) * 100) + '% от цели.');
  return out;
}

// ---------- Здоровье как проекты ----------
export const HEALTH0 = () => [
  { id: 'h-imp', name: 'Зубы и имплант', due: '', steps: ['Записаться на консультацию к имплантологу', 'Сделать снимок или КТ', 'Получить план лечения и смету', 'Вылечить остальные зубы по плану', 'Установка импланта', 'Контрольный осмотр'].map((t, i) => ({ id: 's' + i, t, done: false })) },
  { id: 'h-sleep', name: 'Режим сна', due: '', steps: ['Две недели записывать, во сколько легла', 'Экран-стоп за 75 минут до сна', 'Фиксированный подъём в будни', 'Подъём в выходные не позже чем на час позже будней'].map((t, i) => ({ id: 's' + i, t, done: false })) },
  { id: 'h-check', name: 'Базовое обследование', due: '', steps: ['Анализы крови', 'Терапевт', 'Осмотр у стоматолога и гигиена'].map((t, i) => ({ id: 's' + i, t, done: false })) }
];
// Новые направления здоровья (добавляются к уже сохранённым, если их ещё нет)
export const HEALTH_ADD = () => [
  { id: 'h-teeth', name: 'Зубы: осмотр и гигиена', due: '', steps: ['Записаться онлайн к стоматологу на осмотр и гигиену', 'Пройти осмотр: чувствительность, кариес, скол', 'Узнать цену лечения и записать смету', 'Лечить по плану, по одному зубу за раз', 'Профессиональная гигиена раз в полгода'].map((t, i) => ({ id: 's' + i, t, done: false })) },
  { id: 'h-food', name: 'Питание без счёта калорий', due: '', steps: ['Заготовки на неделю в воскресенье', 'Белок на завтрак каждый будний день', 'Овощи в двух приёмах пищи в день', 'Заменить сладкое после обеда на фрукты или сыр', 'Стакан воды к каждому приёму пищи'].map((t, i) => ({ id: 's' + i, t, done: false })) },
  { id: 'h-calm', name: 'Спокойствие: четыре приёма', due: '', steps: ['Заземление 5-4-3-2-1 (одна минута)', 'Пятиминутная медитация три раза за неделю', 'Расслабление мышц перед сном', 'Записать тревожную мысль и три вопроса к ней'].map((t, i) => ({ id: 's' + i, t, done: false })) }
];
export const CHECK_ADD = [['s-fer', 'Анализы: железо и ферритин'], ['s-vitd', 'Анализ на витамин D']];

// ---------- Спокойствие: набор приёмов ----------
export const CALM_TOOLS = [
  { t: 'Заземление 5-4-3-2-1', x: 'Назови 5 предметов, которые видишь, 4, которые можешь потрогать, 3 звука, 2 запаха и 1 вкус. Минута, и голова возвращается в «здесь».' },
  { t: 'Пять минут тишины', x: 'Таймер на 5 минут, глаза закрыты. Считай выдохи до десяти и начинай заново. Если мысль унесла, просто вернись к счёту: это и есть тренировка.' },
  { t: 'Расслабление мышц', x: 'Сожми кулаки на 5 секунд и отпусти. Потом плечи, челюсть, живот, ноги. Заметь, как меняется тело.' },
  { t: 'Тревожная мысль на бумаге', x: 'Запиши мысль и ответь: что я знаю точно, что только предполагаю, что могу сделать сегодня одним шагом.' },
  { t: 'Резкое сообщение подождёт', x: 'Хочется ответить остро? Напиши черновик, не отправляй, выйди на воздух со стаканом воды. Через 15 минут перечитай.' },
  { t: 'Критика', x: 'Сначала пауза и выдох. Потом спроси себя, что в услышанном полезно, и забери только это. Остальное можно оставить за дверью.' },
  { t: 'Моя «домашняя аптечка»', x: 'Выйти на воздух, стакан воды, музыка в наушниках, лаванда или цитрус, тёплая ванна, красивая вещь рядом, объятие или животные.' }
];

export const healthProgress = (h) => { const n = h.steps.length, d = h.steps.filter((s) => s.done).length; return { n, d, pct: n ? Math.round((d / n) * 100) : 0 }; };
export const healthNext = (list) => { for (const h of list) { const s = h.steps.find((x) => !x.done); if (s) return { p: h, s }; } return null; };
export function healthOverdue(h, today) { return !!h.due && h.due < today && h.steps.some((s) => !s.done); }

// ---------- Цикл ----------
const dn = (ds) => Math.floor(Date.parse(ds + 'T12:00:00Z') / 86400000);
export const CYCLE0 = { on: false, len: 28, per: 5, starts: [], sym: {}, off: {} };
export const PH = { period: 'Месячные', follicular: 'Первая половина цикла', ovulation: 'Середина цикла', luteal: 'Вторая половина цикла', pms: 'Предменструальные дни' };
export const PH_SAY = {
  period: 'В первые дни сил часто меньше всего. Минимум дел, тепло и вода. Это не лень.',
  follicular: 'Энергия обычно растёт. Хорошее время для новых начинаний и непростых разговоров.',
  ovulation: 'Часто пик энергии и общительности. Подойдут встречи и большие шаги.',
  luteal: 'Энергия ровная, к концу может снижаться. Доводи начатое, крупные новые дела лучше отложить на следующий цикл.',
  pms: 'Силы падают, настроение качает, тянет к еде. Это ожидаемо и временно. План смягчён, а строгость к себе лучше отложить.'
};
export const PH_NOTE = {
  pms: 'Сейчас предменструальные дни, и спад сил с перепадами настроения в них обычны. Это пройдёт.',
  period: 'Сейчас месячные, силы часто на минимуме. Береги себя без чувства вины.'
};
export const SYM = [
  { k: 'pain', t: 'боль внизу живота' }, { k: 'back', t: 'боль в пояснице' }, { k: 'head', t: 'головная боль' }, { k: 'sweet', t: 'тянет к сладкому' },
  { k: 'swell', t: 'отёки' }, { k: 'mood', t: 'перепады настроения' }, { k: 'weak', t: 'слабость' }, { k: 'none', t: 'ничего' }
];
export function cycleLen(c) {
  const s = [...c.starts].sort(), iv = [];
  for (let i = 1; i < s.length; i++) iv.push(dn(s[i]) - dn(s[i - 1]));
  const ok = iv.filter((x) => x >= 21 && x <= 40).slice(-4);
  return ok.length ? Math.round(ok.reduce((a, b) => a + b, 0) / ok.length) : c.len || 28;
}
export function cyclePhase(c, ds) {
  if (!c || !c.on || !c.starts || !c.starts.length) return null;
  const s = [...c.starts].sort(), L = cycleLen(c), per = c.per || 5;
  let base = null;
  for (const x of s) if (x <= ds) base = x;
  const diff = dn(ds) - dn(base || s[0]);
  const day = (((diff % L) + L) % L) + 1, ov = L - 14;
  let phase;
  if (day <= per) phase = 'period';
  else if (day >= L - 4) phase = 'pms';
  else if (day >= ov - 1 && day <= ov + 1) phase = 'ovulation';
  else if (day < ov - 1) phase = 'follicular';
  else phase = 'luteal';
  return { day, L, phase, soft: phase === 'pms' || (phase === 'period' && day <= 2), nextStart: addDays(ds, L - day + 1) };
}
// Средние силы по фазам: сравниваем с общим средним, без шкал на экране
export function phaseEnergy(c, ci) {
  const acc = {}; let all = 0, n = 0;
  for (const [ds, r] of Object.entries(ci)) {
    if (!r.e) continue;
    const p = cyclePhase(c, ds); if (!p) continue;
    const a = (acc[p.phase] = acc[p.phase] || { n: 0, s: 0 }); a.n++; a.s += r.e; all += r.e; n++;
  }
  const mean = n ? all / n : 0;
  const rows = Object.entries(acc).map(([k, a]) => { const avg = a.s / a.n, d = avg - mean; return { k, n: a.n, avg, rel: d > 0.4 ? 'выше обычного' : d < -0.4 ? 'ниже обычного' : 'как обычно' }; });
  return { n, rows };
}

// ---------- Значки ----------
export const BADGE_DEFS = [
  { k: 'nights', t: 'Ночи по режиму', tiers: [3, 7, 14, 30], how: 'Лечь не позже плана больше чем на 20 минут' },
  { k: 'water', t: 'Дни с водой', tiers: [3, 7, 21], how: '6 стаканов воды и больше' },
  { k: 'vape', t: 'Дни без вейпа подряд', tiers: [1, 3, 7, 14, 30], how: 'Подряд без вейпа' },
  { k: 'craves', t: 'Волн желания пережито', tiers: [1, 10, 30, 100], how: 'Кнопка «Тянет» и справилась' },
  { k: 'sessions', t: 'Проектные подходы', tiers: [1, 10, 30, 100], how: 'Отмеченные подходы' },
  { k: 'cps', t: 'Решений на середине проекта', tiers: [1, 3], how: 'Дожать, поменять подход или отложить' },
  { k: 'saturdays', t: 'Субботы с уборкой', tiers: [1, 4, 12], how: 'Утро субботы с уборкой и ванной' },
  { k: 'health', t: 'Шагов по здоровью', tiers: [1, 5, 10], how: 'Отмеченные шаги в разделе «Здоровье»' },
  { k: 'reviews', t: 'Разборов недели', tiers: [1, 4, 12], how: 'Воскресный разбор недели' },
  { k: 'checkins', t: 'Дней с отметками', tiers: [3, 7, 21, 60], how: 'Утренняя или вечерняя отметка' },
  { k: 'months', t: 'Месяцев с записью дохода', tiers: [1, 3, 6], how: 'Одна цифра в месяц' },
  { k: 'dresses', t: 'Платьев недели надето', tiers: [1, 4, 12], how: 'Платье в выбранный день недели' },
  { k: 'looksteps', t: 'Шагов по образу', tiers: [1, 5], how: 'Отмеченные шаги в разделе «Образ»' }
];
export function badgeState(stats) {
  const earned = [], next = [];
  for (const d of BADGE_DEFS) {
    const cur = stats[d.k] || 0;
    for (const t of d.tiers) if (cur >= t) earned.push({ id: d.k + ':' + t, title: d.t + ': ' + t });
    const nx = d.tiers.find((t) => cur < t);
    if (nx) next.push({ k: d.k, t: d.t, cur, goal: nx, how: d.how, left: nx - cur });
  }
  next.sort((a, b) => a.left / a.goal - b.left / b.goal);
  return { earned, next };
}

// ---------- Образ ----------
// Красиво, но спокойно: платье недели, мягкий уход, бюджет без учёта.
const pickBy = (list, seed, salt) => list[hash(seed + salt) % list.length];
export function outfit(seed, ds) {
  const month = Number(ds.slice(5, 7)), cold = month >= 11 || month <= 3;
  const colors = ['бордовое', 'чёрное', 'белое', 'пастельное', 'нейтральное'];
  const dressesCold = ['облегающее трикотажное платье с длинным рукавом', 'платье с юбкой солнце и рукавами', 'платье мини с рукавами', 'приталенное платье миди с рукавами'];
  const dressesWarm = ['летящее платье', 'платье с юбкой солнце', 'облегающее платье', 'платье мини с лёгкими рукавами'];
  const tights = ['плотные чёрные колготки', 'колготки в тон', 'тёплые колготки'];
  const layer = ['кардиган', 'жакет', 'пальто сверху'];
  const shoes = ['сапоги на устойчивом каблуке', 'ботильоны', 'удобные ботинки'];
  const shoesWarm = ['балетки', 'босоножки', 'кеды'];
  const jewel = ['цепочка и кольца', 'браслет и часы', 'кольца и тонкая цепочка'];
  const hair = ['мягкие волны', 'низкий пучок', 'гладкие распущенные волосы'];
  const dress = pickBy(cold ? dressesCold : dressesWarm, seed, 'd');
  const color = pickBy(colors, seed, 'c');
  const parts = [color + ' ' + dress];
  if (cold) parts.push(pickBy(tights, seed, 't'), pickBy(layer, seed, 'l'), pickBy(shoes, seed, 's'));
  else parts.push(pickBy(shoesWarm, seed, 's'));
  parts.push(pickBy(jewel, seed, 'j'));
  return parts.join(', ') + '. Волосы: ' + pickBy(hair, seed, 'h') + '. Духи и макияж из трёх средств. Сделай красивый кадр.';
}
export const LOOK_ITEMS0 = () => [
  { t: 'Разобрать гардероб', price: 0 }, { t: 'Маникюр', price: '' }, { t: 'Тёплое платье с рукавами', price: '' }, { t: 'Новая причёска', price: '' },
  { t: 'Пальто', price: '' }, { t: 'Массаж', price: '' }, { t: 'Педикюр', price: '' }, { t: 'Маски для лица и волос', price: '' }, { t: 'Фотосессия', price: '' }
].map((x, i) => ({ id: 'li' + i, ...x, done: false }));
export const LOOK_STEPS0 = () => ['Достать все платья и примерить', 'Отложить любимые, подходящие по сезону', 'Записать, чего не хватает: тёплое платье, пальто', 'Выбрать день для платья недели', 'Записаться на маникюр', 'Записаться к парикмахеру', 'Выбрать идею для фотосессии']
  .map((t, i) => ({ id: 'ls' + i, t, done: false }));
// Раскладывает желаемое по месяцам в пределах бюджета
export function planMonths(items, budget) {
  const months = [], unpriced = []; let cur = { n: 1, items: [], sum: 0 };
  for (const it of items) {
    if (it.done) continue;
    const p = it.price === '' || it.price == null ? null : Number(it.price);
    if (p === null) { unpriced.push(it); continue; }
    if (p === 0) { months.length === 0 && cur.items.length === 0 ? cur.items.push(it) : (months[0] || cur).items.push(it); continue; }
    if (cur.sum > 0 && cur.sum + p > budget) { months.push(cur); cur = { n: months.length + 1, items: [], sum: 0 }; }
    cur.items.push({ ...it, over: p > budget }); cur.sum += p;
    if (p > budget) { months.push(cur); cur = { n: months.length + 1, items: [], sum: 0 }; }
  }
  if (cur.items.length) months.push(cur);
  return { months, unpriced };
}
