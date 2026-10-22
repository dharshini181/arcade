/* Game 5: Galax Space Shooter. Four enemy waves, drifting asteroids, power-ups and a final boss wave. */
(function () {
  'use strict';
  var A = window.Arcade, C = A.C, W = 360, H = 480, MARGIN = 20, WAVES = 5, GX = 40, GY = 32, MINY = H - 170, MAXY = H - 40;
  var LAYOUTS = [[3, 6], [4, 6], [4, 7], [5, 7]], ECOL = [C.mag, C.hot, C.deep, C.fire, C.hot], S;

  function layout(w) { return LAYOUTS[Math.min(w, LAYOUTS.length) - 1]; }
  function slot(w, row, col) { return { x: (W - (layout(w)[1] - 1) * GX) / 2 + col * GX, y: 70 + row * GY }; }
  function rowPoints(r) { return r === 0 ? 150 : r === 1 ? 100 : 50; }
  function spawnWave(w) {
    S.wave = w; S.en = []; S.es = []; S.fx = 0; S.fy = -180; S.fdir = 1; S.boss = null; S.wait = 0;
    if (w >= WAVES) { S.boss = { x: W / 2, y: -70, hp: 60, max: 60, dir: 1, t: 0, shoot: 2 }; S.total = 1; return; }
    var L = layout(w); for (var r = 0; r < L[0]; r++) for (var c = 0; c < L[1]; c++) S.en.push({ row: r, col: c, x: slot(w, r, c).x, y: -100, st: 'form', age: 0, x0: 0, dir: 1, hp: (r === 0 && w >= 2) ? 2 : 1 });
    S.total = S.en.length;
  }
  function drop(x, y, chance, api) {
    if (Math.random() > chance) return; var kinds = ['rapid', 'shield', 'heal']; S.pu.push({ x: x, y: y, kind: A.pick(kinds) });
  }
  function hurt(api) {
    if (S.inv > 0) return;
    if (S.shield > 0) { S.shield = 0; S.inv = .8; api.fx.ring(S.px, S.py, C.hot, 46); api.sfx('tap', 200); return; }
    api.lives--; S.inv = 1.8; api.fx.burst(S.px, S.py, [C.hot, C.fire, C.gold, C.snow], 22, 230); api.fx.ring(S.px, S.py, C.fire, 60); api.sfx('boom');
    if (api.lives <= 0) api.end('GAME OVER', 'Reached wave ' + S.wave + ' of ' + WAVES, false);
  }
  function explode(x, y, col, api, big) { api.fx.burst(x, y, [col, C.gold, C.snow], big ? 40 : 14, big ? 260 : 170); api.fx.ring(x, y, col, big ? 90 : 34); api.sfx('boom'); }

  function drawShip(g, x, y, t) {
    g.save(); g.translate(x, y); g.fillStyle = Math.floor(t * 30) % 2 ? C.gold : C.fire; g.beginPath(); g.moveTo(-5, 12); g.lineTo(0, 24 + Math.random() * 6); g.lineTo(5, 12); g.fill();
    g.strokeStyle = C.ink; g.lineWidth = 2.5; g.fillStyle = C.hot; g.beginPath(); g.moveTo(0, -20); g.lineTo(17, 14); g.lineTo(7, 9); g.lineTo(0, 14); g.lineTo(-7, 9); g.lineTo(-17, 14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = C.fire; g.beginPath(); g.moveTo(-17, 14); g.lineTo(-10, 4); g.lineTo(-7, 9); g.closePath(); g.moveTo(17, 14); g.lineTo(10, 4); g.lineTo(7, 9); g.closePath(); g.fill();
    g.fillStyle = C.gold; g.beginPath(); g.arc(0, -2, 4.5, 0, 7); g.fill(); g.stroke();
    if (S.shield > 0) { g.strokeStyle = C.hot; g.globalAlpha = .6 + Math.sin(t * 12) * .3; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 26, 0, 7); g.stroke(); g.globalAlpha = 1; }
    g.restore();
  }
  function drawEnemy(g, e, t) {
    g.save(); g.translate(e.x, e.y); var c = ECOL[e.row % 5], w = Math.sin(t * 10 + e.col) * 3, k = e.row % 3; g.fillStyle = c; g.strokeStyle = e.hp > 1 ? C.gold : C.ink; g.lineWidth = 2.5;
    if (k === 0) { g.beginPath(); g.moveTo(-12, 0); g.lineTo(-22, -8 + w); g.lineTo(-15, 7); g.moveTo(12, 0); g.lineTo(22, -8 + w); g.lineTo(15, 7); g.stroke(); g.beginPath(); g.ellipse(0, 0, 13, 10, 0, 0, 7); g.fill(); g.stroke(); g.strokeStyle = C.gold; g.beginPath(); g.moveTo(-4, -9); g.lineTo(-7, -15); g.moveTo(4, -9); g.lineTo(7, -15); g.stroke(); }
    else if (k === 1) { A.rr(g, -11, -9, 22, 17, 6); g.fill(); g.stroke(); g.strokeStyle = C.ink; g.beginPath(); g.moveTo(-9, 8); g.lineTo(-13, 13 + w * .4); g.moveTo(9, 8); g.lineTo(13, 13 - w * .4); g.moveTo(-11, -3); g.lineTo(-17, -5 + w); g.moveTo(11, -3); g.lineTo(17, -5 - w); g.stroke(); }
    else { g.beginPath(); g.ellipse(0, 3, 15, 6, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = C.gold; g.beginPath(); g.arc(0, 0, 8, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = C.snow; [-9, 0, 9].forEach(function (s) { g.beginPath(); g.arc(s, 3, 1.6, 0, 7); g.fill(); }); }
    if (k !== 2) [-4.5, 4.5].forEach(function (s) { g.fillStyle = C.snow; g.beginPath(); g.arc(s, -1, 3.2, 0, 7); g.fill(); g.fillStyle = C.ink; g.beginPath(); g.arc(s, 0, 1.5, 0, 7); g.fill(); });
    g.restore();
  }
  function drawBoss(g, b, t) {
    g.save(); g.translate(b.x, b.y); g.strokeStyle = C.ink; g.lineWidth = 3; g.fillStyle = C.mag;
    g.beginPath(); g.moveTo(-46, 0); g.lineTo(-30, -20); g.lineTo(30, -20); g.lineTo(46, 0); g.lineTo(30, 22); g.lineTo(-30, 22); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = C.deep; A.rr(g, -22, -14, 44, 28, 8); g.fill(); g.stroke(); g.fillStyle = C.gold; g.beginPath(); g.arc(0, 0, 9 + Math.sin(t * 6) * 1.5, 0, 7); g.fill(); g.stroke();
    g.fillStyle = C.fire; [-38, 38].forEach(function (x) { g.beginPath(); g.arc(x, 4, 6, 0, 7); g.fill(); g.stroke(); });
    g.restore(); A.rr(g, W / 2 - 80, 10, 160, 10, 5); g.fillStyle = 'rgba(18,0,15,.8)'; g.fill(); g.strokeStyle = C.deep; g.lineWidth = 2; g.stroke();
    if (b.hp > 0) { A.rr(g, W / 2 - 79, 11, Math.max(6, 158 * b.hp / b.max), 8, 4); g.fillStyle = C.gold; g.fill(); }
  }
  function drawAst(g, a) {
    g.save(); g.translate(a.x, a.y); g.rotate(a.rot); g.fillStyle = C.panel2; g.strokeStyle = a.hp > 1 ? C.mag : C.hot; g.lineWidth = 3; g.beginPath();
    for (var i = 0; i < 9; i++) { var an = i / 9 * Math.PI * 2, r = a.r * (.8 + .2 * Math.sin(i * 2.7 + a.seed)); g.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
    g.closePath(); g.fill(); g.stroke(); g.fillStyle = C.ink; g.globalAlpha = .5; g.beginPath(); g.arc(-a.r * .25, -a.r * .1, a.r * .2, 0, 7); g.arc(a.r * .25, a.r * .3, a.r * .14, 0, 7); g.fill(); g.globalAlpha = 1; g.restore();
  }
  var PU = { rapid: [C.gold, 'R'], shield: [C.hot, 'S'], heal: [C.deep, '+'] };

  A.register({
    id: 'galax', title: 'Galax', color: C.mag, W: W, H: H,
    desc: 'Defend the galaxy. Blast four enemy waves, dodge asteroids, then take down the mothership.',
    how: '<ul><li>Move with the arrow keys or WASD, or drag your finger or mouse. Your ship fires automatically.</li><li>Enemies dive and shoot. Asteroids drift down and take two hits to break.</li><li>Catch power-ups: R for rapid double fire, S for a shield, + for an extra life.</li><li>Survive 4 waves, then destroy the boss in wave 5. You have 3 lives.</li></ul>',
    reset: function (api) {
      S = { wave: 1, en: [], total: 1, fx: 0, fy: -180, fdir: 1, boss: null, px: W / 2, py: H - 60, tx: W / 2, ty: H - 60, ps: [], es: [], ast: [], pu: [], rapid: 0, shield: 0, fire: .3, eshoot: 2, dive: 5, astT: 4, inv: 0, wait: 0, t: 0,
        stars: Array.from({ length: 44 }, function (_, i) { return { x: (i * 83) % W, y: (i * 131) % H, s: 1 + i % 3, v: 20 + (i % 5) * 14, c: i % 4 === 0 ? C.gold : i % 4 === 1 ? C.hot : C.snow }; }) };
      spawnWave(1); api.lives = 3; api.maxLives = 5; api.info = 'WAVE 1/' + WAVES; api.banner('WAVE 1', 1.4, C.hot);
    },
    update: function (dt, api) {
      S.t += dt; S.inv = Math.max(0, S.inv - dt); S.rapid = Math.max(0, S.rapid - dt); S.shield = Math.max(0, S.shield - dt);
      S.stars.forEach(function (s) { s.y += s.v * dt; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });
      var k = api.keys, sp = 380 * dt;
      if (k.has('arrowleft') || k.has('a')) S.tx = Math.max(MARGIN, S.tx - sp); if (k.has('arrowright') || k.has('d')) S.tx = Math.min(W - MARGIN, S.tx + sp);
      if (k.has('arrowup') || k.has('w')) S.ty = Math.max(MINY, S.ty - sp); if (k.has('arrowdown') || k.has('s')) S.ty = Math.min(MAXY, S.ty + sp);
      var dx = S.tx - S.px, dy = S.ty - S.py, mv = 460 * dt; S.px += Math.abs(dx) < mv ? dx : Math.sign(dx) * mv; S.py += Math.abs(dy) < mv ? dy : Math.sign(dy) * mv;
      S.fire -= dt; if (S.fire <= 0) { S.fire = S.rapid > 0 ? .13 : .27; if (S.rapid > 0) S.ps.push({ x: S.px - 8, y: S.py - 14, vy: -460 }, { x: S.px + 8, y: S.py - 14, vy: -460 }); else S.ps.push({ x: S.px, y: S.py - 18, vy: -460 }); api.sfx('shoot'); }
      var entering = S.fy < 0 || (S.boss && S.boss.y < 80); if (S.fy < 0) S.fy = Math.min(0, S.fy + 230 * dt);
      if (S.wait > 0) { S.wait -= dt; if (S.wait <= 0) { spawnWave(S.wave + 1); api.banner(S.wave >= WAVES ? 'BOSS WAVE!' : 'WAVE ' + S.wave, 1.5, S.wave >= WAVES ? C.fire : C.hot); } }
      /* asteroids: drift, rotate, never spawn during the entry animation */
      S.astT -= dt; if (S.astT <= 0 && !entering && S.wait <= 0) { var r = A.rnd(13, 21); S.ast.push({ x: A.rnd(30, W - 30), y: -30, vx: A.rnd(-30, 30), v: A.rnd(60, 100) + S.wave * 8, r: r, hp: 2, rot: 0, vr: A.rnd(-2, 2), seed: Math.random() * 6 }); S.astT = Math.max(1.6, 5 - S.wave * .6) * A.rnd(.7, 1.3); }
      S.ast.forEach(function (a) { a.y += a.v * dt; a.x += a.vx * dt; a.rot += a.vr * dt; }); S.ast = S.ast.filter(function (a) { return a.y < H + 40 && a.x > -40 && a.x < W + 40; });
      /* enemy formation */
      if (!entering && S.en.length) {
        var lo = 1e9, hi = -1e9; S.en.forEach(function (e) { if (e.st === 'dive') return; var s = slot(S.wave, e.row, e.col); lo = Math.min(lo, s.x); hi = Math.max(hi, s.x); });
        var spd = 30 + S.wave * 6 + (1 - S.en.length / S.total) * 60; S.fx += S.fdir * spd * dt;
        if (lo < 1e8) { if (S.fdir > 0 && hi + S.fx > W - MARGIN) { S.fdir = -1; S.fy += 10; } else if (S.fdir < 0 && lo + S.fx < MARGIN) { S.fdir = 1; S.fy += 10; } }
        S.dive -= dt; if (S.dive <= 0) { var f = S.en.filter(function (e) { return e.st === 'form'; }); if (f.length > 3) { var e0 = A.pick(f); e0.st = 'dive'; e0.x0 = e0.x; e0.age = 0; e0.dir = Math.random() < .5 ? 1 : -1; } S.dive = Math.max(1.5, 4.2 - .45 * S.wave) * A.rnd(.7, 1.3); }
        S.eshoot -= dt; if (S.eshoot <= 0) { var c = S.en.filter(function (e) { return e.y > 0 && e.y < S.py - 90; }); if (c.length) { var e1 = A.pick(c); S.es.push({ x: e1.x, y: e1.y + 12, vx: e1.st === 'dive' ? (S.px - e1.x) * .3 : 0, vy: 165 + S.wave * 14 }); } S.eshoot = Math.max(.35, 1 - .1 * S.wave) * A.rnd(.7, 1.3); }
      }
      S.en.forEach(function (e) {
        var s = slot(S.wave, e.row, e.col);
        if (e.st === 'form') { e.x = s.x + S.fx; e.y = s.y + S.fy + Math.sin(S.t * 3 + e.col) * 2; }
        else if (e.st === 'dive') { e.age += dt; e.y += (120 + S.wave * 12) * dt; e.x = e.x0 + Math.sin(e.age * 3) * 55 * e.dir; if (e.y > H + 20) { e.st = 'back'; e.y = -30; } }
        else { e.x = s.x + S.fx; e.y += 170 * dt; if (e.y >= s.y + S.fy) e.st = 'form'; }
      });
      /* boss */
      var b = S.boss;
      if (b) {
        b.t += dt; if (b.y < 80) b.y = Math.min(80, b.y + 60 * dt); else {
          b.x += b.dir * (60 + (1 - b.hp / b.max) * 60) * dt; if (b.x > W - 60) b.dir = -1; if (b.x < 60) b.dir = 1;
          b.shoot -= dt; if (b.shoot <= 0) { b.shoot = b.hp < b.max / 2 ? .8 : 1.2; [-70, 0, 70].forEach(function (vx) { S.es.push({ x: b.x, y: b.y + 24, vx: vx, vy: 190 }); }); S.es.push({ x: b.x, y: b.y + 24, vx: (S.px - b.x) * .4, vy: 200 }); }
        }
      }
      S.ps.forEach(function (p) { p.y += p.vy * dt; }); S.es.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; });
      S.ps = S.ps.filter(function (p) { return p.y > -20; }); S.es = S.es.filter(function (p) { return p.y < H + 20 && p.x > -20 && p.x < W + 20; });
      /* player shots hit enemies, asteroids and the boss (each shot hits once) */
      S.ps.forEach(function (p) {
        if (p.dead) return;
        for (var i = 0; i < S.en.length; i++) {
          var e = S.en[i]; if (e.hp <= 0 || !A.near(p.x, p.y, e.x, e.y, 15, 13)) continue; p.dead = true; e.hp--;
          if (e.hp <= 0) { var pts = rowPoints(e.row) * (e.st === 'dive' ? 2 : 1); api.add(pts); api.fx.pop('+' + pts, e.x, e.y, C.gold); explode(e.x, e.y, ECOL[e.row % 5], api); drop(e.x, e.y, .12, api); } else { api.sfx('tap', 300); api.fx.burst(e.x, e.y, [C.gold], 5, 90); }
          return;
        }
        for (var j = 0; j < S.ast.length; j++) {
          var a = S.ast[j]; if (a.hp <= 0 || Math.hypot(p.x - a.x, p.y - a.y) > a.r + 4) continue; p.dead = true; a.hp--;
          if (a.hp <= 0) { api.add(30); api.fx.pop('+30', a.x, a.y, C.hot); explode(a.x, a.y, C.hot, api); drop(a.x, a.y, .1, api); } else { api.fx.burst(a.x, a.y, [C.hot], 5, 90); api.sfx('tap', 120); }
          return;
        }
        if (b && b.hp > 0 && A.near(p.x, p.y, b.x, b.y, 48, 24)) { p.dead = true; b.hp--; api.fx.burst(p.x, p.y, [C.gold, C.snow], 4, 100); api.sfx('tap', 260); api.add(5); }
      });
      S.ps = S.ps.filter(function (p) { return !p.dead; }); S.en = S.en.filter(function (e) { return e.hp > 0; }); S.ast = S.ast.filter(function (a) { return a.hp > 0; });
      /* damage to the player */
      for (var i = 0; i < S.es.length; i++) if (A.near(S.es[i].x, S.es[i].y, S.px, S.py, 11, 14)) { S.es[i].y = H + 99; hurt(api); if (!api.isPlaying()) return; }
      for (var q = 0; q < S.en.length; q++) { var en = S.en[q]; if (en.st !== 'back' && en.y > 0 && A.near(en.x, en.y, S.px, S.py, 16, 16) && S.inv <= 0) { en.hp = 0; explode(en.x, en.y, C.fire, api); hurt(api); if (!api.isPlaying()) return; } }
      S.en = S.en.filter(function (e) { return e.hp > 0; });
      for (var z = 0; z < S.ast.length; z++) { var as = S.ast[z]; if (S.inv <= 0 && Math.hypot(as.x - S.px, as.y - S.py) < as.r + 12) { as.hp = 0; explode(as.x, as.y, C.hot, api); hurt(api); if (!api.isPlaying()) return; } }
      S.ast = S.ast.filter(function (a) { return a.hp > 0; });
      if (b && b.hp > 0 && S.inv <= 0 && A.near(b.x, b.y, S.px, S.py, 40, 24)) { hurt(api); if (!api.isPlaying()) return; }
      /* power-ups */
      S.pu.forEach(function (p) { p.y += 110 * dt; });
      S.pu = S.pu.filter(function (p) {
        if (A.near(p.x, p.y, S.px, S.py, 22, 20)) {
          if (p.kind === 'rapid') { S.rapid = 8; api.fx.pop('RAPID FIRE', p.x, p.y, C.gold); } else if (p.kind === 'shield') { S.shield = 10; api.fx.pop('SHIELD', p.x, p.y, C.hot); } else { api.lives = Math.min(api.maxLives, api.lives + 1); api.fx.pop('+1 LIFE', p.x, p.y, C.deep); }
          api.sfx('coin'); return false;
        }
        return p.y < H + 20;
      });
      /* enemies that reach the ship's line mean the invasion succeeded */
      if (S.en.some(function (e) { return e.st === 'form' && e.y > S.py - 26; })) { api.lives = 0; explode(S.px, S.py, C.hot, api, true); api.end('GAME OVER', 'The invaders landed on wave ' + S.wave, false); return; }
      /* boss defeated */
      if (b && b.hp <= 0) { explode(b.x, b.y, C.mag, api, true); api.fx.ring(b.x, b.y, C.gold, 120); api.add(2000); api.fx.pop('+2000', b.x, b.y, C.gold); api.add(api.lives * 150); S.boss = null; api.end('VICTORY!', 'The mothership is destroyed', true); return; }
      /* wave cleared */
      if (!S.boss && !S.en.length && S.wait <= 0 && !entering) { api.add(100 * S.wave); api.sfx('win'); api.banner('WAVE CLEARED!', 1.5); S.wait = 1.6; S.ast = []; }
      api.info = 'WAVE ' + S.wave + '/' + WAVES + (S.rapid > 0 ? '  RAPID' : '') + (S.shield > 0 ? '  SHIELD' : '');
    },
    draw: function (g, api) {
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#12000F'); bg.addColorStop(1, '#31093D'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      S.stars.forEach(function (s) { g.fillStyle = s.c; g.globalAlpha = .5 + s.s * .15; g.fillRect(s.x, s.y, s.s, s.s * (1 + s.v / 40)); }); g.globalAlpha = 1;
      S.ast.forEach(function (a) { drawAst(g, a); });
      S.pu.forEach(function (p) { var d = PU[p.kind]; g.shadowColor = d[0]; g.shadowBlur = 12; g.fillStyle = d[0]; g.strokeStyle = C.ink; g.lineWidth = 2.5; g.beginPath(); g.arc(p.x, p.y, 10, 0, 7); g.fill(); g.stroke(); g.shadowBlur = 0; g.fillStyle = C.ink; g.font = '900 13px Impact,system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(d[1], p.x, p.y + 1); });
      S.en.forEach(function (e) { drawEnemy(g, e, S.t); }); if (S.boss) drawBoss(g, S.boss, S.t);
      g.shadowColor = C.gold; g.shadowBlur = 8; g.fillStyle = C.gold; S.ps.forEach(function (b) { A.rr(g, b.x - 2, b.y - 8, 4, 14, 2); g.fill(); }); g.shadowBlur = 0;
      g.shadowColor = C.hot; g.shadowBlur = 8; g.fillStyle = C.hot; S.es.forEach(function (b) { g.beginPath(); g.moveTo(b.x, b.y + 7); g.lineTo(b.x + 4, b.y); g.lineTo(b.x, b.y - 7); g.lineTo(b.x - 4, b.y); g.fill(); }); g.shadowBlur = 0;
      if (api.lives > 0 && (S.inv <= 0 || Math.floor(S.t * 14) % 2)) drawShip(g, S.px, S.py, S.t);
    },
    pointer: {
      down: function (p) { S.tx = A.clamp(p.x, MARGIN, W - MARGIN); S.ty = A.clamp(p.y - 40, MINY, MAXY); },
      move: function (p) { S.tx = A.clamp(p.x, MARGIN, W - MARGIN); S.ty = A.clamp(p.y - 40, MINY, MAXY); },
      up: function () {}
    },
    preview: function (g, t, w, h) {
      var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#12000F'); bg.addColorStop(1, '#31093D'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 24; i++) { g.fillStyle = i % 3 ? C.snow : C.gold; g.globalAlpha = .6; g.fillRect((i * 53) % w, (i * 37 + t * 40 * (1 + i % 3)) % h, 2, 2 + i % 3); } g.globalAlpha = 1;
      var cols = [C.mag, C.hot, C.deep, C.fire]; for (var r = 0; r < 3; r++) for (var c = 0; c < 6; c++) { var x = 60 + c * 40 + Math.sin(t * 1.4) * 14, y = 30 + r * 28; g.fillStyle = cols[(r + c) % 4]; g.strokeStyle = C.ink; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x, y, 13, 9, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = C.snow; g.beginPath(); g.arc(x - 4, y - 1, 2.5, 0, 7); g.arc(x + 4, y - 1, 2.5, 0, 7); g.fill(); }
      var sx = w / 2 + Math.sin(t * 1.1) * 70; g.fillStyle = C.gold; for (var k = 0; k < 3; k++) { g.fillRect(sx - 2, 150 - ((t * 200 + k * 50) % 150), 4, 12); }
      g.save(); g.translate(sx, 172); g.fillStyle = C.hot; g.strokeStyle = C.ink; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -18); g.lineTo(15, 12); g.lineTo(0, 8); g.lineTo(-15, 12); g.closePath(); g.fill(); g.stroke(); g.fillStyle = C.gold; g.beginPath(); g.arc(0, -2, 4, 0, 7); g.fill(); g.restore();
    }
  });
})();
