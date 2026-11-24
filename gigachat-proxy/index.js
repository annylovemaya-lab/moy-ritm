// Прокси-функция для GigaChat (Яндекс Облако, Node.js 18+). Ключ хранится только в переменных окружения функции.
// Переменные: GIGACHAT_KEY (Authorization key из личного кабинета), APP_SECRET (любое слово-пароль, то же вводишь в приложении).
// Необязательно: GIGACHAT_HOST (по умолчанию api.giga.chat; старый адрес: gigachat.devices.sberbank.ru).
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false }); // сертификаты Минцифры; отключена проверка только для запросов к Сберу
const H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Content-Type': 'application/json' };
const call = (host, path, headers, body, port) => new Promise((ok, no) => {
  const r = https.request({ host, port: port || 443, path, method: 'POST', headers, agent, timeout: 25000 }, (res) => { let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => ok({ s: res.statusCode, b: d })); });
  r.on('error', no); r.on('timeout', () => r.destroy(new Error('timeout'))); r.end(body);
});
let tok = null;
module.exports.handler = async (event) => {
  if ((event.httpMethod || '').toUpperCase() === 'OPTIONS') return { statusCode: 204, headers: H, body: '' };
  try {
    const q = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body || '{}');
    if (q.secret !== process.env.APP_SECRET) return { statusCode: 401, headers: H, body: JSON.stringify({ error: 'Неверный пароль' }) };
    if (!tok || tok.exp < Date.now() + 60000) {
      const b = 'scope=GIGACHAT_API_PERS';
      const r = await call('ngw.devices.sberbank.ru', '/api/v2/oauth', { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', RqUID: require('crypto').randomUUID(), Authorization: 'Basic ' + process.env.GIGACHAT_KEY, 'Content-Length': Buffer.byteLength(b) }, b, 9443);
      if (r.s !== 200) return { statusCode: 200, headers: H, body: JSON.stringify({ error: 'Ключ не принят (' + r.s + ')' }) };
      const j = JSON.parse(r.b); tok = { v: j.access_token, exp: j.expires_at };
    }
    const body = JSON.stringify({ model: 'GigaChat', messages: (q.messages || []).slice(-20), temperature: 0.8, max_tokens: 400 });
    const r = await call(process.env.GIGACHAT_HOST || 'api.giga.chat', '/api/v1/chat/completions', { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + tok.v, 'Content-Length': Buffer.byteLength(body) }, body);
    if (r.s !== 200) { if (r.s === 401) tok = null; return { statusCode: 200, headers: H, body: JSON.stringify({ error: 'GigaChat ответил ' + r.s }) }; }
    const j = JSON.parse(r.b);
    return { statusCode: 200, headers: H, body: JSON.stringify({ text: (j.choices[0].message.content || '').trim() }) };
  } catch (e) { return { statusCode: 200, headers: H, body: JSON.stringify({ error: String(e.message || e) }) }; }
};
