// main.js — "Kasa Defteri: Soygun" (1080×1920, 24 fps). Lemo-Opuscar spy-titles kâğıt kesim motoru, dikeye uyarlandı.
import { W, H, C, gMain as g, piece, rough, roughC, smooth, circP, ellP, arcP, rectP, xf, S, paperFinish, clear } from './paper.js';
import { agentSide, runPose, AGENT_POSE } from './chars.js';
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, vnoise, TAU } from '/core/lib.js';
import * as ST from './story.js';

const R = Math;
function cam(x = 540, y = 960, z = 1, rot = 0) { g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.rotate(rot); g.scale(z, z); g.translate(-x, -y); }
const P = (key, fn, seed, amp = 1.6, step = 10) => roughC(key, fn, seed, amp, step);
const stabT = t => { let best = -1e9; for (const s of ST.STABS) if (s <= t && s > best) best = s; return t - best; };

// ——— kesilmiş harf (League Gothic) ———
function cutText(str, x, y, size, col, { align = 'center', rot = 0, seed = 1, keyline = false, ls = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.font = `${size}px LGothic`; g.textBaseline = 'alphabetic';
  const chars = [...str], ws = chars.map(c => g.measureText(c).width + ls), total = ws.reduce((a, b) => a + b, 0) - ls;
  let cx = align === 'center' ? -total / 2 : align === 'right' ? -total : 0;
  chars.forEach((c, i) => {
    const jr = (hash(seed * 13 + i) - .5) * .028, jy = (hash(seed * 7 + i) - .5) * 3;
    g.save(); g.translate(cx + ws[i] / 2, jy); g.rotate(jr);
    if (keyline) { g.lineJoin = 'round'; g.lineWidth = size * .08; g.strokeStyle = C.ink; g.strokeText(c, -ws[i] / 2 + ls / 2, 0); }
    g.shadowColor = 'rgba(20,12,6,.3)'; g.shadowBlur = 5; g.shadowOffsetX = 2.5; g.shadowOffsetY = 3.5;
    g.fillStyle = col; g.fillText(c, -ws[i] / 2 + ls / 2, 0); g.restore();
    cx += ws[i];
  });
  g.restore();
}

// ——— altyazı şeridi: kâğıt şerit, sol alttan kayarak gelir ———
function subStrip(text, t0, t, dark) {
  const u = eo(clamp((t - t0) / .18));
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.font = '600 50px LSpartan';
  let fs = 50; while (g.measureText(text).width > 840 && fs > 34) { fs -= 2; g.font = `600 ${fs}px LSpartan`; }
  const tw = g.measureText(text).width, w = tw + 120, h = fs * 1.9;
  const x0 = lerp(-w - 40, 60, u), y0 = 1210;
  g.save(); g.translate(x0, y0); g.rotate(-.022);
  const strip = rough([[0, 0], [w, 4], [w - 14, h * .5], [w + 4, h], [0, h - 2], [10, h * .5]], 7, 1.6, 9);
  S.bg = dark ? C.ink : C.paper;
  piece(strip, dark ? C.paper : C.ink, { gap: 0 });
  // küçük kasa simgesi (madde imi)
  piece(rectP(30, h / 2 - 15, 30, 30), C.mus, { gap: 0, shadow: false });
  piece(circP(45, h / 2, 7, 12), C.ink, { gap: 0, shadow: false });
  g.fillStyle = dark ? C.ink : C.paper; g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillText(text, 84, h / 2 + 3);
  g.restore();
}

// ——— kasa kapısı ———
function vaultDoor(cx, cy, r, { open = 0, shake = 0, t = 0, dialRot = 0 } = {}) {
  g.save(); g.translate(cx + shake, cy);
  // kasa gövdesi (çerçeve)
  piece(P('vFrame', () => rectP(-r * 1.18, -r * 1.18, r * 2.36, r * 2.36), 61, 2), C.inkL);
  piece(P('vHole', () => circP(0, 0, r * 1.02, 80), 62, 1.6), C.ink);
  if (open > 0) {   // içerden hardal ışık
    piece(P('vGlow', () => circP(0, 0, r * .98, 80), 63, 1.4), C.mus, { gap: 0 });
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .4; piece([[0, 0], [R.cos(a - .09) * r * .95, R.sin(a - .09) * r * .95], [R.cos(a + .09) * r * .95, R.sin(a + .09) * r * .95]], C.musD, { gap: 0, shadow: false }); }
  }
  // kapak: menteşe solda, açılınca yatayda daralıp sola kayar
  const sx = 1 - .86 * eo(open);
  g.save(); g.translate(-r * (1 - sx), 0); g.scale(sx, 1);
  piece(P('vDoor', () => circP(0, 0, r * .96, 90), 64, 2), C.paper);
  piece(P('vRing', () => circP(0, 0, r * .78, 80), 65, 1.6), C.paperD, { gap: 2.4 });
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; piece(xf(P('vBolt', () => circP(0, 0, 14, 14), 66, .8), R.cos(a) * r * .87, R.sin(a) * r * .87), C.inkL, { gap: 0 }); }
  // kadran
  g.save(); g.translate(-r * .3, 0); g.rotate(dialRot);
  piece(P('vDial', () => circP(0, 0, r * .26, 48), 67, 1.2), C.ink);
  piece(P('vDialC', () => circP(0, 0, r * .12, 30), 68, 1), C.red, { gap: 0 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; piece(xf([[-3, 0], [3, 0], [3, 18], [-3, 18]], R.cos(a) * r * .27, R.sin(a) * r * .27, 1, a - R.PI / 2), C.ink, { gap: 0, shadow: false }); }
  g.restore();
  // üç kollu tutamak (ikondaki gibi)
  g.save(); g.translate(r * .38, 0); g.rotate(dialRot * .5);
  for (let i = 0; i < 3; i++) { g.save(); g.rotate(i / 3 * TAU - R.PI / 2); piece([[-8, 0], [8, 0], [6, r * .26], [-6, r * .26]], C.ink, { gap: 0 }); piece(circP(0, r * .27, 13, 14), C.ink, { gap: 0 }); g.restore(); }
  piece(circP(0, 0, 18, 16), C.ink, { gap: 0 });
  g.restore();
  g.restore();
  g.restore();
}

