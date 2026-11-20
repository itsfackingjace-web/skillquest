# World, islands and travel

Hollow, islands, the island builder and island edits, voyages, bosses on islands, meteors, maps, getting home safely.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

- **Island builder** (`dev/111c-s113-island-builder.js`, a Dev Suite tab added through `SQSUITE.addTab`): custom islands are
  saved as `islands.cu_<name>` in the asset library and registered by `SQA` as normal regions (painted tiles + objects,
  8 tiles of sea added around, pier placed by `rgDock`). They skip the random tree thinning/tiering, are open without a
  voyage, and a save on a removed island loads back on Hollow. Never re-register the island the player is standing on.
  Islands can hold `lm` entries (buildings/props from `SQA.ISL_LM`, signs with `tx`, loot chests with `loot`; a chest's
  index is remembered per save in `worldState[<island>].loot`). The builder's "Real look" bakes ground with `hdBakeR` and
  copies each object/building kind once from the game's own drawing (`drawFurn` on the hidden main canvas).
- **Island builder part 3**: islands can also hold `npc` (people: `lk` = character-creator look, `s` = lines), `cv` (dungeon
  entrances: `st` style rock/mine/ice/root/sand, `f` floors, `m` monster keys), `zn` (monster zones: box, `m`, `n` at once, `hp`
  toughness 0-3), `ct` + `c` (own 32x32 ground tiles as PNG data URLs, painted per tile; walkability stays with the ground)
  and `mx/my` (sea chart). 111a's generator places people (`lm` items `k:'npc'`, `use:'npc'`) and entrances (`icvdoor`
  items); each entrance registers its own dungeon kind `cv_<island>_<i>` in `SQICV`/`DKIND` (093's island caves).
  `world/117-s119-island-life.js` runs them: talking (TALK button, speech bubble), zone spawns through the outermost
  `rgUpd` for custom islands (also the whole-island `mob` setting, which used to spawn nothing), entrance art, custom tiles
  drawn over `ROOMBG`. Monster keys/health come from `RG_FAUNA` (`SQISLIFE.MOBS`).
- **Editing built-in islands** (`dev/111g-s151-island-edits.js`, `SQA.islandEdits`; builder 111c `openBuiltin`/`saveBuiltin`):
  `islands.ed_<region>` = {bi, n, w, h, x: "i.t.o;..." changed cells (hex ground / object letter, '.' removed, '' unchanged),
  lm, npc}. Applied inside generation by wrapping 050's `rgFinish` (cells with `C.keep`/`lmSolid` are never touched; the
  builder darkens them via `G._keep` from `base(id)`, which generates without the patch). Patched regions skip tiering
  (`R._t64`); the cached region is dropped when its patch changes (not the one you stand on). 111a's `applyIslands` only
  takes `cu_` ids, so `ed_` entries never become islands of their own. Also `cv` (dungeon kinds `cv_<region>_e<i>`, registered
  in 111g), `zn` (spawned by 111g's own `upd` loop, `n.zi='e<k>'`, exempt from 053's cap), `ct`+`c` (drawn over `ROOMBG`) and `ul`
  (unlock: `C.keep` cells may change, `lmSolid` never). A patch change while you stand on the island rebuilds it around you
  (`refresh`). Size and pier stay the game's own.
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
- **Stone Sledgehammer** (`096` + `world/113-s115-sledgehammer-smashes-ore.js`): one hit breaks small ores (`SKOF[t]===2`);
  GROUND SLAM (`window.SQSLAM`) breaks every mineable rock/ore/boulder in its radius by running the game's own `attack()` at
  each tile (player moved there for the call and put back), and sends an `sl` fx event so others see the shockwave.
- **Island bosses online** (`100`): whoever opens the door first runs the boss (normal shared monster via `SQMOB`); its
  attacks go out as `x.ib` next to its shared monsters (`SQMOBX`/`SQMOBRX` hooks in 061's monster sync), each client checks
  hits on itself (`ibResolve`, attack ids in `DONE`). `ibT` picks a target among players in `in:ib_<id>` every 3.5 s,
  `ibScale` adds 60% base HP per extra fighter, a joiner doesn't spawn a boss (`ST.wait`, spawns one after 4 s if no fight
  shows up), the defeat is sent for 4 s (`ST.done`) and gives every fighter the reward; a leaving owner hands it over.
