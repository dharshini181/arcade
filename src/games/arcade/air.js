/* Game 9: Air Racer. Drag to steer a plane through floating rings, grab stars, dodge rocks and towers. Pseudo-3D, fly 7000 m to win. */
(function () {
  'use strict';
  var A = window.Arcade, C = A.C, W = 800, H = 450, VPX = 400, VPY = 190, K = 330, CY = .394, GY = -1.6, GOAL = 7000, SKY = '#46C8FF', S;

  function proj(x, y, z, cx) { var s = K / z; return { x: VPX + (x - cx) * s, y: VPY - (y - CY) * s, s: s }; }
  function star(g, r) { g.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); }

  /* ---------- drawing (shared by the game and the hub preview) ---------- */
  function drawObj(g, o, cx, tm) {
    var p = proj(o.x, o.y, o.z, cx), s = p.s, al = o.z < 1 ? Math.max(0, (o.z - .45) / .55) : 1;
    if (p.x < -400 || p.x > W + 400 || al <= 0) return;
    g.save(); g.globalAlpha = al * Math.min(1, (46 - o.z) / 8);
    if (o.k === 'ring' || o.k === 'bonus' || o.k === 'boost') {
      var r = o.r * s, col = o.k === 'bonus' ? C.gold : o.k === 'boost' ? '#34F58B' : C.hot, w = Math.max(3, r * .16);
      g.shadowColor = col; g.shadowBlur = 16; g.lineWidth = w; g.strokeStyle = col; g.beginPath(); g.arc(p.x, p.y, r, 0, 7); g.stroke(); g.shadowBlur = 0;
      g.lineWidth = Math.max(1.5, w * .35); g.strokeStyle = C.snow; g.beginPath(); g.arc(p.x, p.y, r, -2.6, -1.2); g.stroke();
      g.strokeStyle = o.k === 'ring' ? C.gold : C.snow; g.lineWidth = Math.max(2, w * .5); g.setLineDash([r * .35, r * .35]); g.lineDashOffset = -tm * 20; g.beginPath(); g.arc(p.x, p.y, Math.max(.1, r - w * .9), 0, 7); g.stroke(); g.setLineDash([]);
      if (o.k === 'bonus') { g.translate(p.x, p.y); g.fillStyle = C.gold; g.strokeStyle = C.ink; g.lineWidth = Math.max(1, r * .05); star(g, r * .42); g.fill(); g.stroke(); }
      if (o.k === 'boost') { g.translate(p.x, p.y); g.strokeStyle = '#34F58B'; g.lineWidth = Math.max(2, r * .12); g.lineCap = 'round'; for (var i = -1; i <= 1; i += 2) { g.beginPath(); g.moveTo(-r * .3, i * r * .22 + r * .1); g.lineTo(0, i * r * .22 - r * .15); g.lineTo(r * .3, i * r * .22 + r * .1); g.stroke(); } }
    } else if (o.k === 'star') {
      g.translate(p.x, p.y); g.rotate(tm * 2 + o.z); g.shadowColor = C.gold; g.shadowBlur = 12; g.fillStyle = C.gold; g.strokeStyle = C.ink; g.lineWidth = Math.max(1.5, s * .02); star(g, .17 * s); g.fill(); g.stroke();
    } else if (o.k === 'rock') {
      var rr = o.r * s; g.translate(p.x, p.y); var gr = g.createRadialGradient(-rr * .3, -rr * .3, rr * .1, 0, 0, rr); gr.addColorStop(0, '#8a6fb0'); gr.addColorStop(1, '#2e1a4d');
      g.fillStyle = gr; g.strokeStyle = C.ink; g.lineWidth = Math.max(2, rr * .08); g.beginPath(); for (var j = 0; j < 9; j++) { var a = j * .698 + o.ph, q = rr * (.86 + .16 * Math.sin(j * 2.7 + o.ph * 3)); g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(-rr * .4, -rr * .1); g.lineTo(-rr * .1, rr * .2); g.moveTo(rr * .2, -rr * .4); g.lineTo(rr * .4, 0); g.stroke();
      g.fillStyle = C.fire; g.beginPath(); g.arc(0, -rr * 1.05, Math.max(2, rr * .1), 0, 7); g.fill();
    } else if (o.k === 'tower') {
      var t = proj(o.x, o.top, o.z, cx), b = proj(o.x, GY, o.z, cx), hw = .2 * s;
      var tg = g.createLinearGradient(t.x - hw, 0, t.x + hw, 0); tg.addColorStop(0, '#b33'); tg.addColorStop(.5, '#fff'); tg.addColorStop(1, '#b33'); g.fillStyle = tg; g.strokeStyle = C.ink; g.lineWidth = Math.max(2, s * .02);
      g.fillRect(t.x - hw, t.y, hw * 2, b.y - t.y); g.strokeRect(t.x - hw, t.y, hw * 2, b.y - t.y); g.fillStyle = C.fire;
      for (var k = 0; k < 6; k++) { var yy = t.y + (b.y - t.y) * (k / 6); if (yy > H + 40) break; g.fillRect(t.x - hw, yy, hw * 2, (b.y - t.y) / 12); }
      g.fillStyle = Math.floor(tm * 4) % 2 ? C.fire : C.gold; g.beginPath(); g.arc(t.x, t.y - hw * .5, hw * .5, 0, 7); g.fill(); g.stroke();
    } else if (o.k === 'cloud') {
      var cr = o.r * s; g.fillStyle = 'rgba(255,255,255,.92)'; [[0, 0, 1], [-.9, .2, .7], [.9, .25, .75], [.35, -.3, .7], [-.4, -.25, .6]].forEach(function (q) { g.beginPath(); g.arc(p.x + q[0] * cr, p.y + q[1] * cr, q[2] * cr, 0, 7); g.fill(); });
    } else if (o.k === 'peak') {
      var base = proj(o.x, GY, o.z, cx), top = proj(o.x, GY + o.h, o.z, cx), bw = o.r * s; g.fillStyle = o.col; g.beginPath(); g.moveTo(base.x - bw, base.y); g.lineTo(top.x, top.y); g.lineTo(base.x + bw, base.y); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.moveTo(top.x, top.y); g.lineTo(top.x - bw * .28, top.y + (base.y - top.y) * .28); g.lineTo(top.x + bw * .28, top.y + (base.y - top.y) * .28); g.closePath(); g.fill();
    }
    g.restore();
  }
  function drawPlane(g, x, y, roll, flash, boost, tm) {
    g.save(); g.translate(x, y); g.scale(1.25, 1.25); g.rotate(roll); if (flash) g.globalAlpha = Math.floor(tm * 18) % 2 ? .35 : 1;
    if (boost) { g.fillStyle = 'rgba(255,200,60,.8)'; g.beginPath(); g.moveTo(-12, 22); g.lineTo(0, 70 + Math.random() * 20); g.lineTo(12, 22); g.fill(); }
    g.strokeStyle = C.ink; g.lineWidth = 3.5; g.lineJoin = 'round';
    g.fillStyle = '#ff7a1a'; g.beginPath(); g.moveTo(0, -4); g.lineTo(70, 22); g.lineTo(60, 32); g.lineTo(0, 22); g.lineTo(-60, 32); g.lineTo(-70, 22); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = C.snow; g.beginPath(); g.moveTo(0, -34); g.quadraticCurveTo(22, -10, 15, 36); g.lineTo(-15, 36); g.quadraticCurveTo(-22, -10, 0, -34); g.fill(); g.stroke();
    g.fillStyle = '#29E3FF'; g.beginPath(); g.ellipse(0, -9, 7, 12, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = C.hot; g.beginPath(); g.moveTo(0, 18); g.lineTo(0, -4); g.lineTo(4, 30); g.closePath(); g.beginPath(); g.moveTo(-5, 30); g.lineTo(0, 4); g.lineTo(5, 30); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function scene(g, o) {
    var cx = o.cx, sk = g.createLinearGradient(0, 0, 0, VPY + 10); sk.addColorStop(0, '#2b7fd6'); sk.addColorStop(1, '#bfeaff'); g.fillStyle = sk; g.fillRect(0, 0, W, VPY + 10);
    g.fillStyle = '#fff6c9'; g.beginPath(); g.arc(640 - cx * 20, 70, 36, 0, 7); g.fill(); g.fillStyle = 'rgba(255,246,201,.3)'; g.beginPath(); g.arc(640 - cx * 20, 70, 58, 0, 7); g.fill();
    [['#7ba3d8', .45, 70, 0], ['#5a86c4', .75, 50, 2]].forEach(function (L, li) { g.fillStyle = L[0]; g.beginPath(); g.moveTo(0, VPY + 4); for (var x = 0; x <= W; x += 20) g.lineTo(x, VPY - L[2] * (.5 + .5 * Math.sin((x + cx * 60 * L[1]) * .012 + L[3])) * (.6 + .4 * Math.sin(x * .031 + li))); g.lineTo(W, VPY + 4); g.fill(); });
    var gg = g.createLinearGradient(0, VPY, 0, H); gg.addColorStop(0, '#6fd26a'); gg.addColorStop(1, '#2e8f4a'); g.fillStyle = gg; g.fillRect(0, VPY, W, H - VPY);
    var base = o.trav % 8; for (var j = 0; j < 14; j++) { if (j % 2) continue; var z0 = Math.max(1, 4 * j - base), z1 = 4 * (j + 1) - base; if (z1 <= 1) continue; var y0 = VPY + (CY - GY) * K / z1, y1 = VPY + (CY - GY) * K / z0; g.fillStyle = 'rgba(0,60,20,.12)'; g.fillRect(0, y0, W, y1 - y0); }
    var list = o.objs.slice().sort(function (a, b) { return b.z - a.z; }); list.forEach(function (ob) { drawObj(g, ob, cx, o.t); });
    if (o.boost > 0) { g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; for (var i = 0; i < 22; i++) { var a = i * 2.4 + Math.floor(o.t * 20) * .7, d1 = 90 + (i * 53 + o.t * 900) % 360, d2 = d1 + 70; g.beginPath(); g.moveTo(VPX + Math.cos(a) * d1, VPY + 60 + Math.sin(a) * d1 * .7); g.lineTo(VPX + Math.cos(a) * d2, VPY + 60 + Math.sin(a) * d2 * .7); g.stroke(); } }
    var pp = proj(o.px, o.py, 1, cx); drawPlane(g, pp.x, pp.y, o.roll, o.flash, o.boost > 0, o.t);
  }

  /* ---------- game logic ---------- */
  function mult(c) { return Math.min(5, 1 + Math.floor(c / 3)); }
  function pattern(prog) {
    var r = Math.random(), z = 46, rx = A.rnd(-1.05, 1.05), ry = A.rnd(-.3, .5), id = S.id++;
    function add(k, x, y, zz, extra) { var ob = { k: k, x: x, y: y, z: zz, r: .38, done: false, ph: Math.random() * 6 }; for (var q in extra) ob[q] = extra[q]; S.obj.push(ob); return ob; }
    var danger = .22 + .38 * prog;
    if (r < .1) { add('boost', rx, ry, z, { r: .42 }); }
    else if (r < .2) { add('bonus', rx, ry, z, { r: .36 }); for (var i = 0; i < 3; i++) add('star', rx + Math.sin(i) * .5, ry + i * .15, z + 3 + i * 2); }
    else if (r < .2 + danger) {
      add('ring', rx, ry, z);
      var n = 1 + (prog > .35 ? 1 : 0) + (prog > .7 ? 1 : 0);
      for (i = 0; i < n; i++) { var ox = rx + (Math.random() < .5 ? -1 : 1) * A.rnd(.85, 1.5); ox = A.clamp(ox, -1.5, 1.5); if (Math.random() < .5) add('rock', ox, A.rnd(-.35, .6), z + A.rnd(-1, 1), { r: .24 }); else add('tower', ox, 0, z + A.rnd(-1, 1), { top: A.rnd(-.2, .55) }); }
    } else {
      add('ring', rx, ry, z); for (i = 0; i < 4; i++) add('star', rx + Math.sin(i * 1.1) * .45, ry + Math.cos(i * 1.1) * .2 + .1, z + 3 + i * 2.2);
    }
  }
  function scenery(prog) {
    if (Math.random() < .8) S.obj.push({ k: 'cloud', x: (Math.random() < .5 ? -1 : 1) * A.rnd(1.8, 6), y: A.rnd(.5, 1.6), z: 46, r: A.rnd(.6, 1.1), ph: 0 });
    if (Math.random() < .55) S.obj.push({ k: 'peak', x: (Math.random() < .5 ? -1 : 1) * A.rnd(2.6, 7), y: 0, z: 46, r: A.rnd(1.6, 2.8), h: A.rnd(1.4, 3), col: A.pick(['#4b6b8c', '#5d4b8c', '#3b7a63']), ph: 0 });
  }
  function crash(api, what) {
    if (S.inv > 0) return; api.lives--; S.inv = 1.7; S.shakeT = .45; S.slow = 1; S.combo = 0; api.sfx('boom'); api.banner('CRASH!', 1, C.fire); api.fx.burst(400, 330, [C.fire, C.gold, C.snow, '#555'], 30, 280); api.fx.ring(400, 330, C.fire, 90);
    if (api.lives <= 0) api.end('CRASHED!', 'Hit a ' + what + ' after ' + Math.round(S.dist) + ' m. ' + S.stars + ' stars.', false);
  }
  function hit(ob, api) {
    var d = Math.hypot(S.px - ob.x, S.py - ob.y), sp = proj(ob.x, ob.y, 1, S.cx), px = 400 + (ob.x - S.cx) * K, py = VPY - (ob.y - CY) * K;
    if (ob.k === 'ring' || ob.k === 'bonus') {
      if (d <= ob.r * .86) { S.combo++; S.rings++; var m = mult(S.combo), pts = (ob.k === 'bonus' ? 300 : 100) * m; api.add(pts); api.fx.pop('+' + pts + (m > 1 ? ' x' + m : ''), px, py - 30, ob.k === 'bonus' ? C.gold : C.hot); api.fx.ring(px, py, ob.k === 'bonus' ? C.gold : C.hot, 90); api.fx.burst(px, py, [C.gold, C.snow, C.hot], 16, 220, 0); api.sfx('good', Math.min(S.combo, 10) * 40); }
      else { if (S.combo > 1) api.fx.pop('MISSED', px, py - 30, C.snow); S.combo = 0; api.sfx('tap', -250); }
    } else if (ob.k === 'star') { if (d <= .27) { S.stars++; api.add(25); api.fx.pop('+25', px, py - 24, C.gold); api.fx.burst(px, py, [C.gold, C.snow], 8, 160, 0); api.sfx('coin'); } }
    else if (ob.k === 'boost') { if (d <= ob.r * .9) { S.boost = 2.6; api.add(50); api.banner('BOOST!', .9, '#34F58B'); api.sfx('win'); api.fx.ring(px, py, '#34F58B', 100); } }
    else if (ob.k === 'rock') { if (d <= ob.r + .12) crash(api, 'rock'); }
    else if (ob.k === 'tower') { if (Math.abs(S.px - ob.x) <= .3 && S.py <= ob.top + .08) crash(api, 'tower'); }
  }

  A.register({
    id: 'air', title: 'Air Racer', color: '#46C8FF', W: W, H: H,
    desc: 'Flying ring challenge. Drag your finger to steer the plane through rings and stars, and dodge rocks and towers.',
    how: '<ul><li>Drag your finger anywhere on the screen. The plane follows it smoothly.</li><li>Fly through pink rings (gold bonus rings are worth triple) and grab stars. Rings in a row build a combo up to x5.</li><li>Green boost rings give a burst of speed. Rocks and striped towers cost a life, you have 3.</li><li>You speed up and obstacles get denser as you go. Reach 7000 m to finish the course.</li></ul>',
    reset: function (api) {
      S = { ph: 'cd', cd: 4, go: 0, obj: [], id: 0, px: 0, py: 0, tx: 0, ty: 0, cx: 0, roll: 0, trav: 0, nextAt: 14, dist: 0, sacc: 0, boost: 0, slow: 0, inv: 0, combo: 0, rings: 0, stars: 0, down: false, shakeT: 0, t: 0, demo: 0 };
      for (var i = 0; i < 6; i++) { S.obj.push({ k: 'cloud', x: (i % 2 ? 1 : -1) * A.rnd(1.8, 5), y: A.rnd(.5, 1.5), z: 6 + i * 7, r: A.rnd(.6, 1), ph: 0 }); }
      api.lives = 3; api.info = 'DRAG TO STEER';
    },
    update: function (dt, api) {
      S.t += dt; S.go = Math.max(0, S.go - dt); S.inv = Math.max(0, S.inv - dt); S.shakeT = Math.max(0, S.shakeT - dt); S.boost = Math.max(0, S.boost - dt); S.slow = Math.max(0, S.slow - dt * 1.2);
      var prog = A.clamp(S.dist / GOAL, 0, 1), v = (13 + 15 * prog) * (S.boost > 0 ? 1.6 : 1) * (1 - .45 * S.slow);
      if (S.ph === 'cd') { S.cd -= dt; S.demo += dt; v = 6; if (S.cd <= 0) { S.ph = 'play'; S.go = .6; api.sfx('coin'); } }
      /* the plane glides toward the finger */
      S.px += (S.tx - S.px) * Math.min(1, dt * 7.5); S.py += (S.ty - S.py) * Math.min(1, dt * 7.5); S.cx += (S.px * .45 - S.cx) * Math.min(1, dt * 5);
      S.roll += (A.clamp((S.tx - S.px) * 1.1, -.7, .7) - S.roll) * Math.min(1, dt * 9);
      S.trav += v * dt;
      if (S.ph === 'play') {
        S.dist += v * dt * 7; S.sacc += v * dt * 1.2; if (S.sacc >= 1) { var n = Math.floor(S.sacc); api.add(n); S.sacc -= n; }
        while (S.trav >= S.nextAt) { pattern(prog); scenery(prog); S.nextAt += Math.max(5.5, 10.5 - 5 * prog) * A.rnd(.85, 1.15); }
        if (S.dist >= GOAL) { api.add(api.lives * 300 + S.stars * 10); api.end('COURSE COMPLETE!', Math.round(S.dist) + ' m, ' + S.rings + ' rings, ' + S.stars + ' stars', true); return; }
        api.info = 'DIST ' + Math.min(GOAL, Math.round(S.dist)) + '/' + GOAL + ' m  STARS ' + S.stars + '  RINGS ' + S.rings + (S.combo > 1 ? '  x' + mult(S.combo) : '');
      }
      for (var i = S.obj.length - 1; i >= 0; i--) {
        var ob = S.obj[i], z0 = ob.z; ob.z -= v * dt;
        if (S.ph === 'play' && !ob.done && ob.k !== 'cloud' && ob.k !== 'peak' && z0 > 1 && ob.z <= 1) { ob.done = true; hit(ob, api); if (S.ph !== 'play' || api.lives <= 0) return; }
        if (ob.z < .4) S.obj.splice(i, 1);
      }
    },
    draw: function (g) {
      g.save(); if (S.shakeT > 0) g.translate(Math.sin(S.t * 90) * 7 * S.shakeT, Math.cos(S.t * 80) * 5 * S.shakeT);
      scene(g, { cx: S.cx, trav: S.trav, objs: S.obj, px: S.px, py: S.py, roll: S.roll, boost: S.boost, flash: S.inv > 0, t: S.t });
      g.restore();
      /* progress bar */
      g.fillStyle = 'rgba(0,0,0,.4)'; A.rr(g, 150, 14, 500, 12, 6); g.fill(); g.fillStyle = C.gold; A.rr(g, 150, 14, Math.max(8, 500 * A.clamp(S.dist / GOAL, 0, 1)), 12, 6); g.fill();
      A.drawCD(g, W, H, S.ph === 'cd' ? Math.min(3, S.cd) : 0, S.go);
      if (S.ph === 'cd') {
        var u = (S.demo * .6) % 1, hx = 400 + Math.sin(u * 6.283) * 220, hy = 300 - Math.sin(u * 6.283 * 2) * 60;
        g.globalAlpha = .9; g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(hx, hy, 36, 0, 7); g.fill(); g.strokeStyle = C.snow; g.lineWidth = 5; g.stroke(); g.fillStyle = C.snow; g.beginPath(); g.arc(hx, hy, 12, 0, 7); g.fill(); g.globalAlpha = 1;
        A.txt(g, 'DRAG TO STEER', W / 2, 62, 46, C.snow); A.txt(g, 'FLY THROUGH RINGS  •  GRAB STARS  •  AVOID ROCKS AND TOWERS', W / 2, 405, 22, C.gold);
      }
    },
    pointer: {
      down: function (p) { if (!p) return; S.down = true; steer(p); },
      move: function (p) { if (!S.down || !p) return; steer(p); },
      up: function () { if (S) S.down = false; }
    },
    _state: function () { return S; },
    preview: function (g, t, w, h) {
      g.save(); g.scale(w / W, h / H); var objs = [], trav = t * 14;
      for (var i = 0; i < 5; i++) { var z = 40 - ((t * 9 + i * 8) % 40) + 1; objs.push({ k: i % 3 === 2 ? 'rock' : 'ring', x: Math.sin(i * 2.1 + Math.floor((t * 9 + i * 8) / 40)) * .9, y: .1 + Math.cos(i * 1.7) * .25, z: z, r: i % 3 === 2 ? .24 : .38, ph: i }); objs.push({ k: 'star', x: Math.sin(i * 2.1) * .9 + .3, y: .3, z: z + 2, ph: i }); }
      objs.push({ k: 'cloud', x: -3, y: 1, z: 20 + (t * 3) % 20, r: .8 }, { k: 'peak', x: 5, y: 0, z: 25, r: 2.4, h: 2.4, col: '#5d4b8c' });
      scene(g, { cx: Math.sin(t) * .3, trav: trav, objs: objs, px: Math.sin(t) * .6, py: Math.cos(t * 1.3) * .12, roll: Math.cos(t) * .35, boost: 0, flash: false, t: t }); g.restore();
    }
  });
  function steer(p) { S.tx = A.clamp((p.x - VPX) / (K * .55), -1.4, 1.4); S.ty = A.clamp(CY + (VPY - p.y) / K, -.55, .78); }
})();