// ——— hazine: telefon + defter ———
// gerçekçi telefon: gövde, metal kenar, yan tuşlar, durum çubuğu, dinamik ada, cam yansıması; ekranda uygulama
function realPhone(cx, cy, w, img, { rot = 0, top = 0, zoom = 1, overlay = null } = {}) {
  const sb = w * .11, sw = w, sh = w * 1304 / 640 * .94 + sb, bz = w * .045, bw = sw + bz * 2, bh = sh + bz * 2, r = w * .14;
  g.save(); g.translate(cx, cy); g.rotate(rot);
  g.save(); g.shadowColor = 'rgba(20,12,6,.5)'; g.shadowBlur = 20; g.shadowOffsetX = 6; g.shadowOffsetY = 12;
  g.fillStyle = '#0c0c0f'; g.beginPath(); g.roundRect(-bw / 2, -bh / 2, bw, bh, r + bz); g.fill(); g.restore();
  g.strokeStyle = '#6a6470'; g.lineWidth = R.max(2, w * .009); g.beginPath(); g.roundRect(-bw / 2, -bh / 2, bw, bh, r + bz); g.stroke();
  g.fillStyle = '#3a3840'; g.fillRect(bw / 2 - 1, -bh * .2, w * .014, bh * .12); g.fillRect(-bw / 2 - w * .013, -bh * .3, w * .014, bh * .06); g.fillRect(-bw / 2 - w * .013, -bh * .2, w * .014, bh * .1);
  g.save(); g.beginPath(); g.roundRect(-sw / 2, -sh / 2, sw, sh, r); g.clip();
  g.fillStyle = '#111216'; g.fillRect(-sw / 2, -sh / 2, sw, sh);
  const k = sw / 640 * zoom;
  if (img) { g.save(); g.beginPath(); g.rect(-sw / 2, -sh / 2 + sb, sw, sh - sb); g.clip(); g.drawImage(img, -sw / 2, -sh / 2 + sb - top * k, 640 * k, 1304 * k); if (overlay) overlay(k, -sw / 2, -sh / 2 + sb - top * k); g.restore(); }
  g.fillStyle = '#fff'; g.font = `700 ${R.round(w * .042)}px LSpartan`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('03:00', -sw / 2 + w * .09, -sh / 2 + sb * .55);
  g.fillRect(sw / 2 - w * .16, -sh / 2 + sb * .45, w * .07, w * .03);
  const gr = g.createLinearGradient(-sw / 2, -sh / 2, sw / 2, sh / 2); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(.4, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-sw / 2, -sh / 2, sw, sh);
  g.restore();
  g.fillStyle = '#000'; g.beginPath(); g.roundRect(-w * .15, -sh / 2 + w * .025, w * .3, w * .075, w * .0375); g.fill();
  g.restore();
  return { sw, sh, bh };
}
function notebook(x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  piece(P('nbB', () => rectP(-96, -126, 192, 252), 74, 1.4), C.ink);
  piece(P('nbC', () => rectP(-84, -114, 168, 228), 75, 1.2), C.mus, { gap: 0 });
  piece(rectP(-84, -114, 20, 228), C.musD, { gap: 0, shadow: false });
  piece(P('nbL', () => rectP(-40, -60, 110, 46), 76, .8), C.paper, { gap: 0, shadow: false });
  g.restore();
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.font = '34px LGothic'; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DEFTER', 15, -37);
  g.restore();
}

