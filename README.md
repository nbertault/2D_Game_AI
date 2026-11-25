# Pixel Plumber

A small 2D retro platformer that runs straight in the browser: one level, three
lives, a countdown timer, goombas, coins, `?` blocks and a flagpole.

**This is the first project of the series built together with an AI agent.**
The entire game — architecture, physics, level layout, pixel art and even the
HUD font — was written in a single session by the agent, following the
conventions recorded in [`AGENTS.md`](AGENTS.md). It also serves as the baseline
for the projects that come after it: the same stack, the same rules, a bigger
scope each time.

## Play

Open `index.html` in any modern browser. That's it — no install, no server, no
build step, works offline.

## Controls

| Key | Action |
| --- | --- |
| `←` `→` / `A` `D` | Move |
| `Space` / `↑` / `W` / `Z` | Jump (hold for higher) |
| `Enter` | Start / confirm |
| `P` / `Esc` | Pause |

## What's inside

- HTML5 Canvas + vanilla JavaScript, classic `<script>` tags and a single global
  `Game` namespace, so `file://` works without a server.
- Internal resolution of 320×192, blitted to the window at an integer scale with
  smoothing disabled — crisp pixels at any size.
- Fixed 60 Hz timestep with an accumulator, so physics never depends on the
  display refresh rate.
- Jump feel tuned the classic way: variable jump height, heavier falling
  gravity, coyote time and a jump buffer.
- Per-axis AABB collision against the tile grid.
- All pixel art defined in code as character grids plus a palette, baked into
  offscreen canvases at load. No image files, no third-party assets.
- A hand-rolled 3×5 bitmap font for the HUD and menus.

## Project layout

```
index.html        canvas, script load order, controls
css/style.css     page shell and pixel-perfect scaling
js/config.js      every tunable value (physics, rules, palette)
js/sprites.js     pixel-art grids baked into canvases
js/font.js        3×5 bitmap font
js/input.js       keyboard state, jump buffer, edge detection
js/level.js       level as 12-row ASCII segments, tile grid, collision
js/entities.js    goomba, coin, coin pop, flagpole
js/player.js      physics, state machine, animation
js/camera.js      dead-zone follow, clamped to level bounds
js/render.js      sky, parallax, tiles, HUD, overlays
js/game.js        game states, score, lives, timer, collisions
js/main.js        bootstrap and fixed-timestep loop
```

The level is authored as blocks of 12 rows × 24 columns of ASCII
(`#` ground, `B` brick, `?` block, `o` coin, `I` pipe, `G` goomba, `P` spawn,
`F` flag), joined left to right. Editing a row is enough to change the level.

## Art

The look is a deliberate nod to the 8-bit platformers of the 80s, but every
sprite, name and colour is original. No Nintendo assets are used or reproduced.
