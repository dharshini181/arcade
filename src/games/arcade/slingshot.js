/* Game 3: Digital Slingshot. Drag back, aim, release. Gravity, bounces, breakable crates and falling bots. */
(function () {
  'use strict';
  var A = window.Arcade, C = A.C, W = 460, H = 300, GROUND = 262, G = 620, MAXPULL = 62, K = 8.5, BALL_R = 11, BOT_R = 13, SHOTS = 5, ANCHOR = { x: 78, y: 198 };
  var S;

  function crate(x, y, w, h, hp) { return { x: x, y: y, w: w, h: h, hp: hp, max: hp }; }
  function bot(x, y) { return { x: x, y: y, vy: 0, alive: true }; }
  /* Three stages. Bots sit on the ground or on crates; breaking a crate drops everything above it. */
  var STAGES = [
    function () { return { crates: [crate(318, GROUND - 40, 44, 40, 80)], bots: [bot(340, GROUND - 40 - BOT_R), bot(408, GROUND - BOT_R)] }; },
    function () { return { crates: [crate(296, GROUND - 40, 40, 40, 70), crate(296, GROUND - 80, 40, 40, 70), crate(384, GROUND - 40, 40, 40, 70)], bots: [bot(316, GROUND - 80 - BOT_R), bot(404, GROUND - 40 - BOT_R), bot(350, GROUND - BOT_R)] }; },
    function () { return { crates: [crate(280, GROUND - 44, 30, 44, 70), crate(380, GROUND - 44, 30, 44, 70), crate(280, GROUND - 58, 130, 14, 60)], bots: [bot(305, GROUND - 58 - BOT_R), bot(392, GROUND - 58 - BOT_R), bot(345, GROUND - BOT_R), bot(432, GROUND - BOT_R)] }; }
  ];
  function clampPull(px, py) { var dx = px - ANCHOR.x, dy = py - ANCHOR.y, d = Math.hypot(dx, dy); return d <= MAXPULL ? { x: px, y: py } : { x: ANCHOR.x + dx / d * MAXPULL, y: ANCHOR.y + dy / d * MAXPULL }; }
  function launchVel(px, py) { return { vx: (ANCHOR.x - px) * K, vy: (ANCHOR.y - py) * K }; }
  /* Circle against rectangle: outward normal and penetration depth, or null. */
  function circleBox(cx, cy, r, b) {
    var px = Math.max(b.x, Math.min(cx, b.x + b.w)), py = Math.max(b.y, Math.min(cy, b.y + b.h)), dx = cx - px, dy = cy - py, d2 = dx * dx + dy * dy;
    if (d2 >= r * r) return null;
    if (d2 === 0) { var l = cx - b.x, rt = b.x + b.w - cx, t = cy - b.y, bt = b.y + b.h - cy, m = Math.min(l, rt, t, bt); return m === t ? { nx: 0, ny: -1, depth: t + r } : m === bt ? { nx: 0, ny: 1, depth: bt + r } : m === l ? { nx: -1, ny: 0, depth: l + r } : { nx: 1, ny: 0, depth: rt + r }; }
    var d = Math.sqrt(d2); return { nx: dx / d, ny: dy / d, depth: r - d };
  }
  function load(n, api) { var L = STAGES[n - 1](); S.stage = n; S.crates = L.crates; S.bots = L.bots; S.shots = SHOTS; S.ball = null; S.pull = null; S.phase = 'aim'; api.banner('STAGE ' + n, 1.4, C.hot); }
  function killBot(b, api) { api.fx.burst(b.x, b.y, [C.mag, C.hot, C.gold], 16, 210); api.fx.ring(b.x, b.y, C.gold, 34); api.add(500); api.fx.pop('+500', b.x, b.y - 18, C.gold); api.sfx('good'); }
  function stepBall(b, dt, api) {
    b.age += dt; b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.y + BALL_R > GROUND) { b.y = GROUND - BALL_R; if (b.vy > 60) b.vy = -b.vy * .35; else b.vy = 0; b.vx *= 1 - Math.min(1, 3 * dt); }
    S.crates.forEach(function (c) {
      if (c.hp <= 0) return; var h = circleBox(b.x, b.y, BALL_R, c); if (!h) return;
      b.x += h.nx * h.depth; b.y += h.ny * h.depth; var vn = b.vx * h.nx + b.vy * h.ny;
      if (vn < 0) {
        var imp = -vn;
        if (imp > 70) { b.vx -= 1.3 * vn * h.nx; b.vy -= 1.3 * vn * h.ny; c.hp -= (imp - 40) * .6; if (imp > 120) api.sfx('tap', 100 + Math.min(300, imp * .5)); } else { b.vx -= vn * h.nx; b.vy -= vn * h.ny; }
        b.vx *= .92;
      }
      if (c.hp <= 0) { api.fx.burst(c.x + c.w / 2, c.y + c.h / 2, [C.fire, C.gold, C.hot], 16, 180, 520); api.add(50); api.sfx('tap', 160); }
    });
    S.bots.forEach(function (t) {
      if (!t.alive) return; var sp = Math.hypot(b.vx, b.vy);
      if (Math.hypot(b.x - t.x, b.y - t.y) < BALL_R + BOT_R && sp > 45) { t.alive = false; b.vx *= .75; b.vy *= .75; killBot(t, api); }
    });
    S.crates = S.crates.filter(function (c) { return c.hp > 0; });
    b.still = b.y >= GROUND - BALL_R - .5 && Math.hypot(b.vx, b.vy) < 28 ? b.still + dt : 0;
  }
  /* Bots are light balls: gravity, rest on crates, die from hard landings. */
  function stepBot(t, dt, api) {
    if (!t.alive) return; t.vy += G * dt; t.y += t.vy * dt; var impact = 0;
    if (t.y + BOT_R > GROUND) { t.y = GROUND - BOT_R; impact = Math.max(impact, t.vy); t.vy = 0; }
    S.crates.forEach(function (c) { if (c.hp <= 0) return; var h = circleBox(t.x, t.y, BOT_R, c); if (!h) return; t.x += h.nx * h.depth; t.y += h.ny * h.depth; if (h.ny < -.5) { impact = Math.max(impact, t.vy); t.vy = 0; } else if (h.ny > .5 && t.vy < 0) t.vy = 0; });
    if (impact > 330) { t.alive = false; killBot(t, api); }
  }
  function drawBall(g, x, y) { var f = g.createRadialGradient(x - 3, y - 3, 1, x, y, BALL_R); f.addColorStop(0, C.gold); f.addColorStop(.5, C.fire); f.addColorStop(1, C.deep); g.fillStyle = f; g.strokeStyle = C.ink; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, BALL_R, 0, 7); g.fill(); g.stroke(); }
  function drawCrate(g, c) {
    A.rr(g, c.x, c.y, c.w, c.h, 4); g.fillStyle = C.fire; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 2.5; g.stroke();
    g.strokeStyle = C.gold; g.lineWidth = 2; A.rr(g, c.x + 4, c.y + 4, c.w - 8, c.h - 8, 2); g.stroke();
    if (c.w >= 26 && c.h >= 26) { g.globalAlpha = .5; g.beginPath(); g.moveTo(c.x + 4, c.y + 4); g.lineTo(c.x + c.w - 4, c.y + c.h - 4); g.moveTo(c.x + c.w - 4, c.y + 4); g.lineTo(c.x + 4, c.y + c.h - 4); g.stroke(); g.globalAlpha = 1; }
    if (c.hp < c.max * .6) { g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(c.x + c.w * .3, c.y); g.lineTo(c.x + c.w * .45, c.y + c.h * .4); g.lineTo(c.x + c.w * .35, c.y + c.h * .7); g.lineTo(c.x + c.w * .6, c.y + c.h); g.stroke(); }
  }
  function drawBot(g, b, t) {
    g.save(); g.translate(b.x, b.y); g.strokeStyle = C.ink; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -BOT_R); g.lineTo(0, -BOT_R - 6); g.stroke();
    g.fillStyle = C.gold; g.beginPath(); g.arc(0, -BOT_R - 7, 3, 0, 7); g.fill(); g.stroke(); g.fillStyle = C.mag; g.beginPath(); g.arc(0, 0, BOT_R, 0, 7); g.fill(); g.stroke();
    [-5, 5].forEach(function (s) { g.fillStyle = C.snow; g.beginPath(); g.arc(s, -2, 4, 0, 7); g.fill(); g.stroke(); g.fillStyle = C.ink; g.beginPath(); g.arc(s + Math.sin(t * 2), -1.5, 1.8, 0, 7); g.fill(); });
    g.lineWidth = 2; g.beginPath(); g.moveTo(-6, -8); g.lineTo(-2, -6); g.moveTo(6, -8); g.lineTo(2, -6); g.moveTo(-4, 6); g.quadraticCurveTo(0, 4, 4, 6); g.stroke(); g.restore();
  }
  function scenery(g) {
    var bg = g.createLinearGradient(0, 0, 0, GROUND); bg.addColorStop(0, '#4a0a5a'); bg.addColorStop(1, '#1F0526'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.save(); g.beginPath(); g.arc(W * .7, GROUND - 10, 90, Math.PI, 0); g.clip(); var sn = g.createLinearGradient(0, GROUND - 100, 0, GROUND); sn.addColorStop(0, C.gold); sn.addColorStop(.5, C.fire); sn.addColorStop(1, C.deep);
    g.globalAlpha = .4; g.fillStyle = sn; g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.fillStyle = C.panel2; for (var i = 0; i < 8; i++) g.fillRect(0, GROUND - 96 + i * 12, W, 3 + i * .6); g.restore();
    g.fillStyle = '#1F0526'; g.beginPath(); g.moveTo(0, GROUND); g.lineTo(60, GROUND - 60); g.lineTo(130, GROUND - 20); g.lineTo(210, GROUND - 80); g.lineTo(290, GROUND - 25); g.lineTo(380, GROUND - 65); g.lineTo(W, GROUND - 15); g.lineTo(W, GROUND); g.fill();
    g.fillRect(0, GROUND, W, H - GROUND); g.fillStyle = C.deep; g.shadowColor = C.deep; g.shadowBlur = 10; g.fillRect(0, GROUND, W, 3); g.shadowBlur = 0;
  }

  A.register({
    id: 'sling', title: 'Digital Slingshot', color: C.deep, W: W, H: H,
    desc: 'Pull back, aim along the dotted arc and fire. Smash crates and pop every bot across three stages.',
    how: '<ul><li>Press on the ball, drag backwards to aim, and release to launch. Works with mouse and touch.</li><li>The dotted line shows where the shot will go. A harder pull means a faster shot.</li><li>Hit bots to pop them. Break crates to make bots fall, hard landings pop them too.</li><li>You have 5 shots per stage. Spare shots are worth bonus points. Use Restart to start over.</li></ul>',
    reset: function (api) { S = { stage: 1, crates: [], bots: [], shots: SHOTS, ball: null, pull: null, phase: 'aim', timer: 0, t: 0 }; load(1, api); },
    update: function (dt, api) {
      S.t += dt; S.bots.forEach(function (b) { stepBot(b, dt, api); });
      if (S.ball) {
        var b = S.ball; stepBall(b, dt, api);
        if (b.still > .6 || b.x > W + 40 || b.x < -40 || b.age > 7) { S.ball = null; if (S.phase === 'fly') { S.phase = 'wait'; S.timer = .8; } }
      }
      var alive = S.bots.filter(function (b) { return b.alive; }).length;
      if (S.phase === 'wait') { S.timer -= dt; if (S.timer <= 0) { if (alive > 0 && S.shots <= 0) { api.end('OUT OF SHOTS', 'Stuck on stage ' + S.stage + ' of ' + STAGES.length, false); return; } S.phase = 'aim'; } }
      if (S.phase !== 'clear' && alive === 0) {
        S.phase = 'clear'; S.timer = 1.6; S.ball = null; S.pull = null; api.banner('STAGE CLEAR!', 1.6); var bonus = S.shots * 150; if (bonus) { api.add(bonus); api.fx.pop('+' + bonus + ' spare shots', W / 2, H * .5, C.gold); } api.sfx('win');
      }
      if (S.phase === 'clear') { S.timer -= dt; if (S.timer <= 0) { if (S.stage >= STAGES.length) { api.end('VICTORY!', 'All ' + STAGES.length + ' stages cleared', true); return; } load(S.stage + 1, api); } }
      api.info = 'STAGE ' + S.stage + '/' + STAGES.length + '  SHOTS ' + S.shots + '  BOTS ' + alive;
    },
    draw: function (g, api) {
      scenery(g); S.crates.forEach(function (c) { drawCrate(g, c); }); S.bots.forEach(function (b) { if (b.alive) drawBot(g, b, S.t); });
      var bx = S.pull ? S.pull.x : ANCHOR.x, by = S.pull ? S.pull.y : ANCHOR.y, showBall = !S.ball && S.phase === 'aim' && S.shots > 0;
      g.lineCap = 'round'; g.strokeStyle = C.hot; g.lineWidth = 8; g.beginPath(); g.moveTo(ANCHOR.x, GROUND); g.lineTo(ANCHOR.x, ANCHOR.y + 24); g.stroke();
      if (showBall) { g.strokeStyle = C.gold; g.lineWidth = 3.5; g.beginPath(); g.moveTo(ANCHOR.x - 14, ANCHOR.y - 2); g.lineTo(bx, by); g.lineTo(ANCHOR.x + 14, ANCHOR.y - 2); g.stroke(); }
      g.strokeStyle = C.hot; g.lineWidth = 7; g.beginPath(); g.moveTo(ANCHOR.x, ANCHOR.y + 26); g.lineTo(ANCHOR.x - 14, ANCHOR.y - 2); g.moveTo(ANCHOR.x, ANCHOR.y + 26); g.lineTo(ANCHOR.x + 14, ANCHOR.y - 2); g.stroke();
      if (S.pull) {
        var v = launchVel(S.pull.x, S.pull.y);
        for (var i = 0; i < 18; i++) { var t = (i + 1) * .07, x = S.pull.x + v.vx * t, y = S.pull.y + v.vy * t + .5 * G * t * t; if (y > GROUND) break; g.globalAlpha = 1 - i / 18 * .8; g.fillStyle = C.snow; g.beginPath(); g.arc(x, y, 3 - i / 18 * 1.5, 0, 7); g.fill(); }
        g.globalAlpha = 1;
      }
      if (showBall) drawBall(g, bx, by); if (S.ball) drawBall(g, S.ball.x, S.ball.y);
    },
    pointer: {
      down: function (p) { if (S.phase !== 'aim' || S.shots <= 0) return; if (Math.hypot(p.x - ANCHOR.x, p.y - ANCHOR.y) > 58) return; S.pull = clampPull(p.x, p.y); },
      move: function (p) { if (S.pull) S.pull = clampPull(p.x, p.y); },
      up: function (p, api) {
        var pull = S.pull; S.pull = null; if (!p || !pull || S.phase !== 'aim') return;           /* null means cancelled (pause, game over) */
        if (Math.hypot(pull.x - ANCHOR.x, pull.y - ANCHOR.y) < 16) return;                           /* too small a pull, no shot used */
        var v = launchVel(pull.x, pull.y); S.ball = { x: pull.x, y: pull.y, vx: v.vx, vy: v.vy, age: 0, still: 0 }; S.shots--; S.phase = 'fly'; api.sfx('coin');
      }
    },
    preview: function (g, t, w, h) {
      var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#4a0a5a'); bg.addColorStop(1, '#1F0526'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.fillStyle = '#1F0526'; g.fillRect(0, 160, w, 40); g.fillStyle = C.deep; g.fillRect(0, 160, w, 3);
      g.lineCap = 'round'; g.strokeStyle = C.hot; g.lineWidth = 7; g.beginPath(); g.moveTo(54, 160); g.lineTo(54, 126); g.moveTo(54, 128); g.lineTo(40, 104); g.moveTo(54, 128); g.lineTo(68, 104); g.stroke();
      var c = (t * .7) % 1, x = 54 + c * 210, y = 100 - Math.sin(c * Math.PI) * 60 + c * c * 40; g.fillStyle = C.fire; g.strokeStyle = C.ink; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.stroke();
      A.rr(g, 240, 124, 36, 36, 4); g.fillStyle = C.fire; g.fill(); g.stroke(); A.rr(g, 252, 88, 36, 36, 4); g.fill(); g.stroke();
      g.fillStyle = C.mag; g.beginPath(); g.arc(270, 74, 12, 0, 7); g.fill(); g.stroke(); g.fillStyle = C.snow; g.beginPath(); g.arc(266, 72, 3.5, 0, 7); g.arc(274, 72, 3.5, 0, 7); g.fill();
    }
  });
})();
