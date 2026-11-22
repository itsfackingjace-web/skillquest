# Dated fix collections

Batches of small fixes, by day. Each names the file it lives in.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

- **Quality fixes** (`ui/131-s136-quality-fixes.js`): during `upd`, writes to `tk.innerHTML` are buffered (one write per
  frame, only if changed), and tk's shown/hidden state is held by classes `sqtkon/sqtkoff` set at the end of each frame
  (browsers can't intercept `style.display`; the classes come off when no frames run). Short routine messages matching
  `SQQUIET`, and any message of 56 characters or less that doesn't match `KEEP` (quests, levels, unlocks, rare finds,
  dialog), float over your head (`SQQL`, up to 2 lines) instead of the text box (not while a panel is open or talking). `drawDrops` also runs in
  scenes. Cooking (`nearFire(P.x,P.y,45)`) needs a real fire, not a castle. Boats can't enter `BRIDGE` tiles. Hollow's
  generator in 001 pushes land down within 18 tiles of the map edge (open sea); saves with builds/houses/farm there get
  them packed into the bag on load.
- **Audit fixes** (`core/153-s159-audit-fixes.js`): audio is suspended while the page is hidden (014's music timer is throttled in
  the background) and resumed on return; a trusted keydown also wakes the audio (`ac()`); yards/courtyards use the day/night
  song (`wantSong`). Also: 079's World Market opener is `wmOpen` (a `function open` in that bare block replaced `window.open`);
  039's fire-perk line had code after a `//` comment (use `/* */` mid-line); 120's new-day `dly` has the loaded field order.
  **Never name a function in a bare block after a browser global** (open, close, print, find, stop, focus, name...).
- **Player-report fixes** (`items/157-s163-player-reports.js`, `SQREPORTS`): inside a house/castle the tiles in front of each
  back door (`HDOOR`, rows 2-3) refuse furniture (outermost `canPlaceIn`), furniture already there is moved once per house per
  session, and in any `home` scene a player standing inside something is stepped out (`unstick`, every frame). Screen Wake Lock
  while playing (requested on input / return to the tab). `body.sqibf` hides 071's `#wbb` banner in island boss lairs.
  Also: 004's crafting header uses `tierName(k)` (tiers past `TIT`, e.g. the Crystal sword); 005's sell list falls back to
  `INAME` (133 gives craft outputs a `SELLP` without an `SN`); 071's island lair search requires `R.reach` over the boss's path.
- **Bug sweep Nov 15** (`items/205-s213-bug-sweep-nov15.js`): beds: a second USE within 013's `bedPick` window picks the bed up (118 says
  PICK UP on HIT and TALK); rain (`rainingNow`) waters own yard plots `h.yp` like 021 waters `FARM`; jewelry Make/All at a furnace moves
  exactly the gold bars/gems needed from `benchChests(STATION)` into the bag first (086's clicks run outside 033's merge, as a timed
  job); `sqDo` is wrapped so every step runs with `pnOpen`/`menuOpen` false (actions like `eat()` bail while a panel is open, which
  ended jobs when a menu opened) and campfire `cook` jobs (no `SQDO.st`) stop when `nearFire` fails; outermost `eat` ignores presses
  while a cook job runs; `body.sqpnup` hides `#mpb`/`#mpbug` (z 30) while a panel/menu is open; HIT never auto-shoots (`bowTarget`
  null for the call) when 118's `hitWord` is CHOP/MINE/PICK...; Saltmere's `BOATS` keep only water tiles; islands: after
  `loadRegion` a flood fill with the player box from where you stand removes `_obj` items no reachable tile touches (`R._rch`,
  skipped if under half the land is reached; `window.SQREACHFIX`). 145 re-reads `yards/<owner>/<id>` every 8 s while you visit a yard
  (read-only `_yd`), so the owner's renames/furniture show up live. Also: 077's castle loaders (save + visitor) keep chest `nm`
  (castle names were lost on every load); 013's scene ghost uses the whole `canPlace` chain (yard seeds); 138 hides a boss once
  `SQWB.fell === b.slot`.
- **Bug fixes Nov 15 (afternoon)**: 087's island fire loop only burns fires the inner `upd` didn't already burn this frame (001's
  loop runs on islands too now; both together made island campfires last half as long). 162's `regItem` builds `IDESC` for Content
  items as stats line (heal/food, pot mana) + own words, with a plain default when `d` is empty (`window.SQSTATS` is 171's `{day}`,
  not 084's stats function: don't call it). 086's equipment screen lists bag jewelry per slot (Put on / Swap to, `data-jw="wear"`).
