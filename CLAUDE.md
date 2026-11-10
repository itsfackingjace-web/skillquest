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
- **Gear screen** (Dev Suite > Gear, internally the `worn` tab): per weapon/armour piece, three modes: its look on the character
  (the underlay wears the item via `SQGEAR.wearing(k,f)`, which equips it for the length of `f` and puts back what was there),
  its icon (the sprite editor), and how it works. Rules live in `gear.<k>` = {dmg, rng, blk, mp, rq:{s,l}}
  (`dev/111a2-s114-gear-rules.js`): dmg/rng/blk are changes added to the game's own numbers (blk in % points), mp is a wand's
  mana cost, rq replaces the requirement (skill index, level; 0 = none). Applied through `SQA.onApply`, by the outermost
  `meleeFlat`, `arrowDmg`, `bowRange`, `spellDmg`, `blockBonus`, `setSlot` and `equipItem` wrappers. The editor shows numbers
  for the developer's character (`SQGEAR.base`) and saves the difference.
  `fx` = special effects in % ({ls,burn,slow,crit,spd,xp}), summed over everything worn; on-hit ones run from the
  outermost `attack` (hp diff on `en`), `arrowHit` and `spellHit`; `spd` nudges movement in `upd` (outdoors only).
- **New gear items**: `newgear.eq_cu_<name>` = {n,b,v,d,sm} in the library. `b` is an existing item it works like: the
  game holds it as b's tier (TL/ARM/CLS) and `CUS[slot]` remembers the new key (outermost `occ`/`setSlot`). Saves store
  `cus` and keep counts/worn pieces of not-yet-loaded new items (`PEND`/`PCUS`), so never rename or delete a published
  one (the suite only deletes unpublished ones). Unpublished new items exist only on the developer's device
  (`SQGEAR.devItems`). They get loot-chest entries automatically and an anvil recipe (`SM` entry with `_cu`) if `sm` is set.
- **Pet looks** (Dev Suite > Pets): `pets.<kind>` = {w,h,s,ox,oy,a,b} (standing/walking frame, drawn facing right, mirrored
  when walking left). `SQA` draws them in place of the pet's own look through the outermost `pP` wrapper and
  `LUX.drawPeerPet`; `SQA.capturePet` copies the game's current look to start from. The Imp is left out (tied to combat).
- **Island builder** (`dev/111c-s113-island-builder.js`, a Dev Suite tab added through `SQSUITE.addTab`): custom islands are
  saved as `islands.cu_<name>` in the asset library and registered by `SQA` as normal regions (painted tiles + objects,
  8 tiles of sea added around, pier placed by `rgDock`). They skip the random tree thinning/tiering, are open without a
  voyage, and a save on a removed island loads back on Hollow. Never re-register the island the player is standing on.
  Islands can hold `lm` entries (buildings/props from `SQA.ISL_LM`, signs with `tx`, loot chests with `loot`; a chest's
  index is remembered per save in `worldState[<island>].loot`). The builder's "Real look" bakes ground with `hdBakeR` and
  copies each object/building kind once from the game's own drawing (`drawFurn` on the hidden main canvas).
- Sections live in one shared script: wrap new sections in `(()=>{ ... })()` rather than a bare `{ }` block. A plain
  `function name(){}` inside a bare block also replaces any global with the same name (this once broke `draw`).
