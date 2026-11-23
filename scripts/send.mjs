// Отправка мягких напоминаний. Запускается из GitHub Actions по таймеру cron-job.org каждые 5 минут.
// Проверка без отправки: node scripts/send.mjs --dry 2026-11-23T22:16
import fs from 'node:fs';
import { dueReminders, expiryReminder } from '../core.js';

const cfg = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url), 'utf8'));
const dryIdx = process.argv.indexOf('--dry');
const dry = dryIdx > -1;

function moscowNow() {
  if (dry && process.argv[dryIdx + 1]) {
    const [d, t] = process.argv[dryIdx + 1].split('T');
    const [h, m] = t.split(':').map(Number);
    return { ds: d, min: h * 60 + m };
  }
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { ds: p.year + '-' + p.month + '-' + p.day, min: Number(p.hour) * 60 + Number(p.minute) };
}

const { ds, min } = moscowNow();
const due = dueReminders(ds, min, cfg);
try {
  const fp = new URL('../fridge.json', import.meta.url);
  if (fs.existsSync(fp)) { const er = expiryReminder(ds, min, cfg, JSON.parse(fs.readFileSync(fp, 'utf8')).items); if (er) due.push(er); }
} catch (e) { console.error('fridge.json не прочитан:', e.message); }
console.log('Время по Москве:', ds, String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0'), '· к отправке:', due.length);
if (!due.length) process.exit(0);
if (dry) { due.forEach((r) => console.log(' -', r.id, r.text)); process.exit(0); }

const { default: webpush } = await import('web-push');
const { VAPID_PUBLIC, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTION, VAPID_SUBJECT } = process.env;
if (!VAPID_PUBLIC || !VAPID_PRIVATE_KEY || !PUSH_SUBSCRIPTION) { console.error('Не заданы секреты VAPID_PUBLIC, VAPID_PRIVATE_KEY или PUSH_SUBSCRIPTION'); process.exit(1); }
webpush.setVapidDetails(VAPID_SUBJECT || 'https://github.com', VAPID_PUBLIC, VAPID_PRIVATE_KEY);
const sub = JSON.parse(PUSH_SUBSCRIPTION);
let failed = 0;
for (const r of due) {
  try {
    await webpush.sendNotification(sub, JSON.stringify({ title: 'Мой ритм', body: r.text, tag: r.id }), { TTL: 900, urgency: 'normal' });
    console.log('Отправлено:', r.id);
  } catch (e) { failed++; console.error('Ошибка отправки', r.id, e.statusCode || '', e.body || e.message); }
}
if (failed) process.exit(1);
