// Мой ритм: набор рисованных значков (ver. 4.0). Один набор для меню, заголовков и узоров на фоне.
// Рисунки 32×32: контур currentColor, заливка — переменная --af.
const D = {
  sun: '<circle cx="16" cy="16" r="6" class="f"/><path d="M16 3v3M16 26v3M3 16h3M26 16h3M7 7l2 2M23 23l2 2M25 7l-2 2M9 23l-2 2"/>',
  mug: '<path d="M6 12h15v9a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5z" class="f"/><path d="M21 14h2a3.5 3.5 0 0 1 0 7h-2M10 8c0-2 2-2 2-4M15 8c0-2 2-2 2-4"/>',
  clock: '<circle cx="16" cy="17" r="9" class="f"/><path d="M16 12v5l3.5 2M5.5 8.5L9 5M26.5 8.5L23 5M9 26l-2 2.5M23 26l2 2.5"/>',
  cloud: '<path d="M9 23a5.5 5.5 0 0 1 0-11 7.5 7.5 0 0 1 14.500-1.500A6 6 0 0 1 23 23z" class="f"/><path d="M12 27h8"/>',
  spark: '<path d="M15 4c1 6 3 9 10 12-7 3-9 6-10 12-1-6-3-9-10-12 7-3 9-6 10-12z" class="f"/><path d="M26 4v5M23.500 6.500h5"/>',
  notebook: '<rect x="8" y="4" width="18" height="24" rx="3" class="f"/><path d="M13 10h8M13 15h8M13 20h5M8 9H5M8 14H5M8 19H5"/>',
  calendar: '<rect x="4" y="7" width="24" height="21" rx="4" class="f"/><path d="M4 14h24M10 4v6M22 4v6M10 19h2M15 19h2M20 19h2M10 23h2M15 23h2"/>',
  pencil: '<path d="M6 26l1.500-6L21 6.500 25.500 11 12 24.500z" class="f"/><path d="M18 9.500l4.500 4.500M6 26l6-1.500"/>',
  checklist: '<rect x="7" y="6" width="18" height="22" rx="3" class="f"/><path d="M12 6V4h8v2M11 15l2.500 2.500L18 13M11 22h10"/>',
  bell: '<path d="M7 22v-6a9 9 0 0 1 18 0v6l2 3H5z" class="f"/><path d="M13 28a3 3 0 0 0 6 0M16 4v3"/>',
  pin: '<path d="M16 29s-9-7.500-9-15a9 9 0 0 1 18 0c0 7.500-9 15-9 15z" class="f"/><circle cx="16" cy="14" r="3.200"/>',
  bulb: '<path d="M11 22c0-3-5-4.500-5-10a10 10 0 0 1 20 0c0 5.500-5 7-5 10z" class="f"/><path d="M12 26h8M13.500 29h5M16 2v2M5 6l1.500 1.500M27 6l-1.500 1.500"/>',
  rocket: '<path d="M16 3c5.500 3.500 7.500 10 6 17l-6 3-6-3c-1.500-7 .5-13.500 6-17z" class="f"/><circle cx="16" cy="12" r="2.600"/><path d="M10 17l-4.500 5.500 5-1M22 17l4.500 5.500-5-1M14 26l2 4 2-4"/>',
  laptop: '<rect x="7" y="7" width="18" height="14" rx="2.500" class="f"/><path d="M3 24.500h26l-2 3.500H5zM13 11l3 3-3 3M18 17h3"/>',
  brush: '<path d="M24 3l5 5-10.500 10.500-5-5z" class="f"/><path d="M13.500 14c-4 0-6.500 2.500-6.500 6 0 2-1 3.500-3 4.500 5.500 2.500 12.500 1 13-5"/>',
  target: '<circle cx="15" cy="17" r="11" class="f"/><circle cx="15" cy="17" r="6.500"/><circle cx="15" cy="17" r="2"/><path d="M16 16L27 5M23.500 5H27v3.500"/>',
  heart: '<path d="M16 28S4.500 20 4.500 12.500a6.500 6.500 0 0 1 11.500-4A6.500 6.500 0 0 1 27.500 12.500C27.500 20 16 28 16 28z" class="f"/><path d="M9.500 11.500A3.500 3.500 0 0 1 13 8"/>',
  bubble: '<path d="M6 6h20a3.500 3.500 0 0 1 3.500 3.500v10A3.500 3.500 0 0 1 26 23h-9l-6.500 5.500V23H6a3.500 3.500 0 0 1-3.500-3.500v-10A3.500 3.500 0 0 1 6 6z" class="f"/><circle cx="10.500" cy="14.500" r="1.300"/><circle cx="16" cy="14.500" r="1.300"/><circle cx="21.500" cy="14.500" r="1.300"/>',
  flower: '<circle cx="16" cy="8" r="4.500" class="f"/><circle cx="24" cy="14" r="4.500" class="f"/><circle cx="21" cy="23" r="4.500" class="f"/><circle cx="11" cy="23" r="4.500" class="f"/><circle cx="8" cy="14" r="4.500" class="f"/><circle cx="16" cy="16.500" r="3.500"/>',
  balloon: '<ellipse cx="16" cy="12.500" rx="8" ry="10" class="f"/><path d="M16 22.500l-2.500 3h5zM16 25.500c-3 2 3 3 0 5.500M11.500 8c0-2 1.500-3.500 3.500-4"/>',
  gift: '<rect x="5" y="13" width="22" height="15" rx="2.500" class="f"/><rect x="3" y="9" width="26" height="5" rx="2"/><path d="M16 9v19M16 9c-3-6-9-4-6 0M16 9c3-6 9-4 6 0"/>',
  apple: '<path d="M16 9.500c-4-3.500-11-1-11 6.500 0 6.500 4.500 12 8.500 12 1.200 0 1.800-.6 2.500-.6s1.300.6 2.500.6c4 0 8.500-5.500 8.500-12 0-7.500-7-10-11-6.500z" class="f"/><path d="M16 9.500c0-3 1.500-5.500 4-6.500M20 6c2.500-2 5-1 6 .5-1.500 2.500-4.500 3-6 0z"/>',
  cherry: '<circle cx="9.500" cy="23" r="5" class="f"/><circle cx="22" cy="22" r="5" class="f"/><path d="M9.500 18c0-8 5-13 11-15 1 6 .5 11 1 15M20 3c3.500 0 6.500 1.500 8.500 4-3.500 1-6.500.5-8.500-4z"/>',
  cupcake: '<path d="M8 17h16l-2.500 11h-11z" class="f"/><path d="M13 17l1 11M19 17l-1 11M7.500 17a4.500 4.500 0 0 1 3-6.500 5.500 5.500 0 0 1 11 0A4.500 4.500 0 0 1 24.500 17z"/><circle cx="16" cy="5" r="2"/>',
  croissant: '<path d="M3 21c0-7 5.500-11 13-11s13 4 13 11c-3 0-4 2-6.500 2L19 18l-3 6-3-6-3.500 5C7 23 6 21 3 21z" class="f"/><path d="M11 12.500l2 6M21 12.500l-2 6M16 10v8"/>',
  strawberry: '<path d="M16 29C8.500 25 5 18 7.500 12.500c2.500-3 5.500-3 8.500-1.500 3-1.500 6-1.500 8.500 1.500C27 18 23.500 25 16 29z" class="f"/><path d="M11 8l5 4 5-4M16 4v8M12 17v1M17 16v1M21 19v1M13 22v1M18 23v1"/>',
  milk: '<path d="M9 12h14v16H9z" class="f"/><path d="M9 12l3.500-7h7L23 12M13 5V3h6v2M13 18h6M13 23h6"/>',
  egg: '<path d="M16 3c5.500 0 10 8.500 10 15a10 10 0 0 1-20 0c0-6.500 4.500-15 10-15z" class="f"/><path d="M10.500 18c0-3.500 1.500-6.500 3.500-8.500"/>',
  cheese: '<path d="M3 23L28 10v14H3z" class="f"/><circle cx="11" cy="20" r="2"/><circle cx="19.500" cy="18" r="2.500"/><circle cx="23.500" cy="22" r="1.500"/><path d="M3 23v1h25"/>',
  tomato: '<circle cx="16" cy="18" r="11" class="f"/><path d="M9.500 9.500L16 13l6.500-3.500M16 6v7M12 18a4 4 0 0 1 3-3.500"/>',
  jar: '<path d="M10 4h12v4H10zM8.500 8h15v20h-15z" class="f"/><rect x="11" y="14" width="10" height="8" rx="2"/>',
  coin: '<circle cx="16" cy="16" r="12" class="f"/><circle cx="16" cy="16" r="8"/><path d="M16 11v10M13 13.500h4.500a2 2 0 0 1 0 4h-3a2 2 0 0 0 0 4H19"/>',
  piggy: '<ellipse cx="15" cy="17" rx="11" ry="8.500" class="f"/><path d="M22 9.500l3-3.500 1 6M26 15h3.500v4H25M9.500 24v4M19.500 24v4M13 10.500h5M5 14c-3-1-3 3 0 3"/><circle cx="21.500" cy="15" r="1"/>',
  house: '<path d="M7 13v15h18V13" class="f"/><path d="M3 15L16 3l13 12M13 28v-8h6v8M20 8V5h3v6"/>',
  key: '<circle cx="10" cy="16" r="6" class="f"/><circle cx="10" cy="16" r="1.800"/><path d="M16 16h13M25 16v5M29 16v4"/>',
  wallet: '<rect x="3" y="8" width="26" height="19" rx="4" class="f"/><path d="M3 13h21a5 5 0 0 1 5 5v1"/><circle cx="23.500" cy="20" r="2"/>',
  drop: '<path d="M16 3s10 11 10 18a10 10 0 0 1-20 0c0-7 10-18 10-18z" class="f"/><path d="M10.500 21a5.500 5.500 0 0 0 5 5.500"/>',
  leaf: '<path d="M5 27C5 13.500 13.500 5 28 4c0 14-8 23-21 23z" class="f"/><path d="M5 27L21 11M14 17h6M11 21h5"/>',
  pill: '<path d="M5.500 20l10-10a5.500 5.500 0 0 1 8 8l-10 10a5.500 5.500 0 0 1-8-8z" class="f"/><path d="M11 14.500l7.500 7.500"/>',
  dumbbell: '<rect x="3" y="12" width="4" height="8" rx="1.500" class="f"/><rect x="7" y="8" width="4" height="16" rx="1.500" class="f"/><rect x="21" y="8" width="4" height="16" rx="1.500" class="f"/><rect x="25" y="12" width="4" height="8" rx="1.500" class="f"/><path d="M11 16h10"/>',
  heartbeat: '<path d="M16 28S4.500 20 4.500 12.500a6.500 6.500 0 0 1 11.500-4A6.500 6.500 0 0 1 27.500 12.500C27.500 20 16 28 16 28z" class="f"/><path d="M7 15h5l2-4 3 8 2-4h6"/>',
  moon: '<path d="M23 4a13 13 0 1 0 6 21A11 11 0 0 1 23 4z" class="f"/><path d="M26 6v3M24.500 7.500h3"/>',
  stars: '<path d="M10 4c.6 3.500 2 5 5.500 6.500-3.500 1.500-5 3-5.500 6.500-.6-3.500-2-5-5.500-6.500C8 9 9.400 7.500 10 4z" class="f"/><path d="M23 14c.5 3 1.800 4.200 4.800 5.500-3 1.300-4.300 2.500-4.800 5.500-.5-3-1.800-4.200-4.800-5.500 3-1.300 4.300-2.500 4.800-5.500z" class="f"/>',
  bed: '<path d="M3 26V8M3 20h26v6M29 20v-4a4.500 4.500 0 0 0-4.500-4.500H14V20" class="f"/><rect x="6" y="12" width="7" height="6" rx="3"/>',
  lotus: '<path d="M16 26c-6-1-10-5.500-10-12 4 0 7.500 2 10 5.500 2.500-3.500 6-5.500 10-5.500 0 6.500-4 11-10 12z" class="f"/><path d="M16 26c-3.500-3.500-4.500-9 0-15 4.500 6 3.500 11.500 0 15zM5 29h22"/>',
  feather: '<path d="M27 4C14 4 8 11 7 22l-3 6.500 5-3C19.500 24.500 28 17 27 4z" class="f"/><path d="M9 25l13-13M14 20h6"/>',
  candle: '<rect x="10" y="14" width="12" height="14" rx="2.500" class="f"/><path d="M16 3.500c3.500 3.500 3.500 7 0 9-3.500-2-3.500-5.500 0-9zM16 12.500v1.500M10 19c3 1.500 9 1.500 12 0"/>',
  waves: '<path d="M3 11c3-4 6-4 9 0s6 4 9 0 5-3.500 8-1M3 18c3-4 6-4 9 0s6 4 9 0 5-3.500 8-1M3 25c3-4 6-4 9 0s6 4 9 0 5-3.500 8-1" class="f2"/>',
  dress: '<path d="M12 3l-2 9-6 17h24l-6-17-2-9c-1.500 3.500-6.500 3.500-8 0z" class="f"/><path d="M10 12h12M13 20c1 1 5 1 6 0"/>',
  heel: '<path d="M4 5h6c1 4 2 8 6 10l11 4a2.500 2.500 0 0 1 .5 4.500H8V5" class="f"/><path d="M8 5v18M25 24v5"/>',
  bag: '<path d="M5 11h22l2 17H3z" class="f"/><path d="M10 11V9a6 6 0 0 1 12 0v2M13 18h6"/>',
  hanger: '<path d="M16 11a3 3 0 1 1 3-3c0 2-3 2-3 5M16 13L3 22a2 2 0 0 0 1.200 3.600h23.600A2 2 0 0 0 29 22z" class="f"/>',
  lipstick: '<rect x="10" y="17" width="12" height="11" rx="2" class="f"/><path d="M11.500 17v-5h9v5M13 12V5l6 3.500V12"/>',
  earring: '<path d="M16 3v5"/><circle cx="16" cy="12" r="4" class="f"/><path d="M16 16v5M16 21l-3.500 3.500 3.500 4.500 3.500-4.500z" class="f"/>',
  clapper: '<rect x="3" y="12" width="26" height="16" rx="2.500" class="f"/><path d="M3 12l-1-5 25-4 1 5M8 9.500l3.500 4M15 8.500l3.500 4M22 7.500l3.500 4"/>',
  note: '<path d="M12 24V7l15-3v17" class="f2"/><circle cx="8" cy="24" r="4" class="f"/><circle cx="23" cy="21" r="4" class="f"/>',
  book: '<path d="M4 6h9a4 4 0 0 1 3 1.500A4 4 0 0 1 19 6h9v20h-9a4 4 0 0 0-3 1.500A4 4 0 0 0 13 26H4z" class="f"/><path d="M16 7.500v20"/>',
  popcorn: '<path d="M7 14h18l-2.500 15h-13z" class="f"/><path d="M13 14l1 15M19 14l-1 15M7 14a4.500 4.500 0 0 1 3-6.500 4.500 4.500 0 0 1 6-3 4.500 4.500 0 0 1 6.500 3 4.500 4.500 0 0 1 2.500 6.500"/>',
  headphones: '<path d="M4 19v-3a12 12 0 0 1 24 0v3"/><rect x="3" y="17" width="7" height="11" rx="3" class="f"/><rect x="22" y="17" width="7" height="11" rx="3" class="f"/>',
  sofa: '<path d="M3 16a3.500 3.500 0 0 1 7 0v3h12v-3a3.500 3.500 0 0 1 7 0v10H3z" class="f"/><path d="M7 16v-5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v5M7 26v2M25 26v2"/>',
  plant: '<path d="M9 20h14l-2 9H11z" class="f"/><path d="M16 20V9M16 15c-6 0-8-4-8-8 6 0 8 3 8 8zM16 12c0-5 3-7.500 8-8 0 5-3 8-8 8z"/>',
  lamp: '<path d="M8 4h16l5 13H3z" class="f"/><path d="M16 17v11M10 29h12"/>',
  glass: '<path d="M7 4h18l-2.500 24h-13z" class="f"/><path d="M8.500 13h15M12 18c2 2 6 2 8 0"/>',
  wind: '<path d="M3 11h16a3.500 3.500 0 1 0-3.500-3.500M3 17h22a3.500 3.500 0 1 1-3.500 3.500M3 23h9"/>',
  gear: '<path d="M14 3h4l1 4 3 1.500 3.500-2.200 2.800 2.800-2.200 3.500L27 16l4 1v4l-4 1-1.500 3 2.200 3.500-2.800 2.800-3.500-2.200L19 30l-1 4h-4l-1-4-3-1.500-3.500 2.200-2.800-2.800L6 22l-1.500-3L1 18v-4l3.500-1L6 10 3.800 6.500 6.600 3.700 10 6l3-1.500z" class="f" transform="translate(0 -1) scale(.96) translate(.7 1)"/><circle cx="16" cy="16" r="4.500"/>',
  lock: '<rect x="6" y="14" width="20" height="15" rx="3.500" class="f"/><path d="M10.500 14v-3.500a5.500 5.500 0 0 1 11 0V14M16 19.500v4"/>',
  palette: '<path d="M16 3C8.500 3 3 8.500 3 15.500S8.500 28 15 28c3.500 0 3.500-2.200 2.500-4.200s0-4 3-4H25c3 0 4-2 4-5C29 8 23.500 3 16 3z" class="f"/><circle cx="9.500" cy="14" r="1.600"/><circle cx="14" cy="9" r="1.600"/><circle cx="21" cy="9.500" r="1.600"/>',
  cloudDown: '<path d="M9 21a5.500 5.500 0 0 1 0-11 7.500 7.500 0 0 1 14.500-1.500A6 6 0 0 1 23 21" class="f"/><path d="M16 14v13M12 23l4 4 4-4"/>',
  widget: '<rect x="4" y="4" width="11" height="11" rx="3.500" class="f"/><rect x="17" y="4" width="11" height="11" rx="3.500"/><rect x="4" y="17" width="11" height="11" rx="3.500"/><rect x="17" y="17" width="11" height="11" rx="3.500" class="f"/>',
  robot: '<rect x="5" y="9" width="22" height="17" rx="5" class="f"/><circle cx="12" cy="17" r="2.200"/><circle cx="20" cy="17" r="2.200"/><path d="M16 9V4M13 22h6M3 15v4M29 15v4"/><circle cx="16" cy="3.500" r="1.500"/>',
  sleepy: '<circle cx="14" cy="18" r="11" class="f"/><path d="M9 17c1.500 1.500 3 1.500 4.500 0M16 17c1.500 1.500 3 1.500 4.500 0M12 23c1.500 1 4 1 5.500 0M22 6h5l-5 6h5"/>',
  smoke: '<path d="M7 25h14v4H7z" class="f"/><path d="M21 25h4v4h-4zM13 21c3-3-2-4 1-8M18 19c2-2-2-3 .5-6"/><path d="M4 4l24 24" class="x"/>',
  user: '<circle cx="16" cy="11" r="6" class="f"/><path d="M5 28c1-6 5.500-9 11-9s10 3 11 9z" class="f"/>',
  check: '<path d="M6 17l7 7L27 9" />',
  list: '<path d="M10 8h18M10 16h18M10 24h18M4 8h2M4 16h2M4 24h2"/>',
  grid: '<rect x="4" y="4" width="10" height="10" rx="3" class="f"/><rect x="18" y="4" width="10" height="10" rx="3"/><rect x="4" y="18" width="10" height="10" rx="3"/><rect x="18" y="18" width="10" height="10" rx="3" class="f"/>',
  camera: '<path d="M4 11h5l2-3h10l2 3h5v16H4z" class="f"/><circle cx="16" cy="18" r="5"/>',
  mic: '<rect x="11" y="3" width="10" height="16" rx="5" class="f"/><path d="M6 15a10 10 0 0 0 20 0M16 25v4M11 29h10"/>',
  send: '<path d="M4 15L28 4 21 28l-5-9z" class="f"/><path d="M16 19l12-15"/>',
  cart: '<path d="M3 5h4l3 15h14l3-11H8" class="f"/><circle cx="12" cy="26" r="2"/><circle cx="23" cy="26" r="2"/>',
  pot: '<path d="M5 13h22v10a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z" class="f"/><path d="M3 13h26M12 9c0-2 2-2 2-4M18 9c0-2 2-2 2-4M27 17h3M2 17h3"/>',
  gamepad: '<path d="M8 10h16a6 6 0 0 1 6 6l-1 7a3.500 3.500 0 0 1-6 1.500L21 22H11l-2 2.500A3.500 3.500 0 0 1 3 23l-1-7a6 6 0 0 1 6-6z" class="f"/><path d="M9 14v5M6.500 16.500h5M21 16h.01M24 18.500h.01"/>',
  needle: '<path d="M4 28L27 5M21 5l6 6M4 28l8-1.500"/><circle cx="23" cy="9" r="1.500" class="f"/><path d="M7 20c4-1 6 2 9 1s3-4 7-3" class="x2"/>'
};

