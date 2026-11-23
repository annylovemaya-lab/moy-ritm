// Мой ритм: обходные пути для того, что PWA на iPhone не умеет напрямую (ver. 2.8).
import { TIPS } from './tips.js';
import { EXERCISES, RECIPES } from './mentor2.js';

/* ---------- 1. Квартиры: разбор текста объявления и фото на телефоне ---------- */
export function parseListing(text) {
  const t = String(text || '').replace(/\u00a0/g, ' ');
  const out = { price: 0, area: 0, rooms: '', floor: '', addr: '' };
  const mln = t.match(/(\d+[.,]?\d*)\s*(?:млн|миллион)/i);
  if (mln) out.price = Math.round(parseFloat(mln[1].replace(',', '.')) * 1e6);
  if (!out.price) {
    const all = [...t.matchAll(/(\d[\d ]{4,12})\s*(?:₽|руб|р\.|р(?![а-яa-z]))/gi)].map((m) => Number(m[1].replace(/ /g, ''))).filter((n) => n >= 300000);
    if (all.length) out.price = Math.max(...all);
  }
  const ar = [...t.matchAll(/(\d+[.,]?\d*)\s*(?:м²|м2|кв\.?\s*м|м(?![а-яa-z]))/gi)].map((m) => parseFloat(m[1].replace(',', '.'))).filter((n) => n >= 10 && n <= 400);
  if (ar.length) out.area = ar[0];
  if (/студи/i.test(t)) out.rooms = 'студия';
  else { const r = t.match(/(\d)\s*[-‑]?\s*(?:к(?![а-яa-z])|комн)/i); if (r) out.rooms = r[1] + '-комн.'; }
  const f = t.match(/(\d+)\s*\/\s*(\d+)\s*(?:эт|этаж)?/i) || t.match(/(\d+)\s*этаж\s*из\s*(\d+)/i);
  if (f && Number(f[1]) <= Number(f[2]) && Number(f[2]) < 80) out.floor = f[1] + ' из ' + f[2];
  const ad = t.match(/(?:ул\.?|улица|проспект|пр-т|шоссе|переулок|бульвар|мкр\.?|микрорайон)\s+[^,\n]+(?:,\s*(?:д\.?\s*)?\d+[а-яa-z]?)?/i);
  if (ad) out.addr = ad[0].trim().slice(0, 90);
  return out;
}
let dbp = null;
function db() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    if (typeof indexedDB === 'undefined') return rej(new Error('no idb'));
    const r = indexedDB.open('moy_ritm_photos', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('p');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return dbp;
}
const tx = (mode, fn) => db().then((d) => new Promise((res, rej) => { const t = d.transaction('p', mode), s = t.objectStore('p'), q = fn(s); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }));
export const putPhoto = (id, data) => tx('readwrite', (s) => s.put(data, id));
export const getPhoto = (id) => tx('readonly', (s) => s.get(id)).catch(() => null);
export const delPhoto = (id) => tx('readwrite', (s) => s.delete(id)).catch(() => null);
export function shrinkImage(file, max = 900) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.72));
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
    im.src = url;
  });
}

/* ---------- 2. Помощник без ИИ: поиск по советам и упражнениям ---------- */
const stem = (w) => (w.length > 5 ? w.slice(0, 5) : w.length > 3 ? w.slice(0, w.length - 1) : w);
const words = (s) => String(s || '').toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я0-9]+/).filter((w) => w.length > 2).map(stem);
const STOP = new Set(['как', 'что', 'мне', 'для', 'это', 'или', 'при', 'когда', 'если', 'меня', 'можно', 'надо', 'хочу', 'мой', 'моя', 'очен']);
export function askLocal(q) {
  const qs = words(q).filter((w) => !STOP.has(w));
  if (!qs.length) return [];
  const res = [];
  const score = (text, wt = 1) => { const ws = new Set(words(text)); return qs.reduce((a, w) => a + (ws.has(w) ? wt : 0), 0); };
  EXERCISES.forEach((e) => { const s = score(e.t, 3) + score(e.why, 1.5); if (s > 0) res.push({ s: s + 0.5, kind: 'ex', k: e.k, t: e.t, x: e.why }); });
  TIPS.forEach((t) => { const s = score(t.t, 3) + score(t.x, 1); if (s > 0) res.push({ s, kind: 'tip', t: t.t, x: t.x }); });
  RECIPES.forEach((r) => { const s = score(r.t, 3) + score(r.x, 0.5); if (s > 0) res.push({ s, kind: 'recipe', t: r.t, x: r.x }); });
  const ql = String(q).toLowerCase();
  const force = [];
  if (/тревож|паник|нервнич|страшно|волну/.test(ql)) force.push('ground');
  if (/зл[оа]с|злюсь|злит|злой|бесит|раздраж|ярост|вспыльч|сердит/.test(ql)) force.push('anger');
  if (/стыд|винов|ругаю себя|самокрит/.test(ql)) force.push('kind');
  if (/не могу (заснуть|уснуть)|бессонн|крутятся мысли/.test(ql)) force.push('worry');
  force.reverse().forEach((k) => { const e = EXERCISES.find((x) => x.k === k); if (e) res.unshift({ s: 99, kind: 'ex', k: e.k, t: e.t, x: e.why }); });
  const seen = new Set();
  return res.sort((a, b) => b.s - a.s).filter((r) => (seen.has(r.t) ? false : seen.add(r.t))).slice(0, 4);
}

