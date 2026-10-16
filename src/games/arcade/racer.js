/* Game 10: Racing Car. Four-lane touch racing across three themed tracks. Swipe or drag to change lanes, grab coins, dodge traffic, race 8000 m. */
(function () {
  'use strict';
  var A = window.Arcade, C = A.C, W = 800, H = 450, VPX = 400, VPY = 184, K = 260, HC = 1.3, CZ = 1.6, SC = K / CZ, GOAL = 8000, LANES = [-1.5, -.5, .5, 1.5], S;
  var THEMES = [
    { name: 'CITY NIGHT', sky: ['#12062b', '#7b2cbf'], ground: '#150a2b', road: '#2b2b44', dec: 'building', glow: '#ff2fd6' },
    { name: 'DESERT SUNSET', sky: ['#ff6f61', '#ffd78a'], ground: '#d9a05b', road: '#4b3b33', dec: 'cactus', glow: '#ffb020' },
    { name: 'SNOW PEAKS', sky: ['#78b4ff', '#eaf5ff'], ground: '#e6eff6', road: '#4b5563', dec: 'pine', glow: '#7cf' }
  ];
  var CARCOL = ['#2D9CFF', '#34F58B', '#FFD21F', '#c77dff', '#ff9f1c', '#e5e5e5'];

  function px(x, z, cx) { return VPX + (x - cx) * K / z; }
  function py(y, z) { return VPY + (HC - y) * K / z; }
  function theme(d) { return THEMES[Math.min(2, Math.floor(d / (GOAL / 3)))]; }

  /* ---------- drawing ---------- */
  function carRear(g, x, yb, s, col, o) {
    o = o || {}; var w = (o.w || .82) * s, bh = (o.h || .36) * s;
    g.save(); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, yb + s * .02, w * .58, s * .07, 0, 0, 7); g.fill();
    g.strokeStyle = C.ink; g.lineWidth = Math.max(1.5, s * .025); g.lineJoin = 'round';
    g.fillStyle = '#111'; g.fillRect(x - w * .5, yb - s * .2, w * .17, s * .2); g.fillRect(x + w * .33, yb - s * .2, w * .17, s * .2);
    if (o.truck) { g.fillStyle = col; g.fillRect(x - w * .5, yb - s * .95, w, s * .75); g.strokeRect(x - w * .5, yb - s * .95, w, s * .75); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - w * .5, yb - s * .95, w, s * .12); g.strokeStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(x, yb - s * .95); g.lineTo(x, yb - s * .2); g.stroke(); g.strokeStyle = C.ink; }
    else {
      g.fillStyle = col; A.rr(g, x - w * .5, yb - bh - s * .08, w, bh, s * .06); g.fill(); g.stroke();
      g.fillStyle = col; g.beginPath(); g.moveTo(x - w * .38, yb - bh - s * .08); g.lineTo(x - w * .28, yb - bh - s * .3); g.lineTo(x + w * .28, yb - bh - s * .3); g.lineTo(x + w * .38, yb - bh - s * .08); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#1b2a4a'; g.beginPath(); g.moveTo(x - w * .31, yb - bh - s * .1); g.lineTo(x - w * .23, yb - bh - s * .26); g.lineTo(x + w * .23, yb - bh - s * .26); g.lineTo(x + w * .31, yb - bh - s * .1); g.closePath(); g.fill();
      if (o.spoiler) { g.fillStyle = C.ink; g.fillRect(x - w * .48, yb - bh - s * .36, w * .96, s * .06); g.fillRect(x - w * .36, yb - bh - s * .32, s * .05, s * .24); g.fillRect(x + w * .31, yb - bh - s * .32, s * .05, s * .24); }
      if (o.stripe) { g.fillStyle = C.snow; g.fillRect(x - w * .06, yb - bh - s * .08, w * .12, bh); }
    }
    var ly = o.truck ? yb - s * .4 : yb - bh * .55 - s * .08; g.fillStyle = o.brake ? '#ff5050' : '#c1121f'; g.shadowColor = '#ff2d2d'; g.shadowBlur = o.brake ? 16 : 8;
    g.fillRect(x - w * .46, ly, w * .2, s * .08); g.fillRect(x + w * .26, ly, w * .2, s * .08); g.shadowBlur = 0;
    g.fillStyle = C.snow; g.fillRect(x - w * .12, ly + s * .02, w * .24, s * .07);
    g.restore();
  }
  function flatQuad(g, x0, x1, z0, z1, cx, col) { g.fillStyle = col; g.beginPath(); g.moveTo(px(x0, z0, cx), py(0, z0)); g.lineTo(px(x1, z0, cx), py(0, z0)); g.lineTo(px(x1, z1, cx), py(0, z1)); g.lineTo(px(x0, z1, cx), py(0, z1)); g.closePath(); g.fill(); }
  function drawDecor(g, o, cx, th, tm) {
    var s = K / o.z, x = px(o.x, o.z, cx), yb = py(0, o.z);
    if (x < -300 || x > W + 300) return; g.save();
    if (o.dec === 'building') {
      var bw = o.w * s, bh = o.h * s; g.fillStyle = o.col; g.fillRect(x - bw / 2, yb - bh, bw, bh); g.fillStyle = o.neon; g.fillRect(x - bw / 2, yb - bh, bw, Math.max(2, s * .08));
      var cols = Math.max(2, Math.floor(o.w * 3)), rows = Math.max(3, Math.floor(o.h * 2.6)); for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { if (((r * 7 + c * 3 + o.seed) % 5) < 2) continue; g.fillStyle = (r + c + o.seed) % 3 ? '#ffe27a' : '#7cf'; g.fillRect(x - bw / 2 + bw * (c + .22) / cols, yb - bh + bh * (r + .3) / rows, bw / cols * .5, bh / rows * .4); }
    } else if (o.dec === 'cactus') {
      var w2 = .22 * s, h2 = o.h * s * .55; g.fillStyle = '#2f8f4e'; g.strokeStyle = '#14532d'; g.lineWidth = Math.max(1, s * .02); A.rr(g, x - w2 / 2, yb - h2, w2, h2, w2 / 2); g.fill(); g.stroke(); A.rr(g, x - w2 * 1.9, yb - h2 * .65, w2 * .8, h2 * .1, w2 * .3); g.fill(); A.rr(g, x - w2 * 1.9, yb - h2 * .8, w2 * .5, h2 * .25, w2 * .25); g.fill(); A.rr(g, x + w2 * .5, yb - h2 * .5, w2 * 1.4, h2 * .1, w2 * .3); g.fill(); A.rr(g, x + w2 * 1.4, yb - h2 * .7, w2 * .5, h2 * .3, w2 * .25); g.fill();
    } else {
      var pw = o.w * s * .6, ph = o.h * s * .8; g.fillStyle = '#5b3a29'; g.fillRect(x - pw * .08, yb - ph * .15, pw * .16, ph * .15);
      for (var k = 0; k < 3; k++) { var ty = yb - ph * (.12 + k * .27), bw2 = pw * (1 - k * .25); g.fillStyle = '#1f6b46'; g.beginPath(); g.moveTo(x - bw2 / 2, ty); g.lineTo(x, ty - ph * .38); g.lineTo(x + bw2 / 2, ty); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x - bw2 * .22, ty - ph * .38 * .6); g.lineTo(x, ty - ph * .38); g.lineTo(x + bw2 * .22, ty - ph * .38 * .6); g.closePath(); g.fill(); }
    }
    g.restore();
  }
  function drawItem(g, o, cx, tm) {
    var s = K / o.z, x = px(o.x, o.z, cx), yb = py(0, o.z); if (o.z < .8 || x < -200 || x > W + 200) return;
    g.save(); g.globalAlpha = Math.min(1, (44 - o.z) / 8);
    if (o.k === 'car') carRear(g, x, yb, s, o.col, { truck: o.truck, w: o.truck ? .95 : .82, brake: o.vo < 8 });
    else if (o.k === 'barrier') { var bw = .9 * s, bh = .36 * s; g.fillStyle = C.snow; g.fillRect(x - bw / 2, yb - bh, bw, bh); g.fillStyle = C.fire; for (var i = 0; i < 6; i += 2) g.fillRect(x - bw / 2 + bw * i / 6, yb - bh, bw / 6, bh); g.strokeStyle = C.ink; g.lineWidth = Math.max(1.5, s * .025); g.strokeRect(x - bw / 2, yb - bh, bw, bh); g.fillStyle = C.ink; g.fillRect(x - bw / 2 + bw * .08, yb - bh * .1, bw * .1, bh * .1 + 2); g.fillRect(x + bw / 2 - bw * .18, yb - bh * .1, bw * .1, bh * .1 + 2); }
    else if (o.k === 'cone') { var cw = .34 * s, ch = .5 * s; g.fillStyle = C.fire; g.strokeStyle = C.ink; g.lineWidth = Math.max(1.5, s * .02); g.beginPath(); g.moveTo(x - cw / 2, yb); g.lineTo(x - cw * .12, yb - ch); g.lineTo(x + cw * .12, yb - ch); g.lineTo(x + cw / 2, yb); g.closePath(); g.fill(); g.stroke(); g.fillStyle = C.snow; g.fillRect(x - cw * .3, yb - ch * .55, cw * .6, ch * .16); g.fillStyle = C.fire; g.fillRect(x - cw * .56, yb - ch * .06, cw * 1.12, ch * .1); }
    else if (o.k === 'coin') { var cy = yb - .5 * s, r = .21 * s, sq = Math.abs(Math.cos(tm * 4 + o.z)); g.shadowColor = C.gold; g.shadowBlur = 12; g.fillStyle = C.gold; g.strokeStyle = '#b8860b'; g.lineWidth = Math.max(1.5, s * .03); g.beginPath(); g.ellipse(x, cy, Math.max(2, r * (.25 + .75 * sq)), r, 0, 0, 7); g.fill(); g.stroke(); g.shadowBlur = 0; g.fillStyle = '#b8860b'; g.font = '900 ' + Math.max(8, r * 1.1) + 'px Impact,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; if (sq > .6) g.fillText('$', x, cy + 1); }
    else if (o.k === 'boost') { var z1 = o.z + .9, zz = o.z; flatQuad(g, o.x - .4, o.x + .4, zz, z1, cx, 'rgba(52,245,139,.35)'); g.strokeStyle = '#34F58B'; g.lineWidth = Math.max(2, s * .06); g.lineCap = 'round'; for (var j = 0; j < 2; j++) { var za = zz + .15 + j * .35, zb = za + .2; g.beginPath(); g.moveTo(px(o.x - .25, za, cx), py(0, za)); g.lineTo(px(o.x, zb, cx), py(0, zb)); g.lineTo(px(o.x + .25, za, cx), py(0, za)); g.stroke(); } }
    g.restore();
  }
  function scene(g, o) {
    var th = o.th, cx = o.cx, sk = g.createLinearGradient(0, 0, 0, VPY); sk.addColorStop(0, th.sky[0]); sk.addColorStop(1, th.sky[1]); g.fillStyle = sk; g.fillRect(0, 0, W, VPY + 2);
    /* skyline / dunes / peaks */
    g.fillStyle = th.dec === 'building' ? '#240a45' : th.dec === 'cactus' ? '#c6703a' : '#9fb8d6';
    g.beginPath(); g.moveTo(0, VPY); for (var x = 0; x <= W; x += 16) { var n = Math.sin((x + cx * 40) * .021) + Math.sin((x + cx * 40) * .067 + 2); var hh = th.dec === 'building' ? (Math.floor((x + Math.floor(cx * 40)) / 48) % 5) * 12 + 22 : th.dec === 'cactus' ? 30 + n * 14 : 40 + Math.abs(n) * 40; g.lineTo(x, VPY - hh); } g.lineTo(W, VPY); g.fill();
    if (th.dec === 'cactus') { g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(560 - cx * 15, VPY - 28, 62, Math.PI, 0); g.fill(); }
    g.fillStyle = th.ground; g.fillRect(0, VPY, W, H - VPY);
    /* road: strips alternate for a sense of speed */
    var base = o.trav % 6, i;
    for (i = 0; i < 16; i++) {
      var z0 = Math.max(.9, 3 * i - base), z1 = 3 * (i + 1) - base; if (z1 <= .9) continue;
      flatQuad(g, -2, 2, z0, z1, cx, i % 2 ? th.road : shade(th.road, 14));
      flatQuad(g, -2.2, -2, z0, z1, cx, i % 2 ? '#d33' : C.snow); flatQuad(g, 2, 2.2, z0, z1, cx, i % 2 ? '#d33' : C.snow);
      if (i % 2 === 0) [-1, 0, 1].forEach(function (lx) { flatQuad(g, lx - .035, lx + .035, z0, z1 - 1, cx, 'rgba(255,255,255,.85)'); });
    }
    var list = o.dec.concat(o.objs).sort(function (a, b) { return b.z - a.z; });
    list.forEach(function (ob) { if (ob.dec) drawDecor(g, ob, cx, th, o.t); else drawItem(g, ob, cx, o.t); });
    /* player car */
    var carx = px(o.carX, CZ, cx), spin = o.spin > 0 ? (1 - o.spin / .9) * Math.PI * 2 : 0, bounce = o.spin > 0 ? Math.sin((1 - o.spin / .9) * Math.PI) * 40 : 0;
    if (o.boost > 0) { g.fillStyle = 'rgba(255,200,60,.85)'; g.beginPath(); g.moveTo(carx - 14, py(0, CZ) - 20); g.lineTo(carx, py(0, CZ) + 25 + Math.random() * 20); g.lineTo(carx + 14, py(0, CZ) - 20); g.fill(); }
    g.save(); g.translate(carx, py(0, CZ) - 42 - bounce); g.rotate(spin + o.lean * .12); g.translate(-carx, -(py(0, CZ) - 42)); if (o.blink) g.globalAlpha = Math.floor(o.t * 16) % 2 ? .3 : 1;
    carRear(g, carx, py(0, CZ) - 0, SC, '#e63946', { spoiler: true, stripe: true, brake: false, w: .86 }); g.restore();
    if (o.boost > 0) { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; for (i = 0; i < 16; i++) { var xx = (i * 97 + o.t * 1500) % W, yy = 190 + (i * 53) % 250; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx - 8, yy + 50); g.stroke(); } }
  }
  function shade(hex, d) { var n = parseInt(hex.slice(1), 16), r = Math.min(255, (n >> 16) + d), gg = Math.min(255, ((n >> 8) & 255) + d), b = Math.min(255, (n & 255) + d); return 'rgb(' + r + ',' + gg + ',' + b + ')'; }

  /* ---------- logic ---------- */
  function nearestLane(x) { var b = 0; LANES.forEach(function (l, i) { if (Math.abs(l - x) < Math.abs(LANES[b] - x)) b = i; }); return b; }
  function freeLane(lane, z) { return !S.obj.some(function (o) { return o.lane === lane && Math.abs(o.z - z) < 7; }); }
  function spawnRow(prog, v) {
    var z = 44, nHaz = prog > .45 && Math.random() < .5 ? 2 : 1, lanes = [0, 1, 2, 3].sort(function () { return Math.random() - .5; }), placed = 0;
    for (var i = 0; i < 4; i++) {
      var ln = lanes[i]; if (!freeLane(ln, z)) continue; var x = LANES[ln];
      if (placed < nHaz) {
        var r = Math.random(); placed++;
        if (r < .5) S.obj.push({ k: 'car', lane: ln, x: x, z: z, vo: A.rnd(7, 12), col: A.pick(CARCOL), truck: Math.random() < .2, w: .85, len: .8, done: false, passed: false });
        else if (r < .8) S.obj.push({ k: 'barrier', lane: ln, x: x, z: z, vo: 0, w: .9, len: .5, done: false });
        else { S.obj.push({ k: 'cone', lane: ln, x: x - .22, z: z, vo: 0, w: .34, len: .4, done: false }); S.obj.push({ k: 'cone', lane: ln, x: x + .22, z: z, vo: 0, w: .34, len: .4, done: false }); }
      } else if (placed >= nHaz && Math.random() < .42) {
        var n = 3 + Math.floor(Math.random() * 3); for (var c = 0; c < n; c++) S.obj.push({ k: 'coin', lane: ln, x: x, z: z + c * 1.7, vo: 0, w: .4, len: .3, done: false });
        break;
      }
    }
    if (Math.random() < .09) { var bl = Math.floor(Math.random() * 4); if (freeLane(bl, z + 5)) S.obj.push({ k: 'boost', lane: bl, x: LANES[bl], z: z + 5, vo: 0, w: .8, len: .6, done: false }); }
  }
  function spawnDecor(th) {
    [-1, 1].forEach(function (sd) {
      var d = th.dec, x = sd * A.rnd(2.7, 4.6); S.dec.push({ dec: d, x: x, z: 44, w: A.rnd(1, 1.8), h: A.rnd(1.6, 4.2), col: A.pick(['#24124a', '#1b1040', '#33175e', '#2a1a55']), neon: A.pick(['#ff2fd6', '#29E3FF', '#FFD21F']), seed: Math.floor(Math.random() * 9) });
    });
  }
  function crash(api, what) {
    if (S.inv > 0) return; api.lives--; S.inv = 1.8; S.spin = .9; S.slow = 1; S.shakeT = .5; S.combo = 0; api.sfx('boom'); api.banner('CRASH!', 1, C.fire);
    api.fx.burst(VPX + S.carX * 100, 380, [C.fire, C.gold, C.snow, '#777'], 34, 300); api.fx.ring(VPX, 380, C.fire, 100);
    if (api.lives <= 0) api.end('WRECKED!', 'Crashed into ' + what + ' after ' + Math.round(S.dist) + ' m. ' + S.coins + ' coins.', false);
  }
  function setTarget(x) { S.tx = A.clamp(x, -1.6, 1.6); }

  A.register({
    id: 'racer', title: 'Racing Car', color: '#FF3D5A', W: W, H: H,
    desc: 'Touch racing challenge. Swipe or drag to switch lanes, dodge traffic, collect coins and race through three tracks.',
    how: '<ul><li>Swipe left or right to change lane, or drag the car with your finger. A tap on a lane also moves you there.</li><li>Grab coins, hit green boost pads for speed, and squeeze past traffic for near-miss bonus points.</li><li>Cars, barriers and cones cost a life, you have 3. The race gets faster as you go.</li><li>Drive 8000 m through City Night, Desert Sunset and Snow Peaks to win.</li></ul>',
    reset: function (api) {
      S = { ph: 'cd', cd: 4, go: 0, obj: [], dec: [], carX: -.5, tx: -.5, cx: 0, lean: 0, trav: 0, dist: 0, sacc: 0, spawn: 1.2, decT: 0, boost: 0, slow: 0, inv: 0, spin: 0, coins: 0, combo: 0, near: 0, th: THEMES[0], thIdx: 0, down: false, sx: 0, st: 0, lane0: 1, dragged: false, shakeT: 0, flash: 0, t: 0, v: 14 };
      for (var i = 0; i < 12; i++) S.dec.push({ dec: 'building', x: (i % 2 ? 1 : -1) * A.rnd(2.8, 4.5), z: 4 + i * 3.5, w: A.rnd(1, 1.8), h: A.rnd(1.6, 4.2), col: '#24124a', neon: A.pick(['#ff2fd6', '#29E3FF', '#FFD21F']), seed: i });
      api.lives = 3; api.info = 'SWIPE OR DRAG TO CHANGE LANES';
    },
    update: function (dt, api) {
      S.t += dt; S.go = Math.max(0, S.go - dt); S.inv = Math.max(0, S.inv - dt); S.spin = Math.max(0, S.spin - dt); S.shakeT = Math.max(0, S.shakeT - dt); S.boost = Math.max(0, S.boost - dt); S.slow = Math.max(0, S.slow - dt * 1.1); S.flash = Math.max(0, S.flash - dt); S.near = Math.max(0, S.near - dt);
      var prog = A.clamp(S.dist / GOAL, 0, 1), v = (14 + 17 * prog) * (S.boost > 0 ? 1.5 : 1) * (1 - .5 * S.slow);
      if (S.ph === 'cd') { S.cd -= dt; v = 8; if (S.cd <= 0) { S.ph = 'play'; S.go = .6; api.sfx('coin'); } }
      S.v = v;
      var old = S.carX; S.carX += (S.tx - S.carX) * Math.min(1, dt * 11); S.lean += ((S.tx - S.carX) * 1.2 - S.lean) * Math.min(1, dt * 10); S.cx += (S.carX * .3 - S.cx) * Math.min(1, dt * 6);
      S.trav += v * dt; S.decT -= dt; if (S.decT <= 0) { spawnDecor(S.th); S.decT = .22 + .1 * Math.random(); }
      var i, o;
      for (i = S.dec.length - 1; i >= 0; i--) { S.dec[i].z -= v * dt; if (S.dec[i].z < .7) S.dec.splice(i, 1); }
      if (S.ph === 'play') {
        S.dist += v * dt * 7.5; S.sacc += v * dt * .8; if (S.sacc >= 1) { var n = Math.floor(S.sacc); api.add(n); S.sacc -= n; }
        var ti = Math.min(2, Math.floor(S.dist / (GOAL / 3))); if (ti !== S.thIdx) { S.thIdx = ti; S.th = THEMES[ti]; S.flash = .6; api.banner('ENTERING ' + S.th.name, 1.6, S.th.glow); api.sfx('win'); }
        S.spawn -= dt; if (S.spawn <= 0) { spawnRow(prog, v); S.spawn = (1.05 - .5 * prog) * A.rnd(.8, 1.2); }
        if (S.dist >= GOAL) { api.add(api.lives * 300 + S.coins * 5); api.end('FINISH LINE!', Math.round(S.dist) + ' m, ' + S.coins + ' coins', true); return; }
        api.info = 'KM/H ' + Math.round(v * 6) + '  COINS ' + S.coins + '  DIST ' + Math.min(GOAL, Math.round(S.dist)) + '/' + GOAL + ' m';
      }
      for (i = S.obj.length - 1; i >= 0; i--) {
        o = S.obj[i]; var zp = o.z, rel = v - o.vo; o.z -= rel * dt;
        if (S.ph === 'play' && !o.done) {
          var lo = Math.min(zp, o.z), hi = Math.max(zp, o.z), half = (o.len || .5) / 2 + .35, dx = Math.abs(o.x - S.carX);
          if (hi >= CZ - half && lo <= CZ + half) {
            if (o.k === 'coin') { if (dx < .6) { o.done = true; S.coins++; S.combo++; api.add(20); api.fx.pop('+20', VPX + (o.x - S.cx) * SC, 330, C.gold); api.sfx('coin'); S.obj.splice(i, 1); continue; } }
            else if (o.k === 'boost') { if (dx < .55) { o.done = true; S.boost = 2.2; api.add(50); api.banner('BOOST!', .8, '#34F58B'); api.sfx('win'); } }
            else if (dx < (o.w + .84) / 2 - .06) { o.done = true; crash(api, o.k === 'car' ? 'traffic' : o.k === 'barrier' ? 'a barrier' : 'cones'); if (api.lives <= 0) return; }
          }
          if (o.k === 'car' && !o.passed && o.z < CZ - half - .1) { o.passed = true; if (dx < (o.w + .84) / 2 + .42 && dx >= (o.w + .84) / 2 - .06 && S.inv <= 0) { api.add(50); S.near = .8; api.fx.pop('NEAR MISS +50', VPX + (S.carX - S.cx) * SC, 300, C.hot); api.sfx('good', 160); } }
        }
        if (o.z < .6) S.obj.splice(i, 1);
      }
    },
    draw: function (g) {
      g.save(); if (S.shakeT > 0) g.translate(Math.sin(S.t * 90) * 7 * S.shakeT, Math.cos(S.t * 80) * 4 * S.shakeT);
      scene(g, { th: S.th, cx: S.cx, trav: S.trav, objs: S.obj, dec: S.dec, carX: S.carX, lean: S.lean, spin: S.spin, boost: S.boost, blink: S.inv > 0 && S.spin <= 0, t: S.t });
      g.restore();
      if (S.flash > 0) { g.fillStyle = 'rgba(255,255,255,' + S.flash * .8 + ')'; g.fillRect(0, 0, W, H); }
      g.fillStyle = 'rgba(0,0,0,.4)'; A.rr(g, 150, 14, 500, 12, 6); g.fill(); g.fillStyle = S.th.glow; A.rr(g, 150, 14, Math.max(8, 500 * A.clamp(S.dist / GOAL, 0, 1)), 12, 6); g.fill();
      if (S.ph === 'play') A.txt(g, Math.round(S.v * 6) + ' KM/H', 20, 46, 26, C.snow, 'left');
      A.drawCD(g, W, H, S.ph === 'cd' ? Math.min(3, S.cd) : 0, S.go);
      if (S.ph === 'cd') { A.txt(g, S.th.name, W / 2, 62, 40, S.th.glow); A.txt(g, 'SWIPE OR DRAG LEFT / RIGHT TO CHANGE LANES', W / 2, 410, 24, C.snow); var u = (S.t * .7) % 1, hx = 400 + Math.sin(u * 6.283) * 200; g.globalAlpha = .85; g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(hx, 330, 34, 0, 7); g.fill(); g.strokeStyle = C.snow; g.lineWidth = 5; g.stroke(); g.globalAlpha = 1; }
    },
    pointer: {
      down: function (p) { if (!p) return; S.down = true; S.sx = p.x; S.st = S.t; S.dragged = false; S.lane0 = nearestLane(S.tx); },
      move: function (p) { if (!S.down || !p) return; if (Math.abs(p.x - S.sx) > 22) S.dragged = true; if (S.dragged) setTarget((p.x - VPX) / (SC * .7)); },
      up: function (p) {
        if (!S || !S.down) return; S.down = false; if (!p) return; var dx = p.x - S.sx;
        if (S.dragged && S.t - S.st < .35 && Math.abs(dx) > 45) setTarget(LANES[A.clamp(S.lane0 + (dx > 0 ? 1 : -1), 0, 3)]);
        else if (!S.dragged) setTarget(LANES[nearestLane((p.x - VPX) / (SC * .7))]);
      }
    },
    _state: function () { return S; },
    preview: function (g, t, w, h) {
      var th = THEMES[Math.floor(t / 3) % 3], objs = [], dec = [], trav = t * 16;
      for (var i = 0; i < 6; i++) { var z = 40 - ((t * 10 + i * 7) % 40) + 1; objs.push({ k: i % 3 === 2 ? 'coin' : 'car', x: LANES[(i * 3 + Math.floor((t * 10 + i * 7) / 40)) % 4], z: z, vo: 9, col: CARCOL[i % 6], w: .85, len: .8 }); }
      for (i = 0; i < 8; i++) dec.push({ dec: th.dec, x: (i % 2 ? 1 : -1) * 3.4, z: 40 - ((t * 16 + i * 5) % 40) + 1, w: 1.4, h: 3, col: '#24124a', neon: '#ff2fd6', seed: i });
      g.save(); g.scale(w / W, h / H); scene(g, { th: th, cx: 0, trav: trav, objs: objs, dec: dec, carX: Math.sin(t * 1.3) * 1.2, lean: Math.cos(t * 1.3) * .5, spin: 0, boost: 0, blink: false, t: t }); g.restore();
    }
  });
})();
