# SkillQuest — notes for whoever updates the game

**Read `GAME-BIBLE.md` first**: what the game is, its pillars and the rules every feature is checked against.

## Rules for every change

- **Edit the files in `src/`, never `index.html` directly.** `index.html` is built from them:
  run `node tools/build.mjs` after every change and commit both. GitHub Pages serves `index.html` at skillquestmmo.com,
  and a check on GitHub fails if `index.html` doesn't match `src/` (`node tools/build.mjs --check`).
- `src/manifest.txt` lists every source file in build order. Order matters: the files share one script, and later
  files build on (and often wrap) functions and variables defined by earlier ones. New features go in a new file,
  added to the manifest just before `core/112-fullscreen-options.js` unless they must run earlier.
  Folders (core, world, combat, skills, items, ui, graphics, multiplayer, data, shell) are only for finding things;
  the manifest alone decides the order.
- The build parses the game script and reports syntax errors with the source file and line.
- **Automatic checks** (`tools/checks/`): `node tools/checks/run.cjs` (or `run.cjs <part of a name>`) plays short scripted scenes in the
  real game (fresh Chromium page per case, fake Firebase in `tools/checks/fake/`, rules via `rulesdb.cjs`, account-only saves on as on the
  live site). The cases in `cases/` cover start-up, saves, crafting from chests, graves, campfires, house chests, gathering/eating, island
  trips, trading, the World Market, the guild bank, dungeons, fishing behind menus, HIT/EAT, the Dev Suite tabs, patron art, new pets,
  the Song Studio, song zones, the wiki, the error reporter, monsters under houses and holding HIT on touch. First come the **source rules** (`tools/checks/lint.cjs`, also on its own):
  no bare top-level `{ }` blocks, no `fn=` for a function that has a step list (Nov 20: 013's `useFurn=function`
  skipped every later step and stranded players on islands), unique panel numbers, no class styled in two files unless listed in
  `tools/checks/css-shared.txt`, no `prompt()`, no untagged empty catches. A full run takes about 4 minutes. **Run them after building and before
  every release; never release with a failing check.** When fixing a bug, add a case that fails without the fix. Script errors on the page
  fail a case. Errors that tagged catches swallowed during the run are written to `tools/checks/caught-errors.txt` (code errors are
  counted at the end): fix them, or mark an expected one `/*quiet*/`.
- **Saving is a list of steps** (006, `window.SQSAVE`): `snap()` = the game's own fields + every section's step in load order.
  Add to the save with `SQSAVE.after('<file no>:<keys>', s=>{ s.key=... })`; code that must run before/around the save uses
  `SQSAVE.wrap(name, next=>function(){... next() ...})`. **Never reassign `snap`.** `SQSAVE.list()` shows the order (74 steps on Nov 18).
- **Loading is a list of steps too** (006, `window.SQLOAD`): `applySave(S)` = the game's own loader + every section's step in load order.
  Read your fields with `SQLOAD.after('<file no>', (S)=>{...})`; `SQLOAD.before(name,(S)=>{...})` prepares S/the game before the loaders
  run (latest-added first); `SQLOAD.wrap(name, next=>function(S){... next(S) ...})` surrounds the load (13 of the 76 steps, e.g. 012, 049,
  067, 131, 156, 197). **Never reassign `applySave`.** `SQLOAD.list()` shows the order.
