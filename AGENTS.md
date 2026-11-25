# AGENTS.md — 2D Retro Platformer (CoDevIA TD)

## Project
A single-player, Mario-style 2D platformer built with plain HTML5 Canvas and
vanilla JavaScript. No build step, no package manager, no external assets.

## Hard constraints
- No Node.js or Python is installed on this machine. Do not introduce tooling
  that requires them (no npm, no bundlers, no transpilers, no test runners).
- The game must run by opening `index.html` directly via `file://`.
  Therefore: NO ES modules (`import`/`export`), NO `fetch`, NO JSON files
  loaded at runtime. Use classic `<script>` tags in dependency order and a
  single global namespace (`Game`).
- No CDN dependencies. Everything must work offline.
- No third-party assets. Sprites are pixel art defined in code as string
  arrays + palette; the HUD uses a hand-rolled 3x5 bitmap font.
- Do not copy Nintendo assets, names, or music. The result is an original
  look-alike, not a Mario clone with ripped art.

## Architecture
Load order in `index.html`:
config -> sprites -> font -> input -> level -> entities -> player -> camera
-> render -> game -> main

| File              | Responsibility                                        |
|-------------------|-------------------------------------------------------|
| `js/config.js`    | Tunable constants (gravity, speeds, sizes, palette)    |
| `js/sprites.js`   | Pixel-art definitions baked into offscreen canvases    |
| `js/font.js`      | 3x5 bitmap font for the HUD and screens                |
| `js/input.js`     | Keyboard state, jump buffer, edge detection            |
| `js/level.js`     | ASCII level segments + tile grid + collision queries   |
| `js/entities.js`  | Goomba, coin, coin pop, flagpole                       |
| `js/player.js`    | Physics, state machine, animation                      |
| `js/camera.js`    | Dead-zone follow, clamped to level bounds              |
| `js/render.js`    | Sky, parallax, tiles, entities, HUD, overlays          |
| `js/game.js`      | Game states, score, lives, timer, entity collisions    |
| `js/main.js`      | Bootstrap and fixed-timestep loop                      |

Rendering pipeline: draw everything to an internal 320x192 offscreen canvas,
then blit it once to the visible canvas with an integer scale factor and
`imageSmoothingEnabled = false`.

## Structure principles
- Keep data, simulation and rendering separate. Rendering never mutates state.
- Dependencies flow one way:
  main -> game -> player/entities/camera/render -> level/sprites/font/config.
- Every entity implements `update(dt, world)` and `draw(ctx, camera)`.
- Put every tunable number in `config.js`.
- Prefer small pure helpers (`clamp`, `approach`) over inline math.
- No abstraction that is used fewer than twice.

## Gameplay invariants
- Fixed timestep of 1/60 s with an accumulator; physics never reads the raw
  `requestAnimationFrame` delta.
- Collision is AABB against the tile grid, resolved per axis (X first, then Y).
- Jump feel: variable jump height, asymmetric gravity, coyote time, jump buffer.
- Camera never scrolls left past the player's furthest progress (classic rule).
- Death sources: pits, side contact with a Goomba, timer reaching 0.

## Code style
- Plain ES2019-ish JavaScript, `'use strict'` plus an IIFE per file.
- English identifiers and English comments.
- Comments only where intent is non-obvious: jump physics, per-axis collision
  resolution, sprite baking, game-state transitions. Do not narrate obvious code.
- Entities are plain constructors with prototype methods; no inheritance tree.
- Level is authored as 12-row ASCII segments joined horizontally.

## Testing / verification
- No automated tests are possible (no Node). Verify by opening `index.html`
  in the in-app browser: check the console for errors, take screenshots, and
  confirm the level is completable in roughly 2 minutes with 3 lives.
- When tuning physics, change values in `config.js` only.

## Scope (v1)
Single ~2-minute level, 3 lives, timer, score, title/pause/death/victory/
game-over screens. No audio, no power-ups, no Koopas, no mobile/touch input.
