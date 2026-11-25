'use strict';
window.Game = window.Game || {};

(function (G) {
  var PALETTE = {
    r: '#e83030', // cap and shirt
    b: '#3050c8', // overalls
    s: '#f8c090', // skin
    y: '#8c4a10', // hair, shoes
    k: '#101018', // eyes and outlines
    w: '#ffffff', // gloves, goomba eyes
    n: '#9c5a18'  // goomba body
  };

  // Each sprite is an array of equal-length strings; one character per pixel.
  // '.' is transparent, every other character indexes PALETTE.
  var PLAYER_BODY = [
    '....rrrr....',
    '...rrrrrrr..',
    '...rrrrrrr..',
    '...yyykyy...',
    '..yyysykyy..',
    '..yssssyyy..',
    '...ssssss...',
    '..rrrrrrr...',
    '.rrrbbbbbr..',
    '.srbbbbrbs..',
    '.ssbbbbbbss.',
    '...bbbbbb...',
    '...bbbbbb...'
  ];

  // Legs are swapped per frame; the upper body above stays identical.
  var PLAYER_LEGS = {
    idle:  ['...bb..bb...', '..yyy..yyy..', '..yyy..yyy..'],
    walk1: ['..bb....bb..', '.yyy....yyy.', '.yyy....yyy.'],
    walk2: ['...bbbb.....', '..yyyyyy....', '..yyyyyy....'],
    walk3: ['...bb..bb...', '...yyyy.....', '...yyyy.....'],
    jump:  ['..bb....bb..', '.yy......yy.', '............'],
    skid:  ['...bb..bb...', '..yyy.yyy...', '..yyy.yyy...']
  };

  var GOOMBA_BODY = [
    '....kkkkkk....',
    '..kknnnnnnkk..',
    '.knnnnnnnnnnk.',
    'knnnnnnnnnnnnk',
    'knnwwknnkwwnnk',
    'knnwwknnkwwnnk',
    'knnnkknnkknnnk',
    'knnnnnnnnnnnnk',
    '.knnnnnnnnnnk.',
    '..knnnnnnnnk..',
    '...kknnnnkk...',
    '....kkkkkk....'
  ];

  var GOOMBA_FEET = {
    a: ['...kkk..kkk...', '..kkkk..kkkk..'],
    b: ['..kkkk..kkkk..', '...kkk..kkk...']
  };

  var COIN_FRAMES = [
    [
      '..yyyy..',
      '.yywwyy.',
      'yywwwwyy',
      'yywwwwyy',
      'yywwwwyy',
      'yywwwwyy',
      '.yywwyy.',
      '..yyyy..'
    ],
    [
      '...yy...',
      '..ywwy..',
      '..ywwy..',
      '..ywwy..',
      '..ywwy..',
      '..ywwy..',
      '..ywwy..',
      '...yy...'
    ],
    [
      '....y...',
      '....y...',
      '....y...',
      '....y...',
      '....y...',
      '....y...',
      '....y...',
      '....y...'
    ],
    [
      '...yy...',
      '..ywwy..',
      '..ywwy..',
      '..ywwy..',
      '..ywwy..',
      '..ywwy..',
      '..ywwy..',
      '...yy...'
    ]
  ];

  function bake(rows, palette) {
    var canvas = document.createElement('canvas');
    canvas.width = rows[0].length;
    canvas.height = rows.length;
    var ctx = canvas.getContext('2d');
    for (var y = 0; y < rows.length; y++) {
      for (var x = 0; x < rows[y].length; x++) {
        var color = palette[rows[y][x]];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return canvas;
  }

  function playerFrame(legs) {
    return bake(PLAYER_BODY.concat(PLAYER_LEGS[legs]), PALETTE);
  }

  G.Sprites = {
    player: {},
    goomba: {},
    coin: [],
    init: function () {
      for (var name in PLAYER_LEGS) {
        if (Object.prototype.hasOwnProperty.call(PLAYER_LEGS, name)) {
          this.player[name] = playerFrame(name);
        }
      }
      this.goomba.a = bake(GOOMBA_BODY.concat(GOOMBA_FEET.a), PALETTE);
      this.goomba.b = bake(GOOMBA_BODY.concat(GOOMBA_FEET.b), PALETTE);
      for (var i = 0; i < COIN_FRAMES.length; i++) {
        this.coin.push(bake(COIN_FRAMES[i], {
          y: G.CONFIG.COLORS.coin,
          w: G.CONFIG.COLORS.coinLight
        }));
      }
    }
  };
})(window.Game);