- **Voyages** (051): Sera (`n.id==='sera'`, Tidewatch) runs every voyage and both boat upgrades: `navCards()` on her `twPanel`
  (under way, upgrades she can fit, new voyages, "Coming later" with what opens each), `nav_acc/rep/hand/craft` through `xAct` →
  `voyAct(a,true)`. Harbor posts (`routesHTML`) are fast travel only: charted routes, locked ones say "Not charted yet" + a line
  pointing to Sera. `post` on VOYS/UPGRADES is no longer shown anywhere. `navSpot()` = the Navigator's House door (102's tracker,
  also for upgrades).
- **World boss on maps** (`ui/138`, `window.SQWBMAP`): world map, area map (with a line saying where it is) and minimap mark
  the boss at `wbPos(b, lair)` (071's block functions, global through Annex B); the lair is known on Hollow or once you're on its island.
- **Graves outside entrances** (063 `grvPos`, `SQGRV.pos`): a grave whose `loc` is `in:` (dungeon, island boss lair, building; not houses) is shown, looted and mapped at its `ar/ax/ay` (the spot you come out at, +8 px) in that outdoor area. Display only, the database record is unchanged, so older graves move too. Kept inside when that spot is water on Hollow (Drowned Grotto).
- **Keep your spot** (`core/156-s162-keep-your-spot.js`, `SQKEEPSPOT`): 006's applySave puts you at SPX/SPY when the saved spot is
  blocked (a regrown rock/tree, or the shared world's removals not in yet). The outermost applySave then moves you to the nearest
  free land tile around the saved position instead (Hollow outdoors, not sailing, within 30 tiles).
- **Calmer monsters** (093): a monster that started the frame more than 95 px away has any step toward you undone. Anything that
  moves a monster by teleporting (burrowing beetles, `n.under`, parked 200 px away by 045) must be skipped there, or it stays parked.
- **Island boss lairs close after a win** (100 `ibKick`, `window.SQIBKICK`): `ibReward` (run on every fighter's game) schedules a
  `leaveScene()` 6 s later if you're still in that boss's arena (`R.ib`), clearing `ST`; retried while you're at 0 health. Guild bosses
  (199/200) use the same arena, so they close too. Staying inside used to allow another fight without new shards.
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
- **Safe trips home and /stuck** (`core/217-s225-safe-travel-and-stuck.js`, `window.SQSTUCK`): 049's `travelCommit` took the island trip's
  return point from `P` when standing in a house/yard/dungeon/lair (the guild horn works anywhere), so the trip home landed at room
  coordinates on Hollow (the sea). The outermost `travelCommit` now `stepOut()`s first (follows `prev` like 067's leaveScene, else
  `SCENE.ret`), and the outermost `leaveRegion` `rescue()`s a bad landing: in the sea → the Tidewatch harbor post (`RG_POST`), inside
  something/boxed in (`good()`: walkable + 25 reachable tiles) → nearest good land within 30 tiles. `/stuck` (`/unstuck`) in chat: out
  of rooms, island → `rgSpot(R)`, Hollow → harbor post; 2 min cooldown (`sq_stuck`), not while dead/travelling/duelling/near a boss.
- **Shattered Expanse sharks** (093, `SQSHK`): they hunt wounded players near the water but only bite when you're on the water
  (`SQRSAIL.on` or standing on a water tile, `onW`); a lunging shark (`s.a>0`) is drawn after the player so it isn't hidden behind you.
- **No hits from unseen monsters** (`combat/227-s235-no-invisible-hits.js`, `window.SQGHOSTHIT`): 001's touch damage counts anything in `en`
  within 10 px, and a monster with a NaN position counts as 1 px away (`Math.hypot(NaN)||1`) while being drawn nowhere (Nov 16: two players
  on the Shattered Expanse were hit every second by nothing visible). The outermost `upd` drops monsters without a finite position from `en`
  (a shared copy `_rp` goes back to its owner's `tx/ty`), and moves one that is within 16 px and hasn't been drawn (outermost `pS`, `SEEN`)
  for 0.4 s out of reach for that update (600 ms grace after it first appears; big/boss/ib/_wb/cb/under/_pet exempt). The first one a session
  sends an `[auto]` bug report with its fields (Admin > Bug reports) so the source can be found. Anything that draws a monster without
  going through `pS` must mark it in `SEEN` or be exempted here.
- **No hits from under houses** (`combat/247-s255-no-hits-from-under-houses.js`, `window.SQUNDER`): monsters drawn but covered by an island
  house/castle (067's RH and other players', `window.rhList()` exported from 067): columns x-3..x+3, rows y-4..y of the door tile (`cover(R)`,
  cached 0.5 s). Every 0.5 s a covered monster (not `_rp`, not exempt as in 227) is moved to the nearest free open tile outside (`moveOut`,
  avoiding tiles next to you); one still covered within 24 px is taken out of `en` for that update and pushed back after it. **Don't keep a
  monster out of reach by moving it far away** (227's trick): 001's `en` filter drops anything over 260 px from you, so it's gone for good.
  Check 36 (also a foreign island castle's furniture).
- **Plateau sides open to paths** (`world/232-s240-plateau-paths.js`, `SQPLATOPEN(R)`): 101's edge mask `R._pe` blocks every plateau side; only
  the south side is drawn as a cliff. 232's outermost `solid` replaces `R._pe` once per room (`R._peo` = the `R.plat` it was built for) with a mask
  whose N/E/W sides are open toward path tiles (14 trail, 11 flagstones). The room object isn't the one `rgFinish` returns, so don't set it there.
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
- **Houses on maps** (`ui/132`), **tool smithing / craft prices** (`items/133`: iron/steel axe and pickaxe SM recipes, fishing
  rod in REC, every BREC/GOODS/SM output gets a SELLP of 60% of its materials when it has none).
- **Talking to sleepers** (`world/194-s202-talk-to-sleepers.js`, `SQSLEEPTALK`): folk asleep (`n.scene` = room+'#bed') are found by bed
  position; the outermost `talk` puts the sleeper in the room's scene at the bed for that call (005's `nearNpc` then finds them), TALK
  button + `SQPADUSE`. 085's imp drops a target that's no longer in `en` (and isn't the world boss) or has no health left.
- **Mine levels** (`world/242-s250-mine-levels.js`, `SQMINES`, Nov 20): DKIND entries with `mine:1` need Mining `req(kind,f)` = base + step x
  floor((f-1)/2) (`REQ`: icmine 30/10, icmine2 45/10; others 15/10). Checked at the entrance (useFurn 'icv' step and `window.icvEnter`) and in a
  wrapped `dGo` when going to a deeper floor (nudged off the stairs). A wrapped `buildFloor` doubles the floor's monsters (at least 8+3f), x1.25 hp.
  `window.SQMINEFREE` skips the check (tests). Wiki > World lists the levels. Check 30.
- **Outlaw Country** (`world/243-s251-outlaw-country.js`, `SQOUTLAW`, Nov 20): a village line `nomans` (042's system) given by Dusthaven's Mira
  (her NPC keeps town 'dusthaven'; sideCard/sideAct/sqMark are wrapped to show the `nomans` line for her; `SQ_REGION.nomans='nomans'` so 049
  counts progress only there). New sqEvent types: `nmlm` (landmarks, once each, `SQ_SIDE.nomans.seen`), `nmdeliver` (`nmsatchel` item to the
  `dustwater` landmark; Mira gives a new one if it's lost), `nmmine` (Mining XP there), `nmpvp` (064's ko branch calls `SQPVKO(uid)`), plus
  kill 'bandit' and islandboss 'nomans'. Check 31.