// ——— sahneler ———
function sceneRoom(t) {   // 0 – 3: kasa odası
  cam(540, 960, 1);
  clear(C.ink); S.bg = C.ink;
  // tip = mimari: dev "KASA DAİRESİ" duvar panelleri
  cutText('KASA', 540, 860, 520, C.inkL, { seed: 3 });
  cutText('DAİRESİ', 540, 1240, 300, C.inkL, { seed: 5, ls: 6 });
  // alarm ışığı: dönen kırmızı ışık hüzmesi (düz mürekkep)
  const a = -1.1 + R.sin(t * 2.2) * .55;
  piece([[90, 120], [90 + R.cos(a - .16) * 2600, 120 + R.sin(a - .16) * 2600 + 1800], [90 + R.cos(a + .16) * 2600, 120 + R.sin(a + .16) * 2600 + 1800]].map(([x, y]) => [x, y]), C.redD, { gap: 0, shadow: false });
  piece(P('lamp', () => circP(90, 120, 46, 30), 81), C.red);
  // fener ışığı: hırsızların arkasında büyük krem daire (siluetler okunsun)
  const fl = back(clamp(t / .3), 1.4);
  piece(P('torch', () => circP(330, 840, 400, 110), 83, 2.2).map(([x, y]) => [330 + (x - 330) * fl, 840 + (y - 840) * fl]), C.paper);
  // kasa kapısı (sağda)
  vaultDoor(820, 760, 200, { t });
  // zemin
  piece(P('floor1', () => rectP(-40, 1190, 1160, 900), 82, 2), C.inkL);
  // hırsızlar: koşarak girer, durur, gösterir
  const runU = clamp(t / ST.STOP);
  const x1 = lerp(-260, 420, eo(runU)), x2 = lerp(-420, 190, eo(clamp((t - .1) / ST.STOP)));
  const ph = t * 2.6;
  const p1 = t < ST.STOP ? runPose(ph % 1, { lean: .3 }) : { ...AGENT_POSE.stand, shF: 2.15 + R.sin(t * 8) * .05, elF: .05, lean: .05, eyeWide: 1, tie: .2 };
  const p2 = t < ST.STOP + .1 ? runPose((ph + .5) % 1, { lean: .3 }) : { ...AGENT_POSE.stand, lean: .18, bob: 30, knF: .9, thF: .6, knB: .7, thB: -.2, shF: .9, elF: 1.2, tie: .1 };
  agentSide(x2, 1190, 1.15, p2, { thief: true, accent: C.red, tieCol: C.red });
  agentSide(x1, 1200, 1.25, p1, { thief: true, accent: C.red, tieCol: C.red });
  // kanca başlığı
  const hu = back(clamp(t / .35), 2);
  g.save(); g.translate(540, 300); g.scale(hu, hu); g.translate(-540, -300);
  cutText('BANKA SOYGUNU', 540, 330, 190, C.paper, { seed: 9, ls: 4 });
  g.restore();
  cutText('GECE · 03:00', 540, 420, 64, C.red, { seed: 11, ls: 8 });
}

