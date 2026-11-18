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
