'use strict';
window.Game = window.Game || {};

(function (G) {
  var C = G.CONFIG;
  var COL = C.COLORS;
  var T = C.TILE;
  var F = null; // resolved lazily, G.Font is loaded before this file runs

  function drawGround(ctx, x, y, top) {
    ctx.fillStyle = COL.dirt;
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = COL.dirtDark;
    ctx.fillRect(x, y + 7, T, 1);
    ctx.fillRect(x + 7, y + 8, 1, 8);
    ctx.fillRect(x + T - 1, y, 1, T);
    ctx.fillRect(x, y + T - 1, T, 1);
    if (top) {
      ctx.fillStyle = COL.dirtLight;
      ctx.fillRect(x, y, T, 2);
      ctx.fillRect(x, y + 7, T, 1);
    }
  }

  function drawBrick(ctx, x, y) {
    ctx.fillStyle = COL.brick;
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = COL.brickLight;
    ctx.fillRect(x, y, T, 1);
    ctx.fillRect(x, y, 1, T);
    ctx.fillStyle = COL.brickDark;
    ctx.fillRect(x, y + 7, T, 1);
    ctx.fillRect(x + 7, y + 8, 1, 8);
    ctx.fillRect(x + T - 1, y, 1, T);
    ctx.fillRect(x, y + T - 1, T, 1);
  }

  function drawQuestion(ctx, x, y) {
    ctx.fillStyle = COL.question;
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = COL.questionLight;
    ctx.fillRect(x + 1, y + 1, T - 2, 1);
    ctx.fillRect(x + 1, y + 1, 1, T - 2);
    ctx.fillStyle = COL.questionDark;
    ctx.fillRect(x, y + T - 1, T, 1);
    ctx.fillRect(x + T - 1, y, 1, T);
    F.draw(ctx, '?', x + 6, y + 5, COL.questionDark, 1);
  }

  function drawUsed(ctx, x, y) {
    ctx.fillStyle = COL.used;
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = COL.usedDark;
    ctx.fillRect(x + 1, y + 1, 2, 2);
    ctx.fillRect(x + T - 3, y + 1, 2, 2);
    ctx.fillRect(x + 1, y + T - 3, 2, 2);
    ctx.fillRect(x + T - 3, y + T - 3, 2, 2);
    ctx.fillRect(x, y + T - 1, T, 1);
    ctx.fillRect(x + T - 1, y, 1, T);
  }

  function drawPipe(ctx, x, y, isTop, isLeft) {
    ctx.fillStyle = COL.pipe;
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = COL.pipeLight;
    ctx.fillRect(x + (isLeft ? 2 : 0), y, 3, T);
    ctx.fillStyle = COL.pipeDark;
    ctx.fillRect(x + T - 1, y, 1, T);
    if (isTop) {
      ctx.fillStyle = COL.pipeLight;
      ctx.fillRect(x, y, T, 2);
      ctx.fillStyle = COL.pipeDark;
      ctx.fillRect(x, y + 5, T, 1);
    }
  }

  G.Render = {
    draw: function (ctx, game) {
      F = G.Font;
      ctx.imageSmoothingEnabled = false;
      if (game.state === 'title') {
        this.drawTitle(ctx, game);
        return;
      }
      this.drawWorld(ctx, game);
      this.drawHud(ctx, game);
      if (game.state === 'paused') {
        this.drawOverlay(ctx, 'PAUSED', 'PRESS P TO RESUME');
      } else if (game.state === 'gameover') {
        this.drawOverlay(ctx, 'GAME OVER', 'SCORE ' + G.util.pad(game.score, 6) + '   ENTER TO RETRY');
      } else if (game.state === 'win' && game.stateTimer <= 2.1) {
        this.drawOverlay(ctx, 'COURSE CLEAR',
          'SCORE ' + G.util.pad(game.score, 6) + '   ENTER TO CONTINUE');
      }
    },

    drawSky: function (ctx) {
      if (!this._skyGrad) {
        var grad = ctx.createLinearGradient(0, 0, 0, C.VIEW_H);
        grad.addColorStop(0, '#3f7cf0');
        grad.addColorStop(0.55, COL.sky);
        grad.addColorStop(1, COL.skyLow);
        this._skyGrad = grad;
      }
      ctx.fillStyle = this._skyGrad;
      ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    },

    drawCloud: function (ctx, x, y) {
      ctx.fillStyle = COL.cloud;
      ctx.fillRect(x, y + 4, 26, 7);
      ctx.fillRect(x + 5, y, 16, 8);
      ctx.fillRect(x + 17, y + 2, 9, 8);
      ctx.fillRect(x + 2, y + 11, 22, 3);
    },

    drawHill: function (ctx, x, baseY, size) {
      var steps = Math.ceil(size / 4);
      for (var i = 0; i < steps; i++) {
        var w = Math.round(size * 2 * ((steps - i) / steps));
        ctx.fillStyle = i === 0 ? COL.hillDark : COL.hill;
        ctx.fillRect(Math.round(x + size - w / 2), baseY - (i + 1) * 4, w, 4);
      }
    },

    drawBush: function (ctx, x, baseY) {
      ctx.fillStyle = COL.bush;
      ctx.fillRect(x, baseY - 8, 22, 8);
      ctx.fillRect(x + 4, baseY - 12, 14, 8);
      ctx.fillRect(x + 16, baseY - 6, 10, 6);
    },

    drawParallax: function (ctx, cam) {
      var off = cam.x * 0.25;
      var first = Math.floor(off / 130) * 130;
      var i = 0;
      for (var x = first; x < off + 340; x += 130) {
        this.drawCloud(ctx, Math.round(x - off), 18 + (Math.abs(Math.round(x / 130)) % 3) * 16);
      }
      off = cam.x * 0.5;
      first = Math.floor(off / 160) * 160;
      for (x = first; x < off + 360; x += 160) {
        i = Math.abs(Math.round(x / 160)) % 2;
        this.drawHill(ctx, Math.round(x - off), 160, i === 0 ? 44 : 30);
        this.drawBush(ctx, Math.round(x - off) + 90, 160);
      }
    },

    bumpOffset: function (game, col, row) {
      for (var i = 0; i < game.bumps.length; i++) {
        var b = game.bumps[i];
        if (b.col === col && b.row === row) {
          return -Math.round(4 * Math.sin(Math.PI * (b.t / 0.25)));
        }
      }
      return 0;
    },

    drawTiles: function (ctx, game) {
      var level = G.Level;
      var camX = Math.round(game.camera.x);
      var c0 = Math.max(0, Math.floor(camX / T));
      var c1 = Math.min(level.cols - 1, Math.floor((camX + C.VIEW_W) / T));

      for (var r = 0; r < level.rows; r++) {
        for (var c = c0; c <= c1; c++) {
          var ch = level.grid[r][c];
          if (ch === '.') continue;
          var x = c * T - camX;
          var y = r * T + this.bumpOffset(game, c, r);
          switch (ch) {
            case '#':
              drawGround(ctx, x, y, level.tileAt(c, r - 1) === '.');
              break;
            case 'B':
              drawBrick(ctx, x, y);
              break;
            case '?':
              drawQuestion(ctx, x, y);
              break;
            case 'U':
              drawUsed(ctx, x, y);
              break;
            case 'I':
              drawPipe(ctx, x, y,
                level.tileAt(c, r - 1) !== 'I',
                level.tileAt(c - 1, r) !== 'I');
              break;
          }
        }
      }
    },

    drawWorld: function (ctx, game) {
      var cam = game.camera;
      this.drawSky(ctx);
      this.drawParallax(ctx, cam);
      this.drawTiles(ctx, game);

      if (game.flag) game.flag.draw(ctx, cam);
      for (var i = 0; i < game.entities.length; i++) game.entities[i].draw(ctx, cam);
      for (i = 0; i < game.pops.length; i++) game.pops[i].draw(ctx, cam);
      game.player.draw(ctx, cam);
    },

    hudText: function (ctx, text, x, y, color) {
      F.draw(ctx, text, x + 1, y + 1, 'rgba(8, 8, 16, 0.55)', 1);
      F.draw(ctx, text, x, y, color, 1);
    },

    drawHud: function (ctx, game) {
      var pad = G.util.pad;
      this.hudText(ctx, 'SCORE ' + pad(game.score, 6), 8, 8, COL.text);
      this.hudText(ctx, 'COINS ' + pad(game.coins, 2), 118, 8, COL.text);
      this.hudText(ctx, 'WORLD 1-1', 200, 8, COL.text);
      this.hudText(ctx, 'TIME ' + pad(Math.ceil(game.time), 3), 266, 8, COL.text);
      this.hudText(ctx, 'LIVES ' + pad(game.lives, 1), 8, 16, COL.text);
    },

    drawOverlay: function (ctx, title, subtitle) {
      ctx.fillStyle = 'rgba(8, 8, 16, 0.72)';
      ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
      F.draw(ctx, title, Math.round((C.VIEW_W - F.width(title, 2)) / 2), 72, COL.text, 2);
      if (subtitle) {
        F.draw(ctx, subtitle, Math.round((C.VIEW_W - F.width(subtitle, 1)) / 2), 96, COL.coin, 1);
      }
    },

    drawTitle: function (ctx, game) {
      this.drawSky(ctx);
      this.drawParallax(ctx, { x: game.titleTime * 18 });
      for (var c = 0; c < C.VIEW_W / T + 1; c++) {
        drawGround(ctx, c * T, 160, true);
        drawGround(ctx, c * T, 176, false);
      }

      var title = 'PIXEL PLUMBER';
      var tx = Math.round((C.VIEW_W - F.width(title, 3)) / 2);
      var ty = 33;
      // 1px outline keeps the title readable when a cloud drifts behind it.
      F.draw(ctx, title, tx - 1, ty, COL.shadow, 3);
      F.draw(ctx, title, tx + 1, ty, COL.shadow, 3);
      F.draw(ctx, title, tx, ty - 1, COL.shadow, 3);
      F.draw(ctx, title, tx, ty + 1, COL.shadow, 3);
      F.draw(ctx, title, tx, ty, COL.text, 3);

      var line1 = 'PRESS ENTER TO PLAY';
      var line2 = 'ARROWS / WASD  MOVE';
      var line3 = 'SPACE / Z  JUMP';
      var line4 = 'P PAUSE    R RESTART';
      F.draw(ctx, line1, Math.round((C.VIEW_W - F.width(line1, 1)) / 2), 76, COL.coin, 1);
      F.draw(ctx, line2, Math.round((C.VIEW_W - F.width(line2, 1)) / 2), 92, COL.text, 1);
      F.draw(ctx, line3, Math.round((C.VIEW_W - F.width(line3, 1)) / 2), 102, COL.text, 1);
      F.draw(ctx, line4, Math.round((C.VIEW_W - F.width(line4, 1)) / 2), 112, COL.textDim, 1);

      if (game.bestScore > 0) {
        var best = 'BEST ' + G.util.pad(game.bestScore, 6);
        F.draw(ctx, best, Math.round((C.VIEW_W - F.width(best, 1)) / 2), 126, COL.textDim, 1);
      }

      var sprite = G.Sprites.player.idle;
      ctx.drawImage(sprite, Math.round(C.VIEW_W / 2 - 6), 138);
    }
  };
})(window.Game);