- **Step lists for other functions** (`sqSteps(label, fn, install)` at the top of 006, `window.SQSTEPS[label]`): same after/before/wrap
  steps, plus `list()`. **EAT** (`window.SQEAT`, created in 007 right after its `eat`, which replaced 004's): 11 named steps (stop building,
  iron stomach, burnt food saves, potions not eaten, timed cooking, cooldown, PvP healing, meal buffs, food picker, already cooking).
  **Never reassign `eat`.** A `before` step can't stop the call (a `return` only ends the step): a step that may take over the
  button must be a `wrap` that skips `next` (Nov 18: convfn.cjs had turned 18 such wrappers into `before` steps; `tools/refactor/fix-before-returns.cjs`
  put them back and convfn now refuses). 181's food-picker helpers are `window.SQEATPICK` (`eat()` = eat now, never cook); `window.SQEAT` is the step list.
  **HIT** (`window.SQHIT`, created in 006 right after `sqSteps`, base = 004's `attack`): 58 steps named after their
  section (mostly wrap steps: most take over HIT in one situation or lend/hide something for the call). **Never reassign `attack`**; add a
  step (`SQHIT.wrap('<file no> <what>', next=>function(){...})`) and a word in 118 when it's a new situation.
  **UPD** (`window.SQUPD`, created at the end of 001 right after its `upd`): 142 steps, every frame. **HUD** (`window.SQHUD`, end of 010,
  base = 010's `drawHUD`): 38 steps. **Player drawing** (`window.SQPP`, end of 003, base = 003's `pP`): 31 steps. **Never reassign `upd`,
  `drawHUD` or `pP`**; add a step (`SQUPD.after('<file no> <what>', dt=>{...})`, or `.wrap` when it must run before/around the frame or skip it).
  **Monster drawing** (`window.SQPS`, end of 002, base = 002's `pS`): 16 steps (111d's look drawer keeps the inner drawer as `_ps` for
  its own use). **Panels** (`window.SQRPN`, end of 004, base = 004's `rPn`): 54 steps. **Room items** (`window.SQFURN`, end of 012, base =
  012's `drawFurn`): 33 steps. Also step lists (Nov 19): `addXp` (`SQADDXP`, end of 004), `newGame` (`SQNEWGAME`, end of 006), `talk`
  (`SQTALK`) and `closePanel` (`SQCLOSEPN`, end of 008), `drawMap` (`SQDRAWMAP`, end of 010), `iconURL` (`SQICON`, end of 011), `enterScene`
  (`SQENTER`, end of 012), `enemyDrop` (`SQDROP`, end of 014), `optionsHTML` (`SQOPTS`, end of 019); and `NEWDRAW` (`SQNEWDRAW`, 002), `fire` (`SQFIRE`, 004),
  `gearCH` (`SQGEARCH`, 006), `showScreen`/`mapHTML` (`SQSHOWSCR`/`SQMAPHTML`, 010), `startBuild`/`placeBuild` (`SQSTARTB`/`SQPLACEB`, 011),
  `useFurn` (`SQUSEFURN`, 012), `drawRoom` (`SQDRAWROOM`, 013), `wantSong` (`SQWANTSONG`, 014), `navRoot` (`SQNAVROOT`, 023), `setSlot`
  (`SQSETSLOT`, 028), `loadRegion` (`SQLOADRG`, 049). **Never reassign any of these** either. An `after` step only sees the arguments and
  the result (`(…args, ret)`): a step that reads or changes the wrapper's own result variable must be a `wrap` (convfn now keeps those as wraps).
  Notes that say "the outermost X" now mean "a step on X's list".
  The steps keep the names of the sections that made them, so `SQUPD.list()` shows what runs each frame, in order. `solid` is still a
  wrapper chain (012 calls its saved inner `_sol12` elsewhere, so it can't be converted without changing behaviour).
  `tools/refactor/` has the converters and the before/after comparisons (`compare-frames.cjs` for anything that runs every frame).
- Firebase rules are in `database.rules.json` and must be published in the Firebase console when they change.
- **Every update to the game must add a patch note, and there is one patch note entry per day.** In `PATCH_NOTES`
  (`src/data/074-patch-notes.js`): if the top entry is today's, add your bullets to it (new features first, then "Fixed: ..."
  lines), rewrite older bullets of that day if your change supersedes them (describe the final state, not the steps), keep
  the title a short summary of the day, and bump its version's `-N` (`YYYY.MM.DD-N`). Otherwise put a new entry for today at
  the top. The version shown in Options, the wiki's "NEW!" badge and the update check (125) all come from that first entry, so
  any player-facing change must bump it. Leave out Dev Suite / developer-tool changes that don't change anything for players.
- Write patch notes for players, not developers: what's new or fixed and how to use it.
- The multiplayer code (061 to 080) is one big `(()=>{ ... })();` (it opens in 061 and closes in 080): `MP`, `PV`, `pvSend`, `pvFx`,
  `mpDrawPeer` live inside it and can't be wrapped from later files. The names later files use are put on `window` right after their
  declarations (mpLoc, mpLog, mpBackup, saveInfo, mpChooseSave, mpSignIn, mpVis, mpSend, releaseMenu, pvTarget, rbSolidSync, rhSolidSync,
  lbOpen, wbLair, wbPos, trustedBy, rfForeign, rfCanTill): export a new one the same way (`window.f=f;`). Use its hooks instead: `SQFXH[kind](player,event)` for new fx event kinds, `SQPEERFX` drawers run
  for each other player, `SQPVSEND(event)` to send, `SQPVQUIET` to keep attacks from being sent as swings (`window.SQMP`,
  `window.SQPVP` expose the state).
- Sections live in one shared script: wrap new sections in `(()=>{ ... })()` rather than a bare `{ }` block. A plain
  `function name(){}` inside a bare block also replaces any global with the same name (this once broke `draw`). Every bare block
  became `(()=>{ })();` on Nov 19-20 (tools/refactor/blocks-to-iife.cjs), and the source rules fail on a new one.
- **Panel numbers (`ptab`) must be unique**: 124's Custom Controls used 34, which is 064's PvP screen, so START > PvP opened Custom
  Controls (Nov 15; now 45). In use: 0-8 (built-in screens), 31 style, 32 trade, 33 graves, 34 PvP, 35 achievements, 36/37 player menu/duel,
  38 party, 39 emotes, 40 report, 41 eating, 42 quest choice, 43 events, 44 guild, 45 controls, 46 credits, 47 Art Room,
  48 patron, 49 moderation, 50 campfire, 51 Song Studio, 52 Card Binder, 53 card frame. Grep `TAB=` and `ptab=` before picking one; give it a const (`const XTAB=54`) so the source rules can check it.
- **No `prompt()`**: the Windows app (Electron) doesn't support it ("Prompt () is and will not be supported"). Ask for text with an
  input on the page instead (Moderation's reason box, Admin's reply box).
- **Save keys** (`core/166-s172-save-keys.js`, `SQSAVEKEYS`): 049 keeps unknown save fields (`SAVE_EXTRA`) and writes them back; it
  used to learn "known" fields only from the first snap of a session, so fields written only when non-empty (`rh` island
  houses/castles, `rb`, `rfarm`, ...) came back stale after being emptied (the island castle dupe). 166 lists those fields in
  `KNOWN49`, learns every field a snap writes, and drops known fields from `SAVE_EXTRA`. **A new save field written only when
  non-empty must be added to `KNOWN49`** (or to 166's `KEYS`).
- **Transactions that take something once** (161 gifts, 079 market COLLECT): the update function must return the new value even
  when it's handed null (`cur=>{got=cur;return null}`), never abort on null: the real SDK often calls it first with a stale
  "nothing" before it has the server's value, and aborting there means it never retries. 161 also polls `gifts/<uid>` every 15 s.
- **Bag listing**: the bag shows `BAG_ORDER()` (011) = fixed keys + `EXTRA_BAG`, and 086 copied every item known at that point into
  `EXTRA_BAG`. **An item added by a later section must push itself into `EXTRA_BAG`** (199's `voidlog` didn't and was invisible), and give
  `iconURL` a picture for it.
  `BAG_ORDER()` is de-duplicated (a key in both `BK` and `EXTRA_BAG` was listed twice), so pushing a key that's already listed is harmless.
- **Material names in recipe lists**: `matN(k)` (004, global) = `SHORT[k]` or the item's name lowercased; 004/006/007/011 use it (they printed
  raw keys, so Content items showed as `it_...`). Use it in any new list of materials.
- **Database download traffic** (Nov 15): the database forwards every write to every listener, so download cost grows with players².
  061's `mpTick` sends only the presence fields that changed (`MP.sent`), the whole record only after a reset (`MP.last=''`), and `t`
  only with the 5 s heartbeat (peers' `seen` needs it within 20 s); `MP.pw/pb` count writes/bytes. 061's monster sharing sends the
  whole `mobs/<loc>/<uid>` set once (`MOB.sentM`), then `update`s of changed paths only (`m/<id>/<field>`, removals as null; numbers
  besides x/y/hp only when they move by 1+ or change sign; x/y rounded; `t` every 2 s, peers drop a set after 6 s); `MOB.mw/mb` count.
  111a's `refresh()` reads `assets/live/v` first and skips the ~265 KB library when the device already has that version (`force` to skip
  the check). **New presence fields or listeners on whole nodes cost download for every player online: keep them small and rare.**
  Test harness: scratchpad fake3's `_update` now applies slash paths like the real SDK.
- **Errors are reported, not swallowed** (`core/000b-error-reporter.js`, `window.SQERR`, Dev Suite > Errors): every `catch(e){}` in `src/`
  was turned into `catch(e){self.SQERR&&SQERR(e,'<file>-<n>')}` by `tools/refactor/tag-catches.cjs` (**rerun it after adding catches**; it never
  renumbers existing ones). Write `catch(e){/*quiet*/}` when a catch is meant to fire. Code errors (TypeError/ReferenceError/RangeError, not
  network/audio) are sent once per site per session (6 a session at most) as `errs/<site>` {m,n,v,t}: no account or player data (privacy.html says
  so; 209's dev cleanup removes records older than a year). Uncaught errors from the page come in as `uncaught`/`promise`. Rules: `errs`.

## Pitfalls that have bitten before

- Wrap new sections in `(()=>{ ... })()`. A `function name(){}` in a bare `{ }` block becomes a global and can replace one (it broke `draw`,
  and a `function open` replaced `window.open`). Never name a function after a browser global (open, close, print, find, stop, focus, name...).
- Don't name file-level consts `W`, `H`, `P`, `T`, `K`... : they hide the game's globals (`W`/`H` screen size, `P` the player).
- Prefix the CSS classes of new panels (`.gr`/`.gi` are taken by station screens; the guild screen once restyled all of them). Panel numbers
  (`ptab`) must be unique: grep `TAB=` and `ptab=` first.
- `HOUSES` also holds other players' houses while online (`_foreign`): skip them when looping over "your" homes.
- Anything that lends items to `inv` for longer than one call must keep them out of `snap()` (see docs/saves.md).
- Never rename or delete published library items (new gear, Content items, new pets): saves keep their counts by key.
- New presence fields or listeners on whole database nodes cost download for every player online: keep them small and rare.
- A transaction that takes something once must return the new value even when handed null (the real SDK calls it with a stale null first).
- Firebase rules have no `numChildren()`; the real SDK's `ref(db,'')` throws (use `ref(db)` for the root).
- The checks' rules database (`rulesdb.cjs`) runs rule expressions as plain JavaScript, so a rule Firebase's type checker refuses
  (Nov 22: `sum + (a || b)`, "Invalid + expression") still passes them. After Publish, look for the red "Error saving rules" banner and reload.
- When a new context is added to `attack`, `eat` or `talk`, give it a button word in 118. A new raw fish needs the Giant Turtle's `RAW` list
  and its rule regenerated. A new arrow goes in 021's fletch lines and 010's arrow chip. A new pet after 151 needs its pet item.
- Material lists use `matN(k)` (004); later items must push themselves into `EXTRA_BAG` and give `iconURL` a picture.

## Where things are documented

Each area has its own notes file in `docs/`. Read the one for the area you're changing (search them for a file number or a `window.SQ...` name).

- **`docs/dev-suite.md`** — Dev Suite: The developer editor and everything it publishes through the asset library (`SQA`): sprites, gear, pets, props, monsters, content, balance, recipes, events, checks, admin and moderation tools.
  Covers: Dev Suite, Gear screen, New gear items, Pet looks, Prop looks, Dev Suite > Test, Monsters, Item-sprite swings, Dev Suite copy/paste, Bosses made in the Dev Suite, Monster attacks, Admin tab, Content without code, Balance, History & search, Fixing a player's game, Testers, Checks, Live publishes, Palette tools, More Stats tables, Gear stats tab, Gathering, Worn looks for new gear, Recipes tab, Quest chains, Walking gear, Scheduled events, Simulator, Perks editor, Controller in the Dev Suite, Dungeon builder, Chat log, New pets, Select and zoom in every picture editor, See-through colours.
- **`docs/world.md`** — World, islands and travel: Hollow, islands, the island builder and island edits, voyages, bosses on islands, meteors, maps, getting home safely.
  Covers: Island builder, Island builder part 3, Editing built-in islands, Editing Hollow, Stone Sledgehammer, Island bosses online, Voyages, World boss on maps, Graves outside entrances, Keep your spot, Calmer monsters, Island boss lairs close after a win, Meteor strikes, Safe trips home and /stuck, Partial shared monsters, Shattered Expanse sharks, Shared monsters keep their owner's spot, No hits from unseen monsters, Plateau sides open to paths, Better maps, Houses on maps, Talking to sleepers, No hits from under houses.
- **`docs/saves.md`** — Saves and accounts: Account-only saves, backups, gear tiers kept on load, graves, items lent to the bag, late pet items.
  Covers: Account-only saves, Top-tier gear on load, Backups in Options, Graves on a quick respawn, No saves of borrowed chest items, Grave lock, Late pet items.
- **`docs/multiplayer.md`** — Multiplayer and social: The multiplayer block (061-080) and everything social: player menus, duels, chess, parties, emotes, chat, moderation, young players, the market.
  Covers: Name button, Player menu and duels, Chess, Leaderboard, Emotes and parties, Chess ladder, Party chat and shared gold, Moderation, Two player menus, Chat commands after the MP block, Controller wrap / name button, Chat bubbles, Emote animations, Hide chat, Young players, Chat filter, Account and privacy, Moderators, Peer monster timers, Arrows online, Projectiles over water, Tool swings online, fx events after a reload, Total level after names, Shared resources on guild islands, World Market box, World Market rules, Market prices and tax, Players online, HERE map players, Player stats.
- **`docs/combat.md`** — Combat: HIT, PvP balance, ultimates, damage numbers, game feel.
  Covers: Tool swings / HIT, PvP balance, Ult picker, Combat balance, Mana pause, Game feel.
- **`docs/skills-items.md`** — Skills and items: Skilling looks, gathering, cooking, fishing, firemaking, brewing, off-hand tools, perks, daily/weekly challenges, quests, achievements.
  Covers: Skilling looks, Pet abilities, Button words, Main quest chapter two, Achievements / collection log, Off-hand, Mithril/adamant tools, Perks, Watering can off-hand, HIT never farms, Meals and food buffs, Fletching, Pet powers, Eating / campfire cooking, "N left" for make-all, Cook everything at the stove, Jewelry make-all, Skill trees list every item, Meteorite gear, Brewing and daggers, Campfire logs and feeding, Sunken treasure and Davy, Fishing 70/80/90, Arrow ladder, Vessa's potion stall, Campfire colours per log, Weekly event, Daily challenges, Quest tracker, Getting started guide, Farming seeds, Pet cards in decks, Dragging cards, Blacksmith's bench and cores, Arrows and bows are smithed, Upgrades at the Blacksmith's bench, Upgrade levels and durability, Durability and repairs, XP and time per material, Tree toughness and void trees, Woodcutting quarters and perks.
- **`docs/homes.md`** — Homes and building: Houses, castles, yards, pets at home, chests, building only at home, homes on guild islands.
  Covers: Visiting island castles, Castle hall symmetry, One home, Backyards / courtyards, Home comforts, Deposit bag, Building only at home, Yards count as outdoors for weather and fighting, Pets at home, Chest tools, Homes on guild islands, Home tax.
- **`docs/guilds.md`** — Guilds: Guild founding, island, quests, perks, bank, bosses (Void Treant, Giant Turtle), capes, sails, ponds.
  Covers: Guilds, Guild perks, Void Treant, Guild bosses framework, Giant Turtle, Guild bank deposit buttons, Capes, Guild member limit, Wiki > Guilds, Guild ponds and one angler per spot, Guild sails.
- **`docs/patrons.md`** — Patrons, art and paintings: Patreon link, patron perks, the Art Room (and editing submissions), paintings and the gallery, wearables and pets from art, capes.
  Covers: Patrons, Art Room, Patreon link, One cape picker, Art Room editor, Paintings and the Patron Art Gallery, Art Room wearables, Art Room pets, Editing patron art.
- **`docs/ui.md`** — Screens, controls and HUD: Controllers, custom controls, touch layout, camera, HUD layout on phones, the update check, the wiki.
  Covers: Cursors, Last input wins, Hold HIT on touch, The touch ULT / SLAM button, Hold CAST / BOW on touch, Chat on touch screens, Custom controls, Check for updates, Touch button layout, Camera, Wiki, Wiki overhaul, Descriptions, Discord button, Message box on phones, Controllers everywhere, Controller cards, Controller highlight ring, Title hero looks, Tidy phone screen, Party list placement, Leaderboards in the menu, Sound for controller players, Character tab cards and stats, Wiki pages.
- **`docs/music.md`** — Music: The soundtrack engine, the Dev Suite song editor, the Patron Song Studio and song zones.
  Covers: Soundtrack, Song editor, Song Studio, Song zones.
- **`docs/discord.md`** — Discord: the patch notes feed (webhook) and the SQ Bot's roles (Link Discord, public leaderboard fields, sync job).
  Covers: Patch notes feed, Roles (SQ Bot).
- **`docs/fixes.md`** — Dated fix collections: Batches of small fixes, by day. Each names the file it lives in.
  Covers: Quality fixes, Audit fixes, Player-report fixes, Bug sweep Nov 15, Bug fixes Nov 15 (afternoon), Nov 16 report fixes, Nov 18 evening fixes, Nov 20 harbor posts, Nov 20 report fixes, Nov 21 report fixes, Nov 21 night bug reports, Nov 22 bug reports, Nov 23 bug reports.

When you add something, put its note in the right `docs/` file (or a new one listed here), not in this file. Keep this file to rules and the index.
