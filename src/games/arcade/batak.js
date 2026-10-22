/* Game 7: Batak Pro. Reflex rush. Tap the glowing targets before they fade, never touch the red ones. 30/60/90 s, 1 or 2 players. */
(function () {
  'use strict';
  var A = window.Arcade, C = A.C, W = 800, H = 450, R = 54, TAPR = 66;
  var CY = '#29E3FF', OR = '#FFB020', RED = '#FF2D55', GRN = '#34F58B', BLU = '#2D9CFF', S;
  var modeSec = 60, players = 1;           /* remembered between restarts */
  var BTN = {
    t30: { x: 130, y: 150, w: 150, h: 84, v: 30 }, t60: { x: 325, y: 150, w: 150, h: 84, v: 60 }, t90: { x: 520, y: 150, w: 150, h: 84, v: 90 },
    p1: { x: 180, y: 262, w: 210, h: 84 }, p2: { x: 410, y: 262, w: 210, h: 84 }, go: { x: 270, y: 368, w: 260, h: 66 }
  };
  function inBtn(b, p) { return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h; }
  function slots(two) {
    var out = [], ys = [140, 260, 380], xs = two ? [[105, 290], [510, 695]] : [[130, 310, 490, 670]];
    xs.forEach(function (cols, side) { cols.forEach(function (x) { ys.forEach(function (y) { out.push({ x: x, y: y, side: side, busy: false }); }); }); });
    return out;
  }
  function newSide() { return { score: 0, combo: 0, best: 0, hits: 0, miss: 0, rtSum: 0, rtN: 0, spawn: .6, hitFlash: 0 }; }
  function mult(c) { return Math.min(5, 1 + Math.floor(c / 5)); }
  function prog() { return A.clamp(1 - S.left / S.total, 0, 1); }
  function spawn(side, api) {
    var free = S.slots.filter(function (s) { return s.side === side && !s.busy; }); if (!free.length) return;
    var s = A.pick(free), bad = S.spawned > 3 && Math.random() < .17 + .08 * prog(), life = (1.75 - 1.0 * prog()) * (bad ? 1.1 : 1);
    s.busy = true; S.spawned++; S.tg.push({ s: s, side: side, bad: bad, life: life, max: life, col: bad ? RED : (Math.random() < .5 ? BLU : GRN), born: 0 });
  }
  function release(t) { t.s.busy = false; }
  function tapAt(side, p, api) {
    var st = S.st[side], hit = null, bd = 1e9;
    S.tg.forEach(function (t) { if (t.side !== side && S.two) return; var d = Math.hypot(t.s.x - p.x, t.s.y - p.y); if (d <= TAPR && d < bd) { bd = d; hit = t; } });
    if (!hit) { st.miss++; st.combo = 0; S.ripples.push({ x: p.x, y: p.y, t: 0, c: C.hot }); api.sfx('tap', -200); return; }
    S.tg.splice(S.tg.indexOf(hit), 1); release(hit);
    if (hit.bad) {
      st.combo = 0; S.ripples.push({ x: hit.s.x, y: hit.s.y, t: 0, c: RED }); api.fx.burst(hit.s.x, hit.s.y, [RED, C.fire, C.gold], 18, 230); api.sfx('boom');
      if (S.two) { st.score = Math.max(0, st.score - 30); api.fx.pop('-30', hit.s.x, hit.s.y - 40, RED); }
      else { api.lives--; st.score = Math.max(0, st.score - 20); api.fx.pop('-1 LIFE', hit.s.x, hit.s.y - 40, RED); if (api.lives <= 0) { sync(api); api.end('GAME OVER', 'You hit a red target. ' + summary(st), false); } }
      return;
    }
    var rt = (hit.max - hit.life) * 1000; st.rtSum += rt; st.rtN++; st.hits++; st.combo++; st.best = Math.max(st.best, st.combo);
    var m = mult(st.combo), pts = (10 + (hit.life / hit.max > .6 ? 5 : 0)) * m; st.score += pts; st.hitFlash = .15;
    api.fx.burst(hit.s.x, hit.s.y, [hit.col, C.snow, C.gold], 12, 170); api.fx.ring(hit.s.x, hit.s.y, hit.col, 62); api.fx.pop('+' + pts + (m > 1 ? ' x' + m : ''), hit.s.x, hit.s.y - 40, hit.col); api.sfx('good', Math.min(st.combo, 12) * 35);
    if (st.combo > 0 && st.combo % 10 === 0) { api.banner(st.combo + ' COMBO!', .9, CY); api.sfx('coin'); }
  }
  function summary(st) { var tot = st.hits + st.miss; return 'Accuracy ' + (tot ? Math.round(100 * st.hits / tot) : 0) + '%, avg reaction ' + (st.rtN ? Math.round(st.rtSum / st.rtN) : 0) + ' ms, best combo ' + st.best + '.'; }
  function pct(st) { var tot = st.hits + st.miss; return tot ? Math.round(100 * st.hits / tot) : 0; }
  function sync(api) { api.score = S.two ? Math.max(S.st[0].score, S.st[1].score) : S.st[0].score; }

  function glowCircle(g, x, y, r, col, a) { g.save(); g.globalAlpha = a; g.shadowColor = col; g.shadowBlur = 26; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore(); }
  function drawTarget(g, t, tm) {
    var x = t.s.x, y = t.s.y, f = t.life / t.max, pop = Math.min(1, t.born * 8), r = R * (.6 + .4 * pop) * (1 + .05 * Math.sin(tm * 14));
    glowCircle(g, x, y, r, t.col, .95); g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.arc(x - r * .25, y - r * .3, r * .45, 0, 7); g.fill();
    g.strokeStyle = C.ink; g.lineWidth = 5; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
    g.strokeStyle = C.snow; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(x, y, r + 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); g.stroke(); g.lineCap = 'butt';
    if (t.bad) { g.strokeStyle = C.snow; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 20, y - 20); g.lineTo(x + 20, y + 20); g.moveTo(x + 20, y - 20); g.lineTo(x - 20, y + 20); g.stroke(); g.lineCap = 'butt'; }
  }
  function bg(g, w, h, tm) {
    var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#071a3a'); gr.addColorStop(1, '#0b0620'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(41,227,255,.08)'; g.lineWidth = 1; for (var x = 0; x < w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (var y = 0; y < h; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  }
  function btn(g, b, label, on, col) {
    A.rr(g, b.x, b.y, b.w, b.h, 18); g.fillStyle = on ? col : 'rgba(255,255,255,.07)'; g.fill(); g.lineWidth = 4; g.strokeStyle = on ? C.snow : col; g.stroke();
    A.txt(g, label, b.x + b.w / 2, b.y + b.h / 2 + 2, label.length > 5 ? 28 : 38, C.snow); g.lineWidth = 1;
  }

  A.register({
    id: 'batak', title: 'Batak Pro', color: CY, W: W, H: H,
    desc: 'Reflex rush. Large glowing targets light up and fade fast. Hit the blue and green ones, never the red. 1 or 2 players.',
    how: '<ul><li>Pick 30, 60 or 90 seconds and 1 or 2 players, then press START.</li><li>Tap blue and green targets before their ring runs out. Faster taps score more, hits in a row build a combo up to x5.</li><li>Red targets are traps. In 1 player you have 3 lives and each red tap costs one. In 2 players a red tap costs 30 points.</li><li>Targets get faster as time runs down. 1 player: finish the time to win. 2 players: the higher score wins, the screen is split in two zones and both can touch at once.</li></ul>',
    reset: function (api) {
      S = { ph: 'menu', cd: 3, go: 0, two: players === 2, total: modeSec, left: modeSec, slots: [], tg: [], st: [newSide(), newSide()], spawned: 0, ripples: [], t: 0 };
      api.lives = null; api.info = 'CHOOSE MODE';
    },
    update: function (dt, api) {
      S.t += dt; S.go = Math.max(0, S.go - dt);
      S.ripples = S.ripples.filter(function (r) { r.t += dt; return r.t < .4; });
      if (S.ph === 'menu') return;
      if (S.ph === 'cd') { S.cd -= dt; api.info = 'GET READY'; if (S.cd <= 0) { S.ph = 'play'; S.go = .6; api.sfx('coin'); } return; }
      S.left -= dt; var i, st;
      for (i = 0; i < 2; i++) { S.st[i].hitFlash = Math.max(0, S.st[i].hitFlash - dt); }
      var sides = S.two ? [0, 1] : [0];
      sides.forEach(function (sd) {
        st = S.st[sd]; st.spawn -= dt; var cap = S.two ? 3 : 4;
        if (st.spawn <= 0 && S.left > .8) { if (S.tg.filter(function (t) { return t.side === sd; }).length < cap) spawn(sd, api); st.spawn = (.95 - .55 * prog()) * A.rnd(.75, 1.25); }
      });
      for (i = S.tg.length - 1; i >= 0; i--) {
        var t = S.tg[i]; t.life -= dt; t.born += dt;
        if (t.life <= 0) { S.tg.splice(i, 1); release(t); if (!t.bad) { var s2 = S.st[t.side]; s2.miss++; if (s2.combo > 2) api.fx.pop('COMBO LOST', t.s.x, t.s.y - 40, C.hot); s2.combo = 0; api.fx.burst(t.s.x, t.s.y, ['#556'], 6, 80, 0); } }
      }
      sync(api);
      var tl = Math.max(0, Math.ceil(S.left));
      api.info = S.two ? 'TIME ' + tl + 's' : 'TIME ' + tl + 's  COMBO x' + mult(S.st[0].combo);
      if (S.left <= 0) {
        S.tg = []; sync(api);
        if (!S.two) api.end('TIME UP!', summary(S.st[0]), true);
        else {
          var a = S.st[0], b = S.st[1]; var det = 'P1 ' + a.score + ' pts, P2 ' + b.score + ' pts. P1 acc ' + pct(a) + '%, P2 acc ' + pct(b) + '%.';
          if (a.score === b.score) api.end('DRAW!', det, false);
          else { var w = a.score > b.score ? 0 : 1; api.score = S.st[w].score; api.end('PLAYER ' + (w + 1) + ' WINS!', det, true, 'PLAYER ' + (w + 1)); }
        }
      }
    },
    draw: function (g) {
      bg(g, W, H, S.t);
      if (S.ph === 'menu') {
        A.txt(g, 'BATAK PRO', W / 2, 52, 60, CY); A.txt(g, 'TIME', 60, 110, 22, C.hot, 'left');
        btn(g, BTN.t30, '30s', modeSec === 30, CY); btn(g, BTN.t60, '60s', modeSec === 60, CY); btn(g, BTN.t90, '90s', modeSec === 90, CY);
        A.txt(g, 'PLAYERS', 60, 244, 22, C.hot, 'left'); btn(g, BTN.p1, '1 PLAYER', players === 1, OR); btn(g, BTN.p2, '2 PLAYERS', players === 2, OR); btn(g, BTN.go, 'START', true, GRN);
        return;
      }
      if (S.two) {
        g.fillStyle = 'rgba(41,227,255,.07)'; g.fillRect(0, 0, W / 2, H); g.fillStyle = 'rgba(255,176,32,.07)'; g.fillRect(W / 2, 0, W / 2, H);
        g.fillStyle = C.snow; g.fillRect(W / 2 - 2, 0, 4, H);
      }
      S.slots.forEach(function (s) { g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 3; g.beginPath(); g.arc(s.x, s.y, R, 0, 7); g.stroke(); });
      S.tg.forEach(function (t) { drawTarget(g, t, S.t); });
      S.ripples.forEach(function (r) { g.globalAlpha = 1 - r.t / .4; g.strokeStyle = r.c; g.lineWidth = 4; g.beginPath(); g.arc(r.x, r.y, 10 + r.t * 120, 0, 7); g.stroke(); g.globalAlpha = 1; });
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, 0, W, 8); g.fillStyle = CY; g.fillRect(0, 0, W * Math.max(0, S.left / S.total), 8);
      if (S.two) {
        [0, 1].forEach(function (i) { var st = S.st[i], x = i ? W - 18 : 18; A.txt(g, 'P' + (i + 1) + '  ' + st.score, x, 34, 34, i ? OR : CY, i ? 'right' : 'left'); if (st.combo > 1) A.txt(g, 'COMBO x' + mult(st.combo), x, 66, 20, C.snow, i ? 'right' : 'left'); });
      } else { A.txt(g, '' + S.st[0].combo + ' COMBO', W - 18, 34, 24, S.st[0].combo > 4 ? C.gold : 'rgba(255,255,255,.5)', 'right'); }
      A.drawCD(g, W, H, S.ph === 'cd' ? S.cd : 0, S.go);
    },
    pointer: {
      down: function (p, api) {
        if (!p) return;
        if (S.ph === 'menu') {
          if (inBtn(BTN.t30, p)) modeSec = 30; else if (inBtn(BTN.t60, p)) modeSec = 60; else if (inBtn(BTN.t90, p)) modeSec = 90;
          else if (inBtn(BTN.p1, p)) players = 1; else if (inBtn(BTN.p2, p)) players = 2;
          else if (inBtn(BTN.go, p)) { S.two = players === 2; S.total = S.left = modeSec; S.slots = slots(S.two); S.ph = 'cd'; S.cd = 3; api.lives = S.two ? null : 3; api.sfx('coin'); return; }
          else return;
          api.sfx('tap'); S.two = players === 2; S.total = S.left = modeSec; return;
        }
        if (S.ph !== 'play') return;
        tapAt(S.two ? (p.x < W / 2 ? 0 : 1) : 0, p, api);
      },
      move: function () {}, up: function () {}
    },
    _state: function () { return S; },
    preview: function (g, t, w, h) {
      bg(g, w, h, t); g.save(); g.scale(w / W, h / H);
      [[130, 150, 0, BLU], [310, 270, 1, GRN], [490, 140, 2, RED], [670, 300, 3, BLU], [210, 360, 4, GRN], [580, 390, 5, BLU]].forEach(function (q) {
        var ph = (t * 1.1 + q[2] * .5) % 2, on = ph < 1.2; g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 3; g.beginPath(); g.arc(q[0], q[1], R, 0, 7); g.stroke();
        if (on) { var f = 1 - ph / 1.2; glowCircle(g, q[0], q[1], R * (.7 + .3 * Math.min(1, ph * 6)), q[3], .95); g.strokeStyle = C.snow; g.lineWidth = 7; g.beginPath(); g.arc(q[0], q[1], R + 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); g.stroke(); }
      }); g.restore();
    }
  });
})();
