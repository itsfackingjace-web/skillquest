# SkillQuest — notes for whoever updates the game

**Read `GAME-BIBLE.md` first**: what the game is, its pillars and the rules every feature is checked against.

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
- **Every update to the game must add a patch note, and there is one patch note entry per day.** In `PATCH_NOTES`
  (`src/data/074-patch-notes.js`): if the top entry is today's, add your bullets to it (new features first, then "Fixed: ..."
  lines), rewrite older bullets of that day if your change supersedes them (describe the final state, not the steps), keep
  the title a short summary of the day, and bump its version's `-N` (`YYYY.MM.DD-N`). Otherwise put a new entry for today at
  the top. The version shown in Options, the wiki's "NEW!" badge and the update check (125) all come from that first entry, so
  any player-facing change must bump it. Leave out Dev Suite / developer-tool changes that don't change anything for players.
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
  `fx` = special effects in % ({ls,burn,slow,crit,spd,xp} plus, run by `items/179-s186-gear-effects.js`: mel/arc/mag damage %, mreg mana regen %, hreg = 1 heart every 600/v s, hun = hunger v% slower, gold = kill gold % via the outermost `killEnemy`), summed over everything worn (new effect keys go in 111a2's `FXN`/`FXMAX`, or `clean` drops them). `crit` = that hit does 1.5x-2x: the
  extra lands at once and the hit's own `DMGS` number is rewritten to the total in pink (else a separate `hitE`). `anyFx()` also counts
  `SQFXEXTRA` perks (they were skipped without fx gear); on-hit ones run from the
  outermost `attack` (hp diff on `en`), `arrowHit` and `spellHit`; `spd` nudges movement in `upd` (outdoors only).
- **New gear items**: `newgear.eq_cu_<name>` = {n,b,v,d,sm} in the library. `b` is an existing item it works like: the
  game holds it as b's tier (TL/ARM/CLS) and `CUS[slot]` remembers the new key (outermost `occ`/`setSlot`). Saves store
  `cus` and keep counts/worn pieces of not-yet-loaded new items (`PEND`/`PCUS`), so never rename or delete a published
  one (the suite only deletes unpublished ones). Unpublished new items exist only on the developer's device
  (`SQGEAR.devItems`). They get loot-chest entries automatically and a recipe if `sm` is set: `sm` = {c (up to 12 materials, any item, up to 9999 each), lv, st}; `st:'craft'` = a `GOODS` entry (`_cu:1`; Craft list and crafting bench, Crafting level), else an anvil `SM` entry (`_cu`, Smithing).
- **Pet looks** (Dev Suite > Pets): `pets.<kind>` = {w,h,s,ox,oy,a,c,b,d} (standing frames a/c, idling every 0.5 s;
  walking frames b/d, stepping with the pet's own walk clock; older looks with only a/b walk a/b), drawn facing right, mirrored
  when walking left. `SQA` draws them in place of the pet's own look through the outermost `pP` wrapper and
  `LUX.drawPeerPet`; `SQA.capturePet` copies the game's current look to start from. The Imp (`pets.imp`) isn't a follower: 111a
  overrides `window.SQIMPSP` (085 keeps every canvas it gets, so 111a hands out canvases it repaints in place on each library change).
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
  price band `lo(k)`..`hi(k)`: at least half the shop value (`SELLP`), no top price since Nov 13 (`hi` = 1e7, the database's limit), expiry `expAt(o)` = 7 days from `t`
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
  Island bosses (`m:ib:<id>`) and world bosses (`m:wb:<wisp|giant|demon|dragon>`) are in too (`mkey`), drawn like alpha below. Dungeon bosses are in (`MX` + templates `BT` in 111d): for
  alpha/matri/tidek the game's drawer still runs with `g.drawImage` switched off (glow, attack warnings, health bar stay, body
  goes); Thornroot's roots and the Emberlord's pools/fireballs + a health bar are drawn by `BXFX`. Rules: `mobs.<key>` = {hp%, spd%, gold, dr:[{k,n,x,c}] (older: dk/dn/dc), rep} in
  `dev/111f-s122-monster-rules.js` (outermost `upd` scales health once and movement every frame; `enemyDrop` adds gold
  and the drops; `rep` takes back what the inner `enemyDrop` gave, incl. a new `dchest`; Thornroot/Emberlord pay through `upd` when `_rew` appears; island bosses pay on `sqEvent('islandboss',id)`, world bosses when `SQWB.kills` goes up, no `rep` for those two); `dmg` % scales the health you lose in a frame when a ruled monster was within 40 px at the start of it; proxies of other players' monsters are skipped.
- **Button words** (`ui/118-s123-button-words.js`, `window.SQWORDS`): every 0.1 s the HIT (`a`) and EAT (`e`) buttons get
  the word for what they'd do now (`hitWord`/`eatWord`, following the same order as the `attack`/`eat` wrappers: build,
  facing someone, fishing, station, home furniture/chest/bed, monster in front, water, sign, the object's skill via
  `SKOF`), and a TALK button showing USE gets the thing's word (`useWord`). The `<small>` key hint is kept. When a new
  context is added to `attack`, `eat` or `talk`, add its word here too.
- Sections live in one shared script: wrap new sections in `(()=>{ ... })()` rather than a bare `{ }` block. A plain
  `function name(){}` inside a bare block also replaces any global with the same name (this once broke `draw`).
- **Name button** (`multiplayer/119-s124-trade-button.js`): when another player stands within ~2 tiles and no other code
  wants the TALK button that frame (it hides the button before the inner `upd` runs and yields if anything shows it again),
  the button shows their name (class `sqpn`) and a tap / T / ✕ opens the player menu `SQPLAYERMENU(uid)` (130).
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
- **Custom controls** (`ui/124-s129-custom-controls.js`, `window.SQKEYS`, Options > Controls, `ptab` 45): keyboard binds in
  localStorage `sq_keys` (action -> key, only changes), controller in `sq_pad` (PADB name -> button index). A window capture
  listener turns a trusted key into the game's own key for that action (new KeyboardEvent on the same target) and swallows a
  game key whose action moved; untrusted events (the controller's `gpKey`), text boxes, the Dev Suite and Ctrl/Alt/Meta
  combos pass untouched. Middle/side mouse buttons bind as `mouse1/3/4` (pointer events). The outermost `pollPad` swaps
  PADB to the player's buttons only during play (no menu/`navRoot`, title, chess, START menu, fallen) and puts it back.
  New key-driven actions should be added to `KA` (keyboard) or `PA` (controller) there.
- **Check for updates** (`ui/125-s130-check-for-updates.js`, `window.SQUPD`): fetches `index.html?upd=<time>` with
  `cache:'no-store'` (the query skips the Pages CDN cache), reads the first `PATCH_NOTES` version from the text and compares
  it with `window.SQVER` (set at the end of 074; PATCH_NOTES itself is inside the multiplayer block). UPDATE saves
  (`saveLocal(true)` + `saveCloud(true)`, 2.5 s at most) and loads `?v=<version>`; the query is removed again on load.
  Options button, auto-check every 10 min / on returning to the tab, and a top bar (hidden while a panel is open).
- **Touch button layout** (`ui/126-s131-touch-layout.js`, `window.SQTOUCH`, Options > Controls > Touch): localStorage
  `sq_touch` = {p|l:{id:{x,y,s}}} (centre as a share of the screen, size), per orientation (`innerWidth>innerHeight` = l).
  `apply()` (outermost `upd`, every frame, only writes changed values) sets left/top/transform with `!important` on
  a, e, f, tk, rl, ub, aimb (beats 082's `placeBtn` for BOW/CAST). Edit mode: pnOpen=true (game paused), all buttons
  shown, window-capture listeners turn touches into drags and keep them from the game; closePanel ends it.
- **Camera** (001 `camX()/camY()` + `graphics/127-s132-smooth-camera.js`): the view's top-left is `round(P.x*Z)/Z - floor(W/Z/2)`
  (screen-pixel precise; a whole number of world pixels to the centre). Always use `camX()/camY()` for overlays that redraw
  in world space (never `Math.round(P.x-(W/Z)/2)`: with a fractional half screen that made the player jump a world pixel
  back and forth, the old "shaky camera"). The outermost `pP` translates by the player's sub-pixel offset so you and
  everything drawn with you stay put.
- **Main quest chapter two** (`world/128-s133-quest-chapter-two.js`, `window.SQCH2`): edits QS entries by name (slime
  quests `item:'slime'`, typeless Hollow slimes counted there; Night Watch type `night`; replaced duplicate quests;
  Grandmaster 150), moves The Road East after Gone Fishing, adds chapter two before Grandmaster and Legend of the Isles
  last. New types: `night`, `visit` (region key; done on arrival), `line` (a village line's `SQ_SIDE[k].completed`),
  `ib` (island bosses beaten, `ibk` in the save, recorded from `sqEvent('islandboss',id)`). Save `qv` 10; a qv 9 save is
  converted to names with the old order (`QOLD9`) then `qSkip`. Never reorder QS without such a name-based migration.
  102's tracker: `routeStep(region)` names the next voyage/boat upgrade on the way, `villNext([key])` the next village quest.
- **Achievements / collection log** (`ui/129-s134-achievements.js`, `window.SQACH`, START > Achievements, `ptab` 35): list
  `A` ({g,id,n,d,val(),goal,gold}); lifetime counters `C` (items arriving in a frame with that skill's XP, fires, kills,
  `ibw`, plus `SQACH.add(k)` from elsewhere: `trade` in 062, `duelw` in 130); checked once a second, one unlock at a time.
  Collection log categories `CATS` over `INAME` (first match wins, `eq_cu_` left out), seeded from bag/worn/pets on load.
  Saved as `ach` {c,d,col,rg}.
- **Player menu and duels** (`multiplayer/130-s135-player-menu-and-duels.js`, `window.SQDUEL`/`SQDUELAPI`, `ptab` 36/37):
  menu = TRADE (`SQTRREQ`), ADD FRIEND (`SQADDFRIEND`, exposed in 061), INVITE TO PARTY, DUEL, CHESS. Duels: `dreq/<to>/<from>`
  {n,s,t} and `duels/<a_b>/<uid>` {i,g,s,a,c,f,l,d,t}; `s` = a per-duel nonce (in the key, and sides with another `s`
  are ignored). Stakes leave the bag when both accept twice (f), countdown, fight: 064's `pvTarget`/`pvMelee`/
  `pvProjHits`/`pvIncoming` let the two hit each other (`pvDuel`); `P.hp` gets a setter so reaching 0 = loss with full
  health on the spot (no death). Winner adds both stakes; loc change or 20 s offline = loss; 3 min = draw. Rules for
  `dreq`/`duels` are in `database.rules.json` (publish them).

- **Quality fixes** (`ui/131-s136-quality-fixes.js`): during `upd`, writes to `tk.innerHTML` are buffered (one write per
  frame, only if changed), and tk's shown/hidden state is held by classes `sqtkon/sqtkoff` set at the end of each frame
  (browsers can't intercept `style.display`; the classes come off when no frames run). Short routine messages matching
  `SQQUIET`, and any message of 56 characters or less that doesn't match `KEEP` (quests, levels, unlocks, rare finds,
  dialog), float over your head (`SQQL`, up to 2 lines) instead of the text box (not while a panel is open or talking). `drawDrops` also runs in
  scenes. Cooking (`nearFire(P.x,P.y,45)`) needs a real fire, not a castle. Boats can't enter `BRIDGE` tiles. Hollow's
  generator in 001 pushes land down within 18 tiles of the map edge (open sea); saves with builds/houses/farm there get
  them packed into the bag on load.
- **Voyages** (051): Sera (`n.id==='sera'`, Tidewatch) runs every voyage and both boat upgrades: `navCards()` on her `twPanel`
  (under way, upgrades she can fit, new voyages, "Coming later" with what opens each), `nav_acc/rep/hand/craft` through `xAct` →
  `voyAct(a,true)`. Harbor posts (`routesHTML`) are fast travel only: charted routes, locked ones say "Not charted yet" + a line
  pointing to Sera. `post` on VOYS/UPGRADES is no longer shown anywhere. `navSpot()` = the Navigator's House door (102's tracker,
  also for upgrades).
- **Wiki** (075, inside the MP block: edit in place): `start` tab is "Home" (next steps from `QS[Q.i]`/VOYS, `.hub` buttons to
  every tab, controls, tips); `wkGrid` puts runs of `.c` cards in a 2-column `.cg` grid at ≥900px (panel max 1100px); patch notes
  show 12 until `WK.allp` (`data-wkm`); islands say how to get there via `wkRoute(id)` (charted / which voyage); the voyage guide
  lists each voyage with the player's own progress.
- **Descriptions**: `SQSTRIPSTATS` (084) removes a leading stats line from saved description text, so library items saved
  with their stats in them don't show them twice. `SQPROPS.mkey` uses `rv` or `vr` (dungeon monsters keep variants in `vr`);
  the Monsters tab lists dungeon-only variants. The wiki (075, inside the MP block) redraws monster pictures on every open
  and shows health through `wkHp` (monster rules).
- **Houses on maps** (`ui/132`), **tool smithing / craft prices** (`items/133`: iron/steel axe and pickaxe SM recipes, fishing
  rod in REC, every BREC/GOODS/SM output gets a SELLP of 60% of its materials when it has none).
- **Chess** (`multiplayer/134`): Opening Moves left QS (qv 11; qv 10 saves converted by name with `QOLD10`) and is Orla's
  side quest (`CHS.om` 0-3, card in `chessLobby`, quest log via `window.SQQEXTRA` in 102). Orla levels have `rand` (share of
  random moves). Resigning with < 20 plies or right after another resignation gives no XP (`CHS.rz`, `CG.noXp`). No damage
  while at a board. Player chess = section 135's duel flow with `D.kind==='chess'`: requests carry `k`, the side record
  carries `k` and `m` (moves "from.to", space separated); white = first uid in the tid; `SQPVC` draws the board, applies
  only legal moves from the other side, 3 min per move, 20 s offline loses; no Tactics XP. Rules: `dreq.k`, `duels.k/m`.
- **Leaderboard** (`multiplayer/135`): `reset()` (respawn) keeps `kills`; duel wins add to `SQLB.pk` (068 exposes `LB` as
  `SQLB`); quest points = every finished quest (`SQQPTOTAL`).
- **Emotes and parties** (`multiplayer/136`): presence carries `em` (emote "kind:n"), `pt` (party id), `hp` (061 reads them
  as `r.em`, `r.pt`, `r.hpv`). Party invites go through `dreq` with `k:'party'` (135 hands them to `SQPARTYINV`). Party id
  kept in localStorage `sq_party` for 2 h. START > Party (`ptab` 38) and Emotes (`ptab` 39); G = emotes (in 124's `KA`).
  Emotes are acted out in the outermost `cP`: the character is drawn into a 48x56 canvas (anchor 24,44), changed (raised arms
  `armUp`, head rows moved for bow/yes/no, sit = 114's crouch) and composited with a hop/sway, plus pixel effects. Own emote:
  `SELF` is set while pP draws you; other players are matched by position (`r.x/r.y` = cP's ox/oy) and `r._emK`. Moving ends yours.
- **Discord button** (`ui/137`): a real `<a target="_blank">` (class `tsdc`) in the title menu (`#tsmn`, 061's block, so found by
  id) after OPTIONS; `window.open` from the title menu opened nothing. The Windows app sends it to the browser.
- **World boss on maps** (`ui/138`, `window.SQWBMAP`): world map, area map (with a line saying where it is) and minimap mark
  the boss at `wbPos(b, lair)` (071's block functions, global through Annex B); the lair is known on Hollow or once you're on its island.
- **Players online** (`ui/139`, `window.SQONLINE`): a pill with a green dot and the count (you + players seen in the last 20 s)
  right above the day box, drawn in the outermost `drawHUD` while online.
- **Off-hand** (`items/140`, `window.SQOFFHAND`): `eq_hoe` is slot `off` (kind `hoe`); `TL.hoe` = hoe in hand (farming code
  unchanged); outermost `occ`/`setSlot` handle it and drop 'hoe' from `SLOTS`; a hoe together with a bow/wand goes to the bag.
  X (124's `KA` 'off') = use off-hand: hoe → `attack()`, bow/wand → a synthetic right-click on `cv` at the cursor (082's code).
- **Mithril/adamant tools** (`items/141`): `eq_axe6/7`, `eq_pick6/7` = tool tiers 6/7 (same numbers and `TCOL` as the swords),
  anvil recipes from `mbar`/`abar`, `req:{s,l}` checked by the outermost `equipItem` (Woodcutting/Mining 30/45).
  Skill trees: `TREES[1|2].extra[30|45]`; Smithing's `ulSmith` (039) is rebuilt from `SM` after load and on `SQA.onApply`.
- **Perks**: production speed (039's `pSpeed`: level + `PSPD` perks) shortens 109's timed actions (`sqDo` divides the
  duration) instead of giving bonus XP. Flame Aura (`fi_aura`, 087) needs only the perk (`SQAURA`/`SQAURALIT`; 014's cave dark
  widens with it). fi_haven/fi_sacred act on all non-boss local monsters. `SELLB` (038) lists use functions where recipes grow.
- **Graves outside entrances** (063 `grvPos`, `SQGRV.pos`): a grave whose `loc` is `in:` (dungeon, island boss lair, building; not houses) is shown, looted and mapped at its `ar/ax/ay` (the spot you come out at, +8 px) in that outdoor area. Display only, the database record is unchanged, so older graves move too. Kept inside when that spot is water on Hollow (Drowned Grotto).
- **Weekly event** (`ui/143-s148-weekly-event.js`, `window.SQWEEK`): week = `floor((day-4)/7)` (Monday 00:00 UTC), event `EV[week % 7]`;
  counting like 120's daily challenges (items with that skill's XP in the frame, `xpc` = XP gains of 200 or less, kills).
  `wev/<week>/t` total (only up, +500 a write at most) and `wev/<week>/p/<uid>` {n,c}; sent every 10 s. Tiers at 1/3, 2/3, 1 of
  `goal`, paid once each (`got`) if your count is at least `mins` (2%); last week's tiers paid at the turn. Only shown as a card in the
  quest log under the daily box (no HUD element). Saved as `wev` {w,c,got,q}. Rules: `wev` (publish them).
- **Chess ladder** (`multiplayer/142-s147-chess-ladder.js`, `window.SQCHR`): Elo from 1000 (K 40 for 10 games, then 24) through
  `SQDUELEND(kind,res,foe,why)` (called from 130's win/lose/draw3); opponent rating read from `lb/<foe>.cr` at `SQPVC.begin`.
  Unrated: < 10 plies, > 3 games against one player a day. 068 posts `cr`/`cg` and has the `cr` "Chess" category. Saved as `chr`.
- **Party chat and shared gold** (061 + 136): chat tab `pt`; party messages are pm's starting with `[Party] ` and are logged as `pt`
  (not pm). `SQPARTYSAY(msg)` sends; 061's block `mpSend` routes the Party tab and `/p`. Beating a monster (`enemyDrop`) with a
  member nearby sends fx `pg` {g,p,x,y}: members within 20 steps get half (the kill's 2-6 gold counted as 4 + the drop's gold, max 100).
- **Watering can off-hand** (140): `eq_can` slot `off` kind `can` (`TL.can`); hoe and can swap by themselves in the outermost
  `attack` (tillable ground with the can → hoe; dry crop with the hoe → can) and on the "Buy a watering can" message;
  `shootAim` (controller R1) uses hoe/can when that's the off-hand.
- **Message box on phones** (010's `drawHUD`): touch screens held upright (`H>=W`) draw the text box in the strip above the status
  box (`ty=top-th-3U`, 44U tall, `MSGBOX.top`); the players-online pill (139) skips drawing while it's there.
- **HIT never farms** (140, outermost `attack`): on every input HIT hides `TL.hoe`/`TL.can` for that call (`HID`); keyboard/mouse (`isPC`, no `GPON`) also gets
  `bowTarget` null. Touch: 082's `#aimb` shows TILL/WATER for a hoe/can off-hand (also in yards), a tap = `SQOFFHAND.use()`; hints via `SQOFFHINT(what)`. Off-hand use goes through `viaOff` (X, R1, the farming swaps) which skips the hiding.
- **Dev Suite copy/paste** (111b `pxCopy`/`pxPaste`, Copy/Paste buttons, Ctrl+C/V; Erase all = `eraseall`, clears the current picture/layer, undoable): the clipboard is colours per pixel in
  localStorage `sq_dev_clip`, pasted bottom-middle aligned into any editor, colours added to the palette.
- **Castle hall symmetry** (077 `ROOMS.castle.ex=10.5`, 093's castle `ROOMBG`/`c_throne`): the hall stays 22 wide (furniture is keyed
  `y*w+x`, so never change a room's width); a half-tile `ex` = a two-tile gate on the centre line (012's `solid`/leave handle it,
  077's `canPlaceIn` keeps both gate tiles free). Floor marks are mirrored, the wall bricks are laid out from the middle.
- **One home** (`items/144-s149-one-home.js`, `window.SQONEHOME`): one house or castle across `HOUSES` + `SQRH`; **`HOUSES` also holds other players' houses while online (`_foreign`, 061): 144's `homes()` and 145's `mine()` skip them; anything new that loops over `HOUSES` as "yours" must too.** `startBuild`
  refuses a second; `enforce()` (called from 150 after the yards are read) keeps a castle, else the most furnished, and packs
  the rest (item, furniture, chest contents, yard).
- **Backyards / courtyards** (`items/145-s150-backyards.js`, `window.SQYARD`): rooms `yard` (22x16) and `court` (40x28),
  `ex:-10` (the exits are handled here). Look: ground baked with `hdBakeR` from `R.lay` (`YARD_LAY`/`COURT_LAY`: grass, paving,
  forest floor, ponds; drawn for the whole view, forest floor outside the room), the islands' trees/bushes as solid `_obj` room
  items, a forest of `_obj` items with `ring:1` outside the room (drawn only on screen), and the house/castle facade as a `_ybld`
  item drawn by `drBld` along the top (`decorate`). Back doors: `HDOOR` (house x 112; castle 120/232) ↔ `YDOOR` (the facade's
  door at the room's centre line, `R.w*8`); you arrive on row `DOORY` (3) and walk up into the facade to go back; after a door
  `LOCK` holds until you turn or step away (no bouncing). Indices are `y*w+x`: saves carry `yw` (and published yards `w`), older
  ones are moved from `OLDW` (16/26) by `mv` (centred), then `settle` moves anything on a solid tile or the door to the nearest
  free one. Never change the sizes without bumping that. The yard
  scene is `id:'home'` with `house` = the yard object (`h._yd`: `furn`=h.yf, `plots`=h.yp, `_oid` = id+'~y' so `mpLoc` differs),
  `yardOf` = the house scene, `ret`/`prev` copied from it (saves place you outside). Trees/bushes (non-`ring` `_obj`, `R.cells`/`R.gone`): HIT sets `R.region='_yard'` for that one call so 050's `rgGather`/083's tiers/098's bushes run; regrowth after 240 s in 145's `upd`; `regrowing()` blocks tilling/placing. Ponds: `fishWaterAt` wrapped (yard water), cast/reel handled in 145 because 012 swallows HIT in scenes. Farming: own HIT handler (till grass only, `R.lay(x,y)===2`; water /
  harvest via 016's `harvest(-1,p)`, swaps hoe/can only on off-hand use: `SQOFFVIA()` from 140), seeds via PLANT, growth in
  `upd`. Saved as `yf`/`yp` on `houses[]`/`rh[]`. Friends: `yards/<uid>/<hid>` {f,p(stage)} published every 8 s when changed;
  a visitor needs `trustedBy(owner)` (072) and gets a read-only copy (`ro`). A house that disappears (packed) puts its yard
  furniture in the bag (`KNOWN` watch). Rules: `yards`.
- **Editing built-in islands** (`dev/111g-s151-island-edits.js`, `SQA.islandEdits`; builder 111c `openBuiltin`/`saveBuiltin`):
  `islands.ed_<region>` = {bi, n, w, h, x: "i.t.o;..." changed cells (hex ground / object letter, '.' removed, '' unchanged),
  lm, npc}. Applied inside generation by wrapping 050's `rgFinish` (cells with `C.keep`/`lmSolid` are never touched; the
  builder darkens them via `G._keep` from `base(id)`, which generates without the patch). Patched regions skip tiering
  (`R._t64`); the cached region is dropped when its patch changes (not the one you stand on). 111a's `applyIslands` only
  takes `cu_` ids, so `ed_` entries never become islands of their own. Also `cv` (dungeon kinds `cv_<region>_e<i>`, registered
  in 111g), `zn` (spawned by 111g's own `upd` loop, `n.zi='e<k>'`, exempt from 053's cap), `ct`+`c` (drawn over `ROOMBG`) and `ul`
  (unlock: `C.keep` cells may change, `lmSolid` never). A patch change while you stand on the island rebuilds it around you
  (`refresh`). Size and pier stay the game's own.
- **Bosses made in the Dev Suite** (`combat/146-s152-custom-bosses.js`, `window.SQBOSSES`, Dev Suite > Bosses): `bosses.cb_<id>` =
  {n, base, hp, sz, dmg, spd, cd, rs, atk:{ring,charge,slam,summon}, sk}; each becomes monster kind `cb:<letters>` (`keyOf`) in
  `SQISLIFE.MOBS` (island builder zones, island-dungeon monster lists; in a `cv_` dungeon one boss on the last floor via the
  outermost `buildFloor`). `rgMake` builds the base monster and tags it (`n.cb`, `big`, rk = the cb key so looks/rules use
  `m:cb:...`); the boss walks itself (`stepTo`), attacks from `upd` (bolts `SH`, slam marks `TG`, drawn in `pP`), is drawn scaled
  with a name and bar in the outermost `pS`. 053's population cap ignores `n.cb`/`n._cbs` (helpers get `RG_OWN`). After a
  kill it stays away `rs` minutes (localStorage `sq_cbdead`). Drops = the Monsters tab rules for `m:cb:...`.
- **Top-tier gear on load** (`items/147-s153-keep-top-tier-gear.js`, `window.SQTFX`): 020's `applySave` clamps sword/axe/pick tiers
  to 4; later sections restore only their own tiers (035: 5, 084: 6/7). 147 restores any tier above 4 that has an `eq_<slot><tier>`
  item, from the save's `tl`, after every clamp. **A new tier above 4 needs nothing more, but never clamp again.** Bows too: 021 clamps `TL.bow` to 2, so 147 restores any `tl.bow` above 2 with an `eq_bow<t>` (the Bone bow, 3, became a Longbow on every load until Nov 14); `tfx` 2 saves get a lost Bone bow back once (in hand in place of the clamp's Longbow, else in the bag). Saves without
  `tfx` get a one-time return of `LOST` items that are in `ach.col` but nowhere in the save and not in hand.
- **Account-only saves** (061, on skillquestmmo.com and the Windows app; `window.SQSTRICT`, tests opt in with localStorage
  `sq_strict=1`): signing in is required to play (the title has no PLAY until `SQSTRICT.ready`). Each page load claims
  `sess/<uid>` {id: `SQSTRICT.sid`, t} before reading the account save; the account save carries `sid` and the database rules
  refuse a save whose `sid` isn't `sess/<uid>/id` (when one exists), so a session that lost the account can't write. Losing it
  (sess listener, or a refused save via `SQSTRICT.denied`) = `sqLost()`: overlay `#sqlost`, `upd`/`saveLocal`/`saveCloud` stop;
  PLAY HERE INSTEAD = `sqTakeBack` (claim, load the account save in place). 072's presence-based `sessPassive` is off in strict.
  Loading (`mpLinkStrict`): the account save, except the first time under these rules (no `as` on the account save: the one
  with more XP wins) or when this device's save continues it exactly (`bw`/`wid` = the account save's `wid`, newer); a save
  from another account (`sq_acct`) is never used (backed up on the device only). The other save goes to backups. Cloud
  writes in strict skip 008's `syncCheck` (no adopt/ask) and are marked `as:1`. `#sqoff` shows "Not saved: reconnecting..."
  (`.info/connected`). Rules: `sess`, `saves.sid` (publish them).
- **Home comforts** (`items/148-s154-home-comforts.js`, `window.SQHOME`): yard campfires (012's indoors check and 049's
  "too windy" let yards through; `fireKey64` gives each yard its own fire stash `yard:<house id>`; the fires are kept as `_fire`
  room items so they draw and sort, 083's `drawFurn`; other players' shared fires (`_rp`) are included, or visitors never saw them). No hunger drain inside a house/castle (`SCENE.id==='home'`, not a yard):
  the outermost `upd` adds 3x the drain first and takes it back, so starving can't trigger; eating still counts. The
  wardrobe opens the character screen, so it gets its own `#cwpk` PICK UP WARDROBE button (`pickFurn`/`pickStruct`).
- **Deposit bag** (`items/149-s155-deposit-bag.js`, `SQDEPOSIT`): a DEPOSIT BAG button in 011's `chestHTML` (YOUR BAG header);
  own chests move everything (not `chest`) and save once; a friend's shared chest (`CHEST_H._sh`, 072) goes per item through `chestMove`.
- **Controllers everywhere** (`ui/150-s156-controller-everywhere.js`, `SQOSK`): `navRoot` also returns the request popups
  (#trpop/#ptpop/#dlpop/#updbar, 0.5 s after they appear) and #sqlost/#sqsess; ○ there clicks `.no`. `navItems` adds textarea/select;
  `navPress` with `GPON`: text inputs/textareas open the on-screen keyboard #sqosk (number inputs get digits), checkboxes tick,
  selects cycle. The keyboard's ○/△/□/R1/Options are taken in the outermost `pollPad` before 023 (marked held in `GPPREV`).
  OK writes the value (input/change events) and submits a one-line input's form (chat #mpf, name). New text boxes need nothing.
  A visible `[role=dialog]` inside the panel (011's chest item card) becomes `navRoot` (the highlight stays in it); ○/Options
  click its close (`[data-chx]`/aria-label Close/×). Give new in-panel cards `role="dialog"` and a close button.
- **Late pet items** (`items/151-s157-late-pet-items.js`): 104 makes `pet_<kind>` items only for pets already in `LUX.PETS`;
  pets added later (116's `pmush`/`pglow`) get theirs here (else the PET slot shows empty and bag copies aren't in `INVK`).
  A pet added by a section after 151 needs the same.
- **Farming seeds** (`skills/152-s158-farming-seeds.js`, `SQSEEDS(L)`): 016's harvest asks it for the seed count: 45% + 0.5%/level
  (cap 95%), second seed 5% per 10 levels (max 45%); perks (third choices, like 087's) `fm_pouch` (20, +15%), `fm_twin` (40,
  each seed 25% ×2), `fm_heir` (70, at least one). `TREES[11].step` lists the seed numbers. 038's `fm_seed` still adds its own.
- **Audit fixes** (`core/153-s159-audit-fixes.js`): audio is suspended while the page is hidden (014's music timer is throttled in
  the background) and resumed on return; a trusted keydown also wakes the audio (`ac()`); yards/courtyards use the day/night
  song (`wantSong`). Also: 079's World Market opener is `wmOpen` (a `function open` in that bare block replaced `window.open`);
  039's fire-perk line had code after a `//` comment (use `/* */` mid-line); 120's new-day `dly` has the loaded field order.
  **Never name a function in a bare block after a browser global** (open, close, print, find, stop, focus, name...).
- **PvP balance** (`combat/154-s160-pvp-balance.js`, hooks called from 064's `pvHit`/`pvIncoming`, which can't be wrapped from outside
  the MP block): `SQPVDMG(kind,el)` = hearts from the monster damage numbers (melee `1+TL.sword+lv/15+meleeFlat`, `arrowDmg`,
  `spellDmg`; <7 = 1, 7-13 = 2, 14+ = 3; `ul` +4), receivers accept up to 3; `SQPVARM` (12+ armour points: -1 on hits of 2+);
  `SQPVIF` (0.5 s invulnerability after a player hit); `SQPVBLK` (block vs players capped at 25%). While fighting
  (`SQPVHEAL.fighting()`: duel, or `SQPVP.fight` within 10 s) healing is halved with carry, from food (outermost `eat`, `EATCD`
  5 s) and anything else (outermost `upd`, also between frames); duels after 60 s = sudden death (no healing, `#dlbar` text).
  A duel that ends in a frame restores health untouched.
- **Soundtrack** (`world/155-s161-soundtrack.js`, `window.SQMUSIC`): orchestral samples (FluidR3_GM, CC BY 3.0, credited in
  Options, `README.md` and `music/README.md`) in `music/<inst>.json` ({s:{midi:base64 mp3}}, one every 4 semitones), fetched
  per song (`loadSong`; a new song starts once loaded, the old one keeps playing meanwhile). 014's scheduler still runs and
  owns `MG` (volume/fade bus) but its `PARSED` tracks are emptied every tick. Songs in `S`: {bpm, m (8ths per bar: 8 = 4/4,
  6 = 3/4 or 6/8), lead, harm (second voice: chord tone a third+ below, on quarter notes or longer), pad, arp + arps
  (harp8/strum/stab/ost8/sparkle), bass + bs (held/pedal/pizz/drive/walk/root5/waltz/shanty), perc (timp/march/timp8/taiko/
  tamb/boss), swing, parts {name:[chords, melody, {lead,harm}?]}, order}; instruments in `INST` (range, sustained or not).
  Melody tokens are 8ths ("X/Y" two 16ths, "-" hold, "." rest, "|" bar line); one chord per bar ("C,G" = half each). `VOL`
  evens loudness (re-measure with `SQMUSIC.render(name,secs)` → AudioBuffer when adding a song). The outermost `wantSong`:
  boss near (boss/_wb/cb/ib, or `big` inside a dungeon; held 6 s) > `sail` > island theme by region (`REGION_SONG`) > the
  older names (day night indoor cave port frost tide desert icecave sandcave seacave). Unknown names fall back to cave/day.
  Write only original melodies.
- **Keep your spot** (`core/156-s162-keep-your-spot.js`, `SQKEEPSPOT`): 006's applySave puts you at SPX/SPY when the saved spot is
  blocked (a regrown rock/tree, or the shared world's removals not in yet). The outermost applySave then moves you to the nearest
  free land tile around the saved position instead (Hollow outdoors, not sailing, within 30 tiles).
- **Calmer monsters** (093): a monster that started the frame more than 95 px away has any step toward you undone. Anything that
  moves a monster by teleporting (burrowing beetles, `n.under`, parked 200 px away by 045) must be skipped there, or it stays parked.
- **Player-report fixes** (`items/157-s163-player-reports.js`, `SQREPORTS`): inside a house/castle the tiles in front of each
  back door (`HDOOR`, rows 2-3) refuse furniture (outermost `canPlaceIn`), furniture already there is moved once per house per
  session, and in any `home` scene a player standing inside something is stepped out (`unstick`, every frame). Screen Wake Lock
  while playing (requested on input / return to the tab). `body.sqibf` hides 071's `#wbb` banner in island boss lairs.
  Also: 004's crafting header uses `tierName(k)` (tiers past `TIT`, e.g. the Crystal sword); 005's sell list falls back to
  `INAME` (133 gives craft outputs a `SELLP` without an `SN`); 071's island lair search requires `R.reach` over the boss's path.
- **Controller cards** (`ui/158-s164-controller-cards.js`): the outermost `navMove` measures to the nearest edge (gap in the
  direction + side gap ×3 + centre offset ×.15) so wide buttons are reachable; the thing a `[role=dialog]` card was opened from
  (`data-k`/`data-a`) gets the highlight back when the card closes (checked every 60 ms).
- **Ult picker** (`combat/159-s165-ult-picker.js`, `SQULT`): `avail()` = slam (`SLEDGE`), dragon (`SQJW.neck==='ja_dsoul'`), wand
  (`WAND`); the gear tab (`equipHTML`, `data-ultp`) picks one, saved as `ultp`. The outermost `castUlt` hides the others
  (SLEDGE / SQJW.neck / WAND) for the call and puts them back. A new ultimate source must be added to `avail()` and hidden there.
- **Monster attacks** (`dev/160-s166-monster-attacks.js`, `SQMOBATK`): `SHOOT` = types that put hostile shots in 021's `PROJ`
  (skel, bonelord, guard, tidek). `PROJ.push` tags each hostile shot with the nearest monster (`p._mk`, look key `p._jk` =
  `j:<key>`, `n._shotAt`); `mobs.<key>.pj` = {rate %, dmg hearts, fx:{slow|burn|freeze|poison:[chance %, s]}} (Dev Suite >
  Monsters > "Its shots", 111b `mrShots`); the outermost `drawProj` draws `props['j:...']` turned the way it flies; status
  timers in the outermost `upd`. 111d lists `j:` looks for shooters (captured from `drawProj`). Look frames: `af` = last N frames
  are the attack animation (111d `mobDraw`: within 20 px, 450 ms after a shot, or `n.cast`; `ak` = old one-frame form).
  Pets: the pet editor has Attack 1/2 frames (`k`/`l`), used by the Imp while it fights (111a `impPaint`).
  Bandits/cacti (099's `SQNMP`) and Dev Suite bosses' fire rings (146's `SQCBSH`) push shots tagged `_n` (the monster); 160 tags them,
  099/146 call `SQSHOTHIT(shot)` when one hurts you and skip drawing when `SQSHOTDRAW(shot)` drew a look. `SQMOBATK.capDraw(type)`
  draws a type's own shot for 111d's j: capture.

- **Admin tab** (`dev/161-s167-admin.js`, `window.SQADMIN`, Dev Suite > Admin): Bug reports (`bugs`, devs read; `st` status and
  `re` reply are dev-only children, a reply also goes to the player as a gift message), Players (`lb` list + dev read of
  `saves/<uid>`, gifts), News & events, Economy (gold/items summed over every account save, market offers/last trades).
  Game side: `gifts/<uid>/<id>` {k,n,g,m,t,f} written by devs, claimed once by the player's game (transaction to null, then
  bag/gold + message); `news` {m,t,until} = banner `#sqnews` (closed per `t` in localStorage); `events` {n,xp,until} = XP
  multiplier (outermost `addXp`, max ×5) and pill `#sqevp`. Rules: `gifts`, `news`, `events`, `bugs.st/re`, `saves.read` (publish them).
- **World Market box** (079): deliveries carry `o` (the box owner's offer) and `b` (writer); the rules only take them from someone
  else and tied to an offer of the owner's for that item. So the offer must still exist when the box is written: filled offers
  are removed by their owner after `HOLD` (30 s, `sweep()`), and cancelling an offer that already traded keeps it as `x:1`
  with `q=f` (removed by the same sweep). Offers with `f>=q` don't count toward the caps and aren't listed.
- **Content without code** (`dev/162-s168-content.js`, `window.SQCONTENT`, Dev Suite > Content): library `content` =
  {items it_, recipes r_, shops gen/bw/af/cs_, quests q_, mobs cm_, loot lt_} (field list in the file header). Applied through
  `SQA.onApply`: everything it adds to the game's lists (INVK, FOODS, GOODS, SM, COOKS, GEN/SHOPBW/SHOPAF, SQISLIFE.MOBS) is
  taken back out before the next apply. New items keep counts while not loaded (`PEND`, like 111a2): never rename a published
  `it_` key. Island-builder people have a job `ro` ('shop:cs_x' or 'quest:q_a,q_b'), passed through 111a/111g's npc items; 117's
  `talkTo` asks `SQNPCROLE(it)` first. Custom quests are in the quest log via `SQQEXTRA`, saved as `cq`. Kill quests and loot
  tables count in the outermost `enemyDrop` (monster key = `SQPROPS.mkey` without `m:`). Island chests can list a loot table
  (`lt_` key, count = rolls; 111a's chest code). New monsters `cm:<letters>` are built by the outermost `rgMake` from `base`.
  Items can set `mv` (merge into another item): copies in the bag turn into it (`merge()` on apply, load and every 2 s); the way to
  retire a duplicate without deleting a published item. 176's "Make its item" buttons reuse an item with the same name (`sameName`),
  and 169 warns about two items with one name. 176's item lists label same-named items with their id and icon state, and show
  the picked item's icon.
- **Balance** (`dev/163-s169-balance.js`, `window.SQBAL`, Dev Suite > Balance): library `balance` = {xp:{skill:%}, act:{'<TABLE>:<key>':xp},
  perk:{'<TABLE>:<perk id>':%}}. `act` edits the xp field of COOKS/SM/GOODS/BREC/FREC/FISH_T/SQTIER entries in place (not `_cu`);
  `perk` edits the [id,value] pairs of 038/039's GSPD/GEXT/GRAR/GDBL/STAYP/FOODP/PSPD (one id can sit in two tables, hence the
  table in the key) and swaps the % in the perk's description. Originals captured at load. Perks written into code have no
  table and aren't editable. `sim()` = actions/time between two levels from XT.
- **History & search** (`dev/164-s170-history-search.js`, `window.SQHIST`, Dev Suite > History): the library diffed as units (one
  entry; one level deeper for stats/content/balance; swings whole). Publish some changes = live + the ticked units from the draft;
  versions list what each changed vs the one before; "Make live again"/"Undo the last publish" publish an old version as a new
  one (same hist/prune steps as 111b's goLive). Search covers items, monsters, islands (people, signs), bosses, content, look
  names, skills; results open the tab (Content through `SQCONTENT.edit(section,id)`).
- **Song editor** (`dev/165-s171-song-editor.js`, `window.SQSONGS`, Dev Suite > Songs): library `songs.<key>` = a song in 155's format
  (+ `vol`); built-in keys replace that song, `su_<id>` are new; `songmap.<region>` = song key (155's `REGION_SONG`). `check()`
  validates chords/notes/bar lengths/order and builds it; originals restored when removed. The tab is a composer (since 190, `window.SQCOMPOSER`): per part a chord lane + a 16th-step piano roll (one note at a time); grid edits go back to text through `melText`/`parseMel` (round trip keeps every built-in melody's pitches; flats in flat keys), songs may carry `key` (scale rows, the key's chords in the picker), band presets `PRE`, 💡 `idea()` writes a melody over the chords, undo/redo, Space plays the part. `SQMUSIC.note(inst,midi,dur)` (155) plays one note; 155 also exposes `chord`/`midi`. Redraws go through `redraw()` (API.draw doesn't run the tab's `after`). 155 exposes `VOL`, `force` (play a song
  regardless of `wantSong`; the editor plays its working copy as `__ed`), `restart()`, `step`, `len`. Write only original melodies.
- **Save keys** (`core/166-s172-save-keys.js`, `SQSAVEKEYS`): 049 keeps unknown save fields (`SAVE_EXTRA`) and writes them back; it
  used to learn "known" fields only from the first snap of a session, so fields written only when non-empty (`rh` island
  houses/castles, `rb`, `rfarm`, ...) came back stale after being emptied (the island castle dupe). 166 lists those fields in
  `KNOWN49`, learns every field a snap writes, and drops known fields from `SAVE_EXTRA`. **A new save field written only when
  non-empty must be added to `KNOWN49`** (or to 166's `KEYS`).
- **Transactions that take something once** (161 gifts, 079 market COLLECT): the update function must return the new value even
  when it's handed null (`cur=>{got=cur;return null}`), never abort on null: the real SDK often calls it first with a stale
  "nothing" before it has the server's value, and aborting there means it never retries. 161 also polls `gifts/<uid>` every 15 s.
- **Fixing a player's game** (161, Admin > Players): `fixes/<uid>/<id>` {op:'take'|'restore'|'home', k, n, b, m, t, f}, written by devs,
  taken once by the player's game (same transaction pattern as gifts, poll every 15 s): take = remove up to n of k from the bag
  (`gold` = gold); restore = `applySave` of `bak/<uid>/<b>` (061's cloud backups: daily + before big changes, 8 kept; devs can read
  them now); home = `applySave` of the current save at SPX/SPY on Hollow. Rules: `fixes`, `bak.read` (publish them).
- **Testers** (`dev/168-s174-testers.js`, `SQBETA`, Dev Suite > Testers): `testers/<uid>` = true; `assets/beta` = the draft sent to them
  with `base` = the live `v` it was made from. A tester's game applies it through `SQA.preview` (the stored live copy is untouched)
  only while `beta.base === live.v`; tag `#sqbeta`. Rules: `testers`, `assets/beta` (publish them).
- **Checks** (`dev/169-s175-checks.js`, `SQCHECKS.run(lib)`, Dev Suite > Checks): broken references in the draft (items, monsters,
  quests, shops, songs, loot tables, islands' people/zones/caves/chests, monster drops, bosses, new gear), quests/shops nobody
  runs, missing sprites; problems also head the Publish list. Add a check there when a new library section refers to others.
- **Moderation** (`multiplayer/170-s176-moderation.js`, `SQMOD`, Dev Suite > Moderation): `mod/<uid>` {mu, ba (until, ms), r, by, t};
  the rules refuse chat/pm from muted or suspended accounts and presence/market offers from suspended ones (a missing `mu`/`ba`
  must pass: the rules use `!exists() || val() < now`). Game side: `#sqban` notice + `upd` stopped while suspended; 061's
  `mpSend`/pm send ask `SQMOD.blockChat()`. `reports/<id>` from the player menu's REPORT (130 → `SQREPORT(u,name)`, `ptab` 40).
  Devs can delete chat messages. "Find a player" (`findView`) searches every `lb` account plus players online now (`SQMP.players`,
  `seen` within 60 s, performance clock) by name or account id, with the same mute/suspend buttons, so no report is needed.
  Rules: `mod`, `reports`, `chat`, `pm`, `presence`, `market/offers` (publish them).
- **Player stats** (`ui/171-s177-player-stats.js`, `SQSTATS`, Dev Suite > Player stats): `stats/d/<UTC day>/<uid>` minutes played (sent
  every 5 min), `stats/f/<uid>` first day, `stats/dz/<day>/<where~monster>` deaths (+1 transactions). The tab shows players per
  day, new players and next-day / week returns, deaths, and (reading saves) the quest/guide step/total level of players who
  stopped. Rules: `stats` (publish them).
- **No `prompt()`**: the Windows app (Electron) doesn't support it ("Prompt () is and will not be supported"). Ask for text with an
  input on the page instead (Moderation's reason box, Admin's reply box).
- **Two player menus**: tapping a name in chat opens 070's `#mppm` (message/friend/trade/IGNORE/REPORT); walking up to someone opens
  130's panel menu (now with IGNORE/UNIGNORE via `SQIGNSET`/`SQIGNORED` and REPORT via 170). Both REPORTs write `reports/<id>`
  (070 adds `m` = their recent messages). The ignore list is 070's `IGN` (saved as `ign`), shown under IGNORED in Chat > Friends.
- **Chat commands after the MP block**: 061's chat box calls `window.mpSend`; 080 (end of the block) sets `window.mpSend=mpSend`
  (the block's chain: 062 /trade, 070 /ignore, 072 dev commands). Sections after the block (111b /suite, 136 emotes) wrap
  the global `mpSend`; before this, the box called the block's own binding and those commands were sent as plain chat.
- **Controller wrap / name button** (158, 119): with nothing in the d-pad's direction, `navMove` wraps to the far item that overlaps
  the current one on the cross axis (same row/column), or stays put. 119 compares only the word before `<small>` on `tk` (the
  key hint is rewritten by 023/124's controller labels; comparing the whole label made the name button flash).
- **Controller highlight ring** (`ui/172-s178-controller-highlight.js`, `#sqgpr`): a fixed overlay (top z-index, pointer-events none)
  follows `GPF`'s rect every frame while `GPON`, so pixel frames can't clip it (081's inset ring stays underneath). Side arrows
  only on items 300 px wide or more. Hidden when `elementFromPoint` at points inside GPF finds something else on top (`covered`). Nothing needed for new screens: anything `setFocus` highlights gets the ring.
- **Building only at home** (`items/173-s179-build-at-home-only.js`, `SQHOMEBUILD`): the outermost `startBuild`/`placeBuild` refuse every
  piece outside a `home` scene (house, castle, yard/courtyard) except house/castle and seeds (`FREE`). On load (outermost `applySave`)
  Hollow's `STR` and the islands' `RB` (065's `window.SQRB`) are packed into the bag and saved. 061's `buildSync` no longer adds other
  players' `build/<uid>.s` and 065's `rbForeign` returns nothing (island houses `r._h` still go through `rhForeign`).
- **Live publishes** (`ui/174-s180-live-updates.js`, `SQLIVEUPD`): the game watches `assets/live/v` (realtime listener once `SQFB` is up,
  plus a fetch of `assets/live/v.json` every 30 s and on returning to the tab); a new `v` runs `SQA.refresh()` (full library, applied
  in place) and `SQBETA.check()`. Anything a library section sets must therefore be safe to re-apply mid-game (`SQA.onApply` hooks).
- **Palette tools** (111b `palExtra`, every picture editor): hex box for the selected colour, "Add hex", Copy palette (clipboard +
  localStorage `sq_dev_palclip`), Paste palette (any text: every #rrggbb / #rgb code in it), saved palettes in localStorage `sq_dev_pals`.
- **More Stats tables** (`dev/161b-s181-data-tables.js`, `SQDATA`, before 162 so its snapshots hold only the game's own entries):
  `food` (FOODS heal/hun), `shop` (GEN/SHOPBW/SHOPAF price, amount, off; 095/096 now expose `window.SHOPBW/SHOPAF`, which also made
  Content's bw/af stock work), `recipe` (SM/GOODS/BREC/FREC/REC/COOKS: `mats` text parsed by `SQDATA.parseMats`, level, off = taken
  out of its list and put back in place). Table fields may be `bool` (111a `merged`, 111b checkbox); tables can set `note`, `col`,
  `label(k)`, `sub(k)`. Tables registered after 111a apply their part through `SQA.onApply`.
- **Gear stats tab** (`dev/175-s182-gear-table.js`, Dev Suite > Gear stats): every weapon/armour piece in one table, final numbers
  for the developer's character (`SQGEAR.base` + draft rule); edits save the difference into `gear.<k>` (same as the Gear tab).
- **Gathering** (`dev/176-s183-gathering.js`, `SQGATHER`, Dev Suite > Gathering; catch hook `world/093b-s183-gather-fish-hook.js`
  before 109 so new fish get the reel): library `gather.nodes.gn_<id>` = {n, rep tree|rock|ore, lv, hp, tool, item, xp, col[4]|ore,
  where[], pct} -> 083 tier kind `g_<id>` in `SQTIER` (+OHP/SKOF), placed by a fixed hash on Hollow (obj + REM) and on islands
  (outermost `loadRegion`, and the current island on every apply); sprites recoloured in the outermost `hdSprites`. Removed kinds
  turn back into what they replaced. `gather.fish.gf_<id>` = {n, item, lv, xp, where[], p %, ck, clv, cxp} -> `window.SQGFISH`
  + a `COOKS` entry (`_g`). Items are game items or Content `it_` items ("Make its item" writes them into the draft).
  `gather.crops.gc_<id>` = {n, item, seed, lv, gm (watered minutes), y0,y1, xp, sh, col[3], buy, ck, clv, cxp} -> `CROPS[item]` (keyed by
  the crop item: 016's harvest adds `inv[p.c]`; `_g`), `SEED2CROP[seed]`, a `GEN` seed pack (`_gc`) and `COOKS` (`_gc`). A removed crop
  keeps its CROPS entry (plots/saves name it), only its seed stops planting. Ripe look from the wrapped `hdCropS` (shapes in `SHAPES`).
- **Meals and food buffs** (`items/177-s184-meals.js`, `SQMEALS`): `window.SQFOODBUFF` {food:{b,s}} = eating it (outermost `eat`/`useFood`,
  by bag count drop) starts buff b for s s in 085's `LUX.BUFF` (085 lists/pills: str, iron, swift, wis, regen; wis = +20% XP in the
  outermost `addXp`, regen = 1 heart / 10 s in the outermost `upd`). Filled by 162 (Content food items' `buff`/`bs`) and 161b (Stats >
  Food & potions `buff`/`bs`). `window.SQSTOVE` = multi-ingredient stove meals (Content recipes `sk:'stove'`), listed under "Meals" in
  the outermost `stationHTML` and made by `stationAct('sv_<i>')`. COOKS entries with `st` are stove-only: 007's fire loop, 109, 110 and
  118 skip them (Stats > Recipes "Stove only"). Stats table fields can be `sel` [f,label,'sel',options|()=>options].
- **Worn looks for new gear** (111a apply): `WORN` takes every valid `worn.<eq_...>` without checking `EQ` (newgear items are registered
  by 111a2's onApply hook *after* the worn loop, so their looks used to be dropped on every normal load; drawWorn/hideFor check slots).
- **Title hero looks** (`ui/178-s185-title-hero-looks.js`): when `gearCH().wr` is set, a 96x112 `hd2` canvas (2x transform) over 061's
  16x32 title hero draws the whole character through `cP` (kit at (16,19) of the 48x56 box; size/position set with `!important`).
- **Fletching** (021 `makeFletch`): timed through 109's `sqDo('craft',n)` ("All" = as many as the materials allow); the generic
  "Made ..." line only when the recipe's own `f` didn't say anything (arrows say the arrow count, gear its name).
- **Pet powers** (`skills/180-s187-pet-powers.js`, `SQPETPOW`, Dev Suite > Pet powers): library `petab.<pet kind>` = {own (0 = its built-in
  ability off: `window.SQPETOFF(k)`, asked by 085's imp aggro, 098's fetchers, 116's treelings/mushling/glowcap), at
  melee|ranged|magic|aoe, ag hurt|near|yours, dmg, gr (+1 per 25 Attack/Archery/Magic), cd, rng, col, fx {slow,burn,poison,freeze:
  [%,s]} (the game's own n.slow/burn/poison/frozen), heal {h,e}, fetch {k,n,e}, ex {s skill (-1 any gathering),c}, xp, gold, guard}.
  Attacks come from where the pet is drawn (093's `PST.get('me')`, the imp's state); a melee pet is moved next to the monster and
  093's `petFollow` walks it back. Peers see the attacks via fx `pa` (`SQFXH.pa`, looks only). Powers are appended to `IDESC.pet_<k>`.
  A new pet with a built-in ability should check `SQPETOFF` and get a line in the tab's `own()`.
- **Eating / campfire cooking** (`ui/181-s188-better-eating.js`, `SQEAT`): the outermost `eat` moves the chosen food to the front of
  `FOODS` for the call (pinned `eatp` in the save, else smallest heal that covers what's missing, else least healing; potions and
  `SQFOODBUFF` meals left for USE; "You're full." at full health + food 95). At a fire with 2+ cookable kinds it opens a picker
  (`ptab` 41); a picked kind runs as 109's `sqDo('cook')` whose steps call `eat()` (BYPASS) with that COOKS entry moved first.
- **Tidy phone screen** (`ui/182-s189-tidy-screen.js` + edits): every minimap drawer uses `L.mw||L.dw` (right-aligned to the day box);
  182's outermost `hudLayout` sets `mw` on sideways touch screens so the minimap ends above the action buttons under it. 111's
  `sqPlaceBtns`: ONLINE/BUG are 30px and in a row (upright phones: under the minimap; sideways touch: under the left HUD stack,
  `window.SQHUDBTN` = the row's bottom). 115's guide hint is drawn under the quest box (and under that row), 11 units, left aligned.
  131's floating words go under your feet (`q.hi`) while XP numbers (`drops`) rise over your head. 118's HIT says TALK only when
  the TALK button (`tk`) isn't already showing TALK. Fixed elements have no `offsetParent`: test visibility with `offsetWidth`.
- **Recipes tab** (`dev/183-s191-recipes.js`, `SQRECIPES`, Dev Suite > Recipes): one list of every recipe (161b's `SQDATA.RREF` game
  recipes, Content `r_` recipes, newgear `sm`, Gathering fish/crop cooking), filter by station, search = "makes it" / "uses it".
  One editor saves each change where it lives: game rows to `stats.recipe.<key>` (mats written as item keys, so same-named items
  stay apart) + XP to `balance.act` (ids `<TABLE>:<key>`, originals `SQBAL.OA`), content to `content.recipes`, gear to
  `newgear.<k>.sm` (via `SQGEAR.ngClean`), fish/crops to `gather`. The game's cooking recipes keep their single raw food.
  111a's `apply` keeps a copy of the applied stats (`applied`), so a row deleted from the draft is still put back.
- **Material names in recipe lists**: `matN(k)` (004, global) = `SHORT[k]` or the item's name lowercased; 004/006/007/011 use it (they printed
  raw keys, so Content items showed as `it_...`). Use it in any new list of materials.
- **Quest chains** (162): a content quest is step 0 (its own t/k/amt/take, line `d`) plus `steps` [{t,k,amt,take,say}], each handed in to
  the giver (CQ[id+'@'] = step, CQ[id+'#'] = kills/arrival of that step). `ch` = up to 4 end choices [{l,say,g,xs,xp,rk,rn}] shown on a
  card (`ptab` 42); the pick is kept as CQ[id+'!'] and a quest with `after` + `ac` (choice index, -1 any) only opens after that pick.
  `lp` reminder line, `ld` done line, `rq` {s,l} skill level before it's offered. A giver's `quest:` list is expanded with every quest
  that comes after one of them (`chainOf`), so new branches need no change to the island. Content > Quests draws the chains as a tree.
- **Walking gear** (111a `frameOf`/`autoStep`, 111b worn editor): a worn look can hold step frames `f1 b1 s1 f2 b2 s2` (cP's `st` 1/2),
  drawn instead of the standing layer while walking. Without one, `autoStep` makes it: the game's kit only moves its legs (no bob,
  no arm swing), so only `legs` pieces change (front/back: the lifted leg's part below layer row 94 moves up 2; st 1 = right half,
  st 2 = left half); side legs and other slots keep the standing look. drawWorn no longer adds the old half-pixel bob. Editor:
  ed.layers has 9 entries (index = facing + step*3, `WKS(d)` = key), an empty step is shown faded (automatic) and the first change
  to it starts from that automatic frame (`snapEd` → `autoInto`).
- **Scheduled events** (`ui/184-s192-scheduled-events.js`, `window.SQEVENTS`, Dev Suite > Events, `ptab` 43): library `sched.ev_<id>` =
  {n, msg, from, to (ms), rep ''|'day'|'week', xp 1-5, xs skill (-1 all), gold %, mob {k,n,r}, shop cs_<id>, off}. Published with the
  library, switched on by the clock (`win`/`next`), no database writes. XP in the outermost `addXp` (on top of 161's database
  `events`), gold in the outermost `killEnemy`, monsters tagged `_ev` kept near you outdoors (`EVM`, like 121's DEVM), the shop is a
  Content shop opened from the event card (pill `#sqsev`, below 161's `#sqevp` when that shows). `SQEVENTS.force(id,min)` = run it
  in your own game only. Start messages are remembered per window in localStorage `sq_evseen`.
- **Simulator** (`dev/185-s193-simulator.js`, `window.SQSIM`, Dev Suite > Simulator): runs the real `killEnemy` on `rgMake` monsters inside
  `sandbox(fn)` (snap + localStorage `sq_*` + `kills` kept, `applySave` after; say/sfx/saves/`SQPVSEND` muted), so every drop source
  counts. Per hour: hits = health ÷ (1+TL.sword+Attack/15+meleeFlat) at 2 a second + walk seconds. Loot tables roll `SQCONTENT.roll`.
  Bosses (cb:/ib/wb) are left out. Anything new that a kill changes outside the save must be put back in `sandbox` too.
- **Perks editor** (`dev/186-s194-perk-editor.js`, `window.SQPERKED`, Dev Suite > Perks): library `ptree` = {txt:{'<skill>:<id>':{n,d}},
  add:{'<skill>':{'<level>':[{id:'cp_<x>',n,d,fx}]}}}. txt renames built-in perks (effect stays the code's); add appends choices
  (max 3 a level: PERKS letters a/b/c) marked `_cp`, at any level, making a tree for a skill without one. New perks' `fx` use 111a2's
  FXN keys and count through `window.SQFXEXTRA` (hook in 111a2's `fxSum`, so 179's effects too) while chosen and the level is reached.
  Everything is taken back out before each apply (texts only if still what 186 set, so 163 Balance's rewritten descriptions win).
- **Chat bubbles** (`multiplayer/187-s195-chat-bubbles.js`, `window.SQBUBBLES`): the outermost `drawHUD` nulls every `r.said` and
  `MP.selfSaid` for the inner call (061 then draws names only) and draws speech bubbles itself: wrapped (3 lines), 4 s + 70 ms a
  character, newest first (your own always first), stacked upward, else under the speaker's feet, else a "…" dot; never over the
  HUD corners (`hudLayout`) or the touch buttons / ONLINE / BUG / event pills (DOM rects, keep-out list `KO`). Cap 4 (5 on big screens).
- **Controller in the Dev Suite** (`ui/188-s196-dev-suite-controller.js`, `window.SQDVPAD`): outermost `navRoot` returns `#dvs` while the
  suite is open (the on-screen keyboard and request popups still win); `navItems` adds `.dv-qb,.dv-evr,[data-simrow],[data-simsort],#dvc`
  (add new clickable non-buttons there). Outermost `pollPad`: ○ = the open card's `[data-a="back"]` / drop the item / close, L1/R1 =
  tabs; ✕ on `#dvc` = draw mode (pixel cursor, ✕ held = a real pointer stroke with pointerType 'pen', △ tool, □ undo, L1/R1 colour,
  ○ done), which owns the pad and writes GPPREV itself.
- **Dungeon builder** (`dev/189-s197-dungeon-builder.js`, `window.SQDUNGEONS`, Dev Suite > Dungeons): library `dungeons.dg_<id>` =
  {n, st (rock/mine/ice/root/sand/tomb), fl:[{w,h,g ('#'/'.' per cell),it:[{t,x,y,o}],m:[{k,x,y,hp,b}]}]}. Each design is an island-cave
  kind `dg_<id>` in SQICV/DKIND; island-builder entrances can point at one (`cv[].dg` → 111a sets `dgw` on that cave kind). The outermost
  `buildFloor` builds designed floors exactly (entrance bottom middle, stairs as placed or put far away automatically, none on the
  last floor; bosses = `big`, 4× health, a bar drawn in the outermost `pS`). Floors cached in `DUN.floors` are dropped on apply (not the one you're in).
- **Party list placement** (136's HUD): starts under the left HUD stack, then under 111's CHAT/BUG row when that row is in the left
  column (`SQHUDBTN`, phones without a minimap, e.g. indoors) and under 115's guide hint (`window.SQHINTB` {b,f}, its bottom in canvas
  px this frame). Anything else drawn in that column should record its bottom the same way.
- **Emote animations** (136 `act`): the body is redrawn from `OFF` with dx/dy (hop/sway), `hx/hy` (the head, rows 0-39, moved on its own),
  `sq` (a torso row dropped on landing) and `arms` ([[side,sway]] → `armUp`, which clears the kit's hanging arm at columns 17-18 / 29-30, rows 42-48, and re-outlines the torso edge at 19 / 28); sleep draws the whole OFF rotated -90° on the ground.
  Effects use pixel glyphs (`GL`: heart, check, cross, ?, note, star, spark, z) through `glyph(C,k,x,y,col,outline)`.
- **Leaderboards in the menu** (`ui/190-s198-menu-leaderboard.js`, `window.SQMENULB`): SMI item `leaderboard` after Achievements;
  the outermost `showScreen('leaderboard')` closes the menu and calls 068's `lbOpen()`; pnOpen is held true while `SQLB.open`, and
  closing returns to the START menu when opened from it. Same file: `#sm` gets a max-height + scrolling, and three tighter columns on
  short wide screens (`max-height:520px` and `min-width:560px`, phones held sideways).
- **Hide chat** (`ui/191-s199-hide-chat.js`, `SQHIDECHAT()`): Options button, localStorage `sq_hidechat`; `body.sqnochat` hides `#mpb`, and 187
  skips players' bubbles (yours too) when it's on. **Island people's speech bubbles** (117) are handed to 187 through `window.SQNPCSAY`
  {x,y,said:{m,at},seen} (refreshed while 117 draws the person) so they get the same HUD-avoiding placement; 117's own world-space bubble
  is only drawn when 187 didn't place one last frame (`SQBUBBLES.last.npc`, e.g. offline).
- **Backups in Options** (106): players no longer restore backups themselves (restoring after a trade duplicated items/gold); Options
  shows one line pointing to Report a bug, devs restore via Admin > Players (161 `fixes` restore). Backups are still made (061/008).
- **"N left" for make-all** (`skills/192-s200-make-all-count.js`): the outermost smithAct/makeGood/makeBuild work out how many the
  materials allow when `all`; the wrapped `sqDo` keeps it as `SQDO.tot` and 109 shows `min(n, tot-done)` (display only).
- **Editing Hollow** (`dev/193-s201-hollow-edits.js`, `SQHOLLOWED`): `islands.ed_hollow` (111g's format, skipped by 111g's own
  onApply) applied onto 001's `tile`/`obj` (ground 0-5 only; objects in `HOLOBJ`). `ORIG` copies are taken when the script has run;
  each apply puts the previous patch's cells back first, then clears `HDCK` and 052's `HMAP`. `HARD` (solid() disagrees with
  ground/objects = buildings, walls, bridges, piers, +1 tile) is never changed; `SOFT` (gold/mith/adam veins, boulders, obsidian...)
  only with Unlock. The builder lists Hollow via `A.islandEdits.hollowOK` (ground palette 0-5, `HOLOBJ` objects only).
  Also lm/npc/cv/zn/ct+c (`places()` → `SQHOLLOWP`): room-style `ITEMS` drawn by `drawFurn` through 002's `LHOOK`, walls in `SOL`
  (outermost `solid` outdoors), signs/chests used by the outermost `talk` + tk (READ/OPEN) + `SQPADUSE` via `useFurn` (chest loot in
  `WORLD_STATE.hollow.loot`), people through 117's `npcs()`/`talkTo` (pseudo region `SQHOLLOWP.R`), entrances = kinds `cv_hollow_e<k>`
  (walk up into them, `icvEnter`; `dg` designs too), zones spawn with `rgMake` and are kept in `KEEP` (daylight melt healed back,
  re-added to `en` like 184's EVM), own tiles drawn in `GROUNDHOOK`. Placement never on HARD (or SOFT without Unlock).
- **Talking to sleepers** (`world/194-s202-talk-to-sleepers.js`, `SQSLEEPTALK`): folk asleep (`n.scene` = room+'#bed') are found by bed
  position; the outermost `talk` puts the sleeper in the room's scene at the bed for that call (005's `nearNpc` then finds them), TALK
  button + `SQPADUSE`. 085's imp drops a target that's no longer in `en` (and isn't the world boss) or has no health left.
- **Game feel** (`combat/195-s203-game-feel.js`, `SQFEEL`): end of the outermost `upd` compares nearby monsters' health with last frame:
  hit = sparks, killed (hp<=0 or `_kp` from the outermost `killEnemy`) = smoke puff in `COL` colours; shake = CSS transform on `cv`
  (Options "Screen shake", localStorage `sq_shake`, also gates 015's `shakeScreen`). Monsters inside a solid tile for 0.75 s are moved
  to the nearest free spot (skips big/boss/cb/under/_rp/ghost/wisp). 192 now counts make-all materials when `sqDo` is called (after
  039's station merge).
- **Sound for controller players** (`core/196-s204-controller-sound.js`, `SQPADSND`): browsers don't count gamepad buttons as a user
  gesture, so 006's `ac()` never woke `ACX` for controller-only players. A newly pressed button (own `PREV` after the outermost
  `pollPad`) calls `ac()`; if `ACX` is still not running while `GPON` (and not muted), bar `#sqsnd` asks for a click/key after 1.5 s;
  any trusted pointer/key/touch event wakes it.
- **Guilds** (`multiplayer/197-s205-guilds.js`, `window.SQGUILD`, START > Guild, `ptab` 44): found for `COST` (5,000,000) gold. Database:
  `guilds/<g>/{info{n,tag,col,lead,t}, m/<uid>{r l|o|m,n,j}, q{k,goal,p,c,t,by,done}, prog{qd}, perm{o,m} (withdrawals a day, -1 none), bank{i,v,lid},
  isl/<cell>=node key, wd/<uid>{d,n}}`, `glog/<g>/<id>` (create-only, read by leader/officers), `gname`, `gmem/<uid>`, `ginv/<uid>/<g>`. Every bank change
  is one multi-path update (`bankUpdate`): counts + `v` exactly +1 + `lid` naming a new glog entry in the same write, so the rules refuse stale/duplicate
  changes and unlogged ones. Quests `QK` (fixed goals, the rules check them: wood/mine/forage 100,000, fish 50,000); progress counts like 120's dailies
  (items arriving in a frame with that skill's XP) and is added with a transaction every 8 s (max +5,000 a write); when `done`, a leader/officer `claim(i)`s
  one of `QK[k].rw` (prog/qd +1 with q removed). Island = region `gi_<g>` registered only on members' games (`register`, cached in localStorage
  `sq_guild`; `routeOpen` wrapped, other `gi_` ids closed); the outermost `loadRegion` removes stray objects and plants `NODE` items from `isl`
  (`it._gn`; void sapling = tree with `v:'dark'`). Board/bank use `use:'gboard'|'gbank'` (outermost `useFurn`); banner `gflag` drawn in the outermost `drawFurn`.
  Presence carries `gt`/`gc` (061, both ends); `[TAG]` drawn via `SQPEERFX`. Player menu (130) asks `SQGUILDPM(u)`/`SQGUILDINVITE(u)`. Rules: `guilds`,
  `glog`, `gname`, `gmem`, `ginv` (publish them). Rules were tested with a local evaluator (scratchpad `rulesdb.cjs`/`rulestest.cjs`), not the real emulator. The real SDK's `ref(db,'')` throws (empty path): use `ref(db)` for the root (197's `ref` helper does). **RTDB rules have no `numChildren()`** (the console refused it): the 30-member cap is the game's (`MAXM`), and the rules let the leader delete the whole guild.
  Guild screen classes are all prefixed `gd` (`gdgr`, `gdgi`, ...): 011/007/022/... already use `.gr`/`.gi` (crafting/anvil/furnace rows), and
  197's first `#pn .gr` rules restyled every station screen. **Prefix the CSS classes of new panels** (check `grep 'class="name"'` first).
- **Yards count as outdoors for weather and fighting** (`items/198-s206-yard-weather-and-training.js`, `SQYARDOUT`): `ROOMS.yard/court.cave`
  is a getter that is true only while the outermost `castSpell`/`shootAim`/`castUlt`/`drawCrosshair` run in a yard (the "Not indoors!" checks
  read `SCENE.room.cave`; everything else still sees a normal room: no cave darkness/music/caveAttack). The outermost `drawHUD` draws 021's
  `drawWeather` in yards, and `biomeHere` in a yard = the Hollow biome around the house door (`SCENE.ret`), grass for island homes.
- **Guild perks** (197, see its header): `prog/<wood|mine|forage|fish>` = skill ranks (claim adds 1 to the quest's skill; the rules
  check it against `q.k`), +10% XP (outermost `addXp`, `arguments[1]` scaled) and 10%/rank extra items (upd, same frame rule as quests)
  per rank (max `RMAX` 5). Buildings `BLD` by guild level, placed at runtime by `applyBuildings` (`_gb` lm items in `spots(R)`, kept free of
  planting by `reserved`): horn (`routeGo(REG)`, 3 min cooldown in localStorage `sq_ghorn`), forge (`gstation` items drawn with
  `drawStation`, TALK = `openStation`), shrine (`LUX.BUFF` wis+regen 20 min, once a day `sq_gshrine`), hall (`maxM` 40, +5% XP).
  Planted nodes regrow after 60 s (`g2.at-=180` in upd); 061's `resSubRegion` skips `gi_` regions (not shared world-wide).
  Guild chat: `gchat/<g>/<id>` {u,n,m,t}, 061 has chat tab `gd`, `/g`, `.gld` lines, `window.SQMPLOG(k,m,extra)` = the block's `mpLog`,
  `window.SQGUILDSAY`. Leaderboard `glb/<g>` {n,tag,col,lv,m} (members write when it changes, `pubLB`). Rename: `info.rn`, cost
  `RENAME` after the first, gname moved in one update. Tag: `retag` (leader, free) writes `info/tag` (rules: 2-4 A-Z0-9). Panel messages: `tell()` = say + a note card on top of the guild screen (8 s).
  Rules: `gchat`, `glb`, `guilds.prog`, `guilds.info.rn`, `gname` (publish them).
- **Jewelry make-all** (086, edited in place): `data-jw="all"` → `jwMake(k,true)` = `sqDo('craft',jwCan(j),...)` and `SQDO.tot` for 109's "N left".
- **Void Treant** (`combat/199-s207-void-treant.js`, `window.SQGTREANT`): a weekly guild boss. Void trees (`o.v==='dark'`) give `voidlog`
  instead of plain logs (outermost `attack`, log deltas converted). The leader/an officer spends 50,000 void logs (`SUM`; the rules check the same number) from the bank (197's
  `bankUpdate`, log `w:'boss'`) and writes `guilds/<g>/boss` {w: week = floor((now-4 days)/7 days), t, by}; any member writes `k` when it
  falls (sqEvent 'islandboss' with a `gt_` id is swallowed there: no chapter-two `ibk`, achievements' `ibw` +1). While `w` is this week
  and no `k`, 197's applyBuildings adds a `gportal` lm item (use `gtreant`) on the guild island; the fight is 100's island-boss arena
  under id `gt_<guild id>` (the `SQIB` entry is non-enumerable so 111a/111d don't list it; `DKIND['ib_'+id]` registered every frame),
  drawn through `SQIBART` from the `TP`/`TR` pixel rows. Loot every fight: `eq_wvoid` (wand, element `void` in `WSP`, spellDmg +4,
  Magic 50, every 4th void hit heals a heart; 029's storm branch becomes VOID RIFT for it). Melee hits on it add 1 + axe tier +
  Woodcutting/10. 197 exposes `SQGUILD.api` (bankUpdate, tell, fail, boss, ref, DB, rec = G.boss, applyBuildings...). Rules: `guilds.$g.boss`.
- **Homes on guild islands** (197): 067's applySave drops `rh` houses whose region isn't registered, and a save loads before the
  database says which guild you're in, so a house on the guild island vanished on a device without `sq_guild`. 197's outermost
  applySave registers the `gi_` island named in the save's `rh`/`region` first (adopting it as G.id when none is known); `rh` entries
  on another guild's island are packed into the bag (`packRaw`: house/castle, furniture, chest and yard contents), and `leftGuild`
  packs homes on the island being left (`packLeft`).
- **Bag listing**: the bag shows `BAG_ORDER()` (011) = fixed keys + `EXTRA_BAG`, and 086 copied every item known at that point into
  `EXTRA_BAG`. **An item added by a later section must push itself into `EXTRA_BAG`** (199's `voidlog` didn't and was invisible), and give
  `iconURL` a picture for it.
  `BAG_ORDER()` is de-duplicated (a key in both `BK` and `EXTRA_BAG` was listed twice), so pushing a key that's already listed is harmless.
- **Guild bosses framework** (199, `window.SQGBOSS`, alias `SQGTREANT`): `SQGBOSS.add(kind,{path,pre,need,unit,costTxt,have(bank),pay(bank)->changes,
  DEF (the SQIB entry), sk, bonus(), spots(R), spr, draw(b,tm), drawPortal, texts...})`. Each kind = record `guilds/<g>/<path>` {w,t,by,k} (its own
  rules node), arena id `<pre><gid>`, a `gportal` lm item with `bk` = kind (197's applyBuildings adds `SQGBOSS.portals(R)`; spots must have dry
  open ground below, where `ibEnter` puts you back), the guild screen's **Bosses** tab (`data-g="gtb:sum:<kind>"`). 199's outermost `upd`
  re-applies the island's buildings when `SQGBOSS.key()` differs from the room's `_bk` stamp. A summon also spends 1 rank of the boss's skill
  (`pk`: treant `wood`, turtle `fish`; `prog/<pk>` - 1 in the same update, `prk(k)` reads it): the boss/turt rules require
  `prog/<pk>` >= 1 and exactly one less in the write, and `prog` has a matching branch (leader/officer, qd unchanged, only that skill
  down by one, the boss record written with by = you and t = now). Ranks above RMAX are kept, so spending one there shows no change. Kinds: `treant` (path `boss`, `gt_`),
  `turtle` (200, path `turt`, `gu_`).
- **Giant Turtle** (`combat/200-s208-giant-turtle.js`, `SQTURT`): 5,000 raw fish (`RAW`, 16 kinds incl. 221's moonfin/abeel/akoi since Nov 16, cheapest `SELLP` first; the rules sum the
  16 bank keys' decrease = 5000, none rising; a new raw fish needs both RAW and the turt rule regenerated), whirlpool by the pier, attacks with 100's new `bubble` shots and `water` geysers (100's charge/
  leap lines now use the boss's own name), crab adds; melee + 1 + Fishing/10 + rod tier. Loot `turtfrag` ×1 + 25 swordfish. **Turtle armor**
  `eq_thelm/eq_tbody/eq_tlegs`: anvil 1/2/2 fragments (Smithing 75/80/78), Defence 50, held as armor tier 5 with `TT` flags (save `tta`,
  KNOWN49) like the Outlaw's hat; +3% block a piece, 2 pieces +5%, 3 pieces +5% and blockCap +5%; look = 084's plate recoloured (`ttk`).
- **Guild bank deposit buttons** (197 `depositMany`, `GRP`): put in all void logs / raw fish / logs / ores, or everything (two taps), as one
  bank change with one log line (`k:'*'`, `d` text). Log lines with a text `d` show it as is.
- **Capes** (`items/201-s209-guild-capes.js`, `SQGCAPE`): 201 paints every cape (Marlo's `ch.cape` and the guild cape), not 085; the outermost
  `kitBuild` strips the cape fields so the 16x32 kit never has one. `cloth(ch,dir,st,tick)` paints the cape as cloth at half-pixel detail in the
  48x56 box (anchor 24,44; kit at (16,19); hd pixel (X,Y) = kit ((X+.5)/2-16, (Y+.5)/2-19)) from shape tests in kit pixels: back = collar rolling
  over the shoulders, fanned folds (`fold`, nF), wavy hem at the ankles, swings sideways with `st` 1/2; side (facing right, back = left) = a dome
  over the shoulder, wraps the back of the body, billows/ripples behind when walking; front = the same shape as a darker lining behind you plus
  shoulder pieces, cords and a clasp on top. Width comes from the bare kit's torso (rows 22-26), never from worn looks. `tick` (650 ms, test
  override `window.SQCAPETICK`) makes it stir while standing. 111a's cP wrapper calls `window.SQCAPEUNDER` before the character (front lining)
  and `window.SQCAPETOP` after it and after drawWorn (everything else, for characters with or without worn looks). The top layer skips `cov`
  pixels: `sil()` draws the character through 111a's `window.SQCHDRAW` (inner cP + drawWorn into any canvas) twice, with and without head-slot
  worn looks, and marks where they differ: hoods/hats go over the cape, robes/armour (body/legs looks) go under it. Its edges (`E`) come from the
  render without head pieces, and widen the cape to cover a robe's torso (hd rows 82-91) and flare over its skirt (92-99); side view keeps its back
  edge behind the robe (`backAt`). 2-half-pixel outline like the kit's; trim only along the hem. Emblems `EM`: 4x4 ones
  drawn at 2x2 half pixels, 8x8 ones (Tree, Fish, Skull) at one half pixel each. Guild cape: worn from the guild screen's Members tab (`gcw`,
  KNOWN49); the leader's design is `info.cp` {c,s,p,t,e,x} (`PAL` 18 colours, `PAT` 5 patterns, trim on/off, `EM` 14 emblems; rules: those keys,
  numbers 0-31), drafted in Settings until Save; older guilds fall back to `info.col`/`info.em`. gearCH adds gcp (c+1), gcs, gpt, gtr, gce, gex
  and drops `cape`; other players get them through `ch` (061's cleanCh keeps numbers 0-99). Guild screen pictures (`pic`) draw through cP.
- **Guild member limit** (197 `accept`/`join`): `maxM()` (30, 40 with the hall) is checked on invite, again before joining from the public
  `glb/<g>` entry (`m` members, `lv`; `capOf(lv)`), and after joining (`JOINCHK` in `listen`): if the guild is over its limit, the newest
  joiners by `m/<uid>/j` step back out (a pending server timestamp counts as newest). The database rules can't count members.
- **Island boss lairs close after a win** (100 `ibKick`, `window.SQIBKICK`): `ibReward` (run on every fighter's game) schedules a
  `leaveScene()` 6 s later if you're still in that boss's arena (`R.ib`), clearing `ST`; retried while you're at 0 health. Guild bosses
  (199/200) use the same arena, so they close too. Staying inside used to allow another fight without new shards.
- **Wiki > Guilds** (075, `WK_TABS` `guild`, `WK2.guild`): founding, island, quests/ranks, buildings, bank, guild bosses (pictures from
  `SQGBOSS.K[k].spr()`, costs from `need`), Turtle armor and capes. Update it when guild features change.
- **Combat balance** (`combat/202-s210-combat-balance.js`, `window.SQCOMBAT`): the outermost `attack` ignores a swing that would hit a
  monster (`target()`: within 20 px of `front(13)`, 30 for big/boss) until `MELEE_GAP` (0.4 s) after the last swing that hurt one; the
  game's own `swing` is 0.25 s, which holding R2 (023's repeat) or Space used fully. Gathering swings aren't affected. Measured sustained
  damage per second vs one target (scratchpad `bal/dps.js`, levels 10/45/90 with that tier's best gear): melee 10/25/36 (52 with Tactics
  at the same level), bow 6/24/34, wand 2/16/~12 (mana: cost 2-3, regen ~0.5-2/s, so a wand empties in seconds).
  Since Nov 15 the same file also makes `WSP[el].cost` an accessor (base - 1, at least 1; 111a2's setCosts and Dev Suite `mp` rules write
  the base), triples mana regen (small per-frame rises in the outermost `upd` get 2x more added; potions untouched), and adds +1 to
  `arrowDmg` and `spellDmg`. Measured after: melee 10/25/36, bow 8/28/35, wand 7/22/31 (mana holds).
- **Arrows online** (`multiplayer/203-s211-arrows-seen-online.js`): 064 only sent fx 'ar' from its `shoot` wrapper (021's old HIT
  auto-shot); every off-hand shot goes through `shootAim`, so the outermost `shootAim` now sends 'ar' for the arrows it added. A new way
  to fire projectiles must send its own fx event (`SQPVSEND`), or other players won't see it and PvP can't count it.
- **Projectiles over water** (021's `projBlocked`, a top-level const, edited in place): any tile `fishWaterAt` counts as water (islands'
  `R.tiles===0`, Hollow's sea, 145's yard ponds) lets arrows, spells and other players' projectile ghosts through; before, scenes used
  `solid()` only, so on islands every shot stopped at the shore and a shot from a boat (`SQRSAIL.on`) died on its first frame.
- **Chest tools** (`items/204-s212-chest-tools.js`, `window.SQCHEST`): chest screen header with the name, ✎ RENAME (inline form, owner only: not
  `_sh`/`_foreign`), TAKE ALL (own chests at once + one save; shared chests through 072's `chestMove` per item) and SORT (type/name/amount/value,
  localStorage `sq_chsort`; `gridHTML` is wrapped only during `chestHTML`). Name = `nm` on the chest object, `SQCHNAME` cleans it (max 12):
  furniture rows are `[i,t,items,nm]` in 012/067/145 saves and `[i,t,0,nm]` in what 061 (`houses/`) and 145 (`yards/`) publish; 061's
  `buildForeign` and 145's visitor read take it back; island homes (incl. guild islands) go out through 067's `rbPub` `_h` (same `[i,t,0,nm]` rows,
  read back by `rhForeign` → `buildForeign`). The outermost `drawStruct` draws the placard (text shrunk to fit, `fillText` maxWidth).
  010's document keydown (capture) stops every key typed into an input and blurs on Enter, so Enter/Escape for a panel input must be
  handled by a `window` capture listener (forms in panels never get `submit` from Enter).
- **Panel numbers (`ptab`) must be unique**: 124's Custom Controls used 34, which is 064's PvP screen, so START > PvP opened Custom
  Controls (Nov 15; now 45). In use: 0-8 (built-in screens), 31 style, 32 trade, 34 PvP, 35 achievements, 36/37 player menu/duel,
  38 party, 39 emotes, 40 report, 41 eating, 42 quest choice, 43 events, 44 guild, 45 controls. Grep `TAB=` and `ptab=` before picking one.
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
- **Pets at home** (`items/206-s214-pets-at-home.js`, `window.SQHOMEPETS`): every pet item (`pet_<kind>`, 104) is pushed into `BK` (also on
  `SQA.onApply`), so the bag shows PLACE and every home loader/publisher keeps rows `[i,'pet_<kind>']` like furniture (houses, castles,
  island/guild homes, yards). The row is only the pet's home spot (not solid: the outermost `solid` treats it as a rug). Each pet is a local
  simulation (`PS`, key `<house _oid|id>:<i>`, modes idle/walk/nap/chase/flee/zoom/greet/follow/petted, `choose`/`tick`, walls via
  `solid`), run and drawn in the outermost `pP` (before the player when above, after when below) through the game's drawers with a state
  {x,y,mv,t,fl}: 111a `window.SQPETLOOK`, 093 `SQDRAWNPET` (`SQNPET`/`SQSIDEMAP`), 085 `LUX.drawPetS`, Imp `LUX.impDrawS`. Nothing is sent;
  visitors run their own copy. HIT finds the pet by where it stands (`front()`): pat = hop + heart; the owner's second HIT within 3 s =
  `pickFurn`. 118's hitWord says PET / PICK UP. 145's yard `canPlaceIn` refuses pond tiles (`fishWaterAt`). Old clients drop unknown
  furniture rows on load, so pets need this version.
- **Young players** (`ui/207-s215-young-players.js`, `window.SQAGE`): once per account a birth-year question (`#sqage`, pauses `upd`, owns
  `navRoot`) stores only the age band in `age/<uid>` {b:'c'|'t'|'a',t} (player can write it once; devs can correct it) + localStorage
  `sq_age_<uid>`. `c` (under 13): chat input read-only, PHRASES only (outermost `window.mpSend` checks `PHRASES`), `SQTRREQ` only to friends,
  PNAME 'Adventurer' instead of the Google name. **The database rules enforce it too**: chat/gchat/pm text from a `c` account must match
  the phrase regex (apostrophes are `.` in it), pm/treq/dreq to or from a `c` account need the child's `friends/<child>/<other>`.
  **Keep `PHRASES` and the rules regex identical.** The PHRASES button (everyone) sits in 061's `#mpf`, list `#agpl`. Test harness:
  mp3lib's `world(n,co,ages)` seeds `sq_age_<uid>`='a' unless `ages[uid]==='ask'` (fake3's db only enforces rules on guild paths: test
  rules with `rulesdb.cjs` directly, scratchpad `kidrules.js`).
- **Chat filter** (`multiplayer/208-s216-chat-filter.js`, `SQFILTER.clean/bad`): lists stored shifted by one letter (`un`); long words match
  anywhere after letters-only + leetspeak + squashed repeats, short ones whole-word; emails, phone numbers and links (not skillquestmmo.com)
  starred. Wraps window.mpSend, SQGUILDSAY, SQPARTYSAY, window.SQCHNAME (204's rename calls it), refuses names at 061's `#nmf`.
- **Account and privacy** (`ui/209-s217-account-and-privacy.js`, `SQACCOUNT`): Options > ABOUT (links to `terms.html`, `privacy.html`,
  `refund.html` + `legal.css` at the repo root, plain files, not built) and "Delete my account" (type DELETE; stops saveLocal/saveCloud,
  removes the owner-deletable records, deleteUser, sign out, clears sq_* storage, reloads; guild members leave first). Retention promised in
  privacy.html and done here: own pm > 90 days on sign-in; a dev's game once a day removes chat > 90 days, bugs/reports/stats days > 1 year
  (rules let devs delete bugs and stats/d days). `SECURITY-PROGRAM.md` = the COPPA written security program (review yearly).
  **If data handling changes, update privacy.html.**
- **Patrons** (`multiplayer/210-s218-patrons.js`, `window.SQPATRON`): `patron/<uid>` {s,u (paid through, ms),c (fire cape, kept)} written
  only by devs (Dev Suite > Art Room > Patrons; later the payment server), read by everyone signed in (onValue on the whole node, `PR`).
  Active (u > now) = our own 9x11 pixel flame (`FL`, 2 frames; `SQFLAMEURL`) left of the name/OG crown over heads (outermost drawHUD,
  same layout as 061's `one`) and before `b.nm[data-u]` in chat lines (MutationObserver on #mpl). Fire cape: worn from START > Style (212), save `fcw`
  (always written), gearCH `fcp:1`; 201's `spec` gives `fire:1` (fireCol palette, flame tongues on the hem, 8 frames at 110 ms via
  `tickFor`); peers' `ch.fcp` is deleted every frame unless their patron record has `c`. Credits = ptab 46 (Options > ABOUT > Credits):
  `pcred/<uid>` {n,t} written by each patron's own game (opt-out `sq_pcred`; rules: patron record exists, not under 13), alphabetical,
  no amounts; `artcred/<id>` {n,w} for approved art. `PATREON` = the page URL. **Patron screen** (START > Patron, `ptab` 48, `showScreen('patron')`, `SQPATRON.open()`): status, perk cards (fire cape → Style, Art Room, credits toggle), a fire-cape picture (212's `SQCAPEX.picWith`), Become a Patron (`.sqpatlink`, signed in, age band known and not `c`, not active) and Link Patreon. The SMI item is added/removed in a `rSM` wrapper (`showMenu()`: signed in and a patron record, or a known non-`c` age band); Options keeps Credits + a Patron button. Patreon membership isn't linked to accounts automatically yet: devs grant `patron/<uid>` by hand (Art Room > Patrons). terms/refund/privacy.html name Patreon. **Don't name file-level consts `W`, `H`, `P`, `T`, `K`... : they hide the game's
  globals (`W`/`H` = screen size, `P` = the player) inside the section** (the flame first drew nothing because of a colour named W).
- **Art Room** (`ui/211-s219-art-room.js`, `window.SQARTROOM`, ptab 47): for active Patrons who aren't under 13. Pixel editor (up to
  48x48, 8 frames, onion skin, preview, palette slot 0 = clear, draft in localStorage `sq_art_draft`); SEND writes `art/<uid>/<id>`
  {n,k,w,h,f,ms,note,who,t} (f = JSON {p:[hex],fr:[one `CH` char per pixel, '.' clear]}); rules: create-only by active 13+ patrons, no
  st/re from players, no deleting approved pieces. Dev Suite > Art Room (`artroom` tab): animated previews, Approve / Not this time (st,
  re, a gift message, `artcred` on approval; separate `set`s, not a multi-path update), "Copy frame" = Dev Suite clipboard `sq_dev_clip`
  {w,h,p:[hex|'']} for pasting into any picture editor, Patrons list with +1 month / End now and add-by-search. The game-wide CSS
  `canvas{position:fixed;inset:0;width:100%;height:100%}` covers every canvas: panel canvases need `position:static` and sizes.
- **Bug fixes Nov 15 (afternoon)**: 087's island fire loop only burns fires the inner `upd` didn't already burn this frame (001's
  loop runs on islands too now; both together made island campfires last half as long). 162's `regItem` builds `IDESC` for Content
  items as stats line (heal/food, pot mana) + own words, with a plain default when `d` is empty (`window.SQSTATS` is 171's `{day}`,
  not 084's stats function: don't call it). 086's equipment screen lists bag jewelry per slot (Put on / Swap to, `data-jw="wear"`).
- **Database download traffic** (Nov 15): the database forwards every write to every listener, so download cost grows with players².
  061's `mpTick` sends only the presence fields that changed (`MP.sent`), the whole record only after a reset (`MP.last=''`), and `t`
  only with the 5 s heartbeat (peers' `seen` needs it within 20 s); `MP.pw/pb` count writes/bytes. 061's monster sharing sends the
  whole `mobs/<loc>/<uid>` set once (`MOB.sentM`), then `update`s of changed paths only (`m/<id>/<field>`, removals as null; numbers
  besides x/y/hp only when they move by 1+ or change sign; x/y rounded; `t` every 2 s, peers drop a set after 6 s); `MOB.mw/mb` count.
  111a's `refresh()` reads `assets/live/v` first and skips the ~265 KB library when the device already has that version (`force` to skip
  the check). **New presence fields or listeners on whole nodes cost download for every player online: keep them small and rare.**
  Test harness: scratchpad fake3's `_update` now applies slash paths like the real SDK.
- **Patreon link** (`functions/` + 210 + 211): Firebase Cloud Functions (v1, us-central1, Node 22; `firebase.json`/`.firebaserc` at
  the root, deployed by hand, see `functions/README.md`): `patreonAuth` = OAuth redirect (state `<uid>.<nonce>` must match `plink/<uid>`
  {n,t} written by the game on click, 20 min, used once), reads the membership (identity.memberships), keeps `pmap/<patreon user>` = uid (webhooks for a Patreon user not linked yet are kept in `ppend/<patreon user>` {a,t} and used at link time within 3 days; both functions log statuses, no personal data; a relink to another player removes a patron record started in the last 7 days from the player it was linked to before, or ends an older one)
  and `puser/<uid>` (no client access) and writes `patron/<uid>` {s,u,c} with the admin SDK; `patreonHook` = webhooks (HMAC-MD5 of the
  raw body with `ws`) keep `u` in step. Decisions in `functions/lib.js` (`paidThrough`: active = next charge + 3 days; else last paid
  charge + 31 days; `merge`: active never shortens, inactive never extends, cape kept), tested by `node functions/test.js`. Settings:
  `cfg/patreon` {cid,cs,ws,camp} (write devs, read nobody: only the functions) and `cfgpub/patreon` {cid, cs/ws/camp booleans, t} (read
  signed in), both written from Dev Suite > Art Room > "Patreon link". The game shows Link Patreon (a real `<a>` to Patreon's authorize
  page, `data-plink`) only when `cfgpub/patreon.cid` is set, signed in, age band known and not `c`. `.sqpatlink` clicks are kept from the
  panel's button handlers (they ran `shopAct`). Rules: `plink`, `cfg`, `cfgpub` (publish them).
  **Email matching** (Nov 15): `patreonSync` (every 6 h) / `patreonSyncNow` (database trigger on `cfg/patreon/go`, the Art Room's Sync now)
  list the campaign's members with the creator token (`cfg/patreon/ct`/`crt`, renewed on a 401 and saved), and link members not in `pmap`
  whose Patreon email = a verified Firebase Auth email (`getUserByEmail`); a player already linked to another *active* member is never taken
  over (`mayRelink`); a link to an account with no membership is replaced. The webhook tries the same match before `ppend`. Emails are never
  stored or logged. Result counts in `cfgpub/psync` (server-only write). Tests: `node functions/test.js` (24 checks).
- **One cape picker** (`ui/212-s220-one-cape-picker.js`, `window.SQCAPEX`): 085's Style screen (ptab 31) lists Marlo capes plus `SQCAPEX.opts()`
  (guild cape while in a guild, fire cape when `patron/<uid>.c`), with a back/front picture (`preview()`, cP at 3x). Picking one takes the
  others off (`pick(id)` sets 201's `SQGCAPE.wear` / 210's `SQPATRON.wearing`; 085 clears `COS.cape`). Saves unchanged (`gcw`, `fcw`, `cos.cape`).
  The guild screen's cape card and Options > PATRON only link to Style (`gcp:style`, `data-pcr="style"`). A new cape goes in `opts()`/`pick()`.
- **Art Room editor** (211, rebuilt Nov 15): sticky icon toolbar (pen/erase/fill/pick, move when zoomed, mirror, undo/redo, zoom 1-6, grid),
  canvas sized by `fit()` (width, and half the screen height on phones) × `A.zoom` in `#arbox` (scrolls when zoomed; two fingers / move tool /
  Space / middle button pan), palette strip + current colour (a colour input over it), frames strip with `+`, preview and speed, then a
  separate `send` view (name, kind, note). `#pn.sqart` widens the panel to 980px; two columns at ≥760px. Keys: B E G I M, Ctrl+Z/Y, +/-.
- **Paintings and the Patron Art Gallery** (`items/213-s221-paintings-and-gallery.js`, `window.SQPAINT`): `paintings/<id>` {n,by,u,w,h,f,ms,p,t,off}
  (devs write via Dev Suite > Art Room "Approve as a painting"; signed-in read, onValue; cached in localStorage `sq_paint`). Items `pt_<id>` (bag/easel)
  and `pw_<id>` (hung): a hung painting is stored on the floor tile under the wall (row 2) because every home loader drops rows 0-1; it isn't
  solid and is drawn on the wall band. Placing facing the wall row (`facingWall()`) hangs it (`wallOK`: not over windows/room wall items, not
  the back door, houses and castles only); HIT facing it picks it up. `applySave` first registers every `pt_/pw_` key found in the save
  (`scan`), so saves never lose them before the records arrive. Artist's free copy: `ptg` in the save (KNOWN49). Gallery: BLD `gallery`
  placed at library `places.gallery` {tx,ty} (Dev Suite > Art Room "Put the gallery's door where I'm standing": you stand on the doorstep, `standHere`/`tryPlace`, saved to the draft; applied through `SQA.onApply` → `applyChosen`) or else `spot()` (free 5x2 + a free row in front, nearest the village centre, inside the village preferred, never on/against `HOUSES`); `place`/`unplace` record and undo everything a spot changes (obj, BS, PROT, sign), room `gallery` (wall frames `_ptw`, easels `_pte`,
  `fill()` = newest first), curator Iris (NPC kind `gallery`, shop on ptab 2 via the outermost `rPn`, `data-ptbuy`). A label naming the
  painting and artist is drawn in the outermost `drawHUD` when you face one. `SQPAINT.charLayer(dir,gear)` = your character as a 96x112
  worn layer (211 shadows `CH`, so it draws it). Rules: `paintings`, `art.k 'wear'`, `art.sl` (publish them).
- **Art Room wearables** (211): mode "Something to wear" (`A.mode==='wear'`, own draft `sq_art_wear`; `sq_art_mode`): 48x76 pixels = the worn
  layer from (24,28), three frames = front/back/side, `sl` helm|body|legs, your character underneath (`under`). Sent as `k:'wear'`. Dev Suite >
  Art Room: "Put it in the Gear editor" builds `worn.<item>` (f/b/s, `h:1`) with `SQA.PXC`/`SQA.pack`, saves it to the draft and opens Gear on it.
- **Skill trees list every item** (`skills/214-s222-tree-unlocks-from-gear.js`, `window.SQTREEAUTO`): the outermost `treeGains(sk,l)` appends
  generated lines: wear/use requirements of every `EQ` item (library `gear.<k>.rq` first, then `e.tt` = Defence 50, 111a2's `defReq`, `e.req`)
  and making levels from SM (Smithing), GOODS/REC/BREC (Crafting), COOKS (Cooking). Skipped when the level's own text already names the item
  (or "<first word> armor"). Rebuilt on `SQA.onApply` and when those lists change size. A new requirement check elsewhere should be added to `reqOf`.
- **Meteor strikes** (`world/215-s223-meteor-strikes.js`, `window.SQMETEOR`): Hollow-only shared event. Schedule from the clock (`sched`:
  windows of `CFG.win` h (24), chance `CFG.per` (.85), 1 h + up to win-6 h in; `realAt` skips a strike under `GAP` 12 h after the previous
  real one, and `sched` skips any within 6 h of a summoned `SUM`); dev `/meteorite [here|stop]` writes `events/met`
  {t,x,y,id} (lands 60 s later). Spot = `ok(x,y)`: 11x7 tiles of open land (no water/tile 3/obj/solid/PROT/BS/TOWNZ/ROADS/BRIDGE/village)
  and none of those or a `HOUSES` house within MARGIN; scheduled spots are agreed through `wb/mts<id>/d/<uid>` (smallest uid wins).
  Shared numbers reuse the existing `wb/<slot>/d/<uid>` rule (no new rules): core damage `mtc<id>`, vein hits `mtv<id>_<i>`, sent at
  most once a second. Core: any level, damage 1 + pick tier + Mining/10, health `CFG.hp`; when it breaks every game ranks the list and
  pays itself once (`CFG.rew`, best ore by Mining 30/45/60 + a tenth in meteorite ore; save `mtp`). Veins: Mining `CFG.vlv`, pick 4+,
  `CFG.vhp` hits, the breaking hit gets 1-3 meteorite ore. Stardust sparkles on the rim (HIT). Crater/veins/core drawn in `GROUNDHOOK`
  (things in front redrawn after the outermost `pP`), solid via the outermost `solid`, HIT via the outermost `attack`, 118's `hitWord`
  asks `window.SQHITWORD` first. Streak/flash/smoke in the outermost `drawHUD`, banner `#mtb`, minimap/area map markers. Items
  `meteorore`, `stardust`, `metbar` (SM smelt: 15 + 15 adamant ore + 3 stardust, Smithing 80). Library `meteor` overrides CFG.
  Test: `SQMETEOR.test(ms, tile)` starts a local strike (where you stand: Hollow or an island).
  Islands (Nov 16): scheduled windows pick a place from `LOCS` (Hollow 3/7, ashfall/briarwood/ironcrest/shattered); island strikes
  have ids `i<k>`, tile = y*R.w+x, picked only by games standing on that island (`okR`: crater cells may hold `_obj` items, which
  `flatten()` hides (gone + rgCellDel + R.solid) while the strike lasts and puts back after) and agreed through the same `mts` slot;
  games elsewhere see the banner "on <island>" (`CUR.known` false). Drawn from the outermost ROOMBG on islands; `here()` = standing
  outdoors where it is. `events/met` takes `loc`. Achievements pushed into 129's `SQACH.A` (group Meteors, counters mtcore/mttop/
  mtvein/mtdust/mtisl).
- **Meteorite gear** (`items/216-s224-meteorite-gear.js`, `window.SQMETGEAR`): all level 75 (`rq2` {s,l}, read first by 214's `reqOf`).
  Armor `eq_mhelm9/eq_mbody9/eq_mlegs9` held as armor tier 5 with `MT` flags (save `mta`, KNOWN49), like 200's turtle armor: +5% block
  a piece, 2 pieces +5%, 3 another +5% and blockCap +8%; look = gearCH `mtk` bits → kitLook recolour. Tools `eq_pick9/eq_axe9` = tier 9
  (TIER_N/TCOL/TIT[9]). Bow `eq_bow6` (tier 6, +3 dmg, +30 range). Wand `eq_wmeteor`, element `meteor` (`WSP.meteor`, +6 dmg): the
  outermost `drawSpells` draws meteor spells as rocks (their `sc` is hidden from the inner drawer for the call), 40% splash in
  `spellHit`; ult METEOR FALL in the outermost `castUlt` when 159's `SQULT.chosen()` is the wand (`FALLS`, drawn in drawHUD, damage
  spellDmg x3 within 48 px on impact; peers via fx `mf`). 159's `WN` names void/meteor ults. Meteorite arrows `marrow` (FREC, 25 per
  bar + 2 void logs): the outermost `shoot`/`shootAim` lend them to `inv.iarrow` for the call (`LEND` adds +2 in `arrowDmg`) and take
  back what was used; projectiles get `met:1`. 214 also lists SQTIER trees/ores, SQBOUL boulders and meteor cores/veins on the
  Woodcutting/Mining trees.
- **Safe trips home and /stuck** (`core/217-s225-safe-travel-and-stuck.js`, `window.SQSTUCK`): 049's `travelCommit` took the island trip's
  return point from `P` when standing in a house/yard/dungeon/lair (the guild horn works anywhere), so the trip home landed at room
  coordinates on Hollow (the sea). The outermost `travelCommit` now `stepOut()`s first (follows `prev` like 067's leaveScene, else
  `SCENE.ret`), and the outermost `leaveRegion` `rescue()`s a bad landing: in the sea → the Tidewatch harbor post (`RG_POST`), inside
  something/boxed in (`good()`: walkable + 25 reachable tiles) → nearest good land within 30 tiles. `/stuck` (`/unstuck`) in chat: out
  of rooms, island → `rgSpot(R)`, Hollow → harbor post; 2 min cooldown (`sq_stuck`), not while dead/travelling/duelling/near a boss.
- **Brewing and daggers** (`skills/218-s226-brewing-and-daggers.js`, `window.SQBREW`/`SQDAGGER`): skill 14 = Brewing (`SQBREWSK`, pushed
  onto SKN/AB/SKC/XPS/SKICON like 028's Magic; `PSK`/`pTree` tree, perks `br_long/wide/twice/thrift/venom/spark/quick/heal`, read with
  `PK(id)` = 036's `perk`). Cauldron = 022 station `cauldron` (STNS/BREC/BK), the outermost `stationHTML`/`stationAct` (actions `cw_<pot>`/
  `cwa_<pot>`: **station actions starting with `b` are taken as shop buys by 107**), timed with `sqDo('craft')`. Art drawn in the outermost
  `drawStation` unless a Props look `p:cauldron` exists. Potions `pot_poison/napalm/zap` are `COAT` potions (not FOODS; USE coats).
  Daggers `idag/sdag/mdag/adag/stdag/metdag` (stdag = Starsteel, tier 5, `mc` = its own anvil materials) are EQ kind `dagger` (028's iconURL draws EQ items as `iconURL(EQ[k].ic)`: an `ic` equal to the item's own key recursed forever and broke every screen showing one, so idag/sdag use `ic:'dagger'`), slot `off` (DAG, save `dag`), +tier in `meleeFlat`. Potion pin `dpin`
  (bag button `data-dpin`). 159's `avail()` also lists `window.SQULTX` entries ({k,n,ok,from,run}); the outermost `castUlt` runs the
  dagger ult (cooldown `DCD`, 20 s / 12 with br_quick). Helpful potions are drunk and shared with fx `dp` {p,to (uid list),x,y}:
  receivers check party/friend + distance and drink without using their own. Coats apply on hp drops during the outermost `attack`.
  While a brew job runs (`SQDO.brew` = potion, `BREWAT` = the tile in front when it started) that cauldron is drawn boiling in the
  potion's colour (`PCOL`/`palOf`), and 114's `localAct` returns 0 for `SQDO.brew` (no crafting saw). HUD chips (coat time, dagger ULT) are added in the outermost `hudLayout`. Flames on every burning monster in the outermost `pS`.
  **Stabs** (`window.SQSTAB`, end of 218): the off-hand button (140's `down` → `SQDAGGER.stab()`, X; right-click capture on `cv`; outermost
  `shootAim` for R1; 082's touch button shows STAB) runs the outermost `attack` with `TL.sword` 0 on its own 0.28 s clock; 202 skips its
  sword gap while `window.SQSTABNOW` is set. The outermost `pP` answers `occ('main')` with the dagger and sets `SLEDGE` false while a stab shows (123 draws it; the sledge won
  otherwise), and the stab's attack also runs with `SLEDGE` false. Peers: 064's `sw` event takes `w` from `window.SQSWINGW()` when set
  (stabs send 20 + dagger tier); 218's outermost `SQSWING` draws that dagger's icon jabbing for `t` 20-29.
- **Shattered Expanse sharks** (093, `SQSHK`): they hunt wounded players near the water but only bite when you're on the water
  (`SQRSAIL.on` or standing on a water tile, `onW`); a lunging shark (`s.a>0`) is drawn after the player so it isn't hidden behind you.
- **Moderators** (`multiplayer/219-s227-moderators.js`, `window.SQMODS`, Options > MODERATION or `/mod`, `ptab` 49): `mods/<uid>` = true,
  written by devs only from the panel's Moderators tab (refused unless `age/<uid>/b==='a'`; the rules' `MOD` also needs it). Tabs: open
  reports (`reports`, Mark handled = `st:'done'`), public chat (delete), private messages (reads the whole `pm` node, filters to/from the
  player), Guild chat (guilds from `glb`, last 150 of `gchat/<g>`, delete; rules let mods/devs read and delete gchat), Muted, plus Moderators and Log for devs. Mute 1h/24h/7d, suspend 24h/7d, lift → `mod/<u>` {mu,ba,r,by,t}; the rules let a moderator
  write only `by` = themselves, never self/devs/mods, at most now+7 days, and never change a longer (dev) mute/suspension. Every pm look
  and action pushes `modlog/<id>` {by,a,u,x,t} (create-only, devs read). Players see a notice in the Private chat tab. Disclosed in
  privacy.html (Moderation section), terms.html and SECURITY-PROGRAM.md: **keep them in step if what moderators can see changes.**
  Rules: `mods`, `mod`, `reports`, `chat`, `pm`, `gchat`, `age`, `modlog` (publish them). Rules test: scratchpad `modrules.js`, panel `modui.js`.
- **Peer monster timers** (061's monster sync): fields matching `CDK` (`tcd`, `scd`, `gcd`, `lcd`, `cd`, `cbt`, `cast`...) are only taken from
  the owner when the copy is created; after that the copy keeps its own. Copying them on every update (the owner's skeleton timer runs
  far below 0 when nobody is in range) made copies of skeletons throw on every database update. New reload timers: end the name in `cd`.
- **Campfire logs and feeding** (`skills/220-s228-firemaking-logs.js`, `window.SQFIRELOGS`, `ptab` 50): tiers `T` (wood, oak 15, willow 30, maple 45,
  yew 60, void 75: per-log XP `pl`, life multiplier `m`, feed seconds `fs`). The outermost `fire` opens the CAMPFIRE picker only when there's a choice
  (a tier log you can burn, or your own fire next to you); plain wood with nothing near builds as before (`SQFIREDIRECT` skips the picker).
  A tier build lends 3 wood to the game's own fire() (timed by 109) and `PEND` waits in the outermost `upd`: the new fire gets `lg`, life x`m`,
  extra XP; no new fire and no job running = wood taken back, logs returned. Feeding: 1 log, +`fs` s (cap 30 min), `pl` XP, `lg` raised.
  Extra/feed XP is added with `window.SQFIREXTRA` set, which 120/143/129 check so it doesn't count as another fire lit. `lg` is kept in
  saved fires (061 snap, 006 load) and shared fires (061 FIRE sync, clamped 0-5); the outermost `pF` draws it in `PAL` colours unless a
  `p:campfire` look exists. Skill tree lines via the outermost `treeGains`.
- **Fishing 70/80/90** (`skills/221-s229-deep-fishing.js`, `window.SQDEEPFISH`): moonfin (70, night: `dark()>.25`), abyssal eel (80, shattered/
  ironcrest), ancient koi (90, anywhere, 6%) through `window.SQFISHX`, which 093b's catch hook checks before the Dev Suite's `SQGFISH`
  (entries may have `ok()`). Raw `k` + cooked `c<k>`, COOKS/FOODS/icons/tree lines. Not in 200's turtle `RAW` (fixed by the rules).
- **Guild ponds and one angler per spot** (`skills/222-s230-ponds-and-fishing-spots.js`, `window.SQPONDS`): 197's `QK.fish.rw` = pond items
  `gp_trout/salmon/sword/moon/koi` (+ bait); `NODE` has them (`PONDK`), `canPlant(k)` checks a 3x3 patch in front (middle = front cell +
  facing) plus a ring of land around it, `plant` stores `isl/<middle>`, `dig`/`spotOK` find a pond by any of its cells (`pondAt`).
  197's `applyNodes` calls `SQPONDS.apply(R,want,pondCells)`: those cells become water (`R.tiles` 0, originals in `R._pondO`, put back when
  dug), `R._ponds`, and the island's `RGCK` chunks are dropped so the ground is rebaked. Pond fishing = entries at the front of
  `window.SQFISHX` (093b, which now calls an entry's `got()` after a catch) whose `ok()` checks the bobber is in a pond of that kind with
  stock left (per player, localStorage `sq_pond`, 30, +1 per 120 s); chances trout/salmon/sword .6, moon .4 any time, koi .15. Library
  `ponds` {p,stock,refill} overrides. The rules needed no change (isl values are any short string, rewards aren't checked).
  One angler per spot (everywhere): the outermost `attack` calls off a new cast whose bobber tile equals another player's (same `mpLoc()`,
  presence `ak` 3-5, their bobber = tx/ty + facing x 24); two casts at once: the larger uid reels in within 3 s (outermost `upd`).
- **Nov 16 report fixes** (`items/223-s231-bug-fixes-nov16.js` + edits): the cauldron is in 033's `STCH` (uses house/nearby chests; 223 adds the
  chest line 218's `stationHTML` skips). 083's `tierHit` and 096's `boulderHit` roll 038's `STAYP` (`sumP(sk,STAYP)`) before `done()`, like 038/050
  do for plain rocks/trees. 067's `enterScene` wrapper never gives an island scene a `prev` (a region loaded while standing on a region, e.g.
  049's applySave or 111g's `refresh`, got the old island as `prev`, and 067's `leaveScene` then "sailed home" to it). 001's night fire glow is
  culled to the screen and merged per 32 px cell (max 24 glows a frame). Note: fishing (007's upd) pauses while a panel is open.
- **Grave lock** (063, in the MP block, edited in place): `GRAVE_LOCK` 5 min from `g.at`, `grvLock(g)`; others see the items but no TAKE
  buttons and `grvTake` refuses. The rules check it too: `graves/$gid/i/$k` writes need the grave's `u` or `at < now - 300000` (publish them).
- **Arrow ladder** (`items/224-s232-arrow-ladder.js`, `window.SQARROWS`): `mitharrow` (Archery 40) and `adarrow` (55), 15 a fletch; damage over
  plain arrows iron +1, mithril +2, adamant +3, meteorite +4 (216's LEND bonus is 3). The outermost shoot/shootAim lend the best special
  arrows to `inv.iarrow` for the call (meteorite left to 216's own lend) with `BON` added in `arrowDmg`; `bowTarget` counts them; shots get
  `p.ah` (head colour, 021's drawProj). 021's fletch/equipment lines and 010's arrow chip list every arrow kind: a new arrow goes there too.
- **Vessa's potion stall** (096, edited in place): NPC role `potions` at Emberwatch with an `afstall` item; `POTAF` (`window.SQPOTAF`) =
  potions she sells; she buys any of them for `potBuy(k)` = 1.5x SELLP, always below her own price (data-af `p<i>` buy, `q<key>` sell).
- **Better maps** (`ui/225-s233-better-maps.js`, `window.SQPIN`): the outermost `drawMini52` shows `SPAN` (48) tiles around you. All older
  minimap hooks map tiles as `x0 + u/t.w*w` from `hudLayout()`/`miniTarget()`, so for that call it swaps in a fake target (w/h = the window in
  tiles, `rw/rh` real, `fake:1`) and a layout whose box origin is tile 0,0; everything is clipped to the box; 052 draws the terrain zoomed and
  skips its frame/player dot when `t.fake`; 105's `SQMINIBOX` is set back to the real box. New minimap markers: keep using that formula.
  Pins: tap `#mpc` (HERE) = `PIN` {a,x,y tile} in localStorage `sq_pin`, on-screen arrow in drawHUD, cleared within 1.5 tiles. Party pins:
  `pings/<party id>/<uid>` {a,x,y,t} (rules: own uid, party id [a-z0-9]{1,12}; publish them), written by `partyTick` (0.7 s) when PIN changes,
  listened per party; members' pins (`PP`, only uids in `SQPARTY.members()`) drawn green on minimap/map (labels `c:'p'`)/ground, with a say on a new one. Map labels:
  the outermost `mapHTML` wraps `#mpc` in `.sqmpw` with a `.sqmpl` label layer (towns/dungeons/harbors on Hollow, pier + found landmarks on
  islands, greedy no-overlap) and drops legend spans naming only labelled places. Guild quests: an `SQQEXTRA` entry `gq:<guild>:<t>`, no arrow (102
  exposes `SQTRKSET`, `SQTRKID`, `SQNEAROBJ`, `SQCURAREA`); towns no longer `say` a welcome on entry (020/041/044/046); 197's quest card shows `SQGQTRKBTN()` (`data-gqtrk`).
- **Guild sails** (`items/226-s234-guild-sails.js`, `window.SQSAILS`): START > Style gets a Boat section (added after 085's Style screen in the
  outermost `rPn`, `#sqboatsec`, `data-bsail`); save `gsw` (always written). gearCH carries the guild cape design as `slc` (c+1) `sls slp slt
  sle slx` while worn in a guild. The outermost `drawBoat26` finds whose boat it is (a sailing peer exactly at P, else you) and sets `CURD`;
  `BOAT85.back` is wrapped to return a recoloured sail layer (SA colours → main colour, RD band/pennant → second colour, pattern by position,
  trim on edges, emblem as large as fits (4x4 at 3x/2x, 8x8 at 2x/1x) with a contrasting outline, on cloth outside the sailor's box x±9, y -38..2, nearest the free cloth's centroid; end-on sails (symmetric about the mast) put it on the centre line and only search its height), cached per canvas + design. Furled/moored boats stay plain. Wiki > Guilds mentions it.
