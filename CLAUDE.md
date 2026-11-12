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
  travel to other players as `ch.wr`, kept by `cleanCh` in 061; with them go the wearer's own hat/shirt/trousers as
  `wht/whc/wsh/wpn`, and the viewer's game applies a look's "hide" itself in the outermost `cP` via `SQA.hideFor`, so a
  viewer without that look in its library still sees the game's own piece) and stats and publishes them through the database: drafts in `assets/draft`, the published copy in `assets/live`
  (public read; players apply it at startup and cache it on the device), replaced versions in `assets/hist`. Writes need
  the account's uid under `devs/` (added by hand in the Firebase console). `SQA` (`111a-s111-asset-library.js`) applies a
  library on top of the game's own values and keeps the originals, so anything not published falls back to the code.
- **Gear screen** (Dev Suite > Gear, internally the `worn` tab): per weapon/armour piece, three modes: its look on the character
  (the underlay wears the item via `SQGEAR.wearing(k,f)`, which equips it for the length of `f` and puts back what was there),
  its icon (the sprite editor), and how it works. The underlay is the game's real character sprite (`kitSprite`, 16x32,
  drawn 2x at layer (32,38)); an item with no worn look yet opens with the game's own look already in the layers (armour:
  the pixels the item changes on the kit, with "hide" on; weapons: their icon at the hand, since the kit only shows a
  weapon mid-swing), so editing starts from what players see now. Worn looks for head/body/legs can list dyeable colours
  (`worn.<k>.dy`); `SQA.dyeMap` gives them the wearer's dye (`ch.dyh/dyb/dyl`, `LUX.EMP.DYES`) keeping relative brightness.
  The editor strips the developer's own dyes from the underlay and the starting look, and marks the colours a dye changes
  on the game's kit as dyeable. Rules live in `gear.<k>` = {dmg, rng, blk, mp, rq:{s,l}}
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
- **Pet looks** (Dev Suite > Pets): `pets.<kind>` = {w,h,s,ox,oy,a,c,b,d} (standing frames a/c, idling every 0.5 s;
  walking frames b/d, stepping with the pet's own walk clock; older looks with only a/b walk a/b), drawn facing right, mirrored
  when walking left. `SQA` draws them in place of the pet's own look through the outermost `pP` wrapper and
  `LUX.drawPeerPet`; `SQA.capturePet` copies the game's current look to start from. The Imp is left out (tied to combat).
- **Island builder** (`dev/111c-s113-island-builder.js`, a Dev Suite tab added through `SQSUITE.addTab`): custom islands are
  saved as `islands.cu_<name>` in the asset library and registered by `SQA` as normal regions (painted tiles + objects,
  8 tiles of sea added around, pier placed by `rgDock`). They skip the random tree thinning/tiering, are open without a
  voyage, and a save on a removed island loads back on Hollow. Never re-register the island the player is standing on.
  Islands can hold `lm` entries (buildings/props from `SQA.ISL_LM`, signs with `tx`, loot chests with `loot`; a chest's
  index is remembered per save in `worldState[<island>].loot`). The builder's "Real look" bakes ground with `hdBakeR` and
  copies each object/building kind once from the game's own drawing (`drawFurn` on the hidden main canvas).
- The multiplayer code (061 to 080) is one big `{ }` block: `MP`, `PV`, `pvSend`, `pvFx`, `mpDrawPeer` live inside it and can't be
  wrapped from later files. Use its hooks instead: `SQFXH[kind](player,event)` for new fx event kinds, `SQPEERFX` drawers run
  for each other player, `SQPVSEND(event)` to send, `SQPVQUIET` to keep attacks from being sent as swings (`window.SQMP`,
  `window.SQPVP` expose the state).
- **Stone Sledgehammer** (`096` + `world/113-s115-sledgehammer-smashes-ore.js`): one hit breaks small ores (`SKOF[t]===2`);
  GROUND SLAM (`window.SQSLAM`) breaks every mineable rock/ore/boulder in its radius by running the game's own `attack()` at
  each tile (player moved there for the call and put back), and sends an `sl` fx event so others see the shockwave.
- **Island bosses online** (`100`): whoever opens the door first runs the boss (normal shared monster via `SQMOB`); its
  attacks go out as `x.ib` next to its shared monsters (`SQMOBX`/`SQMOBRX` hooks in 061's monster sync), each client checks
  hits on itself (`ibResolve`, attack ids in `DONE`). `ibT` picks a target among players in `in:ib_<id>` every 3.5 s,
  `ibScale` adds 60% base HP per extra fighter, a joiner doesn't spawn a boss (`ST.wait`, spawns one after 4 s if no fight
  shows up), the defeat is sent for 4 s (`ST.done`) and gives every fighter the reward; a leaving owner hands it over.
- **Skilling looks** (`skills/114-s116-skilling-looks.js`): fire, cooking and fishing are drawn on the character, not as a
  progress bar (109 now only draws the "N left" count). The state travels as `ak` in the
  multiplayer position (1 fire, 2 cook, 3 fishing, 4 bite, 5 reeling, 6 caught, 7 smelt, 8 smith, 9 craft; `SQACT()`; 0-9 only, `cleanCh`/receiver clamp), the crouch is done in the
  outermost `cP` (whole character, gear included, re-drawn shorter at the knees), and other players' props via `SQPEERFX`.
- **Getting started guide** (`ui/115-s117-getting-started.js`): 8 steps for new characters, shown through the quest
  tracker (102's `refresh` asks `SQGUIDE()` first), with hints, glowing buttons (`.sqglow`) and small rewards. Saved as `gd`
  (99 = done or skipped); a save without `gd`, or a game started without a save, is judged once play starts. Tapping the
  quest box opens the quest log (with "Skip the guide").
- **Pet abilities** (`skills/116-s118-pet-abilities.js`): treelings (`SQPETAB.TREEL`, chance per kind, doubled on their own
  tree kind) add +1 of whatever log a chop just gave (outermost-at-the-time `attack` wrapper). Mushroom pets `pmush`/`pglow`
  (`SQPETAB.MP`) drop from `shroom` patches (`SQMUSHDROP=<kind>` forces it in tests), are drawn through `SQPETDRAW`, and
  registered in `SQNPET`/`LUX.PETS` like the other non-shop pets. Glowcap watches for P.hp drops in `upd` (damage is applied
  in many places, there is no single hurt function).
- **World Market rules** (`items/079`, a bare block, so edit it in place): `SQWMRULES` = per-item cap (`PERK` 2 of the 8),
  price band `lo(k)`..`hi(k)` from `SELLP` (half the shop value to 25x, at least 100), expiry `expAt(o)` = 7 days from `t`
  (old offers from `RULES_AT`). Matching, browsing and the order book ignore expired and out-of-band offers; the owner's
  client cancels its own expired offers (refund). The database rules keep `t` unchanged when others fill an offer and
  no later than now (publish `database.rules.json` in the Firebase console).
- **Island builder part 3**: islands can also hold `npc` (people: `lk` = character-creator look, `s` = lines), `cv` (dungeon
  entrances: `st` style rock/mine/ice/root/sand, `f` floors, `m` monster keys), `zn` (monster zones: box, `m`, `n` at once, `hp`
  toughness 0-3), `ct` + `c` (own 32x32 ground tiles as PNG data URLs, painted per tile; walkability stays with the ground)
  and `mx/my` (sea chart). 111a's generator places people (`lm` items `k:'npc'`, `use:'npc'`) and entrances (`icvdoor`
  items); each entrance registers its own dungeon kind `cv_<island>_<i>` in `SQICV`/`DKIND` (093's island caves).
  `world/117-s119-island-life.js` runs them: talking (TALK button, speech bubble), zone spawns through the outermost
  `rgUpd` for custom islands (also the whole-island `mob` setting, which used to spawn nothing), entrance art, custom tiles
  drawn over `ROOMBG`. Monster keys/health come from `RG_FAUNA` (`SQISLIFE.MOBS`).
- **Prop looks** (Dev Suite > Props; game side `dev/111d-s120-prop-looks.js`, `window.SQPROPS`): `props.<key>` = one
  picture {w,h,s,ox,oy,p,r} (s/2 world px per pixel, top-left at (ox,oy) from the anchor), more frames in `fr` [{p,r}]
  (up to 12, `ms` per frame, `sy` = all in step, otherwise each starts at its own point), `<key>@n` = its night look
  (used when `dark()>.15`). The full key list and anchors are in the file's header comment: `o:` world objects, `x:` the
  spot they leave while regrowing (Hollow `REM` + `window.SQRES` from 061, islands `R.gone` + `SQRES.r`), `b:` buildings,
  `v:` village details and boats (sail back/front layers), `p:` things players build (outermost `drawStation`,
  `drawPiece`, `drawStruct`, `pF`), `f:<t>:<c|o|e|w|n|s>` fence/wall/gate pieces composed per neighbour (outermost
  `drawFence`), `c:` soil and crops (outermost `drawPlot`), `r:` room/dungeon/island-village items (outermost `drawFurn`,
  catalogue built from `ROOMS` and one `buildFloor` per dungeon kind), `l:` island props. Each hook draws the look and
  skips the game's own drawing only when a look exists. `SQPROPS.capture(key,night)` draws the game's own look at 2x
  (fence side parts: what the game adds when a neighbour is there). The editor is the pet editor with one layer
  (`kind:'prop'`, `LAY()` in 111b; `ed.k` = the key being edited, `ed.base` without `@n`); database keys go through
  `key()`. Names typed in the editor are Dev-Suite-only labels in `pnames.<key>`.
- **Dev Suite > Test** (`dev/111e-s121-test-tools.js`, `window.SQTEST`): go to any island (`routeGo` with `routeOpen`
  forced open), a Hollow town, or any dungeon floor (`dFloor`/`enterScene`/`dArrive`; `outside()` first leaves
  dungeons/buildings), set the time, spawn monsters from `SQISLIFE.MOBS` (kept alive through town clearing and Hollow's
  daylight melt via `DEVM`), clear them, heal, can't be hurt (`P.hp` becomes a getter/setter that ignores decreases),
  give items/gold, set skill levels (`XPS[i]=XT[L-1]`), and a checkpoint (`snap()` in localStorage `sq_dev_ckpt`,
  restored with `applySave`).
- **Monsters** (Dev Suite > Monsters, the Props editor filtered to `m:` keys): looks are `props.m:<rk>` (`SQPROPS.mkey(n)`:
  the region key `n.rk`, else `type[:rv]`), drawn by the outermost `pS` (`mobDraw` in 111d: walk frames, `ak` = last
  frame is the attack pose within 20 px, `fw` = face the walking direction instead of the player, white flash when hit,
  bosses get a health bar). Capture draws `pS` at six moments and keeps the different frames (bosses' own bars left out).
  World bosses and island bosses are left out (`_wb`, type `ib`), and so are Thornroot and the Emberlord (their attack
  warnings are part of their drawing). Rules: `mobs.<key>` = {hp%, spd%, gold, dk/dn/dc} in
  `dev/111f-s122-monster-rules.js` (outermost `upd` scales health once and movement every frame; `enemyDrop` adds gold
  and the drop); proxies of other players' monsters are skipped.
- **Button words** (`ui/118-s123-button-words.js`, `window.SQWORDS`): every 0.1 s the HIT (`a`) and EAT (`e`) buttons get
  the word for what they'd do now (`hitWord`/`eatWord`, following the same order as the `attack`/`eat` wrappers: build,
  facing someone, fishing, station, home furniture/chest/bed, monster in front, water, sign, the object's skill via
  `SKOF`), and a TALK button showing USE gets the thing's word (`useWord`). The `<small>` key hint is kept. When a new
  context is added to `attack`, `eat` or `talk`, add its word here too.
- Sections live in one shared script: wrap new sections in `(()=>{ ... })()` rather than a bare `{ }` block. A plain
  `function name(){}` inside a bare block also replaces any global with the same name (this once broke `draw`).
- **TRADE button** (`multiplayer/119-s124-trade-button.js`): when another player stands within ~2 tiles and no other code
  wants the TALK button that frame (it hides the button before the inner `upd` runs and yields if anything shows it again),
  the button says TRADE and a tap / T / ✕ calls `SQTRREQ(uid)` (062's `trRequest`, which also answers an incoming request).
  062 exposes `SQTRREQ`, `SQTRNEAR` (its `trNearList`) next to `SQTRADE`.
  Skipped for players with `pk` while `SQPVP.on` (a controller's ✕ is also the attack, via `SQPADUSE`).
- **Daily challenges** (`ui/120-s125-daily-challenges.js`, `window.SQDAILY`): three tasks per real day (device date), picked
  from `T` by a hash of the date, skipping ones the character can't do yet (`r`), target scaled by skill level. Items count
  when they arrive in a frame where that task's skill gained XP (outermost `addXp` marks it; positive `inv` deltas in `upd`),
  `xpc` tasks count XP gains, `kill` uses the game's `kills` counter. Paid at once (gold + XP); all three = streak bonus.
  Saved as `dly` {d,q:[{t,n,p,c}],s,l}; shown at the top of the quest log (below the guide box). Separate from the
  townsfolk "daily jobs" in 020.
- **Quest tracker** (102): `TRK==='none'` = nothing tracked (stored in localStorage `sq_trk`): no quest box (010's old box
  checks `SQTRKOFF()` too), tapping that HUD spot doesn't open the log, and new quests don't grab the tracker. The main
  quest of type `village` gets its step and arrow from the first unfinished village line (`villNext`).
- **Chat on touch screens** (`ui/121-s126-chat-at-bottom.js`): `#mpchat.sqbot` sits at the bottom when `!isPC`, lifted
  above the keyboard using `visualViewport` (gap below the visible part), with a shorter message list.
- **Tool swings / HIT** (`combat/122-s127-tool-swings-and-hit.js`, `window.SQTOOLSW`): the outermost `attack` sets `ACTN`
  chop/mine for any object whose `SKOF` is 1/2 (also boulders, regions, dungeons; 028 only knew tree/pine/cactus/rock/ore on
  Hollow) and sets `SQPVQUIET` for that call so peers don't get a sword swing. The outermost `pP` hides `swing` while a tool
  swing or a cast (plus its tail) runs, and draws `drawAct` in scenes. `wandTarget()` returns null during HIT, so HIT never
  casts (028's old auto-cast); casting is the CAST button / mouse / controller aim.
- **Item-sprite swings** (`dev/123-s128-item-sprite-swings.js`, `window.SQISW`, Dev Suite > Swings): the outermost `pP`
  draws the held item's icon (`eqIcon`/`iconURL`, so redrawn sprites too) turned in 32 steps on the pixel grid for sword /
  sledge swings, chop/mine (`ACTN`), casts (`CASTT`, `CASTD`) and shots (`BOWT`, `BOWD`), hiding swing/CASTT/BOWT/ACTN from
  the inner drawers for that call; pointing up it's drawn behind you. Icons are assumed to point up-right (grip bottom-left),
  bows to face right. `SQSWING` (other players' swings) is wrapped too. Library `swings` = {all (default on), k:{key:'icon'|'own'}}.