function scenePry(t) {    // 3 – 7: levyelerle zorlama, kapı patlar
  const closeUp = t >= ST.CU && t < ST.WIDE;
  if (closeUp) cam(540, 900, 1.65, -.04); else cam(540, 960, 1, t > ST.BURST ? 0 : .015);
  const burst = seg(t, ST.BURST, ST.BURST + .45);
  clear(burst > 0 ? C.ink : C.red); S.bg = burst > 0 ? C.ink : C.red;
  if (burst <= 0) { piece(P('pryBg', () => rectP(-200, 1400, 1480, 800), 91, 2), C.redD); cutText('ZORLA!', 540, 360, 260, C.redD, { seed: 21 }); }
  // kasa: her vuruşta sarsılır
  const beat = R.max(0, 1 - ((t - ST.S2) % ST.BEAT) / .2);
  const shake = burst > 0 ? 0 : R.sin(t * 60) * 6 * beat;
  const open = eo(burst);
  vaultDoor(540, 900, 360, { open, shake, t, dialRot: (t - ST.S2) * .8 });
  // hırsızlar: levyelerle iki yandan
  const effort = R.sin((t - ST.S2) * R.PI * 2 / ST.BEAT) * .5 + .5;
  const recoil = burst > 0 ? eo(burst) : 0;
  const pL = { ...AGENT_POSE.stand, lean: .32 - recoil * .55, bob: 20, thF: .7, knF: .9, thB: -.35, knB: .3, shF: 1.45 + effort * .25, elF: .45 - effort * .2, shB: 1.6, elB: .5, tie: .5 + effort * .3, tph: t * 6, eyeWide: burst > 0 ? 1 : 0 };
  const pR = { ...pL, shF: 1.45 + (1 - effort) * .25, elF: .45 - (1 - effort) * .2, tph: t * 6 + 1 };
  agentSide(150 - recoil * 60, 1500, 1.2, pL, { thief: true, accent: C.red, tieCol: C.red, bar: burst < .3, barRot: .35 + effort * .1 });
  agentSide(930 + recoil * 60, 1500, 1.2, pR, { thief: true, accent: C.paper, tieCol: C.paper, flip: true, bar: burst < .3, barRot: .35 + (1 - effort) * .1 });
  // kıvılcımlar (vuruşlarda)
  if (burst <= 0) {
    const st = stabT(t);
    if (st < .25) for (let i = 0; i < 9; i++) { const side = i % 2 ? 1 : -1, a = hash(i + R.floor(t * 4)) * TAU, d = 30 + st * 500 * (.5 + hash(i * 3)); const x = 540 + side * 330 + R.cos(a) * d, y = 900 + R.sin(a) * d; piece(xf([[0, -14], [6, 0], [0, 14], [-6, 0]], x, y, 1 - st * 3, a), i % 3 ? C.mus : C.paper, { gap: 0, shadow: false }); }
  }
  if (burst > 0) cutText('ÇAT!', 540, 400, 240 * back(burst, 2.5), C.paper, { seed: 23 });
}

