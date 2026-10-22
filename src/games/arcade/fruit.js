/* Game 1: Fruit Slash. Swipe to slice fruit, avoid bombs. */
(function () {
  'use strict';
  var A = window.Arcade, C = A.C, W = 360, H = 480, GRAV = 640, TIME = 60, TRAIL = .22;
  var KINDS = ['berry', 'orange', 'lemon', 'plum', 'peach'];
  var LOOK = { berry: { b: C.deep, f: C.hot }, orange: { b: C.fire, f: C.gold }, lemon: { b: C.gold, f: C.snow }, plum: { b: C.mag, f: C.hot }, peach: { b: C.hot, f: C.snow } };
  var S;

  function launch(bombChance) {
    var x = A.rnd(50, W - 50), apex = A.rnd(70, 240), y = H + 30, bomb = Math.random() < bombChance;
    return { kind: bomb ? 'bomb' : A.pick(KINDS), x: x, y: y, vx: (W / 2 - x) * A.rnd(.25, .6), vy: -Math.sqrt(2 * GRAV * (y - apex)), r: bomb ? 24 : A.rnd(26, 30), rot: 0, vr: A.rnd(-3, 3), cut: false };
  }
  function drawWhole(g, f) {
    g.save(); g.translate(f.x, f.y); g.rotate(f.rot); var r = f.r; g.lineWidth = 3; g.strokeStyle = C.ink;
    if (f.kind === 'bomb') {
      g.fillStyle = C.ink; g.strokeStyle = C.fire; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke();
      g.strokeStyle = C.snow; g.globalAlpha = .5; g.beginPath(); g.arc(-r * .3, -r * .3, r * .5, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); g.globalAlpha = 1;
      g.strokeStyle = C.gold; g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(6, -r - 10, 12, -r - 12); g.stroke();
      g.fillStyle = Math.floor(performance.now() / 120) % 2 ? C.gold : C.fire; g.beginPath(); g.arc(13, -r - 13, 4.5, 0, 7); g.fill();
      g.fillStyle = C.fire; g.font = '900 20px Impact,system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', 0, 1);
    } else {
      var L = LOOK[f.kind]; g.fillStyle = L.b; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke();
      g.strokeStyle = C.snow; g.globalAlpha = .6; g.lineWidth = 4; g.beginPath(); g.arc(-r * .3, -r * .3, r * .5, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); g.globalAlpha = 1;
      g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -r); g.lineTo(3, -r - 9); g.stroke();
      g.fillStyle = C.gold; g.beginPath(); g.ellipse(9, -r - 4, 7, 3.5, -.4, 0, 7); g.fill(); g.stroke();
    }
    g.restore();
  }
  function drawHalf(g, h) {
    var L = LOOK[h.kind]; g.save(); g.translate(h.x, h.y); g.rotate(h.ang + h.rot + (h.side === 1 ? 0 : Math.PI));
    g.fillStyle = L.b; g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, h.r, 0, Math.PI); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = L.f; g.beginPath(); g.arc(0, 0, h.r * .82, 0, Math.PI); g.closePath(); g.fill();
    g.fillStyle = C.ink; [-.4, 0, .4].forEach(function (s) { g.beginPath(); g.arc(s * h.r, h.r * .28, 2.2, 0, 7); g.fill(); }); g.restore();
  }
  function slice(f, a, b, api) {
    if (f.cut) return; f.cut = true;                       /* a fruit can only ever be cut once */
    var i = S.fl.indexOf(f); if (i < 0) return; S.fl.splice(i, 1);
    if (f.kind === 'bomb') {
      api.fx.burst(f.x, f.y, [C.fire, C.gold, C.snow], 26, 240); api.fx.ring(f.x, f.y, C.fire, 70); api.fx.pop('-1 LIFE', f.x, f.y, C.fire);
      S.flash = .4; S.streak = 0; S.swipe = 0; api.lives--; api.sfx('boom'); if (api.lives <= 0) api.end('GAME OVER', 'You sliced a bomb. ' + S.sliced + ' fruit sliced.', false);
      return;
    }
    var L = LOOK[f.kind], ang = Math.atan2(b.y - a.y, b.x - a.x), n = ang + Math.PI / 2;
    S.sliced++; S.swipe++; S.streak++;
    var mult = Math.min(4, 1 + Math.floor(S.streak / 6)), pts = 10 * mult; api.add(pts); api.fx.pop('+' + pts, f.x, f.y, L.f); api.sfx('good', S.swipe * 60);
    api.fx.burst(f.x, f.y, [L.f, L.b, C.snow], 14, 180);
    [1, -1].forEach(function (side) { S.bits.push({ kind: f.kind, x: f.x, y: f.y, vx: f.vx + Math.cos(n) * side * 80, vy: f.vy - 50, rot: 0, vr: f.vr + side * 2.5, r: f.r, ang: ang, side: side }); });
  }
  function sweep(a, b, api) { S.fl.slice().forEach(function (f) { if (A.segHitsCircle(a.x, a.y, b.x, b.y, f.x, f.y, f.r)) slice(f, a, b, api); }); }

  A.register({
    id: 'fruit', title: 'Fruit Slash', color: C.fire, W: W, H: H,
    desc: 'Swipe through flying fruit, chain combos and dodge the bombs before the clock runs out.',
    how: '<ul><li>Swipe with your finger or mouse across the fruit to slice it.</li><li>Slice 3 or more in one swipe for a combo bonus. Long streaks raise your multiplier.</li><li>Slicing a bomb costs a life. You have 3 lives and 60 seconds.</li><li>Fruit and bombs come faster as time passes. Pause with P or Esc.</li></ul>',
    reset: function (api) { S = { fl: [], bits: [], trail: [], t: 0, next: .5, sliced: 0, swipe: 0, streak: 0, down: false, last: null, flash: 0 }; api.lives = 3; api.info = 'TIME ' + TIME + 's'; },
    update: function (dt, api) {
      S.t += dt; S.flash = Math.max(0, S.flash - dt); var prog = Math.min(1, S.t / TIME); api.info = 'TIME ' + Math.max(0, Math.ceil(TIME - S.t)) + 's';
      S.next -= dt;
      if (S.next <= 0 && S.t < TIME - 1.2) { var n = 1 + Math.floor(Math.random() * (1.3 + prog * 2.4)); for (var i = 0; i < n; i++) S.fl.push(launch(.08 + .14 * prog)); S.next = (1.05 - .45 * prog) * A.rnd(.75, 1.35); }
      S.fl.forEach(function (f) { f.vy += GRAV * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; });
      S.bits.forEach(function (h) { h.vy += GRAV * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vr * dt; });
      S.bits = S.bits.filter(function (h) { return h.y < H + 60; });
      for (var j = S.fl.length - 1; j >= 0; j--) { var f = S.fl[j]; if (f.y > H + 40 && f.vy > 0) { S.fl.splice(j, 1); if (f.kind !== 'bomb') S.streak = 0; } }
      S.trail = S.trail.filter(function (p) { return S.t - p.t < TRAIL; });
      if (S.t >= TIME) api.end('TIME UP!', S.sliced + ' fruit sliced', true);
    },
    draw: function (g, api) {
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#31093D'); bg.addColorStop(1, '#12000F'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,215,0,.13)'; g.beginPath(); g.arc(W * .78, 92, 46, 0, 7); g.fill();
      for (var i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,0,255,.05)'; g.fillRect(i * (W / 5.4) + 10, 0, 10, H); }
      S.fl.forEach(function (f) { drawWhole(g, f); }); S.bits.forEach(function (h) { drawHalf(g, h); });
      if (S.trail.length > 1) {
        g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = C.gold; g.shadowBlur = 12;
        for (var k = 1; k < S.trail.length; k++) { var a = S.trail[k - 1], b = S.trail[k], age = Math.min(1, (S.t - b.t) / TRAIL); g.strokeStyle = 'rgba(255,244,250,' + (1 - age) + ')'; g.lineWidth = Math.max(1, 10 * (1 - age)); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        g.shadowBlur = 0;
      }
      if (S.streak >= 6) { g.fillStyle = C.gold; g.font = '900 14px Impact,system-ui,sans-serif'; g.textAlign = 'left'; g.fillText('STREAK ' + S.streak + '  x' + Math.min(4, 1 + Math.floor(S.streak / 6)), 12, H - 14); }
      if (S.flash > 0) { g.fillStyle = 'rgba(255,69,0,' + S.flash + ')'; g.fillRect(0, 0, W, H); }
    },
    pointer: {
      down: function (p, api) { S.down = true; S.swipe = 0; S.last = p; S.trail = [{ x: p.x, y: p.y, t: S.t }]; sweep(p, p, api); },
      move: function (p, api) { if (!S.down) return; var a = S.last; S.last = p; S.trail.push({ x: p.x, y: p.y, t: S.t }); sweep(a, p, api); },
      up: function (p, api) {
        var n = S.swipe; S.down = false; S.swipe = 0;
        if (p && n >= 3) { var bonus = (n - 2) * 20; api.add(bonus); api.fx.pop('COMBO x' + n + '  +' + bonus, W / 2, H * .55, C.gold); api.sfx('coin'); }
      }
    },
    preview: function (g, t, w, h) {
      var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#31093D'); bg.addColorStop(1, '#12000F'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,215,0,.15)'; g.beginPath(); g.arc(w * .8, 44, 28, 0, 7); g.fill();
      [[70, C.deep], [160, C.fire], [250, C.gold]].forEach(function (f, i) { var y = h * .55 - Math.abs(Math.sin(t * 1.6 + i * 1.3)) * 70; g.fillStyle = f[1]; g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.arc(f[0], y, 26, 0, 7); g.fill(); g.stroke(); g.strokeStyle = C.snow; g.globalAlpha = .6; g.beginPath(); g.arc(f[0] - 8, y - 8, 12, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); g.globalAlpha = 1; });
      var s = (t * 1.1) % 1; g.lineCap = 'round'; g.strokeStyle = C.snow; g.shadowColor = C.gold; g.shadowBlur = 10; g.lineWidth = 5; g.beginPath(); g.moveTo(20 + s * 120, 170 - s * 120); g.lineTo(80 + s * 220, 110 - s * 120); g.stroke(); g.shadowBlur = 0;
    }
  });
})();
