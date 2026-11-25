'use strict';
window.Game = window.Game || {};

(function (G) {
  var KEYMAP = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowDown: 'down', KeyS: 'down',
    Space: 'jump', KeyZ: 'jump', ArrowUp: 'jump', KeyW: 'jump',
    KeyP: 'pause', Escape: 'pause',
    KeyR: 'restart', Enter: 'confirm'
  };

  // Keys whose default browser behaviour (page scroll) must be suppressed.
  var CAPTURED = {
    ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1,
    Space: 1, Enter: 1
  };

  var state = {
    down: {},
    left: false, right: false, downKey: false,
    jumpHeld: false,
    jumpPressed: false,
    jumpReleased: false,
    pausePressed: false,
    restartPressed: false,
    confirmPressed: false
  };

  function press(action) {
    switch (action) {
      case 'left': state.left = true; break;
      case 'right': state.right = true; break;
      case 'down': state.downKey = true; break;
      case 'jump':
        if (!state.jumpHeld) state.jumpPressed = true;
        state.jumpHeld = true;
        break;
      case 'pause': state.pausePressed = true; break;
      case 'restart': state.restartPressed = true; break;
      case 'confirm': state.confirmPressed = true; break;
    }
  }

  function release(action) {
    switch (action) {
      case 'left': state.left = false; break;
      case 'right': state.right = false; break;
      case 'down': state.downKey = false; break;
      case 'jump':
        if (state.jumpHeld) state.jumpReleased = true;
        state.jumpHeld = false;
        break;
    }
  }

  G.Input = {
    // Read-only view used by the game code.
    get left() { return state.left; },
    get right() { return state.right; },
    get jumpHeld() { return state.jumpHeld; },
    get jumpPressed() { return state.jumpPressed; },
    get jumpReleased() { return state.jumpReleased; },
    get pausePressed() { return state.pausePressed; },
    get restartPressed() { return state.restartPressed; },
    get confirmPressed() { return state.confirmPressed; },

    init: function () {
      window.addEventListener('keydown', function (e) {
        if (CAPTURED[e.code]) e.preventDefault();
        if (e.repeat) return;
        var action = KEYMAP[e.code];
        if (action) press(action);
      });

      window.addEventListener('keyup', function (e) {
        if (CAPTURED[e.code]) e.preventDefault();
        var action = KEYMAP[e.code];
        if (action) release(action);
      });

      // Dropping focus while a key is held would otherwise leave it stuck.
      window.addEventListener('blur', function () {
        state.left = false;
        state.right = false;
        state.downKey = false;
        state.jumpHeld = false;
      });
    },

    // One-shot flags are cleared once per simulation step, after the update.
    endFrame: function () {
      state.jumpPressed = false;
      state.jumpReleased = false;
      state.pausePressed = false;
      state.restartPressed = false;
      state.confirmPressed = false;
    }
  };
})(window.Game);