function sceneTreasure(t) { // 7 – 9.5: kasanın içi — telefon ve defter
  const z = lerp(1, 1.08, seg(t, ST.S3, ST.S4));
  cam(540, 960, z);
  clear(C.paper); S.bg = C.paper;
  // kasa içi: raf ve arka levha
  piece(P('inBack', () => rectP(80, 300, 920, 1100), 101, 2.2), C.paperD);
  piece(P('shelf', () => rectP(40, 1100, 1000, 60), 102, 1.6), C.inkL);
  cutText('HAZİNE?', 540, 470, 200, C.musD, { seed: 31, ls: 6 });
  // defter rafta, telefon kalkıyor
  notebook(300, 900, 1.45, -.05);
  const grabbed = t >= ST.GRAB + .2;
  if (!grabbed) realPhone(700, 845, 220, REC.a190, { rot: .05 });
  // Hırsız 2 (sağda, büyük): uzanır, telefonu alır, yüzüne kaldırır
  const reach = seg(t, ST.S3, ST.GRAB), lift = eo(seg(t, ST.GRAB + .2, ST.GRAB + .7));
  const p = { ...AGENT_POSE.stand, lean: -.05 + reach * .2 - lift * .2, head: lift * .25, shF: lerp(.3, 1.5, eo(reach)) + lift * .25, elF: lerp(.3, .1, reach) + lift * 1.1, eyeWide: grabbed ? 1 : 0, tie: .1 };
  const hand = agentSide(1000, 1700, 1.55, p, { thief: true, accent: C.paper, tieCol: C.paper, flip: true });
  if (grabbed) { const hx = hand.wrist[0], hy = hand.wrist[1]; realPhone(lerp(700, hx - 70, eo(seg(t, ST.GRAB + .2, ST.GRAB + .45))), lerp(845, hy - 40, eo(seg(t, ST.GRAB + .2, ST.GRAB + .45))), lerp(220, 210, lift), REC.a190, { rot: lerp(.05, -.08, lift) }); }
  // Hırsız 1 kenardan bakar
  agentSide(-20, 1720, 1.4, { ...AGENT_POSE.stand, lean: .2, head: .1, eyeWide: 1, shF: .4, elF: .5 }, { thief: true, accent: C.red, tieCol: C.red });
  // soru işareti
  const q = back(seg(t, 8.05, 8.4), 2.5);
  if (q > 0) cutText('?', 975, 620, 230 * q, C.red, { seed: 33, keyline: true });
}

const REC = { a: [], b: [], c: [] };
async function recFrame(set, i) {
  const n = { a: 190, b: 78, c: 54 }[set]; i = clamp(R.round(i), 1, n);
  const key = set + i;
  if (!REC[key]) REC[key] = await new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = `rec/${set}/${String(i).padStart(4, '0')}.jpg`; });
  return REC[key];
}
async function sceneApp(t) {  // 9.5 – 17.4: uygulama
  cam(540, 960, 1); clear(C.ink); S.bg = C.ink;
  // yan sütunlar: GELİR (hardal) / GİDER (kırmızı) — tip mimari
  cutText('GELİR', 120, 960, 230, C.musD, { rot: -R.PI / 2, seed: 41, ls: 10 });
  cutText('GİDER', 960, 960, 230, C.redD, { rot: R.PI / 2, seed: 42, ls: 10 });
  // eldeki telefondan büyüyerek ekrana dalış
  const push = eio(seg(t, ST.S4, ST.S4 + .5));
  let im, zoom = 1, top = 0;
  if (t < ST.SUMMARY) im = await recFrame('a', lerp(1, 190, seg(t, ST.S4 + .3, ST.SUMMARY - .1)));
  else if (t < ST.MENU) { im = await recFrame('a', 190); const u = eio(seg(t, ST.SUMMARY, ST.SUMMARY + .5)); zoom = lerp(1, 1.32, u); top = lerp(0, 60, u); }
  else if (t < ST.JOIN) im = await recFrame('b', lerp(1, 22, seg(t, ST.MENU, ST.JOIN)));
  else im = await recFrame('c', lerp(14, 54, seg(t, ST.JOIN, ST.S5 - .4)));
  const W0 = 620, w = lerp(200, W0, push), cx = lerp(800, 540, push), cy = lerp(640, 1000, push);
  const overlay = (k, x0, y0) => {
    const box = (sx, sy, sw, sh, a, lw = 8) => { if (a <= 0) return; g.globalAlpha = a; g.strokeStyle = C.mus; g.lineWidth = lw; g.beginPath(); g.roundRect(x0 + sx * k, y0 + sy * k, sw * k, sh * k, 22); g.stroke(); g.globalAlpha = 1; };
    if (t >= ST.SUMMARY && t < ST.MENU) box(18, 190, 600, 300, env(t, ST.SUMMARY + .45, ST.MENU));
    if (t >= ST.MENU + .3 && t < ST.JOIN) box(6, 586, 330, 46, env(t, ST.MENU + .3, ST.JOIN, .15, .1), 7);
  };
  realPhone(cx, cy, w, im, { rot: lerp(-.08, 0, push), top, zoom, overlay });
}
const env = (t, a, b, fi = .25, fo = .25) => R.max(0, R.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b)));

