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
- **Custom controls** (`ui/124-s129-custom-controls.js`, `window.SQKEYS`, Options > Controls, `ptab` 34): keyboard binds in
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
- **Voyages** (051): Sera (`n.id==='sera'`, Tidewatch) runs every voyage: `navCards()` on her `twPanel`, `nav_acc/rep/hand`
  through `xAct` → `voyAct(a,true)`. Harbor posts keep routes and boat upgrades. `navSpot()` = the Navigator's House door
  (102's tracker uses it).
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
- **HIT on PC** (140, outermost `attack`): with keyboard/mouse (`isPC`, no `GPON`) HIT is melee only: for that call `TL.hoe`/`TL.can` are 0 and
  `bowTarget` returns null (`HID`). Off-hand use goes through `viaOff` (X, R1, the farming swaps) which skips the hiding.
- **Dev Suite copy/paste** (111b `pxCopy`/`pxPaste`, Copy/Paste buttons, Ctrl+C/V): the clipboard is colours per pixel in
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
  item, from the save's `tl`, after every clamp. **A new tier above 4 needs nothing more, but never clamp again.** Saves without
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
  room items so they draw and sort, 083's `drawFurn`). No hunger drain inside a house/castle (`SCENE.id==='home'`, not a yard):
  the outermost `upd` adds 3x the drain first and takes it back, so starving can't trigger; eating still counts. The
  wardrobe opens the character screen, so it gets its own `#cwpk` PICK UP WARDROBE button (`pickFurn`/`pickStruct`).

