'use strict';
window.Game = window.Game || {};

(function (G) {
  var C = G.CONFIG;

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var buffer = document.createElement('canvas');
  buffer.width = C.VIEW_W;
  buffer.height = C.VIEW_H;
  var bctx = buffer.getContext('2d');

  G.Sprites.init();
  G.Level.init();
  G.Input.init();

  var game = new G.Game();
  G.game = game;
  window.__game = game; // console handle for debugging

  // Integer scaling keeps every pixel square at any window size.
  function resize() {
    var maxW = window.innerWidth - 32;
    var maxH = window.innerHeight - 110;
    var scale = Math.max(1, Math.floor(Math.min(maxW / C.VIEW_W, maxH / C.VIEW_H)));
    canvas.width = C.VIEW_W * scale;
    canvas.height = C.VIEW_H * scale;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
  }

  window.addEventListener('resize', resize);
  resize();

  var STEP = 1 / 60;
  var accumulator = 0;
  var lastTime = performance.now();

  function frame(now) {
    var delta = (now - lastTime) / 1000;
    lastTime = now;
    // A long pause (tab switch) must not queue hundreds of steps.
    if (delta > 0.25) delta = 0.25;
    accumulator += delta;

    while (accumulator >= STEP) {
      game.update(STEP);
      G.Input.endFrame();
      accumulator -= STEP;
    }

    bctx.imageSmoothingEnabled = false;
    game.draw(bctx);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})(window.Game);