function sceneHero(t) {   // 17.4 – 21: gerçek hazine
  cam(540, 960, 1); clear(C.ink); S.bg = C.ink;
  const u = back(seg(t, ST.S5, ST.S5 + .4), 1.6);
  piece(P('sun', () => circP(540, 880, 440, 120), 121, 2.2).map(([x, y]) => [540 + (x - 540) * u, 880 + (y - 880) * u]), C.mus);
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .3, r0 = 470 * u, r1 = 900 * u; piece([[540 + R.cos(a - .05) * r0, 880 + R.sin(a - .05) * r0], [540 + R.cos(a - .1) * r1, 880 + R.sin(a - .1) * r1], [540 + R.cos(a + .1) * r1, 880 + R.sin(a + .1) * r1], [540 + R.cos(a + .05) * r0, 880 + R.sin(a + .05) * r0]], C.musD, { gap: 0, shadow: false }); }
  cutText('GERÇEK', 540, 330, 220, C.paper, { seed: 51, ls: 6 });
  cutText('HAZİNE', 540, 1560, 220, C.mus, { seed: 52, ls: 6 });
  const run = seg(t, ST.RUN, ST.S6);
  const xo = eio(run) * 1300, ph = t * 2.8;
  const p1 = run > 0 ? runPose(ph % 1, { lean: .32 }) : { ...AGENT_POSE.stand, shF: 2.95, elF: .05, lean: -.05, head: -.35, eyeWide: 1, tie: .3 + R.sin(t * 5) * .1, tph: t * 4 };
  const p2 = run > 0 ? runPose((ph + .5) % 1, { lean: .32 }) : { ...AGENT_POSE.stand, shF: 2.4, elF: .4, shB: 2.6, elB: .3, lean: -.08, head: -.3, eyeWide: 1, bob: -18 * R.abs(R.sin(t * R.PI * 2)) };
  agentSide(300 + xo, 1420, 1.2, p2, { thief: true, accent: C.paper, tieCol: C.paper });
  const hh = agentSide(640 + xo, 1440, 1.3, p1, { thief: true, accent: C.red, tieCol: C.red });
  realPhone(hh.wrist[0] + 8, hh.wrist[1] - 110, 120, REC.a190, { rot: .05 });
}