- **Nov 16 report fixes** (`items/223-s231-bug-fixes-nov16.js` + edits): the cauldron is in 033's `STCH` (uses house/nearby chests; 223 adds the
  chest line 218's `stationHTML` skips). 083's `tierHit` and 096's `boulderHit` roll 038's `STAYP` (`sumP(sk,STAYP)`) before `done()`, like 038/050
  do for plain rocks/trees. 067's `enterScene` wrapper never gives an island scene a `prev` (a region loaded while standing on a region, e.g.
  049's applySave or 111g's `refresh`, got the old island as `prev`, and 067's `leaveScene` then "sailed home" to it). 001's night fire glow is
  culled to the screen and merged per 32 px cell (max 24 glows a frame).
- **Nov 18 evening fixes**: fishing runs while a panel/START menu is open (007's fishing `upd` only needs `FISH`; 109's `sqDo` doesn't close the
  panel for a `reel` job). 205's EAT step: while a campfire `cook` job runs, EAT eats (`SQEATPICK.eat()`) and the job carries on.
  `items/231-s239-chest-card-fits.js` (`SQCHFIT`): after every `rPn` the chest item card's backdrop (`.chcbg`) is set to #pn's visible box and
  the card capped to fit (iPhone Safari clips position:fixed inside the scrolling panel), and #pn doesn't scroll while it's open (`sqchlock`).

## Nov 20 harbor posts

