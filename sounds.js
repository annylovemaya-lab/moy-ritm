// Звуки внутри приложения (WebAudio). Звук push-уведомлений на iPhone задаёт система, его приложение изменить не может. ver. 4.0
let ac = null;
const ctx = () => { try { const A = window.AudioContext || window.webkitAudioContext; if (A && !ac) ac = new A(); if (ac && ac.state === 'suspended') ac.resume(); } catch (e) { /* без звука */ } return ac; };
const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G4: 392, C4: 261.63, E4: 329.63, A4: 440 };
// ноты: [частота, начало(с), длина(с), тип, громкость]
export const PRESETS = {
  drop: { t: 'Капля', n: [[N.E6, 0, .18, 'sine', .5], [N.A5, .07, .3, 'sine', .3]] },
  bell: { t: 'Колокольчик', n: [[N.C6, 0, .9, 'sine', .4], [N.G5 * 2, 0, .6, 'sine', .15], [N.E6, .12, .8, 'sine', .25]] },
  marimba: { t: 'Маримба', n: [[N.C5, 0, .25, 'triangle', .55], [N.E5, .12, .25, 'triangle', .5], [N.G5, .24, .4, 'triangle', .5]] },
  gong: { t: 'Мягкий гонг', n: [[N.C4, 0, 1.6, 'sine', .5], [N.C4 * 2.01, 0, 1.2, 'sine', .2], [N.G4, .02, 1.2, 'sine', .2]] },
  chime: { t: 'Перезвон', n: [[N.G5, 0, .5, 'sine', .35], [N.C6, .15, .5, 'sine', .35], [N.E6, .3, .8, 'sine', .35]] },
  pop: { t: 'Пузырёк', n: [[N.A5, 0, .08, 'sine', .5], [N.E6, .05, .1, 'sine', .4]] },
  harp: { t: 'Арфа', n: [[N.C5, 0, .6, 'triangle', .4], [N.E5, .1, .6, 'triangle', .4], [N.G5, .2, .6, 'triangle', .4], [N.C6, .3, .9, 'triangle', .4]] },
  off: { t: 'Без звука', n: [] }
};
export const EVENTS = [['done', 'Отметила дело'], ['water', 'Стакан воды'], ['step', 'Шаг упражнения'], ['timer', 'Конец таймера'], ['survey', 'Мини-опрос'], ['cheer', 'Весь день закрыт']];
export const SND0 = () => ({ on: true, vol: 70, ev: { done: 'drop', water: 'pop', step: 'marimba', timer: 'gong', survey: 'chime', cheer: 'harp' } });
export function play(name, vol) {
  const p = PRESETS[name]; if (!p || !p.n.length) return false;
  const a = ctx(); if (!a) return false;
  const k = (vol == null ? 70 : vol) / 100;
  p.n.forEach(([f, s, d, ty, g]) => {
    const o = a.createOscillator(), gn = a.createGain(), t = a.currentTime + s;
    o.type = ty; o.frequency.value = f; gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(g * k, t + .012); gn.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(gn); gn.connect(a.destination); o.start(t); o.stop(t + d + .05);
  });
  return true;
}
export const fire = (S, ev) => { const s = S && S.snd; if (!s || !s.on) return; play((s.ev || {})[ev], s.vol); };
