# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Project agent roster: planner, playtester, reviewer, docs-scribe and
  physics-tuner under `.opencode/agents/`.
- Mechanical push gate before `git push`, `gh pr merge` and `gh release create`.
- Workflow documentation, pull request template and issue template.

### Changed
- `main` and `dev` now only move through pull requests, enforced by the
  `protect-main-dev` ruleset.

## [1.0.0] - 2026-11-25

### Added
- First playable version: one level, three lives, timer, score, goombas, coins,
  blocks, flagpole, and the title/pause/death/victory/game-over screens.
