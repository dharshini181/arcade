/* Game 2: Maze Chase. Eat every dot, dodge the ghosts, use power pellets to turn the tables. */
(function () {
  'use strict';
  var A = window.Arcade, C = A.C, T = 24, N = 15, W = T * N, H = T * N, LEVELS = 3, PSPEED = 5;
  /* # wall  . dot  o power pellet  P player start  G ghost start. All maps are 15x15 and mirror left to right. */
  var MAPS = [[
    '###############', '#o.....#.....o#', '#.##.#.#.#.##.#', '#.............#', '#.##.#####.##.#', '#....#...#....#', '####.#.#.#.####', '#.....GGG.....#',
    '####.#.#.#.####', '#....#...#....#', '#.##.#####.##.#', '#.............#', '#.##.#.#.#.##.#', '#o.....P.....o#', '###############'], [
    '###############', '#o....#.#....o#', '#.###.#.#.###.#', '#.............#', '#.#.##.#.##.#.#', '#.#...#.#...#.#', '#...#.....#...#', '###.#.GGG.#.###',
    '#...#.....#...#', '#.#...#.#...#.#', '#.#.##.#.##.#.#', '#.............#', '#.###.#.#.###.#', '#o....#P#....o#', '###############'], [
    '###############', '#o.....#.....o#', '#.###.###.###.#', '#.............#', '#.#.#######.#.#', '#.#.........#.#', '#...###.###...#', '###.#.GGG.#.###',
    '#...#.....#...#', '#.#...###...#.#', '#.#.#######.#.#', '#.............#', '#.###.###.###.#', '#o.....P.....o#', '###############']];
  var UP = { x: 0, y: -1 }, DOWN = { x: 0, y: 1 }, LEFT = { x: -1, y: 0 }, RIGHT = { x: 1, y: 0 }, ALL = [UP, LEFT, DOWN, RIGHT];
  var DIRS = { up: UP, down: DOWN, left: LEFT, right: RIGHT };
  var GCOL = [C.hot, C.mag, C.fire];
  var EPS = 1e-6, S;

  function parse(map) {
    var grid = map.map(function (r) { return r.replace(/[o.PG]/g, ' '); }), dots = new Map(), ghosts = [], player = { x: 1, y: 1 };
    map.forEach(function (row, y) { for (var x = 0; x < row.length; x++) { var c = row[x]; if (c === '.') dots.set(y * N + x, 1); else if (c === 'o') dots.set(y * N + x, 2); else if (c === 'P') player = { x: x, y: y }; else if (c === 'G') ghosts.push({ x: x, y: y }); } });
    return { grid: grid, dots: dots, player: player, ghosts: ghosts };
  }
  function open(g, x, y) { return g[y] !== undefined && g[y][x] !== undefined && g[y][x] !== '#'; }
  function aligned(v) { return Math.abs(v - Math.round(v)) < EPS; }
  function nextC(v, d) { return d > 0 ? (aligned(v) ? Math.round(v) + 1 : Math.ceil(v)) : (aligned(v) ? Math.round(v) - 1 : Math.floor(v)); }
  /* Move an entity `dist` tiles along the corridors. choose() is asked for a direction each time it sits on a tile centre, so walls always block it. */
  function advance(g, e, dist, choose) {
    var left = dist, guard = 12;
    while (left > 1e-9 && guard-- > 0) {
      if (aligned(e.x) && aligned(e.y)) {
        e.x = Math.round(e.x); e.y = Math.round(e.y); var w = choose(e);
        if (w && (w.x || w.y) && open(g, e.x + w.x, e.y + w.y)) { e.dx = w.x; e.dy = w.y; }
        if ((!e.dx && !e.dy) || !open(g, e.x + e.dx, e.y + e.dy)) { e.dx = 0; e.dy = 0; return; }
      }
      var tx = e.dx ? nextC(e.x, e.dx) : e.x, ty = e.dy ? nextC(e.y, e.dy) : e.y, d = Math.abs(tx - e.x) + Math.abs(ty - e.y), m = Math.min(left, d);
      e.x += e.dx * m; e.y += e.dy * m; left -= m; if (m >= d - 1e-9) { e.x = tx; e.y = ty; }
    }
  }
  function flip(e, w) { if ((e.dx || e.dy) && e.dx === -w.x && e.dy === -w.y && !(aligned(e.x) && aligned(e.y))) { e.dx = w.x; e.dy = w.y; } }
  /* Ghost AI: never reverses unless trapped. Chasers head for the player at junctions, patrollers mostly wander, frightened ghosts wander. */
  function ghostDir(g, e, tx, ty, chaseOdds) {
    var c = ALL.filter(function (d) { return open(g, e.x + d.x, e.y + d.y) && !((e.dx || e.dy) && d.x === -e.dx && d.y === -e.dy); });
    if (!c.length) c = ALL.filter(function (d) { return open(g, e.x + d.x, e.y + d.y); });
    if (Math.random() > chaseOdds) return A.pick(c);
    var best = c[0], bd = 1e9; c.forEach(function (d) { var v = Math.pow(e.x + d.x - tx, 2) + Math.pow(e.y + d.y - ty, 2); if (v < bd) { bd = v; best = d; } }); return best;
  }
  function board(lvl, keep) {
    var p = parse(MAPS[(lvl - 1) % MAPS.length]);
    return {
      lvl: lvl, grid: p.grid, dots: p.dots, pl: { x: p.player.x, y: p.player.y, dx: 0, dy: 0 }, face: RIGHT, want: null, wantT: 0, fright: 0, chain: 0, freeze: 1.4, msg: lvl === 1 ? 'READY!' : 'LEVEL ' + lvl,
      t: S ? S.t : 0, mouth: 0, eaten: 0, ghosts: p.ghosts.map(function (q, i) { return { e: { x: q.x, y: q.y, dx: 0, dy: 0 }, sx: q.x, sy: q.y, col: GCOL[i % 3], patrol: i === 2, delay: 1 + i * 2.2 }; })
    };
  }
  function ghostSpeed(lvl) { return 3.4 + .45 * (lvl - 1); }
  function frightTime(lvl) { return Math.max(3, 7 - lvl); }
  function turn(d) { S.want = d; S.wantT = .9; }
  function resetPositions(api) { var b = board(S.lvl); S.pl = b.pl; S.ghosts = b.ghosts; S.fright = 0; S.chain = 0; S.freeze = 1.2; S.msg = 'OOPS!'; S.want = null; }
  function drawGhost(g, x, y, gh, fr, flash, t) {
    var r = T * .4, d = gh.e; g.save(); g.translate(x, y); g.fillStyle = fr ? (flash ? C.hot : C.snow) : gh.col; g.strokeStyle = C.ink; g.lineWidth = 2;
    var a = Math.floor(t * 8) % 2 ? 4 : 0, b = 4 - a; g.beginPath(); g.arc(0, -1, r, Math.PI, 0); g.lineTo(r, r); g.lineTo(r * .66, r - a); g.lineTo(r * .33, r); g.lineTo(0, r - b); g.lineTo(-r * .33, r); g.lineTo(-r * .66, r - a); g.lineTo(-r, r); g.closePath(); g.fill(); g.stroke();
    if (fr) { g.fillStyle = C.ink; g.beginPath(); g.arc(-4, -3, 1.8, 0, 7); g.arc(4, -3, 1.8, 0, 7); g.fill(); g.beginPath(); g.moveTo(-6, 5); g.lineTo(-3, 3); g.lineTo(0, 5); g.lineTo(3, 3); g.lineTo(6, 5); g.stroke(); }
    else [-4.5, 4.5].forEach(function (s) { g.fillStyle = C.snow; g.beginPath(); g.arc(s, -3, 3.6, 0, 7); g.fill(); g.fillStyle = C.ink; g.beginPath(); g.arc(s + d.dx * 1.6, -3 + d.dy * 1.6, 1.8, 0, 7); g.fill(); });
    g.restore();
  }
  function pacman(g, x, y, face, mouth) {
    var a = Math.atan2(face.y, face.x), m = .08 + .3 * Math.abs(Math.sin(mouth));
    g.fillStyle = C.gold; g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.arc(x, y, T * .42, a + m, a + Math.PI * 2 - m); g.closePath(); g.fill(); g.stroke();
  }

  A.register({
    id: 'maze', title: 'Maze Chase', color: C.gold, W: W, H: H, dpad: true,
    desc: 'Eat every dot in the neon maze. Three ghosts hunt you, power pellets let you hunt them.',
    how: '<ul><li>Move with the arrow keys or WASD, by swiping on the maze, or with the on-screen arrows.</li><li>Eat all dots to clear a level. There are 3 levels and the ghosts get faster.</li><li>Big glowing pellets turn the ghosts scared for a few seconds. Eat them for bonus points.</li><li>Touching a ghost costs a life. You have 3 lives.</li></ul>',
    reset: function (api) { S = null; S = board(1); S.lives0 = 3; api.lives = 3; api.info = 'LEVEL 1/' + LEVELS; S.sw = null; },
    update: function (dt, api) {
      S.t += dt; api.info = 'LEVEL ' + S.lvl + '/' + LEVELS + '  DOTS ' + S.dots.size;
      if (S.freeze > 0) { S.freeze -= dt; return; }
      var k = api.keys;
      if (k.has('arrowup') || k.has('w')) turn(UP); else if (k.has('arrowdown') || k.has('s')) turn(DOWN); else if (k.has('arrowleft') || k.has('a')) turn(LEFT); else if (k.has('arrowright') || k.has('d')) turn(RIGHT);
      S.wantT -= dt; if (S.wantT <= 0) S.want = null;
      var pl = S.pl; if (S.want) flip(pl, S.want);
      advance(S.grid, pl, PSPEED * dt, function () { return S.want; });
      if (pl.dx || pl.dy) { S.face = { x: pl.dx, y: pl.dy }; S.mouth += dt * 14; }
      var cx = Math.round(pl.x), cy = Math.round(pl.y), key = cy * N + cx, v = Math.hypot(pl.x - cx, pl.y - cy) < .4 ? S.dots.get(key) : undefined;
      if (v) {
        S.dots.delete(key); api.add(v === 1 ? 10 : 50);
        if (v === 2) { S.fright = frightTime(S.lvl); S.chain = 0; api.sfx('coin'); api.fx.pop('POWER!', pl.x * T + T / 2, pl.y * T, C.gold); } else if (++S.eaten % 3 === 0) api.sfx('tap', 420);
      }
      if (S.fright > 0) S.fright -= dt;
      for (var i = 0; i < S.ghosts.length; i++) {
        var gh = S.ghosts[i]; if (gh.delay > 0) { gh.delay -= dt; continue; }
        var fr = S.fright > 0, odds = fr ? 0 : gh.patrol ? .25 : .82;
        advance(S.grid, gh.e, ghostSpeed(S.lvl) * (fr ? .6 : 1) * dt, function (e) { return ghostDir(S.grid, e, pl.x, pl.y, odds); });
        if (Math.pow(gh.e.x - pl.x, 2) + Math.pow(gh.e.y - pl.y, 2) < .4) {
          if (fr) { var pts = 200 * Math.pow(2, Math.min(S.chain++, 3)); api.add(pts); api.fx.pop('+' + pts, gh.e.x * T + T / 2, gh.e.y * T, C.gold); api.fx.burst(gh.e.x * T + T / 2, gh.e.y * T + T / 2, [C.snow, C.hot], 12); api.sfx('good', S.chain * 80); gh.e = { x: gh.sx, y: gh.sy, dx: 0, dy: 0 }; gh.delay = 2.2; }
          else { api.lives--; api.sfx('bad'); api.fx.burst(pl.x * T + T / 2, pl.y * T + T / 2, [C.gold, C.fire], 18, 200); if (api.lives <= 0) { api.end('GAME OVER', 'Caught on level ' + S.lvl, false); return; } resetPositions(api); break; }
        }
      }
      if (S.dots.size === 0) {
        api.add(200);
        if (S.lvl >= LEVELS) { api.add(api.lives * 100); api.end('YOU WIN!', 'All ' + LEVELS + ' levels cleared', true); return; }
        var b = board(S.lvl + 1); b.sw = null; S = b; api.sfx('win'); api.banner('LEVEL ' + S.lvl, 1.2);
      }
    },
    draw: function (g, api) {
      g.fillStyle = C.ink; g.fillRect(0, 0, W, H); var grid = S.grid, y, x;
      for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
        if (grid[y][x] !== '#') continue; var edge = false; for (var j = -1; j <= 1; j++) for (var i = -1; i <= 1; i++) if (open(grid, x + i, y + j)) edge = true; if (!edge) continue;
        A.rr(g, x * T + 2, y * T + 2, T - 4, T - 4, 6); g.fillStyle = C.panel2; g.fill(); g.strokeStyle = C.mag; g.lineWidth = 1.5; g.globalAlpha = .85; g.stroke(); g.globalAlpha = 1;
      }
      S.dots.forEach(function (v, k) { var dx = (k % N) * T + T / 2, dy = Math.floor(k / N) * T + T / 2; g.fillStyle = v === 1 ? C.hot : C.gold; g.beginPath(); g.arc(dx, dy, v === 1 ? 2.4 : 5 + Math.sin(S.t * 8) * 1.2, 0, 7); if (v === 2) { g.shadowColor = C.gold; g.shadowBlur = 10; } g.fill(); g.shadowBlur = 0; });
      var fr = S.fright > 0, flash = fr && S.fright < 2 && Math.floor(S.t * 6) % 2 === 0;
      S.ghosts.forEach(function (gh) { drawGhost(g, gh.e.x * T + T / 2, gh.e.y * T + T / 2 + (gh.delay > 0 ? Math.sin(S.t * 6) * 2 : 0), gh, fr, flash, S.t); });
      pacman(g, S.pl.x * T + T / 2, S.pl.y * T + T / 2, S.face, S.mouth);
      if (S.freeze > 0 && api.isPlaying()) { g.font = '900 24px Impact,system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = C.ink; g.strokeText(S.msg, W / 2, H / 2 + T * .5); g.fillStyle = S.msg === 'OOPS!' ? C.fire : C.gold; g.fillText(S.msg, W / 2, H / 2 + T * .5); }
    },
    onDir: function (d) { turn(DIRS[d]); },
    pointer: {
      down: function (p) { S.sw = p; },
      move: function (p) { if (!S.sw) return; var dx = p.x - S.sw.x, dy = p.y - S.sw.y; if (Math.hypot(dx, dy) < 14) return; S.sw = p; turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? RIGHT : LEFT) : (dy > 0 ? DOWN : UP)); },
      up: function () { S.sw = null; }
    },
    preview: function (g, t, w, h) {
      g.fillStyle = C.ink; g.fillRect(0, 0, w, h); g.strokeStyle = C.mag; g.lineWidth = 3; g.fillStyle = C.panel2;
      [[20, 20, 80, 24], [20, 156, 80, 24], [220, 20, 80, 24], [220, 156, 80, 24], [130, 70, 60, 60]].forEach(function (r) { A.rr(g, r[0], r[1], r[2], r[3], 8); g.fill(); g.stroke(); });
      for (var i = 0; i < 12; i++) { g.fillStyle = C.hot; g.beginPath(); g.arc(30 + i * 24, 100, 3, 0, 7); g.fill(); }
      var x = 20 + ((t * 70) % 290); g.fillStyle = C.gold; g.strokeStyle = C.ink; g.lineWidth = 2; var m = .08 + .3 * Math.abs(Math.sin(t * 12)); g.beginPath(); g.moveTo(x, 100); g.arc(x, 100, 16, m, Math.PI * 2 - m); g.closePath(); g.fill(); g.stroke();
      var gx = x - 56; g.fillStyle = C.mag; g.beginPath(); g.arc(gx, 99, 14, Math.PI, 0); g.lineTo(gx + 14, 114); g.lineTo(gx - 14, 114); g.closePath(); g.fill(); g.stroke();
    }
  });
  /* exposed only so the automated map checks can read them */
  A._mazeMaps = MAPS;
})();
