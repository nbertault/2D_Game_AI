'use strict';
window.Game = window.Game || {};

(function (G) {
  var C = G.CONFIG;
  var Input = G.Input;

  function Game() {
    this.state = 'title';
    this.score = 0;
    this.coins = 0;
    this.lives = C.START_LIVES;
    this.time = C.START_TIME;
    this.player = null;
    this.entities = [];
    this.pops = [];
    this.bumps = [];
    this.flag = null;
    this.camera = new G.Camera();
    this.stateTimer = 0;
    this.titleTime = 0;
    this.bestScore = 0;
  }

  Game.prototype.newGame = function () {
    this.score = 0;
    this.coins = 0;
    this.lives = C.START_LIVES;
    this.resetLevel();
    this.state = 'playing';
  };

  // Rebuilds the tile grid and every entity from the level data.
  Game.prototype.resetLevel = function () {
    var level = G.Level;
    var T = C.TILE;
    level.load();

    this.entities = [];
    this.pops = [];
    this.bumps = [];
    this.flag = null;

    for (var i = 0; i < level.spawns.length; i++) {
      var s = level.spawns[i];
      if (s.type === 'G') {
        this.entities.push(new G.Goomba(s.col * T + 1, (s.row + 1) * T - C.GOOMBA_H));
      } else if (s.type === 'o') {
        this.entities.push(new G.Coin(s.col * T + 4, s.row * T + 4));
      } else if (s.type === 'F') {
        this.flag = new G.Flag(s.col, s.row);
      }
    }

    var spawn = level.spawnOfType('P');
    var px = spawn ? spawn.col * T + (T - C.PLAYER_W) / 2 : 32;
    var py = spawn ? (spawn.row + 1) * T - C.PLAYER_H : 145;
    this.player = new G.Player(px, py);

    this.camera.reset();
    this.time = C.START_TIME;
  };

  Game.prototype.update = function (dt) {
    switch (this.state) {
      case 'title':
        this.titleTime += dt;
        if (Input.confirmPressed) this.newGame();
        break;

      case 'playing':
        if (Input.restartPressed) { this.resetLevel(); break; }
        if (Input.pausePressed) { this.state = 'paused'; break; }
        this.updatePlaying(dt);
        break;

      case 'paused':
        if (Input.pausePressed || Input.confirmPressed) this.state = 'playing';
        break;

      case 'dying':
        this.stateTimer -= dt;
        this.player.updateDeath(dt);
        if (this.stateTimer <= 0) this.loseLife();
        break;

      case 'win':
        this.stateTimer -= dt;
        if (this.flag) this.flag.update(dt);
        if (this.stateTimer <= 0 && Input.confirmPressed) this.state = 'title';
        break;

      case 'gameover':
        if (Input.confirmPressed) this.state = 'title';
        break;
    }

    this.updateBumps(dt);
  };

  Game.prototype.updatePlaying = function (dt) {
    this.time -= dt / C.SECONDS_PER_TIME_UNIT;
    if (this.time <= 0) {
      this.time = 0;
      this.killPlayer();
      return;
    }

    this.player.update(dt);
    if (this.player.hitCeiling) this.hitBlock(this.player.ceilingCol, this.player.ceilingRow);

    this.camera.update(this.player, G.Level);
    // The camera never scrolls back, so the player cannot walk behind it.
    if (this.player.x < this.camera.x) {
      this.player.x = this.camera.x;
      if (this.player.vx < 0) this.player.vx = 0;
    }

    for (var i = 0; i < this.entities.length; i++) this.entities[i].update(dt);
    for (i = 0; i < this.pops.length; i++) this.pops[i].update(dt);
    if (this.flag) this.flag.update(dt);

    this.handleCollisions();

    this.pops = this.pops.filter(function (p) { return p.alive; });
    this.entities = this.entities.filter(function (e) {
      // Anything that fell into a pit is gone for good.
      return e.alive && e.y < G.Level.heightPx + 64;
    });

    if (this.player.y > G.Level.heightPx + 32) this.killPlayer();
  };

  Game.prototype.hitBlock = function (col, row) {
    if (col < 0 || row < 0) return;
    var tile = G.Level.tileAt(col, row);
    if (tile === '?') {
      G.Level.setTile(col, row, 'U');
      this.coins++;
      this.score += C.COIN_SCORE;
      this.pops.push(new G.CoinPop(col * C.TILE + 4, row * C.TILE - 6));
      this.bumps.push({ col: col, row: row, t: 0 });
    } else if (tile === 'B') {
      this.bumps.push({ col: col, row: row, t: 0 });
    }
  };

  Game.prototype.updateBumps = function (dt) {
    for (var i = this.bumps.length - 1; i >= 0; i--) {
      this.bumps[i].t += dt;
      if (this.bumps[i].t > 0.25) this.bumps.splice(i, 1);
    }
  };

  Game.prototype.handleCollisions = function () {
    var p = this.player;

    for (var i = 0; i < this.entities.length; i++) {
      var e = this.entities[i];
      if (!e.alive) continue;
      if (p.x + p.w <= e.x || p.x >= e.x + e.w) continue;
      if (p.y + p.h <= e.y || p.y >= e.y + e.h) continue;

      if (e instanceof G.Goomba) {
        if (e.squashed) continue;
        // Stomp: the player must be falling and their feet near the goomba's top.
        if (p.vy > 0 && p.y + p.h <= e.y + 8) {
          e.squash();
          p.vy = -270;
          this.score += C.STOMP_SCORE;
        } else {
          this.killPlayer();
          return;
        }
      } else if (e instanceof G.Coin) {
        e.alive = false;
        this.coins++;
        this.score += C.COIN_SCORE;
      }
    }

    if (this.flag && p.x + p.w >= this.flag.x - 1) this.winLevel();
  };

  Game.prototype.killPlayer = function () {
    if (this.state !== 'playing') return;
    this.state = 'dying';
    this.stateTimer = 2.2;
    this.player.die();
  };

  Game.prototype.loseLife = function () {
    this.lives--;
    if (this.lives <= 0) {
      this.bestScore = Math.max(this.bestScore, this.score);
      this.state = 'gameover';
    } else {
      this.resetLevel();
      this.state = 'playing';
    }
  };

  Game.prototype.winLevel = function () {
    this.state = 'win';
    this.stateTimer = 2.5;
    this.score += C.FLAG_SCORE + Math.floor(this.time) * C.TIME_BONUS;
    this.bestScore = Math.max(this.bestScore, this.score);
    this.player.vx = 0;
    this.player.vy = 0;
  };

  Game.prototype.draw = function (ctx) {
    G.Render.draw(ctx, this);
  };

  G.Game = Game;
})(window.Game);