export const ico = (name, o = {}) => {
  const s = o.size || 28, af = o.af || 'var(--af, rgba(190,170,230,.35))', sw = o.sw || 1.6, c = o.c || 'currentColor';
  const body = (D[name] || D.star || D.spark).replace(/class="f2"/g, 'fill="none"').replace(/class="f"/g, 'fill="' + af + '"').replace(/class="x2"/g, 'fill="none" stroke-dasharray="2 2"').replace(/class="x"/g, 'stroke="#d9778f" stroke-width="2.200"');
  return '<svg class="ico" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="' + s + '" height="' + s + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
};
export const ICON_NAMES = Object.keys(D);

// Узор для фона: плитка 240×240 с конкретными предметами раздела
const SPOTS = [[8, 10, -12, 1.0], [96, 4, 10, .9], [170, 20, 18, 1.0], [44, 84, 14, .95], [130, 72, -10, 1.05], [196, 96, 8, .9], [6, 162, -8, 1.0], [84, 150, 12, 1.0], [160, 146, -16, .95], [206, 190, 10, 1.0], [40, 208, 6, .9], [120, 206, -6, 1.0]];
export function patternUrl(names, stroke, fill) {
  const g = SPOTS.map(([x, y, r, k], i) => {
    const n = names[i % names.length], body = (D[n] || D.spark).replace(/class="f2"/g, 'fill="none"').replace(/class="f"/g, 'fill="' + fill + '"').replace(/class="x2"/g, 'fill="none"').replace(/class="x"/g, 'stroke="' + stroke + '"');
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ' 16 16) scale(' + (k * 1.5).toFixed(2) + ')">' + body + '</g>';
  }).join('');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" fill="none" stroke="' + stroke + '" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">' + g + '</svg>';
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29') + '")';
}
// Какие предметы рисовать на фоне каждого раздела
export const SECTION_ART = {
  today: ['sun', 'mug', 'clock', 'cloud', 'spark', 'notebook'], week: ['calendar', 'pencil', 'checklist', 'bell', 'pin', 'notebook'],
  proj: ['bulb', 'rocket', 'laptop', 'brush', 'target', 'gear'], mentor: ['heart', 'bubble', 'flower', 'balloon', 'gift', 'spark'],
  food: ['apple', 'cherry', 'cupcake', 'mug', 'croissant', 'strawberry'], fridge: ['milk', 'egg', 'cheese', 'tomato', 'jar', 'apple'],
  money: ['coin', 'piggy', 'house', 'key', 'wallet', 'target'], health: ['heartbeat', 'drop', 'leaf', 'dumbbell', 'pill', 'apple'],
  cycle: ['moon', 'flower', 'drop', 'heart', 'stars', 'leaf'], look: ['dress', 'heel', 'bag', 'hanger', 'lipstick', 'earring'],
  taste: ['clapper', 'note', 'book', 'popcorn', 'headphones', 'spark'], apts: ['house', 'key', 'sofa', 'plant', 'lamp', 'pin'],
  smoke: ['leaf', 'glass', 'wind', 'spark', 'drop', 'cloud'], sleep: ['moon', 'stars', 'bed', 'cloud', 'mug', 'candle'],
  calm: ['lotus', 'feather', 'candle', 'cloud', 'waves', 'leaf'], sounds: ['bell', 'note', 'headphones', 'waves', 'spark', 'heart'],
  more: ['gear', 'palette', 'lock', 'cloudDown', 'widget', 'spark'], menu: ['grid', 'spark', 'heart', 'star', 'flower', 'cloud']
};
