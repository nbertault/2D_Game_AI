'use strict';
window.Game = window.Game || {};

(function (G) {
  var C = G.CONFIG;
  var COL = C.COLORS;

  function Goomba(x, y) {
    this.x = x;
    this.y = y;
    this.w = C.GOOMBA_W;
    this.h = C.GOOMBA_H;
    this.vx = 0;
    this.vy = 0;
    this.dir = -1;
    this.alive = true;
    this.squashed = false;
    this.squashTimer = 0;
    this.animTime = 0;
  }

  Goomba.prototype.update = function (dt) {
    if (this.squashed) {
      this.squashTimer -= dt;
      if (this.squashTimer <= 0) this.alive = false;
      return;
    }
    this.animTime += dt;
    this.vy = Math.min(this.vy + C.GRAVITY * dt, C.MAX_FALL);
    this.vx = this.dir * C.GOOMBA_SPEED;
    G.Level.moveAndCollide(this, dt);
    if (this.hitWall) this.dir *= -1;
  };

  Goomba.prototype.squash = function () {
    this.squashed = true;
    this.squashTimer = 0.45;
    this.vx = 0;
    this.vy = 0;
  };

  Goomba.prototype.draw = function (ctx, cam) {
    var sprites = G.Sprites.goomba;
    var sprite = (Math.floor(this.animTime * 6) % 2 === 0) ? sprites.a : sprites.b;
    var sx = Math.round(this.x - cam.x);
    var sy = Math.round(this.y);
    if (this.squashed) {
      // Flatten the bottom 6 pixels of the sprite instead of a second asset.
      ctx.drawImage(sprite, 0, 8, 14, 6, sx, sy + 8, 14, 6);
    } else {
      ctx.drawImage(sprite, sx, sy);
    }
  };

  function Coin(x, y) {
    this.x = x;
    this.y = y;
    this.w = 8;
    this.h = 8;
    this.alive = true;
    this.t = 0;
  }

  Coin.prototype.update = function (dt) {
    this.t += dt;
  };

  Coin.prototype.draw = function (ctx, cam) {
    var frame = Math.floor(this.t * 8) % 4;
    ctx.drawImage(G.Sprites.coin[frame], Math.round(this.x - cam.x), Math.round(this.y));
  };

  // Short-lived coin that pops out of a bumped question block.
  function CoinPop(x, y) {
    this.x = x;
    this.y = y;
    this.w = 8;
    this.h = 8;
    this.vy = -240;
    this.t = 0;
    this.alive = true;
  }

  CoinPop.prototype.update = function (dt) {
    this.vy += C.GRAVITY * dt;
    this.y += this.vy * dt;
    this.t += dt;
    if (this.t > 0.6) this.alive = false;
  };

  CoinPop.prototype.draw = function (ctx, cam) {
    var frame = Math.floor(this.t * 20) % 4;
    ctx.drawImage(G.Sprites.coin[frame], Math.round(this.x - cam.x), Math.round(this.y));
  };

  function Flag(col, row) {
    this.col = col;
    this.x = col * C.TILE + C.TILE / 2;
    this.baseY = (row + 1) * C.TILE;
    this.topY = this.baseY - 6 * C.TILE;
    this.w = 6;
    this.h = this.baseY - this.topY;
    this.animTime = 0;
  }

  Flag.prototype.update = function (dt) {
    this.animTime += dt;
  };

  Flag.prototype.draw = function (ctx, cam) {
    var x = Math.round(this.x - cam.x);
    var top = Math.round(this.topY);
    var bottom = Math.round(this.baseY);

    ctx.fillStyle = COL.pole;
    ctx.fillRect(x - 1, top, 2, bottom - top);

    ctx.fillStyle = COL.flag;
    ctx.beginPath();
    ctx.moveTo(x + 1, top + 6);
    ctx.lineTo(x + 15, top + 12);
    ctx.lineTo(x + 1, top + 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = COL.coin;
    ctx.fillRect(x - 2, top - 3, 4, 4);
  };

  G.Goomba = Goomba;
  G.Coin = Coin;
  G.CoinPop = CoinPop;
  G.Flag = Flag;
})(window.Game);
