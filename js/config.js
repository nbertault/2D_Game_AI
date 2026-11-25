'use strict';
window.Game = window.Game || {};

(function (G) {
  // Every value that decides how the game feels lives here, so tuning never
  // requires touching simulation code.
  G.CONFIG = {
    TILE: 16,
    VIEW_W: 320,
    VIEW_H: 192,

    // Physics, in pixels per second (the loop always steps at 60 Hz).
    GRAVITY: 1700,
    FALL_GRAVITY_MULT: 1.4, // falling is snappier than rising
    MAX_FALL: 480,
    JUMP_VELOCITY: -470,
    JUMP_CUT: 0.45,         // velocity kept when the jump button is released
    WALK_ACCEL: 800,
    AIR_ACCEL: 600,
    SKID_ACCEL: 1500,
    FRICTION: 1000,
    MAX_RUN: 190,
    COYOTE_TIME: 0.09,      // grace period to still jump after leaving a ledge
    JUMP_BUFFER: 0.10,      // jump pressed slightly before landing is remembered

    PLAYER_W: 12,
    PLAYER_H: 15,

    GOOMBA_W: 14,
    GOOMBA_H: 14,
    GOOMBA_SPEED: 40,

    START_LIVES: 3,
    START_TIME: 500,
    SECONDS_PER_TIME_UNIT: 0.4,
    TIME_BONUS: 50,
    COIN_SCORE: 200,
    STOMP_SCORE: 100,
    FLAG_SCORE: 2000,

    COLORS: {
      sky: '#5c94fc',
      skyLow: '#7fb0ff',
      cloud: '#ffffff',
      hill: '#1ea848',
      hillDark: '#0d7a30',
      bush: '#2ec85a',
      dirt: '#c86a28',
      dirtLight: '#f0a868',
      dirtDark: '#6c3008',
      brick: '#b05010',
      brickLight: '#e08040',
      brickDark: '#5c2000',
      question: '#e8a020',
      questionLight: '#fcd858',
      questionDark: '#7c4000',
      used: '#a06020',
      usedDark: '#603408',
      pipe: '#00a800',
      pipeLight: '#68e068',
      pipeDark: '#005800',
      coin: '#fcd800',
      coinLight: '#fff8b0',
      coinDark: '#c08800',
      pole: '#d8d8d8',
      flag: '#e83030',
      text: '#ffffff',
      textDim: '#b8b8c8',
      shadow: '#101018'
    }
  };

  // Small numeric helpers shared by the simulation.
  G.util = {
    clamp: function (v, min, max) {
      return v < min ? min : (v > max ? max : v);
    },
    approach: function (value, target, step) {
      if (value < target) return Math.min(value + step, target);
      if (value > target) return Math.max(value - step, target);
      return target;
    },
    pad: function (n, width) {
      var s = String(Math.max(0, Math.floor(n)));
      while (s.length < width) s = '0' + s;
      return s;
    }
  };
})(window.Game);
