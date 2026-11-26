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

## Git workflow
Branch roles:
- `main` — released, playable versions only. Every commit here belongs to a tag.
- `dev` — integration branch. Every change lands here before `main`.
- `<type>/<slug>` — one branch per change, always cut from an up-to-date `dev`.
  Types: `feat`, `fix`, `chore`, `docs`.

Every change follows the same path:
1. `git checkout dev && git pull`
2. `git checkout -b feat/short-slug`
3. commit in small steps with an imperative subject line
4. commit locally; push only after approval
5. after approval: `git push -u origin feat/short-slug`,
   `gh pr create --base dev --fill`
6. after approval: merge the pull request, then delete the feature branch

Releases: once a milestone's scope is done, verify the game in the browser,
close the milestone, then open a pull request `dev` -> `main` and show
`git log --oneline main..dev` plus `git diff --stat main...dev`. Merge only
after approval. Tag and publish only after a second approval:
`gh release create vX.Y --target main`. Afterwards resync `dev` from `main`
through a pull request (`main` -> `dev`); `dev` is protected, so it cannot be
force-reset.

### Push approval gate
This project is under manual push control: commits stay local until the user
approves them, and nothing reaches `origin` on its own.

- Never run `git push`, `gh pr merge`, `gh release create`, or anything else
  that writes to `origin` without explicit approval for that exact action.
- Commit locally, then report: branch, commit hash(es), files touched, and the
  exact command you intend to run. Wait for a clear go-ahead.
- Approval is per push. A new commit or a new branch needs a new approval.
- The `git-*` skills stop at this gate: run `git-feature` up to the local
  commit, and `git-release` up to just before the `dev` -> `main` merge. Skip
  their automatic push/merge steps here and run them only after approval.
- `dev` -> `main` is a release action. Before asking, show
  `git log --oneline main..dev` and `git diff --stat main...dev`, verify the
  game in the browser, and confirm the milestone is closed.

Rules:
- Never commit directly to `main` or `dev`; they only move through merges.
- `main` must stay playable at all times.
- `main` and `dev` are protected on GitHub: both only move through pull
  requests, with no force pushes and no deletions.
- One branch, one concern. A change that needs two branches is two changes.
- Every release gets a milestone, one issue describing its scope, a tag and a
  GitHub release.

## Agents

The roster lives in `.opencode/agents/`. Select a primary role from the agent
picker; Build launches the subagents.

| Agent | Mode | Use it for |
|-------|------|------------|
| `planner` | primary | Turning an issue into a plan before branching |
| `playtester` | primary | Browser verification after implementing |
| `reviewer` | primary | Diff review before commit |
| `docs-scribe` | subagent | README, AGENTS and CHANGELOG updates |
| `physics-tuner` | subagent | Game-feel tuning through `js/config.js` |

`docs/WORKFLOW.md` defines the pipeline, the Definition of Ready/Done and the
release checklist. The mechanical push gate is in `.opencode/opencode.jsonc`.

## Milestones
- `v1.0` — first playable version, shipped.
- `v1.1` — agent team and workflow: roster, push gate, protected branches,
  workflow docs and templates (in progress).
- Open the next milestone on GitHub before starting work on it, so every branch
  maps to a milestone.

## Tooling
- GitHub CLI lives at `C:\Program Files\GitHub CLI\gh.exe`. A shell started
  before the install will not have it on `PATH`.
- Git authenticates through gh (`gh auth setup-git`). If a push hangs, the
  credential helper is misconfigured — `git config --global` must route
  `https://github.com` to `gh auth git-credential`, not to Git Credential Manager.
- Run git/gh with `GIT_TERMINAL_PROMPT=0` so a bad credential fails fast instead
  of waiting on an invisible prompt.
- The git work above is automated by four global OpenCode skills in
  `~/.config/opencode/skills`: `git-bootstrap`, `git-feature`, `git-milestone`,
  `git-release`. Run their `.cmd` launchers instead of typing the commands by
  hand. Script execution is disabled on this machine, so the `.ps1` files must
  be started through the launcher.
