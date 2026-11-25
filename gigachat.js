// ИИ через GigaChat. Два режима: через свой прокси (надёжно) и напрямую (может не сработать в Safari). ver. 4.0
const K = 'moy_ritm_gc';
export const gcCfg = () => { try { return JSON.parse(localStorage.getItem(K) || '{}'); } catch (e) { return {}; } };
export const gcSave = (o) => localStorage.setItem(K, JSON.stringify({ ...gcCfg(), ...o }));
export const gcReady = () => { const c = gcCfg(); return !!(c.proxy || c.key); };
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); }));
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('Нет ответа за ' + ms / 1000 + ' с')), ms))]);
let tok = null;
async function direct(messages, c) {
  if (!tok || tok.exp < Date.now() + 60000) {
    const r = await withTimeout(fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', RqUID: uuid(), Authorization: 'Basic ' + c.key }, body: 'scope=' + (c.scope || 'GIGACHAT_API_PERS') }), 15000);
    if (!r.ok) throw new Error('Ключ не принят (' + r.status + ')');
    const j = await r.json(); tok = { v: j.access_token, exp: j.expires_at || Date.now() + 25 * 60000 };
  }
  const r = await withTimeout(fetch((c.base || 'https://api.giga.chat/api/v1') + '/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + tok.v }, body: JSON.stringify({ model: c.model || 'GigaChat', messages, temperature: 0.8, max_tokens: 400 }) }), 30000);
  if (!r.ok) throw new Error('GigaChat ответил ' + r.status);
  const j = await r.json(); return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
}
async function viaProxy(messages, c) {
  const r = await withTimeout(fetch(c.proxy, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret: c.secret || '', messages }) }), 35000);
  if (!r.ok) throw new Error('Прокси ответил ' + r.status);
  const j = await r.json(); if (j.error) throw new Error(j.error); return j.text || '';
}
export async function gcAsk(messages) {
  const c = gcCfg();
  if (c.proxy) return viaProxy(messages, c);
  if (c.key) return direct(messages, c);
  throw new Error('GigaChat не настроен');
}
export async function gcTest() {
  const c = gcCfg();
  try { const t = await gcAsk([{ role: 'user', content: 'Ответь одним словом: привет' }]); return { ok: true, msg: 'Работает: «' + t.slice(0, 40) + '»' }; }
  catch (e) {
    const m = String(e && e.message || e), net = /Failed to fetch|Load failed|NetworkError/i.test(m);
    if (net && c.proxy) return { ok: false, msg: 'Не достучалась до функции. Проверь адрес (должен начинаться с https://) и что в Яндекс Облаке включена «Публичная функция».' };
    if (net) return { ok: false, msg: 'Напрямую Safari не может подключиться: сертификат Сбера и запрет CORS. Нужен прокси, инструкция в файле «Инструкция_GigaChat_прокси.html».' };
    if (/Неверный пароль/.test(m)) return { ok: false, msg: 'Пароль приложения не совпал с тем, что записан в функции (APP_SECRET).' };
    return { ok: false, msg: m };
  }
}
