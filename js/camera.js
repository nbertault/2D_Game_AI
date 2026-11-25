'use strict';
window.Game = window.Game || {};

(function (G) {
  var C = G.CONFIG;
  var clamp = G.util.clamp;

  function Camera() {
    this.x = 0;
  }

  Camera.prototype.reset = function () {
    this.x = 0;
  };

  // Follows the player inside a dead zone and never scrolls back: the level
  // only moves forward, which is the classic Mario rule.
  Camera.prototype.update = function (player, level) {
    var target = player.x + player.w / 2 - C.VIEW_W * 0.45;
    if (target > this.x) this.x = target;
    this.x = clamp(this.x, 0, Math.max(0, level.widthPx - C.VIEW_W));
  };

  G.Camera = Camera;
})(window.Game);
