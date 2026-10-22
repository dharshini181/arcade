/* Game 4: Fill the Basket. Catch the good stuff, dodge hazards, race the clock. */
(function () {
  'use strict';
  var A = window.Arcade, C = A.C, W = 360, H = 480, BW = 86, BH = 46, BY = H - 76, TIME = 60;
  var POINTS = { berry: 10, orange: 10, plum: 15, star: 30 }, COLOR = { berry: C.deep, orange: C.fire, plum: C.mag, star: C.gold };
  var S;

  function pickKind(prog) {
    var r = Math.random(), bomb = .09 + .1 * prog, rotten = .08;
    if (r < bomb) return 'bomb'; if (r < bomb + rotten) return 'rotten';
    var s = Math.random(); return s < .12 ? 'star' : s < .4 ? 'plum' : s < .7 ? 'orange' : 'berry';
  }
  function mult(combo) { return Math.min(5, 1 + Math.floor(combo / 4)); }
  function clampX(x) { return Math.max(BW / 2, Math.min(W - BW / 2, x)); }
  function caught(bx, ix, iy, ir) { return iy + ir >= BY && iy - ir <= BY + 14 && Math.abs(ix - bx) <= BW / 2 - 4 + ir * .3; }
  function star(g, r) { g.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); }
  function drawItem(g, it) {
    g.save(); g.translate(it.x, it.y); g.rotate(it.rot); var r = it.r; g.strokeStyle = C.ink; g.lineWidth = 3;
    if (it.kind === 'star') { g.shadowColor = C.gold; g.shadowBlur = 14; g.fillStyle = C.gold; star(g, r * 1.25); g.fill(); g.shadowBlur = 0; g.stroke(); }
    else if (it.kind === 'bomb') {
      g.fillStyle = C.ink; g.strokeStyle = C.fire; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke(); g.strokeStyle = C.gold; g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(5, -r - 8, 10, -r - 10); g.stroke();
      g.fillStyle = Math.floor(performance.now() / 120) % 2 ? C.gold : C.fire; g.beginPath(); g.arc(11, -r - 11, 4, 0, 7); g.fill(); g.fillStyle = C.fire; g.font = '900 16px Impact,system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', 0, 1);
    } else if (it.kind === 'rotten') {
      g.fillStyle = C.panel2; g.strokeStyle = C.mag; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke(); g.strokeStyle = C.hot; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(-7, -6); g.lineTo(-2, -1); g.moveTo(-2, -6); g.lineTo(-7, -1); g.moveTo(2, -6); g.lineTo(7, -1); g.moveTo(7, -6); g.lineTo(2, -1); g.moveTo(-6, 7); g.quadraticCurveTo(0, 3, 6, 7); g.stroke();
    } else {
      g.fillStyle = COLOR[it.kind]; g.beginPath(); if (it.kind === 'plum') g.ellipse(0, 0, r * .9, r, 0, 0, 7); else g.arc(0, 0, r, 0, 7); g.fill(); g.stroke();
      g.strokeStyle = C.snow; g.globalAlpha = .6; g.lineWidth = 3; g.beginPath(); g.arc(-r * .3, -r * .3, r * .5, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); g.globalAlpha = 1;
      g.strokeStyle = C.ink; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -r); g.lineTo(2, -r - 6); g.stroke(); g.fillStyle = C.gold; g.beginPath(); g.ellipse(7, -r - 2, 5, 2.6, -.4, 0, 7); g.fill(); g.stroke();
    }
    g.restore();
  }
  function drawBasket(g, x, flash) {
    g.save(); g.translate(x, BY); var hw = BW / 2, bw = hw * .72;
    g.strokeStyle = C.gold; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, hw * .8, Math.PI, 0); g.stroke();
    g.beginPath(); g.moveTo(-hw, 0); g.lineTo(hw, 0); g.lineTo(bw, BH); g.lineTo(-bw, BH); g.closePath(); g.save(); g.clip();
    var gr = g.createLinearGradient(0, 0, 0, BH); gr.addColorStop(0, C.gold); gr.addColorStop(1, C.fire); g.fillStyle = gr; g.fillRect(-hw, 0, BW, BH);
    g.strokeStyle = C.ink; g.globalAlpha = .55; g.lineWidth = 2; for (var i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * hw / 3.2, 0); g.lineTo(i * bw / 3.2, BH); g.stroke(); }
    [15, 31].forEach(function (y) { g.beginPath(); g.moveTo(-hw, y); g.lineTo(hw, y); g.stroke(); }); g.globalAlpha = 1; g.restore();
    g.beginPath(); g.moveTo(-hw, 0); g.lineTo(hw, 0); g.lineTo(bw, BH); g.lineTo(-bw, BH); g.closePath(); g.lineWidth = 3; g.strokeStyle = C.ink; g.stroke();
    A.rr(g, -hw - 5, -6, BW + 10, 11, 5); g.fillStyle = flash > 0 ? C.snow : C.deep; g.fill(); g.stroke(); g.restore();
  }

  A.register({
    id: 'basket', title: 'Fill the Basket', color: C.hot, W: W, H: H,
    desc: 'Slide the basket under falling fruit and stars. Skip the bombs and rotten fruit and beat the clock.',
    how: '<ul><li>Move the basket with the left/right arrows or A and D, or drag your finger or mouse across the game.</li><li>Catch fruit for points and stars for a big bonus. Catches in a row build a combo up to x5.</li><li>A bomb costs a life. Rotten fruit costs 25 points and breaks your combo. You have 3 lives.</li><li>Everything falls faster as the 60 seconds tick down. Missing good fruit breaks your combo.</li></ul>',
    reset: function (api) { S = { items: [], bx: W / 2, tx: W / 2, t: 0, next: .6, combo: 0, caught: 0, flash: 0, hit: 0 }; api.lives = 3; api.info = 'TIME ' + TIME + 's'; },
    update: function (dt, api) {
      S.t += dt; S.flash = Math.max(0, S.flash - dt); S.hit = Math.max(0, S.hit - dt); var prog = Math.min(1, S.t / TIME); api.info = 'TIME ' + Math.max(0, Math.ceil(TIME - S.t)) + 's  COMBO x' + mult(S.combo);
      var k = api.keys; if (k.has('arrowleft') || k.has('a')) S.tx = clampX(S.tx - 400 * dt); if (k.has('arrowright') || k.has('d')) S.tx = clampX(S.tx + 400 * dt);
      var dx = S.tx - S.bx, mv = 900 * dt; S.bx += Math.abs(dx) < mv ? dx : Math.sign(dx) * mv;
      S.next -= dt;
      if (S.next <= 0 && S.t < TIME) { var kind = pickKind(prog); S.items.push({ kind: kind, x: A.rnd(26, W - 26), y: -24, v: (150 + 190 * prog) * A.rnd(.85, 1.15), r: kind === 'star' ? 13 : 15, rot: 0, vr: A.rnd(-1.5, 1.5) }); S.next = (.95 - .45 * prog) * A.rnd(.7, 1.3); }
      for (var i = S.items.length - 1; i >= 0; i--) {
        var it = S.items[i]; it.y += it.v * dt; it.rot += it.vr * dt;
        if (caught(S.bx, it.x, it.y, it.r)) {
          S.items.splice(i, 1);
          if (it.kind === 'bomb') { api.lives--; S.combo = 0; S.hit = .35; api.fx.burst(it.x, it.y, [C.fire, C.gold, C.snow], 22, 230); api.fx.pop('-1 LIFE', it.x, it.y - 20, C.fire); api.sfx('boom'); if (api.lives <= 0) { api.end('GAME OVER', 'Out of lives. ' + S.caught + ' items caught.', false); return; } }
          else if (it.kind === 'rotten') { api.add(-25); S.combo = 0; api.fx.burst(it.x, it.y, [C.mag, C.hot], 10, 120); api.fx.pop('-25', it.x, it.y - 20, C.hot); api.sfx('bad'); }
          else { S.combo++; S.caught++; var m = mult(S.combo), pts = POINTS[it.kind] * m; api.add(pts); S.flash = .12; api.fx.pop('+' + pts + (m > 1 ? ' x' + m : ''), it.x, it.y - 20, COLOR[it.kind]); api.sfx('good', Math.min(S.combo, 10) * 40); api.fx.burst(it.x, it.y, [COLOR[it.kind], C.gold, C.snow], 8, 120); }
        } else if (it.y > H + 30) { S.items.splice(i, 1); if (it.kind !== 'bomb' && it.kind !== 'rotten') { if (S.combo > 2) api.fx.pop('COMBO LOST', S.bx, BY - 40, C.hot); S.combo = 0; } }
      }
      if (S.t >= TIME && !S.items.length) api.end('TIME UP!', S.caught + ' items caught', true);
    },
    draw: function (g) {
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#31093D'); bg.addColorStop(1, '#12000F'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,0,255,.06)'; for (var i = 0; i < 7; i++) g.fillRect((i * 57 + S.t * 14) % W, 0, 3, H);
      g.fillStyle = '#1F0526'; g.fillRect(0, BY + BH + 4, W, H); g.fillStyle = C.deep; g.fillRect(0, BY + BH + 4, W, 3);
      S.items.forEach(function (it) { drawItem(g, it); }); drawBasket(g, S.bx, S.flash);
      if (S.combo >= 4) { g.fillStyle = C.gold; g.font = '900 14px Impact,system-ui,sans-serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('COMBO x' + mult(S.combo), 12, H - 12); }
      if (S.hit > 0) { g.fillStyle = 'rgba(255,69,0,' + S.hit * .8 + ')'; g.fillRect(0, 0, W, H); }
    },
    pointer: { down: function (p) { S.tx = clampX(p.x); }, move: function (p) { S.tx = clampX(p.x); }, up: function () {} },
    preview: function (g, t, w, h) {
      var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#31093D'); bg.addColorStop(1, '#12000F'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      var bx = w / 2 + Math.sin(t * 1.5) * 90; g.save(); g.translate(bx, 138); g.fillStyle = C.gold; g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(-40, 0); g.lineTo(40, 0); g.lineTo(30, 42); g.lineTo(-30, 42); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = C.fire; g.lineWidth = 2; for (var i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 14, 0); g.lineTo(i * 10, 42); g.stroke(); } g.restore();
      [[C.deep, 70, 0], [C.fire, 160, .8], [C.mag, 250, 1.6]].forEach(function (f) { var y = ((t * 70 + f[2] * 60) % 190) - 10; g.fillStyle = f[0]; g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.arc(f[1], y, 14, 0, 7); g.fill(); g.stroke(); });
    }
  });
})();
