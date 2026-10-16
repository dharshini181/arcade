/* Game 8: Homerun Hero. One-tap baseball timing. 15 pitches (last 3 are a x2 bonus round), 3 outs ends it, score 8 runs to win. */
(function () {
  'use strict';
  var A = window.Arcade, C = A.C, W = 800, H = 450, PITCHES = 15, TARGET = 8, BONUS = 3, SW = .208, SWDUR = .34, ZX = 405, ZY = 322, WALL = 132, S;
  var COL = '#FFB020', GRASS = '#2f9e44';

  function lvl() { return Math.min(1, S.used / PITCHES); }
  function newPitch() {
    var r = Math.random(), kind = S.used < 2 ? 'fast' : r < .5 ? 'fast' : r < .8 ? 'curve' : 'change', base = 1.15 - .5 * lvl();
    var T = base * (kind === 'fast' ? 1 : kind === 'curve' ? 1.18 : 1.5), mph = kind === 'fast' ? Math.round(78 + 25 * lvl()) : kind === 'curve' ? Math.round(66 + 10 * lvl()) : Math.round(58 + 8 * lvl());
    S.ball = { kind: kind, t: 0, T: T, ex: ZX + A.rnd(-22, 22), amp: kind === 'curve' ? A.rnd(55, 85) * (Math.random() < .5 ? -1 : 1) : 0, mph: mph, x: 400, y: 190, r: 4 };
    S.windup = A.rnd(.55, 1.15); S.ph = 'windup'; S.wt = 0; S.swung = false; S.swing = null; S.res = null; S.fl = null;
  }
  function ballAt(b) {
    var e = Math.pow(Math.min(b.t / b.T, 1.35), 1.55), ee = Math.min(e, 1.4);
    b.x = 400 + (b.ex - 400) * ee + b.amp * Math.sin(Math.PI * Math.min(ee, 1)) * (1 - ee * .15); b.y = 190 + (ZY - 190) * ee; b.r = 3.5 + 17 * ee;
  }
  function showRes(text, sub, col) { S.res = { text: text, sub: sub || '', col: col || C.gold, t: 0 }; }
  function strike(api, why) {
    S.strikes++; var out = S.strikes >= 3;
    if (out) { S.outs++; S.strikes = 0; api.lives = 3 - S.outs; api.sfx('lose'); }
    return out;
  }
  function judge(api) {
    var b = S.ball, err = b.t + SW - b.T, ae = Math.abs(err), bonus = S.used >= PITCHES - BONUS, m = bonus ? 2 : 1;
    S.swung = true; S.swing = { t: 0 }; api.sfx('whoosh');
    if (ae > .18) { var out = strike(api); showRes(err < 0 ? 'TOO EARLY' : 'TOO LATE', out ? 'STRUCK OUT!' : 'STRIKE ' + S.strikes, C.hot); S.ph = 'res'; S.wait = 1.5; b.pass = true; api.sfx('bad'); return; }
    var q = ae <= .035 ? 4 : ae <= .075 ? 3 : ae <= .125 ? 2 : 1, side = A.clamp(err * 5, -1, 1), dist = 0, runs = 0, name = '', col = C.gold;
    if (q === 1) {
      var had = S.strikes; if (had < 2) strike(api); showRes('FOUL BALL', had < 2 ? 'STRIKE ' + S.strikes : 'STILL 2 STRIKES', C.hot);
      S.fl = { t: 0, T: .9, x0: ZX, y0: ZY, x1: ZX + (err < 0 ? -1 : 1) * 380, y1: 250, apex: 90, r0: 16 }; S.ph = 'fly'; api.sfx('hit'); api.add(10); api.fx.burst(ZX, ZY, [C.snow, C.gold], 6, 150); return;
    }
    if (q === 4) { dist = Math.round(A.rnd(385, 470)); runs = 4; name = 'HOME RUN!'; col = C.gold; }
    else if (q === 3) { dist = Math.round(A.rnd(255, 345)); runs = 2; name = 'BIG HIT!'; col = C.hot; }
    else { dist = Math.round(A.rnd(120, 205)); runs = 1; name = 'SINGLE'; col = '#34F58B'; }
    runs *= m; var pts = (runs * 100 + dist) * 1; api.add(pts); S.runs += runs; S.longest = Math.max(S.longest, dist); S.hits++;
    showRes(name + (m > 1 ? ' x2' : ''), dist + ' ft  +' + runs + (runs > 1 ? ' runs' : ' run'), col);
    var hr = q === 4, y1 = hr ? 72 : A.clamp(ZY - dist * .6, WALL + 12, ZY - 50);
    S.fl = { t: 0, T: hr ? 1.8 : 1.1 + dist / 400, x0: ZX, y0: ZY, x1: ZX + side * (hr ? 90 : 60) + A.rnd(-40, 40), y1: y1, apex: hr ? 240 : 60 + dist * .28, r0: 16, hr: hr }; S.ph = 'fly';
    api.sfx('hit'); api.fx.burst(ZX, ZY, [C.snow, C.gold, COL], hr ? 24 : 12, 220); S.crowd = hr ? 1 : .55; S.shake = hr ? .3 : .12;
    if (hr) { api.sfx('cheer'); api.fx.ring(ZX, ZY, C.gold, 100); }
  }
  function endPitch(api) {
    S.used++;
    if (S.outs >= 3) { api.end('THREE OUTS', S.runs + ' runs, needed ' + TARGET + '.', S.runs >= TARGET); return true; }
    if (S.used >= PITCHES) {
      if (S.runs >= TARGET) { api.add(500); api.end('YOU WIN!', S.runs + ' runs. Longest hit ' + S.longest + ' ft.', true); } else api.end('GAME OVER', S.runs + ' runs, needed ' + TARGET + '. Longest hit ' + S.longest + ' ft.', false);
      return true;
    }
    if (S.used === PITCHES - BONUS) api.banner('BONUS ROUND x2', 1.5, C.hot);
    return false;
  }

  function field(g, w, h, t, crowd) {
    g.save(); g.scale(w / W, h / H);
    var sk = g.createLinearGradient(0, 0, 0, WALL); sk.addColorStop(0, '#0a1233'); sk.addColorStop(1, '#3b2a6d'); g.fillStyle = sk; g.fillRect(0, 0, W, WALL);
    for (var r = 0; r < 4; r++) for (var i = 0; i < 70; i++) { var j = Math.sin(t * 7 + i * 1.7 + r) * crowd * 5; g.fillStyle = ['#ff69b4', '#ffd700', '#7cf', '#fff', '#f60', '#9f6'][(i * 5 + r * 2) % 6]; g.globalAlpha = .8; g.fillRect(i * 12 + (r % 2) * 6, 22 + r * 24 - Math.abs(j), 6, 9); } g.globalAlpha = 1;
    g.fillStyle = '#16603a'; g.fillRect(0, WALL - 4, W, 18); g.fillStyle = C.gold; g.fillRect(0, WALL - 4, W, 4);
    var gr = g.createLinearGradient(0, WALL + 14, 0, H); gr.addColorStop(0, '#3fb85a'); gr.addColorStop(1, GRASS); g.fillStyle = gr; g.fillRect(0, WALL + 14, W, H - WALL);
    for (i = 0; i < 9; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.06)'; var y0 = WALL + 14 + Math.pow(i / 9, 1.5) * (H - WALL), y1 = WALL + 14 + Math.pow((i + 1) / 9, 1.5) * (H - WALL); g.fillRect(0, y0, W, y1 - y0); }
    g.fillStyle = '#b5703b'; g.beginPath(); g.ellipse(400, 330, 230, 105, 0, 0, 7); g.fill(); g.fillStyle = '#3fb85a'; g.beginPath(); g.ellipse(400, 262, 120, 40, 0, 0, 7); g.fill();
    g.fillStyle = '#c98a52'; g.beginPath(); g.ellipse(400, 188, 34, 10, 0, 0, 7); g.fill(); g.fillStyle = C.snow; g.fillRect(392, 186, 16, 3);
    g.fillStyle = C.snow; g.beginPath(); g.moveTo(ZX - 24, 362); g.lineTo(ZX + 24, 362); g.lineTo(ZX + 24, 372); g.lineTo(ZX, 384); g.lineTo(ZX - 24, 372); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(ZX, 380); g.lineTo(60, 215); g.moveTo(ZX, 380); g.lineTo(740, 215); g.stroke();
    g.restore();
  }
  function person(g, x, y, s, shirt, helmet) {
    g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = C.ink; g.lineWidth = 3;
    g.fillStyle = '#26307a'; g.fillRect(-14, 20, 11, 42); g.fillRect(3, 20, 11, 42); g.strokeRect(-14, 20, 11, 42); g.strokeRect(3, 20, 11, 42);
    g.fillStyle = shirt; A.rr(g, -20, -26, 40, 52, 10); g.fill(); g.stroke();
    g.fillStyle = '#f2c9a0'; g.beginPath(); g.arc(0, -40, 14, 0, 7); g.fill(); g.stroke();
    g.fillStyle = helmet; g.beginPath(); g.arc(0, -43, 15, Math.PI, 0); g.fill(); g.stroke(); g.fillRect(-1, -45, 22, 4); g.strokeRect(-1, -45, 22, 4);
    g.restore();
  }
  function bat(g, px, py, ang) { g.save(); g.translate(px, py); g.rotate(ang); g.lineCap = 'round'; g.strokeStyle = C.ink; g.lineWidth = 14; g.beginPath(); g.moveTo(-6, 0); g.lineTo(96, 0); g.stroke(); g.strokeStyle = '#e8b36a'; g.lineWidth = 8; g.beginPath(); g.moveTo(-6, 0); g.lineTo(96, 0); g.stroke(); g.strokeStyle = C.ink; g.lineWidth = 16; g.beginPath(); g.moveTo(-10, 0); g.lineTo(-6, 0); g.stroke(); g.restore(); g.lineCap = 'butt'; }
  function ball(g, x, y, r) { g.fillStyle = C.snow; g.strokeStyle = C.ink; g.lineWidth = Math.max(1.5, r / 6); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke(); g.strokeStyle = C.deep; g.lineWidth = Math.max(1, r / 9); g.beginPath(); g.arc(x - r * .9, y, r * .8, -.8, .8); g.stroke(); g.beginPath(); g.arc(x + r * .9, y, r * .8, Math.PI - .8, Math.PI + .8); g.stroke(); }

  A.register({
    id: 'homerun', title: 'Homerun Hero', color: COL, W: W, H: H,
    desc: 'Baseball timing challenge. One tap swings the bat. Time it right to crush home runs.',
    how: '<ul><li>The pitcher winds up and throws. Tap the screen to swing. The ball must be at the glowing strike zone as the bat comes through.</li><li>Perfect timing is a HOME RUN (4 runs). Close is a big hit (2) or single (1). Too early or too late is a strike, a weak tap is a foul.</li><li>3 strikes is an out and 3 outs ends the game. You get 15 pitches and the last 3 are a x2 BONUS round.</li><li>Score 8 runs to win. Watch the pitch: fastballs are quick, curveballs bend, changeups arrive late.</li></ul>',
    reset: function (api) {
      S = { ph: 'cd', cd: 3, go: 0, wait: 0, used: 0, runs: 0, strikes: 0, outs: 0, hits: 0, longest: 0, ball: null, swing: null, res: null, fl: null, windup: 1, wt: 0, swung: false, crowd: .1, shake: 0, t: 0 };
      api.lives = 3; api.info = 'PITCH 1/' + PITCHES;
    },
    update: function (dt, api) {
      S.t += dt; S.go = Math.max(0, S.go - dt); S.shake = Math.max(0, S.shake - dt); S.crowd = Math.max(.08, S.crowd - dt * .35);
      if (S.swing) { S.swing.t += dt; if (S.swing.t > SWDUR + .25) S.swing = null; }
      if (S.res) S.res.t += dt;
      api.info = 'PITCH ' + Math.min(PITCHES, S.used + 1) + '/' + PITCHES + '  RUNS ' + S.runs + '/' + TARGET + '  STRIKES ' + S.strikes + (S.used >= PITCHES - BONUS ? '  BONUS x2' : '');
      if (S.ph === 'cd') { S.cd -= dt; if (S.cd <= 0) { api.sfx('coin'); S.go = .6; newPitch(); } return; }
      if (S.ph === 'windup') { S.wt += dt; if (S.wt >= S.windup) { S.ph = 'pitch'; S.ball.t = 0; api.sfx('whoosh'); } return; }
      if (S.ph === 'pitch') {
        var b = S.ball; b.t += dt; ballAt(b);
        if (!S.swung && b.t > b.T + .2) { var out = strike(api); showRes('STRIKE LOOKING', out ? 'STRUCK OUT!' : 'STRIKE ' + S.strikes, C.hot); S.ph = 'res'; S.wait = 1.5; b.pass = true; api.sfx('bad'); }
        return;
      }
      if (S.ph === 'res') {
        if (S.ball && S.ball.pass) { S.ball.t += dt; ballAt(S.ball); }
        S.wait -= dt; if (S.wait <= 0 && !endPitch(api)) newPitch(); return;
      }
      if (S.ph === 'fly') {
        var f = S.fl; f.t += dt; if (f.t < f.T) return;
        if (f.hr) { api.fx.burst(f.x1, f.y1 + 20, [C.gold, C.hot, C.snow, C.mag, '#7cf'], 50, 300, 200); api.fx.ring(f.x1, f.y1 + 20, C.gold, 120); api.sfx('win'); S.wait = 1.4; }
        else S.wait = .9;
        S.ph = 'res'; S.ball.pass = false;
      }
    },
    draw: function (g) {
      g.save(); if (S.shake > 0) g.translate(Math.sin(S.t * 80) * 7 * S.shake, Math.cos(S.t * 70) * 4 * S.shake);
      field(g, W, H, S.t, S.crowd);
      /* strike zone hint */
      var near = S.ph === 'pitch' ? A.clamp(S.ball.t / S.ball.T, 0, 1) : 0;
      g.strokeStyle = 'rgba(255,215,0,' + (.25 + .55 * near) + ')'; g.lineWidth = 3 + near * 3; g.setLineDash([8, 6]); A.rr(g, ZX - 32, ZY - 30, 64, 60, 8); g.stroke(); g.setLineDash([]);
      /* pitcher */
      var wp = S.ph === 'windup' ? A.clamp(S.wt / S.windup, 0, 1) : (S.ph === 'pitch' || S.ph === 'res' || S.ph === 'fly') ? 1 : 0;
      person(g, 400, 150, .55, '#c0392b', '#c0392b');
      g.strokeStyle = '#f2c9a0'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(405, 138); var ax = wp < .7 ? 420 - wp * 30 : 420 + (wp - .7) * 60, ay = wp < .7 ? 138 - wp * 55 : 100 + (wp - .7) * 140; g.lineTo(ax, ay); g.stroke(); g.lineCap = 'butt';
      if (S.ph === 'windup' || S.ph === 'cd') ball(g, ax + 2, ay - 2, 4);
      /* batter and bat */
      person(g, 318, 300, 1.15, '#2980b9', '#1c4f7c');
      var ang = -1.9; if (S.swing) { var u = A.clamp(S.swing.t / SWDUR, 0, 1); ang = -1.9 + 3.1 * (1 - Math.pow(1 - u, 1.4)); if (S.swing.t > SWDUR) ang = 1.2; }
      bat(g, 352, ZY, ang);
      /* ball in flight */
      if (S.ph === 'pitch' || (S.ph === 'res' && S.ball && S.ball.pass)) { var bl = S.ball; if (bl.t < bl.T + .4) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(bl.x, Math.min(bl.y + bl.r + 6, 380), bl.r, bl.r * .35, 0, 0, 7); g.fill(); ball(g, bl.x, bl.y, bl.r); } }
      if (S.fl && (S.ph === 'fly' || (S.ph === 'res' && S.fl))) {
        var f = S.fl, uu = Math.min(1, f.t / f.T), fx = f.x0 + (f.x1 - f.x0) * uu, fy = f.y0 + (f.y1 - f.y0) * uu - f.apex * 4 * uu * (1 - uu), fr = f.r0 * (1 - .75 * uu);
        if (!(f.hr && uu >= 1)) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(f.x0 + (f.x1 - f.x0) * uu, f.y0 + (f.y1 - f.y0) * uu, fr, fr * .35, 0, 0, 7); g.fill(); ball(g, fx, fy, Math.max(3, fr)); }
      }
      g.restore();
      /* scoreboard */
      g.fillStyle = 'rgba(10,0,20,.72)'; A.rr(g, 12, 150, 188, 102, 12); g.fill(); g.strokeStyle = COL; g.lineWidth = 3; g.stroke();
      A.txt(g, 'RUNS ' + S.runs + '/' + TARGET, 24, 172, 24, C.gold, 'left'); A.txt(g, 'PITCH ' + Math.min(PITCHES, S.used + 1) + '/' + PITCHES, 24, 200, 18, C.snow, 'left');
      var dots = function (n, max, yy, col, lab) { A.txt(g, lab, 24, yy, 16, C.hot, 'left'); for (var i = 0; i < max; i++) { g.fillStyle = i < n ? col : 'rgba(255,255,255,.2)'; g.beginPath(); g.arc(124 + i * 22, yy, 8, 0, 7); g.fill(); } };
      dots(S.strikes, 3, 224, C.fire, 'STRIKES'); dots(S.outs, 3, 244, C.deep, 'OUTS');
      if (S.ph === 'pitch') { A.txt(g, S.ball.kind.toUpperCase() + '  ' + S.ball.mph + ' MPH', W / 2, 36, 22, C.snow); }
      if (S.used >= PITCHES - BONUS && S.ph !== 'cd') A.txt(g, 'BONUS x2', W - 20, 30, 26, C.hot, 'right');
      if (S.res) { var al = S.res.t < 1.6 ? 1 : 0; g.globalAlpha = al; var sc = 1 + Math.max(0, .3 - S.res.t) * 2; A.txt(g, S.res.text, W / 2, 205, 62 * sc, S.res.col); A.txt(g, S.res.sub, W / 2, 255, 28, C.snow); g.globalAlpha = 1; }
      if (S.ph === 'windup' && S.used < 2) A.txt(g, 'TAP TO SWING WHEN THE BALL REACHES THE BOX', W / 2, 415, 24, C.snow);
      A.drawCD(g, W, H, S.ph === 'cd' ? S.cd : 0, S.go);
    },
    pointer: {
      down: function (p, api) { if (!S || S.ph !== 'pitch' || S.swung) return; judge(api); },
      move: function () {}, up: function () {}
    },
    _state: function () { return S; },
    preview: function (g, t, w, h) {
      field(g, w, h, t, .5); g.save(); g.scale(w / W, h / H); var u = (t % 2.4) / 1.6, e = Math.pow(Math.min(u, 1), 1.55);
      person(g, 400, 150, .55, '#c0392b', '#c0392b'); person(g, 318, 300, 1.15, '#2980b9', '#1c4f7c');
      var sw = t % 2.4 > 1.35 ? A.clamp((t % 2.4 - 1.35) / SWDUR, 0, 1) : 0; bat(g, 352, ZY, sw ? -1.9 + 3.1 * sw : -1.9);
      if (u < 1) ball(g, 400 + (ZX - 400) * e, 190 + (ZY - 190) * e, 3.5 + 17 * e);
      else { var v = A.clamp((t % 2.4 - 1.6) / .8, 0, 1); ball(g, ZX + 30 * v, ZY - 230 * v + 600 * v * v * .3, 14 * (1 - .7 * v)); }
      g.restore();
    }
  });
})();