- 013 replaced `useFurn` (`useFurn=function`) after 012 had made it a step list (`SQUSEFURN`, Nov 19 evening), so every step added later was
  skipped: harbor posts on islands (049's `regdock`), island NPCs (117), guild board/bank/hall (197), loot chests (111a). 013 is now the first
  step. 220's `fire` and 111a's library icons were reassigned the same way and are steps too (111a's `origIcon` runs the list with its step
  stepping aside, `RAWICO`). `tools/checks/lint.cjs` refuses `fn=` for any function with a step list; check 27 uses the post on Ashfall.

## Nov 20 report fixes

- 096/086: the ULT chip and touch button show SLAM / Dragon Form only when it's 159's chosen ultimate (`slamUI`, `dsUI`); check 34.
- 010's arrow chip = the arrow kind shot next (marrow > adarrow > mitharrow > iarrow > arrow) and its count; check 35.
- Error reports: 093's `PST` (pet draw positions) is put on `window` (098/116/180 read it; it was never global); 213's `FR` is declared before
  the device cache's `setRec` calls (TDZ, the cache never loaded).
- Guild quest rules: `guilds/$g/q` validates when the quest keeps its `k` and `goal` (`data.exists()`), or the goal matches the ladder. Quests
  started before the doubling goals failed every progress write (Nov 20 chat). Check 28 writes an old goal with `__dbForce` (lib.cjs/rulesdb.cjs:
  test set-up writes without rules).
- PvP hit rules: `pvp/$uid/$id` `d` may be 0-3 (154's `SQPVDMG` sends up to 3 hearts; the rules took 2 since Nov 13, so 3-heart hits were
  refused and 061's `mpErr` said "The online server refused that"). Check 38 tests the rules file directly with `RulesDB`.
- 086 Dragon Form ends on a fall before the menu/panel check (a screen opened by the fall skipped it; Derek, Nov 20). Check 42.
- 239 wiki "How to get it" reads `window.SQWIKIGET[item]` (HTML lines); 215 adds meteor strikes for `meteorore` and `stardust`. Check 25.

## Nov 21 report fixes

- 086's jewelry XP was a `SQADDXP.before` step since Nov 19: a before step can't change the arguments passed on, so the gold amulet / emerald
  ring bonus did nothing. Now a `wrap`. 229 lists both bonuses. Check 60. (A scan of every `.before(` step for reassigned arguments found no other.)
- 007's anvil armour (`r.arm`) goes into the bag as `eq_<slot><tier>` instead of being worn; 022 lists the recipe even when you wear that tier.
- 192 re-counts make-all after each item (`SQDO.allR`: done + what the materials allow now), so refunded ores raise "N left". Check 59.
- 102's tracker: `window.SQGIVERAREA[line]` = where a quest line's giver lives (243: No Man's Land quests, Mira on Hollow). Check 61.
- 021's dodge roll moves in steps of 3 px and goes back to where it started if it ends inside something solid. Check 62 (passes before too: Kevin's exact spot wasn't found).
- 177: Cook all for stove meals (`sva_<i>`, 109's sqDo). Check 63. 145: with the hoe out, HIT twice on yard soil fills it in (like 019 on Hollow).
- 227's hit log lists monsters that hit you and died in the same moment (`dead:1`).
- 262: while the Drop Card table is open (Ace or a player) HP can't go down (a P.hp getter like 134's chess boards; 130's card-match guard comes first when it's on) and hunger is held at its value when the table opened. The death log showed 6 of 25 deaths "Starving!" (Jace's mid-match) and Stormie's "Ouch!" falls to a drawn slime at night: the table hides the world. Check 64. (Night eyes preview dropped.)
- 244 (252's background tab): while `document.hidden` the HP getter holds (`SQIDEAS252.hold`) and so a hidden game can't starve or kill you; make-alls etc. still run. Changed the same day: hunger drains while hidden again (Kevin's approved idea against AFK skilling), only HP is held, and at 0 food 244 stops `SQDO`/`FISH`. The starving damage itself (001: only at hunger 0) and the FOOD bar (010: `hunger` every frame) were checked and are correct. Check 65.
- Discord #bugs/#ideas (Nov 21): 087's Hearthkeeper sets `window.SQFIREONLY` around its `nearFire` so 077's castle aura doesn't count (Kevin's approved idea: AFK fishing outside a castle by water never got hungry; check 66). Indoors in houses and castles still no hunger (a first try that took castles out of 148 was undone the same day). 220: ☆ BURN FIRST pin (`firep` in the save; away from a
  fire FIRE builds with it, next to yours it feeds one), saved fuel from a tier build comes back as that log (`PEND.w0`; 039's message names it via
  `SQFIRELOGN`), and the extra fire XP joins the fire's own XP number (check 67). 036's cooldown cut is `window.SQULTCUT()`, used by 216's Meteor
  Fall too (check 68). Arrow damage per kind checked (9/10/11/12 at the same bow): a bow always shoots the best arrows carried.
- 149's DEPOSIT BAG skips `SQKEEPFALL` keys (cards and pet cards are bag items hidden by the binder; Jace's "randomly losing cards" were in his chests). 254 looked for pets on `window.EQ`, but 028's `EQ` is a script-level const: no pet card existed until a save had one, named with the raw key ("pweb"). It reads `EQ` directly now (`EQS()`), names from `EQ[pk].n` / `INAME`, and renames after every load. Check 69.

## Nov 21 night: bug reports (Firebase + #bugs)
- World Market: `market/offers` and `market/box` took item keys of fewer than 24 letters; Dev Suite gear is `eq_cu_<name>` and
  `eq_cu_spider_weaver_robe` is 24 (Jynx: "Unable to sell Spider Weaver Robes"). Rules now take fewer than 64 (published). 079's offer
  time `t` was the device clock while the rules refuse one more than 60 s ahead of the server's: it's `mpNow()` now, and `live`/`expire`
  count on it too. The checks' fake database now runs `market/...` through the rules (check 10 read the whole box; it reads its own).
  Check 74.
- 004's `upd` step skips the frame while `pnOpen`, but fishing and make-alls run behind screens, so a screen left open meant skilling
  with no food used (sniffynose, snitzler). 266 (`SQSCREENFOOD`): while `pnOpen` and skilling (`SQDO`/`FISH`), food drains at the base
  rate (gear "hun" counts) except indoors or by a real fire with Hearthkeeper; at 0 the action stops ("too hungry"), no damage. Check 76.
- 192's recount between make-all steps read only the bag; from chests (lent only during a step) it counted 0 left and the "N left"
  vanished (Jace). It counts 109's `SQDO.chests` when they aren't lent (`BMERGE`). Check 75.
- 220's campfire picker showed `baseLife()*t.m` while a fire is capped at `CAP` (30 min): it promised 54:03 for a yew fire that burned
  29:57 (Kevin). It shows `min(CAP, ...)` and "(the most a fire burns)". Check 77.
- 258's card table (and 009's chess table) were `SQNEWDRAW` steps with no `SCENE` test, so Ace's table showed on every island at
  Hollow's spot (Jace, Briarwood). `if(SCENE)return` like the other Hollow drawings. Check 78.
- 218's `brewOne` gave one potion's XP for a double batch and kept ingredients silently (Kevin): XP x potions, message names what you
  kept. Check 79.
- Not reproduced: Jynx's roll into a wall in No Man's Land (21:28). 855 rolls into the walls around his spot never ended inside one,
  and 40 tried in real time all walked out; his screenshot shows the game asking him to update (021's roll fix went out at midday).
- 201's cape cloth (every cape since the guild capes) was painted over the kit's long hair from behind (kit styles 2 and 3 hang to row
  24; the cape starts at 21; FUMP: "a cape showing through Kass's hair"). `sil()` now marks those hair pixels and their outline as
  covering the cape when `dir===1`, like a hood (`cov`). Check 80.
- Card frames: 061's `myHousesData` and 067's island-home `_h` rows send a frame's card as the row's 5th entry `[i,'cardframe',0,'',card]`
  (from 260's `SQCARDFRAME.on`); `buildForeign` keeps it as `f.card` (a `dc_` key), and 260 draws it in someone else's house. Visitors
  saw an empty stand before. Check 81.
- Checked and not reproduced: Kass's brewing stopping when the skills screen opens (a Brew ALL goes on behind it: 1 → 5 → 7 potions);
  Bear's chat emptying after an update (chat loads the last 50 messages of the past day whenever the game starts).