/* ---------- 3. Календарь iPhone: файл .ics ---------- */
const icsEsc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
function utc(ds, min) { // Москва UTC+3 без перехода на летнее время
  const [y, m, d] = ds.split('-').map(Number), t = new Date(Date.UTC(y, m - 1, d, 0, min - 180, 0));
  return t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
export function icsFromEvents(events, now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Moy ritm//RU', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Мой ритм', 'X-WR-TIMEZONE:Europe/Moscow'];
  events.forEach((e) => {
    L.push('BEGIN:VEVENT', 'UID:' + e.uid + '@moy-ritm', 'DTSTAMP:' + stamp, 'DTSTART:' + utc(e.ds, e.t), 'DTEND:' + utc(e.ds, e.t + Math.max(5, e.dur || 15)), 'SUMMARY:' + icsEsc(e.title));
    if (e.note) L.push('DESCRIPTION:' + icsEsc(e.note));
    if (e.alarm) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(e.title), 'TRIGGER:-PT0M', 'END:VALARM');
    L.push('END:VEVENT');
  });
  L.push('END:VCALENDAR');
  return L.join('\r\n');
}

/* ---------- 4. Обои на экран блокировки вместо виджета ---------- */
function wrap(ctx, text, maxW) {
  const out = []; let line = '';
  String(text).split(' ').forEach((w) => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; });
  if (line) out.push(line); return out;
}
export function drawWallpaper(cv, o) {
  const W = 1170, H = 2532; cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#fde7ef'); g.addColorStop(0.5, '#efe7fb'); g.addColorStop(1, '#e3f3e6'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.5; [[180, 2300, 280, '#fff3c4'], [1000, 1750, 230, '#f9d6e6'], [900, 2380, 170, '#d8f0dc']].forEach(([x, y, r, col]) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }); c.globalAlpha = 1;
  const F = 'ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", sans-serif';
  c.textAlign = 'center'; c.fillStyle = '#5b4c73'; c.font = '700 54px ' + F; c.fillText(o.dateLabel, W / 2, 1000);
  const x0 = 120, bw = W - 240; let y = 1070;
  const items = o.items.slice(0, 5);
  items.forEach((it, i) => {
    c.fillStyle = i === 0 ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.7)'; c.beginPath(); c.roundRect(x0, y, bw, 140, 44); c.fill();
    c.textAlign = 'left'; c.fillStyle = '#8a6bb8'; c.font = '800 46px ' + F; c.fillText(it.time, x0 + 42, y + 88);
    c.fillStyle = '#3f3550'; c.font = '600 44px ' + F; let s = it.title; while (c.measureText(s).width > bw - 330 && s.length > 4) s = s.slice(0, -2); if (s !== it.title) s = s.trimEnd() + '…';
    c.fillText(s, x0 + 230, y + 88); y += 166;
  });
  if (!items.length) { c.textAlign = 'center'; c.fillStyle = '#5b4c73'; c.font = '600 48px ' + F; c.fillText('На сегодня всё сделано', W / 2, y + 80); y += 150; }
  c.textAlign = 'center'; c.fillStyle = '#5b4c73'; c.font = '600 46px ' + F;
  c.fillText('Вода: ' + o.water + ' из ' + o.waterGoal + ' · дел: ' + o.done + ' из ' + o.total, W / 2, y + 60);
  if (o.line) { c.font = '500 40px ' + F; c.fillStyle = '#7a6a92'; wrap(c, o.line, bw).slice(0, 3).forEach((l, i) => c.fillText(l, W / 2, y + 140 + i * 56)); }
  return cv;
}