function kasaIcon(cx, cy, size) {
  const s = size / 512;
  g.save(); g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = '#20222b'; g.beginPath(); g.roundRect(-256, -256, 512, 512, 115); g.fill();
  const gold = g.createLinearGradient(0, -170, 0, 190); gold.addColorStop(0, '#E9C46A'); gold.addColorStop(1, '#C9973A');
  g.fillStyle = gold; g.beginPath(); g.roundRect(-170, -175, 340, 330, 34); g.fill();
  g.fillStyle = '#a87a2a'; g.fillRect(-120, 150, 52, 32); g.fillRect(68, 150, 52, 32);
  g.strokeStyle = '#1b1a1f'; g.lineWidth = 9; g.beginPath(); g.roundRect(-145, -150, 290, 280, 22); g.stroke();
  g.fillStyle = '#1b1a1f'; g.fillRect(-160, -100, 16, 40); g.fillRect(-160, 40, 16, 40);
  g.lineWidth = 12; g.beginPath(); g.arc(-38, -10, 58, 0, TAU); g.stroke();
  g.beginPath(); g.arc(-38, -10, 26, 0, TAU); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.lineWidth = 7; g.beginPath(); g.moveTo(-38 + R.cos(a) * 66, -10 + R.sin(a) * 66); g.lineTo(-38 + R.cos(a) * 82, -10 + R.sin(a) * 82); g.stroke(); }
  g.fillStyle = '#1b1a1f';
  for (let i = 0; i < 3; i++) { const a = -R.PI / 2 + i / 3 * TAU; g.lineWidth = 12; g.beginPath(); g.moveTo(88, -10); g.lineTo(88 + R.cos(a) * 44, -10 + R.sin(a) * 44); g.stroke(); g.beginPath(); g.arc(88 + R.cos(a) * 46, -10 + R.sin(a) * 46, 10, 0, TAU); g.fill(); }
  g.restore();
}
function sceneEnd(t) {    // 21 – 25: kapanış kartı
  cam(540, 960, 1); clear(C.ink); S.bg = C.ink;
  const d = t - ST.S6;
  const u = back(seg(d, 0, .4), 1.8);
  g.save(); g.translate(540, 560); g.scale(u, u); g.translate(-540, -560);
  piece(P('icBack', () => smooth(rectP(318, 338, 444, 444), 2), 131, 2), C.mus);
  g.save(); g.shadowColor = 'rgba(20,12,6,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 10; g.drawImage(LOGO, 540 - 200, 560 - 200, 400, 400); g.restore();
  g.restore();
  const a1 = back(seg(d, .2, .5), 2), a2 = back(seg(d, .45, .75), 2), a3 = back(seg(d, .7, 1.05), 2);
  if (a1 > 0) { g.save(); g.translate(540, 930); g.scale(a1, a1); g.translate(-540, -930); cutText('KASA DEFTERİ', 540, 960, 170, C.paper, { seed: 61, ls: 4 }); g.restore(); }
  if (a2 > 0) { g.save(); g.translate(540, 1060); g.scale(a2, a2); g.translate(-540, -1060); cutText('GELİR GİDER', 540, 1095, 110, C.mus, { seed: 62, ls: 10 }); g.restore(); }
  if (a3 > 0) {
    const pulse = 1 + .035 * R.max(0, R.sin((d - 1) * R.PI * 2));
    g.save(); g.translate(540, 1215); g.scale(a3 * pulse, a3 * pulse);
    piece(P('btn', () => smooth(rectP(-320, -62, 640, 124), 2), 133, 1.6), C.mus);
    g.font = '800 54px LSpartan'; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText("App Store'da İndir", 0, 4);
    g.restore();
  }
}

// ——— ana çizim ———
await document.fonts.ready;
for (const f of ['100px LGothic', '600 40px LSpartan', '800 40px LSpartan']) await document.fonts.load(f, 'şğİıçöüŞĞÇÖÜ');
const LOGO = await new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = 'img/logo.png'; });
for (const [s, n] of [['a', 190], ['b', 22], ['c', 54]]) for (let i = 1; i <= n; i += 1) await recFrame(s, i);

function subAt(t) { return ST.SUBS.find(s => t >= s[0] && t < s[1]); }
async function draw(t) {
  t = Math.min(t, ST.DUR - 1e-4);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  if (t < ST.S2) sceneRoom(t);
  else if (t < ST.S3) scenePry(t);
  else if (t < ST.S4) sceneTreasure(t);
  else if (t < ST.S5) await sceneApp(t);
  else if (t < ST.S6) sceneHero(t);
  else sceneEnd(t);
  const s = subAt(t);
  if (s) { const light = t >= ST.S3 && t < ST.S4; subStrip(s[2], s[0], t, !light); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  paperFinish(t >= ST.S4 && t < ST.S5 ? .55 : 1);
}
window.DUR = ST.DUR;
window.SUBS = ST.SUBS.map(s => ({ t0: s[0], t1: s[1], text: s[2] }));
window.render = t => draw(t);
await draw(0);
window.READY = true;
