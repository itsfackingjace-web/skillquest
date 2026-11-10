# SkillQuest — notes for whoever updates the game

- **Edit the files in `src/`, never `index.html` directly.** `index.html` is built from them:
  run `node tools/build.mjs` after every change and commit both. GitHub Pages serves `index.html` at skillquestmmo.com,
  and a check on GitHub fails if `index.html` doesn't match `src/` (`node tools/build.mjs --check`).
- `src/manifest.txt` lists every source file in build order. Order matters: the files share one script, and later
  files build on (and often wrap) functions and variables defined by earlier ones. New features go in a new file,
  added to the manifest just before `core/112-fullscreen-options.js` unless they must run earlier.
  Folders (core, world, combat, skills, items, ui, graphics, multiplayer, data, shell) are only for finding things;
  the manifest alone decides the order.
- The build parses the game script and reports syntax errors with the source file and line.
- Firebase rules are in `database.rules.json` and must be published in the Firebase console when they change.
- **Every update to the game must add a patch note.** Put a new entry at the top of `PATCH_NOTES` in
  `src/data/074-patch-notes.js` with a new version (`YYYY.MM.DD-N`), the date, a short title and player-friendly bullet points.
  The version shown in Options and the wiki's "NEW!" badge both come from that first entry.
- Write patch notes for players, not developers: what's new or fixed and how to use it.
- **Dev Suite** (`src/dev/`): developer-only editor in the game (Options > Dev Suite, or `/suite` in chat). It edits item
  sprites, worn looks (gear drawn on the character: a 96x112 layer per facing f/b/s, run-length packed; equipped keys
  travel to other players as `ch.wr`) and stats and publishes them through the database: drafts in `assets/draft`, the published copy in `assets/live`
  (public read; players apply it at startup and cache it on the device), replaced versions in `assets/hist`. Writes need
  the account's uid under `devs/` (added by hand in the Firebase console). `SQA` (`111a-s111-asset-library.js`) applies a
  library on top of the game's own values and keeps the originals, so anything not published falls back to the code.
- **Island builder** (`dev/111c-s113-island-builder.js`, a Dev Suite tab added through `SQSUITE.addTab`): custom islands are
  saved as `islands.cu_<name>` in the asset library and registered by `SQA` as normal regions (painted tiles + objects,
  8 tiles of sea added around, pier placed by `rgDock`). They skip the random tree thinning/tiering, are open without a
  voyage, and a save on a removed island loads back on Hollow. Never re-register the island the player is standing on.
- Sections live in one shared script: wrap new sections in `(()=>{ ... })()` rather than a bare `{ }` block. A plain
  `function name(){}` inside a bare block also replaces any global with the same name (this once broke `draw`).