/* ---------- 5. Отклик на касание (вместо вибрации) и тихий сигнал ---------- */
let hap = null, actx = null;
export function haptic() {
  try {
    if (typeof document === 'undefined' || !document.body) return;
    if (!hap) {
      const l = document.createElement('label'); l.setAttribute('aria-hidden', 'true'); l.style.cssText = 'position:fixed;left:-99px;top:0;opacity:0;pointer-events:none';
      const i = document.createElement('input'); i.type = 'checkbox'; i.setAttribute('switch', ''); l.appendChild(i); document.body.appendChild(l); hap = l;
    }
    hap.click();
  } catch (e) { /* без отклика */ }
  try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) { /* не поддерживается */ }
}
export function unlockAudio() { try { const A = window.AudioContext || window.webkitAudioContext; if (A && !actx) actx = new A(); if (actx && actx.state === 'suspended') actx.resume(); } catch (e) { /* без звука */ } }
export function beep() {
  try {
    unlockAudio(); if (!actx) return;
    const o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = 660; g.gain.value = 0.0001; o.connect(g); g.connect(actx.destination);
    const t = actx.currentTime; g.gain.exponentialRampToValueAtTime(0.12, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.start(t); o.stop(t + 0.55);
  } catch (e) { /* без звука */ }
}

/* ---------- 6. Блокировка: PIN и Face ID через ключ устройства (WebAuthn) ---------- */
const LK = 'moy_ritm_lock';
export const lockCfg = () => { try { return JSON.parse(localStorage.getItem(LK) || 'null'); } catch (e) { return null; } };
const b2h = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const b64 = (b) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
async function derive(pin, salt) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  return b2h(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100000 }, k, 256));
}
export async function setPin(pin, cred) {
  const salt = b2h(crypto.getRandomValues(new Uint8Array(12)));
  localStorage.setItem(LK, JSON.stringify({ salt, h: await derive(pin, salt), cred: cred || '' }));
}
export async function checkPin(pin) { const c = lockCfg(); return !!c && (await derive(pin, c.salt)) === c.h; }
export const lockOff = () => localStorage.removeItem(LK);
export const bioSupported = () => typeof window !== 'undefined' && !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
export async function bioRegister() {
  const cred = await navigator.credentials.create({ publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)), rp: { name: 'Мой ритм', id: location.hostname },
    user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'moy-ritm', displayName: 'Мой ритм' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' }, timeout: 60000, attestation: 'none' } });
  return b64(cred.rawId);
}
export async function bioCheck() {
  const c = lockCfg(); if (!c || !c.cred) return false;
  const a = await navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), rpId: location.hostname, allowCredentials: [{ type: 'public-key', id: unb64(c.cred), transports: ['internal'] }], userVerification: 'required', timeout: 60000 } });
  return !!a;
}

/* ---------- 7. Сроки годности: список продуктов уходит в репозиторий, оттуда его читает рассылка ---------- */
const GH = 'moy_ritm_gh';
export const ghCfg = () => { try { return JSON.parse(localStorage.getItem(GH) || '{}'); } catch (e) { return {}; } };
export const ghSave = (o) => localStorage.setItem(GH, JSON.stringify({ ...ghCfg(), ...o }));
export function guessRepo() {
  try {
    const m = location.hostname.match(/^(.+)\.github\.io$/); if (!m) return '';
    const seg = location.pathname.split('/').filter(Boolean)[0];
    return m[1] + '/' + (seg && !seg.includes('.') ? seg : m[1] + '.github.io');
  } catch (e) { return ''; }
}
export async function pushFridge(items) {
  const c = ghCfg(); if (!c.token || !c.repo) return { ok: false, msg: 'Нет токена или репозитория' };
  const url = 'https://api.github.com/repos/' + c.repo + '/contents/fridge.json';
  const H = { Authorization: 'Bearer ' + c.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  const body = JSON.stringify({ updated: new Date().toISOString(), items: items.map((x) => ({ name: x.name, exp: x.exp || '' })) }, null, 1);
  for (let k = 0; k < 2; k++) {
    let sha; try { const g = await fetch(url, { headers: H, cache: 'no-store' }); if (g.ok) sha = (await g.json()).sha; else if (g.status !== 404) return { ok: false, msg: g.status === 401 ? 'Токен не подошёл (401)' : 'GitHub ответил ' + g.status }; } catch (e) { return { ok: false, msg: 'Нет сети' }; }
    try {
      const r = await fetch(url, { method: 'PUT', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Список продуктов', content: btoa(unescape(encodeURIComponent(body))), ...(sha ? { sha } : {}) }) });
      if (r.ok) return { ok: true, msg: 'Отправлено' };
      if (r.status !== 409 && r.status !== 422) return { ok: false, msg: r.status === 403 || r.status === 404 ? 'У токена нет доступа к репозиторию (' + r.status + ')' : 'GitHub ответил ' + r.status };
    } catch (e) { return { ok: false, msg: 'Нет сети' }; }
  }
  return { ok: false, msg: 'Не удалось записать, попробуй ещё раз' };
}
