# Refactor tools

Used to replace wrapper chains with ordered step lists without changing behaviour.

- `find.cjs <fn>` lists every `const _x=<fn>;<fn>=function...` wrapper in build order (needs acorn + acorn-walk; found at `/opt/node-tools`).
- `conv.cjs` (snap → `SQSAVE`, Nov 18) and `convfn.cjs <fn> <REG>` (applySave → `SQLOAD`, Nov 18) rewrite the wrappers in `src/` into
  `REG.after/before/wrap('<file no>', ...)` steps. `--dry` prints the plan only. The registry itself must exist first (see 006).
- Proving nothing changed (run on the old build, then on the new one, and compare):
  - `node compare-save.cjs out.json` — the save of a rich character (two runs on the same build must match first).
  - `node compare-load.cjs out.json` + `python3 compare-load.py old.json new.json` — four saves (current, older formats, a minimal
    one) loaded into a fresh game; the first run writes `saves.json` from the build you run it on, keep it for the second.
- Then run `node tools/checks/run.cjs`.
- `node compare-scenes.cjs scenes-<x>.cjs out.json` plays the scripted scenes in that file (bag, health, hunger, messages, open screen,
  timed job) for functions that act rather than load: run it 2-3 times on the old build first to be sure it repeats exactly.
  `scenes-eat.cjs` (8 situations) was used for EAT on Nov 18.
- `scenes-attack.cjs` (18 HIT situations: trees, ores, rocks, boulder, bush, monsters, water, building, hoe, dagger, sledge, a house wall)
  was used for HIT on Nov 18 with `--fresh` (a new game per scene) and `compare-load.py`-style comparison ignoring hp/hunger
  (monsters and hunger tick on their own).
- `compare-frames.cjs scenes-frames.cjs out.json --pix` (Nov 18, used for `upd`/`drawHUD`/`pP`): the page runs offline and frozen from
  its first line (clock, timers, requestAnimationFrame and Math.random under the harness's control), starts the game through the title
  screen and character creator, loads `frames-save.json` and plays scenes frame by frame (walking, a fight to the death, chopping/lighting/
  cooking, sailing to Ashfall, fishing behind the START menu, a dungeon, building and walking through a house), recording state lines and a
  canvas hash every few frames. Two runs of one build give identical files (pixels too); compare with a JSON diff of the `lines`.
  It caught a deliberate 0.2-pixel nudge in `upd` in every scene.
- `convfn.cjs` refuses: a `before` step with any `return` (it would no longer stop the call), and a wrapper whose saved inner function is
  used anywhere else in its block (scope-aware). Text between `const _x=fn` and `fn=function` is kept.
- `convfn.cjs` makes an `after` step only when the wrapper never mentions its own result variable (Nov 19: `const ok=_lr(...);if(ok)...;return ok`
  became an `after` step where `ok` didn't exist, and island boulders stopped being drawn; the frame comparison caught it).
- `blocks.cjs` lists the bare top-level `{ }` blocks and what each leaks to the global scope (function declarations and `var`s, Annex B),
  with scope-aware uses elsewhere (eslint-scope). `blocks-to-iife.cjs [--dry] [--only <file>]` turns them into `(()=>{ ... })();`: a leaked
  name other code uses stays global (`window.f=f;` after a function, `var v;` before the block for a `var`), and a `;` goes first when the
  statement before could run into the `(`. Nov 19: 67 blocks in 48 files (kept global: icvEnter, petFollow, SLEDGE, EATCD); then the
  multiplayer block (061-080) with `--multi` (18 names kept global). `tools/checks/lint.cjs` now fails on any bare block.
