'use strict';
window.Game = window.Game || {};

(function (G) {
  var C = G.CONFIG;
  var clamp = G.util.clamp;
  var approach = G.util.approach;

  var WALK_FRAMES = ['walk1', 'walk2', 'walk3'];

  function Player(x, y) {
    this.x = x;
    this.y = y;
    this.w = C.PLAYER_W;
    this.h = C.PLAYER_H;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = false;
    this.coyote = 0;
    this.buffer = 0;
    this.jumping = false;
    this.skidding = false;
    this.animTime = 0;
    this.frame = 'idle';
    this.dead = false;
    this.won = false;
    this.hitCeiling = false;
    this.ceilingCol = -1;
    this.ceilingRow = -1;
  }

  Player.prototype.update = function (dt) {
    var input = G.Input;
    var dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);

    // Coyote time: a few frames after walking off a ledge still count as
    // grounded, which is what makes jumps off edges feel fair.
    if (this.onGround) this.coyote = C.COYOTE_TIME;
    else this.coyote = Math.max(0, this.coyote - dt);

    // Jump buffer: a press slightly before landing is kept for a few frames.
    if (input.jumpPressed) this.buffer = C.JUMP_BUFFER;
    else this.buffer = Math.max(0, this.buffer - dt);

    this.skidding = false;
    if (dir !== 0) {
      var turning = this.onGround && this.vx * dir < -20;
      if (turning) {
        this.skidding = true;
        this.vx += dir * C.SKID_ACCEL * dt;
      } else {
        this.vx += dir * (this.onGround ? C.WALK_ACCEL : C.AIR_ACCEL) * dt;
      }
      this.facing = dir;
    } else if (this.onGround) {
      this.vx = approach(this.vx, 0, C.FRICTION * dt);
    }
    this.vx = clamp(this.vx, -C.MAX_RUN, C.MAX_RUN);

    if (this.buffer > 0 && this.coyote > 0) {
      this.vy = C.JUMP_VELOCITY;
      this.buffer = 0;
      this.coyote = 0;
      this.jumping = true;
      this.onGround = false;
    }

    // Releasing the button early cuts the remaining upward velocity, giving
    // the classic short hop / full jump range from a single button.
    if (this.jumping && input.jumpReleased && this.vy < 0) {
      this.vy *= C.JUMP_CUT;
      this.jumping = false;
    }
    if (this.vy >= 0) this.jumping = false;

    var gravity = C.GRAVITY * (this.vy < 0 ? 1 : C.FALL_GRAVITY_MULT);
    this.vy = Math.min(this.vy + gravity * dt, C.MAX_FALL);

    G.Level.moveAndCollide(this, dt);
    this.updateAnimation(dt);
  };

  Player.prototype.updateAnimation = function (dt) {
    if (!this.onGround) {
      this.frame = 'jump';
      return;
    }
    if (this.skidding) {
      this.frame = 'skid';
      return;
    }
    if (Math.abs(this.vx) > 8) {
      this.animTime += dt * (Math.abs(this.vx) / 60);
      this.frame = WALK_FRAMES[Math.floor(this.animTime * 6) % WALK_FRAMES.length];
    } else {
      this.animTime = 0;
      this.frame = 'idle';
    }
  };

  Player.prototype.die = function () {
    this.dead = true;
    this.vx = 0;
    this.vy = -380;
    this.frame = 'jump';
  };

  // Death is only an animation: the game decides when to remove a life.
  Player.prototype.updateDeath = function (dt) {
    this.vy += C.GRAVITY * dt;
    this.y += this.vy * dt;
  };

  Player.prototype.draw = function (ctx, cam) {
    var sprite = G.Sprites.player[this.frame] || G.Sprites.player.idle;
    var sx = Math.round(this.x - cam.x);
    var sy = Math.round(this.y) - 1; // sprite is 16px tall, hitbox is 15

    if (this.facing < 0) {
      ctx.save();
      ctx.translate(sx + this.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, 0, sy);
      ctx.restore();
    } else {
      ctx.drawImage(sprite, sx, sy);
    }
  };

  G.Player = Player;
})(window.Game);
