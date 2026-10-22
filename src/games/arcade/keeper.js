/* Game 6: Ko Keeper. Tap where the ball is heading and the keeper dives there. 4 rounds of 5 shots, 3 goals conceded and you are out. */
(function () {
  'use strict';
  var A = window.Arcade, C = A.C, W = 800, H = 450;
  var GL = 230, GR = 570, GT = 72, GB = 228, ROUNDS = 4, PER = 5, REACH = 58, PERFECT = 24, KSPEED = 1250, S;

  function mult(c) { return Math.min(5, 1 + Math.floor(c / 3)); }
  function clampT(p) { return { x: A.clamp(p.x, GL + 24, GR - 24), y: A.clamp(p.y, GT + 28, GB - 22) }; }
  function newShot() {
    var ex = A.rnd(GL + 35, GR - 35), ey = A.rnd(GT + 30, GB - 22);
    if (Math.random() < .35) { ex = Math.random() < .5 ? GL + A.rnd(18, 55) : GR - A.rnd(18, 55); ey = Math.random() < .5 ? GT + A.rnd(14, 45) : GB - A.rnd(14, 40); }
    S.ball = { sx: A.rnd(320, 480), sy: 415, ex: ex, ey: ey, t: 0, T: Math.max(.6, 1.7 - .3 * (S.round - 1)) * A.rnd(.88, 1.12), curve: A.rnd(-60, 60), st: 'fly', x: 0, y: 0, vx: 0, vy: 0, r: 26 };
  }
  function ballPos(b) {
    var u = Math.min(1, b.t / b.T), e = u * u * (3 - 2 * u * .4);
    b.x = b.sx + (b.ex - b.sx) * u + b.curve * Math.sin(Math.PI * u); b.y = b.sy + (b.ey - b.sy) * u - 55 * Math.sin(Math.PI * u); b.r = 26 - 15 * u; return u;
  }
  function resolve(api) {
    var b = S.ball, d = Math.hypot(S.kx - b.ex, S.ky - b.ey); S.shots++;
    if (d <= REACH) {
      S.combo++; S.saves++; var perfect = d <= PERFECT, m = mult(S.combo), pts = (100 + (perfect ? 100 : 0)) * m; api.add(pts);
      b.st = 'saved'; b.vx = (b.ex - S.kx) * 5 + A.rnd(-90, 90); b.vy = -260; api.sfx(perfect ? 'win' : 'good', perfect ? 0 : 120);
      api.banner(perfect ? 'PERFECT SAVE!' : 'SAVE!', 1.1, perfect ? C.gold : '#39E27A'); api.fx.pop('+' + pts + (m > 1 ? ' x' + m : ''), b.ex, b.ey - 30, C.gold); api.fx.burst(b.ex, b.ey, ['#39E27A', C.gold, C.snow], perfect ? 30 : 14, 200);
      if (perfect) api.fx.ring(b.ex, b.ey, C.gold, 80);
    } else {
      S.combo = 0; S.conceded++; api.lives--; b.st = 'goal'; api.sfx('bad'); S.shake = .35;
      api.banner('GOAL!', 1.1, C.fire); api.fx.burst(b.ex, b.ey, [C.fire, C.snow], 16, 160); api.fx.ring(b.ex, b.ey, C.fire, 60);
    }
    S.ph = 'res'; S.wait = 1.15;
  }
  function drawKeeper(g, x, y, ang, sq) {
    g.save(); g.translate(x, y); g.rotate(ang); var sw = 1 + sq * .15;
    g.strokeStyle = C.ink; g.lineWidth = 3;
    g.fillStyle = '#1b2a6b'; g.fillRect(-9, 12, 8, 26); g.fillRect(2, 12, 8, 26); g.strokeRect(-9, 12, 8, 26); g.strokeRect(2, 12, 8, 26);
    g.fillStyle = '#FFD21F'; A.rr(g, -15, -22, 30, 40, 8); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-14, -14); g.lineTo(-36 * sw, -30 - sq * 6); g.moveTo(14, -14); g.lineTo(36 * sw, -30 - sq * 6); g.lineWidth = 8; g.strokeStyle = '#FFD21F'; g.stroke();
    g.lineWidth = 3; g.strokeStyle = C.ink; [-1, 1].forEach(function (s) { g.fillStyle = C.hot; g.beginPath(); g.arc(s * 36 * sw, -30 - sq * 6, 10, 0, 7); g.fill(); g.stroke(); });
    g.fillStyle = '#f2c9a0'; g.beginPath(); g.arc(0, -32, 11, 0, 7); g.fill(); g.stroke(); g.restore();
  }
  function drawBall(g, x, y, r, rot) {
    g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = C.snow; g.strokeStyle = C.ink; g.lineWidth = Math.max(1.5, r / 8); g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = C.ink; g.beginPath(); for (var i = 0; i < 5; i++) { var a = i * 1.2566 - 1.5708; g.lineTo(Math.cos(a) * r * .38, Math.sin(a) * r * .38); } g.closePath(); g.fill();
    for (i = 0; i < 5; i++) { a = i * 1.2566 - 1.5708; g.beginPath(); g.moveTo(Math.cos(a) * r * .38, Math.sin(a) * r * .38); g.lineTo(Math.cos(a) * r * .8, Math.sin(a) * r * .8); g.stroke(); }
    g.restore();
  }
  function scene(g, t, w, h, k) {
    var sx = w / W, sy = h / H; g.save(); g.scale(sx, sy);
    var sky = g.createLinearGradient(0, 0, 0, 250); sky.addColorStop(0, '#080f2e'); sky.addColorStop(1, '#1b3b78'); g.fillStyle = sky; g.fillRect(0, 0, W, 250);
    for (var r = 0; r < 3; r++) for (var i = 0; i < 60; i++) { g.fillStyle = ['#ff69b4', '#ffd700', '#7cf', '#fff', '#f60'][(i * 7 + r * 3) % 5]; g.globalAlpha = .75; g.fillRect(i * 14 + (r % 2) * 7, 8 + r * 14 + Math.sin(t * 4 + i) * 1.2, 7, 8); } g.globalAlpha = 1;
    g.fillStyle = 'rgba(255,255,220,.1)'; g.beginPath(); g.moveTo(80, 0); g.lineTo(150, 0); g.lineTo(330, 240); g.lineTo(120, 240); g.fill(); g.beginPath(); g.moveTo(650, 0); g.lineTo(720, 0); g.lineTo(700, 240); g.lineTo(480, 240); g.fill();
    var gr = g.createLinearGradient(0, 240, 0, H); gr.addColorStop(0, '#1d7a3c'); gr.addColorStop(1, '#0d4a22'); g.fillStyle = gr; g.fillRect(0, 238, W, H - 238);
    for (i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)'; var y0 = 238 + Math.pow(i / 8, 1.7) * (H - 238), y1 = 238 + Math.pow((i + 1) / 8, 1.7) * (H - 238); g.fillRect(0, y0, W, y1 - y0); }
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(GL - 90, 240); g.lineTo(GL - 190, 330); g.lineTo(GR + 190, 330); g.lineTo(GR + 90, 240); g.stroke();
    g.beginPath(); g.arc(W / 2, 350, 5, 0, 7); g.fillStyle = C.snow; g.fill();
    /* net, then keeper, then front frame so the keeper stands inside the goal */
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(GL + 14, GT + 14, GR - GL - 28, GB - GT - 14);
    g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1; for (i = 0; i <= 17; i++) { g.beginPath(); g.moveTo(GL + 14 + i * (GR - GL - 28) / 17, GT + 14); g.lineTo(GL + 14 + i * (GR - GL - 28) / 17, GB); g.stroke(); }
    for (i = 0; i <= 7; i++) { g.beginPath(); g.moveTo(GL + 14, GT + 14 + i * (GB - GT - 14) / 7); g.lineTo(GR - 14, GT + 14 + i * (GB - GT - 14) / 7); g.stroke(); }
    k(g);
    g.strokeStyle = C.snow; g.lineWidth = 9; g.lineJoin = 'round'; g.beginPath(); g.moveTo(GL, GB + 6); g.lineTo(GL, GT); g.lineTo(GR, GT); g.lineTo(GR, GB + 6); g.stroke();
    g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(GL, GT); g.lineTo(GL + 14, GT + 14); g.moveTo(GR, GT); g.lineTo(GR - 14, GT + 14); g.stroke();
    g.restore();
  }

  A.register({
    id: 'keeper', title: 'Ko Keeper', color: '#39E27A', W: W, H: H,
    desc: 'Goalkeeper challenge. Tap where the ball is heading and dive to save it before it hits the net.',
    how: '<ul><li>Footballs are shot at your goal. A ring in the net shows where the ball will land.</li><li>Tap (or drag) that spot. The goalkeeper dives there. Be there when the ball arrives.</li><li>Land right on the ball for a PERFECT SAVE and bonus points. Saves in a row build a combo up to x5.</li><li>Every goal costs a life, you have 3. Survive all 4 rounds (20 shots) to win. Shots get faster each round, and from round 3 the ring appears late.</li></ul>',
    reset: function (api) {
      S = { ph: 'cd', cd: 3, go: 0, wait: 0, round: 1, shots: 0, saves: 0, conceded: 0, combo: 0, ball: null, kx: 400, ky: 178, tx: 400, ty: 178, ang: 0, down: false, shake: 0, t: 0, rot: 0 };
      api.lives = 3; api.info = 'ROUND 1/' + ROUNDS;
    },
    update: function (dt, api) {
      S.t += dt; S.shake = Math.max(0, S.shake - dt); S.go = Math.max(0, S.go - dt);
      var dx = S.tx - S.kx, dy = S.ty - S.ky, d = Math.hypot(dx, dy), mv = KSPEED * dt;
      if (d > 0.5) { var f = Math.min(1, mv / d); S.kx += dx * f; S.ky += dy * f; S.ang += (A.clamp(dx * .0045, -1.25, 1.25) - S.ang) * Math.min(1, dt * 18); } else S.ang *= Math.max(0, 1 - dt * 8);
      api.info = 'ROUND ' + Math.min(ROUNDS, S.round) + '/' + ROUNDS + '  SAVES ' + S.saves + '  GOALS ' + S.conceded + (S.combo > 1 ? '  COMBO x' + mult(S.combo) : '');
      if (S.ph === 'cd') { S.cd -= dt; if (S.cd <= 0) { S.ph = 'wait'; S.wait = .5; S.go = .6; api.sfx('coin'); } return; }
      if (S.ph === 'wait') { S.wait -= dt; if (S.wait <= 0) { newShot(); S.ph = 'shot'; api.sfx('whoosh'); } return; }
      if (S.ph === 'shot') { var b = S.ball; b.t += dt; ballPos(b); S.rot += dt * 9; if (b.t >= b.T) resolve(api); return; }
      if (S.ph === 'res') {
        var bb = S.ball; if (bb.st === 'saved') { bb.vy += 700 * dt; bb.x += bb.vx * dt; bb.y += bb.vy * dt; bb.r = Math.max(8, bb.r); S.rot += dt * 12; }
        S.wait -= dt; if (S.wait > 0) return;
        if (api.lives <= 0) { api.end('GAME OVER', 'Conceded 3 goals in round ' + S.round + '. ' + S.saves + ' saves.', false); return; }
        if (S.shots >= ROUNDS * PER) { api.add(api.lives * 200); api.end('CLEAN SHEET!', S.saves + ' saves from ' + ROUNDS * PER + ' shots', true); return; }
        if (S.shots % PER === 0) { S.round++; api.banner('ROUND ' + S.round, 1.3, C.hot); }
        S.ph = 'wait'; S.wait = S.shots % PER === 0 ? 1.1 : .45;
      }
    },
    draw: function (g) {
      g.save(); if (S.shake > 0) g.translate(Math.sin(S.t * 90) * 6 * S.shake, 0);
      scene(g, S.t, W, H, function (g2) {
        var b = S.ball;
        if (b && S.ph === 'shot') { var u = b.t / b.T, al = S.round <= 2 ? .85 : A.clamp((u - .3) * 3, 0, .85); g2.globalAlpha = al; g2.strokeStyle = C.gold; g2.lineWidth = 4; g2.beginPath(); g2.arc(b.ex, b.ey, REACH * (1 - .35 * u) + Math.sin(S.t * 12) * 2, 0, 7); g2.stroke(); g2.setLineDash([5, 7]); g2.beginPath(); g2.arc(b.ex, b.ey, PERFECT, 0, 7); g2.stroke(); g2.setLineDash([]); g2.globalAlpha = 1; }
        var moving = Math.hypot(S.tx - S.kx, S.ty - S.ky) > 6; drawKeeper(g2, S.kx, S.ky, S.ang, moving ? 1 : 0);
        if (b && b.st === 'goal') { g2.globalAlpha = .5; g2.strokeStyle = C.snow; g2.lineWidth = 2; g2.beginPath(); g2.arc(b.ex, b.ey, 22 + Math.sin(S.t * 20) * 3, 0, 7); g2.stroke(); g2.globalAlpha = 1; }
      });
      var b2 = S.ball; if (b2 && S.ph !== 'cd') drawBall(g, b2.st === 'goal' ? b2.ex : b2.x, b2.st === 'goal' ? b2.ey : b2.y, b2.r, S.rot);
      else if (S.ph === 'cd' || S.ph === 'wait') drawBall(g, 400, 415, 26, 0);
      g.restore();
      if (S.ph === 'cd') { A.txt(g, 'TAP WHERE THE BALL IS HEADING', W / 2, 395, 30, C.snow); }
      A.drawCD(g, W, H, S.cd, S.go);
    },
    pointer: {
      down: function (p) { if (!p) return; S.down = true; var q = clampT(p); S.tx = q.x; S.ty = q.y; },
      move: function (p) { if (!S.down || !p) return; var q = clampT(p); S.tx = q.x; S.ty = q.y; },
      up: function () { if (S) S.down = false; }
    },
    _state: function () { return S; },
    preview: function (g, t, w, h) {
      var ph = t % 3, tx = ph < 1.5 ? 400 : 290, ty = 170;
      scene(g, t, w, h, function (g2) { drawKeeper(g2, ph < 1.5 ? 400 : 400 + (-110) * Math.min(1, (ph - 1.5) * 3), 178, ph < 1.5 ? 0 : -1, ph < 1.5 ? 0 : 1); });
      var u = (ph % 1.5) / 1.5, bx = 400 + (tx - 400) * u, by = 415 + (ty - 415) * u - 55 * Math.sin(Math.PI * u); g.save(); g.scale(w / W, h / H); drawBall(g, bx, by, 26 - 15 * u, t * 8); g.restore();
    }
  });
})();
