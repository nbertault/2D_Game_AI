'use strict';
window.Game = window.Game || {};

(function (G) {
  var C = G.CONFIG;
  var TILE = C.TILE;

  // The level is authored as 12-row ASCII segments, joined left to right.
  // Editing a segment shifts everything after it, so keep every row the same
  // length inside a segment (shorter rows are padded with '.').
  //   .  empty      #  ground       B  brick        ?  question block
  //   U  used block I  pipe         o  coin         G  goomba
  //   P  player     F  flagpole
  var SEGMENTS = [
    {
      name: 'start',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '...o.o.o................',
        '..P...........G.........',
        '########################',
        '########################'
      ]
    },
    {
      name: 'block row',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '..........B?B?B.........',
        '........................',
        '.....G..................',
        '########################',
        '########################'
      ]
    },
    {
      name: 'first pit',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '..............II........',
        '..........G...II........',
        '####...#################',
        '####...#################'
      ]
    },
    {
      name: 'ledge',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '.BBBB...........BB......',
        '........................',
        '........o.o.............',
        '########....############',
        '########....############'
      ]
    },
    {
      name: 'goombas',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '......B?BB?B............',
        '........................',
        '..G.........G...........',
        '########################',
        '########################'
      ]
    },
    {
      name: 'pipe wall',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '.....II.................',
        '.....II.................',
        '.....II.................',
        '################....####',
        '################....####'
      ]
    },
    {
      name: 'dense',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '......BBBBBBBB..........',
        '........................',
        '...G.....G......G.......',
        '########################',
        '########################'
      ]
    },
    {
      name: 'chasm',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '.......o.o....o.........',
        '.......BBB...BBB........',
        '........................',
        '####..............######',
        '####..............######'
      ]
    },
    {
      name: 'brick steps',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '.......oo...............',
        '.......BB...............',
        '......BBBB..............',
        '.....BBBBBB.............',
        '........................',
        '########################',
        '########################'
      ]
    },
    {
      name: 'pipe pair',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '..........II............',
        '....II....II............',
        '....II....II...G........',
        '########################',
        '########################'
      ]
    },
    {
      name: 'coin arc',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '.......o................',
        '.....o...o..............',
        '...o.......o............',
        '.............G..........',
        '########################',
        '########################'
      ]
    },
    {
      name: 'elevated run',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '....o.o.o.o.....o.o.....',
        '....BBBBBBBB....BBBB....',
        '........................',
        '..G...............G.....',
        '########################',
        '########################'
      ]
    },
    {
      name: 'pit series',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '.....o.....o............',
        '........................',
        '####...####...##########',
        '####...####...##########'
      ]
    },
    {
      name: 'gauntlet',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '....?..?..?.............',
        '........................',
        '..G....G....G...........',
        '########################',
        '########################'
      ]
    },
    {
      name: 'finale',
      rows: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '.........#..............',
        '........##..............',
        '.......###..............',
        '......####.....F........',
        '########################',
        '########################'
      ]
    }
  ];

  var SOLID = { 'B': 1, '?': 1, 'U': 1, 'I': 1, '#': 1 };

  G.Level = {
    cols: 0,
    rows: 0,
    widthPx: 0,
    heightPx: 0,
    grid: [],
    template: [],
    spawns: [],

    // Parses the segments once: joins them, records entity spawn points and
    // clears their cells so the grid only holds static tiles.
    init: function () {
      var height = 0;
      var i, s, r;
      for (i = 0; i < SEGMENTS.length; i++) {
        height = Math.max(height, SEGMENTS[i].rows.length);
      }

      var template = [];
      for (r = 0; r < height; r++) template.push('');

      for (i = 0; i < SEGMENTS.length; i++) {
        s = SEGMENTS[i];
        var width = 0;
        for (r = 0; r < s.rows.length; r++) {
          width = Math.max(width, s.rows[r].length);
        }
        for (r = 0; r < height; r++) {
          var row = s.rows[r] || '';
          while (row.length < width) row += '.';
          template[r] += row;
        }
      }

      this.template = template;
      this.rows = height;
      this.cols = template[0].length;
      this.widthPx = this.cols * TILE;
      this.heightPx = this.rows * TILE;

      this.spawns = [];
      for (r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.cols; c++) {
          var ch = template[r].charAt(c);
          if (ch === 'P' || ch === 'G' || ch === 'o' || ch === 'F') {
            this.spawns.push({ type: ch, col: c, row: r });
            template[r] = template[r].substring(0, c) + '.' + template[r].substring(c + 1);
          }
        }
      }
    },

    load: function () {
      this.grid = [];
      for (var r = 0; r < this.rows; r++) {
        this.grid.push(this.template[r].split(''));
      }
    },

    tileAt: function (col, row) {
      if (row < 0) return '.';
      if (row >= this.rows || col < 0 || col >= this.cols) return '.';
      return this.grid[row][col];
    },

    setTile: function (col, row, ch) {
      if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
      this.grid[row][col] = ch;
    },

    // Side walls count as solid so nothing can walk off the level edges,
    // but the space above the level and below it are open (falling = death).
    isSolid: function (col, row) {
      if (col < 0 || col >= this.cols) return true;
      if (row < 0 || row >= this.rows) return false;
      return SOLID[this.grid[row][col]] === 1;
    },

    // AABB against the tile grid, one axis at a time: moving on X then on Y
    // avoids the classic "snag on a corner" artifact.
    moveAndCollide: function (e, dt) {
      e.onGround = false;
      e.hitWall = false;
      e.hitCeiling = false;
      e.ceilingCol = -1;
      e.ceilingRow = -1;

      e.x += e.vx * dt;
      var rowTop = Math.floor(e.y / TILE);
      var rowBottom = Math.floor((e.y + e.h - 0.01) / TILE);
      var col, row;

      if (e.vx > 0) {
        col = Math.floor((e.x + e.w - 0.01) / TILE);
        for (row = rowTop; row <= rowBottom; row++) {
          if (this.isSolid(col, row)) {
            e.x = col * TILE - e.w;
            e.vx = 0;
            e.hitWall = true;
            break;
          }
        }
      } else if (e.vx < 0) {
        col = Math.floor(e.x / TILE);
        for (row = rowTop; row <= rowBottom; row++) {
          if (this.isSolid(col, row)) {
            e.x = (col + 1) * TILE;
            e.vx = 0;
            e.hitWall = true;
            break;
          }
        }
      }

      e.y += e.vy * dt;
      var colLeft = Math.floor(e.x / TILE);
      var colRight = Math.floor((e.x + e.w - 0.01) / TILE);

      if (e.vy > 0) {
        row = Math.floor((e.y + e.h - 0.01) / TILE);
        for (col = colLeft; col <= colRight; col++) {
          if (this.isSolid(col, row)) {
            e.y = row * TILE - e.h;
            e.vy = 0;
            e.onGround = true;
            break;
          }
        }
      } else if (e.vy < 0) {
        row = Math.floor(e.y / TILE);
        for (col = colLeft; col <= colRight; col++) {
          if (this.isSolid(col, row)) {
            e.y = (row + 1) * TILE;
            e.vy = 0;
            e.hitCeiling = true;
            e.ceilingCol = col;
            e.ceilingRow = row;
            break;
          }
        }
      }
    },

    spawnOfType: function (type) {
      for (var i = 0; i < this.spawns.length; i++) {
        if (this.spawns[i].type === type) return this.spawns[i];
      }
      return null;
    }
  };
})(window.Game);
