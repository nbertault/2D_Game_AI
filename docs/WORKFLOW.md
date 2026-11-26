# Workflow

This is the source of truth for how work moves from an idea to a release.
`AGENTS.md` holds the technical constraints; this file holds the process.

## Roles

| Role | Mode | Owns | Cannot |
|------|------|------|--------|
| Build | primary | implementation, commits | push, merge or release without approval |
| Planner | primary | the implementation plan | edit files, run writing commands |
| Playtester | primary | browser verification | edit files, run shell |
| Reviewer | primary | review findings | edit files |
| Docs-scribe | subagent | README, AGENTS, CHANGELOG | touch code |
| Physics-tuner | subagent | `js/config.js` | touch any other file |

Select a primary role from the agent picker. Build launches the subagents.

## Pipeline

| Step | Role | Output | Gate |
|------|------|--------|------|
| 1. Scope | you + Planner | milestone and issue | milestone open |
| 2. Plan | Planner | plan | you approve |
| 3. Branch | Build | branch from `dev` | - |
| 4. Implement | Build | commits | - |
| 5. Verify | Playtester | report and screenshots | must pass |
| 6. Review | Reviewer | findings | no blockers |
| 7. Docs | Docs-scribe | doc diff | - |
| 8. Commit and push | Build | local commit | your approval |
| 9. PR and merge | you | merged PR into `dev` | your approval |
| 10. Release | you + Playtester + Reviewer | tag and release | milestone closed, two approvals |

## Definition of Ready

An issue is ready when it states:
- the goal in one sentence;
- acceptance criteria;
- what is out of scope;
- how Playtester will verify it.

## Definition of Done

- The game runs by opening `index.html` via `file://`.
- The console is clean.
- The level is completable and the invariants in `AGENTS.md` still hold.
- Reviewer reports no blockers.
- Docs are updated when behaviour or structure changed.
- The PR is approved and merged.

## Gates

- **Push**: `.opencode/opencode.jsonc` asks before `git push`, `gh pr merge`
  and `gh release create`. Choose "Allow once", never "Allow always".
- **Merge**: every branch enters `dev` through a pull request you approve.
- **Release**: `dev` -> `main` needs one approval; the tag and GitHub release
  need a second. `main` and `dev` are protected by the `protect-main-dev`
  ruleset: pull request required, no force push, no deletion, no bypass.

## Conventions

- Branches: `<type>/<slug>` with `feat`, `fix`, `chore`, `docs`.
- One branch, one concern.
- Commit subjects: imperative, present tense, no trailing period.
- Commit in small steps that keep the game runnable.

## Release checklist

1. Every issue in the milestone is closed.
2. Playtester verified the build in the browser.
3. `git log --oneline main..dev` and `git diff --stat main...dev` reviewed.
4. PR `dev` -> `main` merged after approval.
5. `gh release create vX.Y --target main` after a second approval.
6. `dev` resynced from `main` through a PR (`main` -> `dev`); never force-reset.

## Where things live

| Path | Contents |
|------|----------|
| `AGENTS.md` | technical constraints, architecture, git rules |
| `docs/WORKFLOW.md` | this document |
| `.opencode/agents/` | the roster |
| `.opencode/opencode.jsonc` | the mechanical push gate |
| `.github/` | PR and issue templates |
| `CHANGELOG.md` | released changes |
