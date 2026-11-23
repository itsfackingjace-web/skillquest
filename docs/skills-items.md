# Skills and items

Skilling looks, gathering, cooking, fishing, firemaking, brewing, off-hand tools, perks, daily/weekly challenges, quests, achievements.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

- **Skilling looks** (`skills/114-s116-skilling-looks.js`): fire, cooking and fishing are drawn on the character, not as a
  progress bar (109 now only draws the "N left" count). The state travels as `ak` in the
  multiplayer position (1 fire, 2 cook, 3 fishing, 4 bite, 5 reeling, 6 caught, 7 smelt, 8 smith, 9 craft; `SQACT()`; 0-9 only, `cleanCh`/receiver clamp), the crouch is done in the
  outermost `cP` (whole character, gear included, re-drawn shorter at the knees), and other players' props via `SQPEERFX`.
- **Pet abilities** (`skills/116-s118-pet-abilities.js`): treelings (`SQPETAB.TREEL`, chance per kind, doubled on their own
  tree kind) add +1 of whatever log a chop just gave (outermost-at-the-time `attack` wrapper). Mushroom pets `pmush`/`pglow`
  (`SQPETAB.MP`) drop from `shroom` patches (`SQMUSHDROP=<kind>` forces it in tests), are drawn through `SQPETDRAW`, and
  registered in `SQNPET`/`LUX.PETS` like the other non-shop pets. Glowcap watches for P.hp drops in `upd` (damage is applied
  in many places, there is no single hurt function).
- **Button words** (`ui/118-s123-button-words.js`, `window.SQWORDS`): every 0.1 s the HIT (`a`) and EAT (`e`) buttons get
  the word for what they'd do now (`hitWord`/`eatWord`, following the same order as the `attack`/`eat` wrappers: build,
  facing someone, fishing, station, home furniture/chest/bed, monster in front, water, sign, the object's skill via
  `SKOF`), and a TALK button showing USE gets the thing's word (`useWord`). The `<small>` key hint is kept. When a new
  context is added to `attack`, `eat` or `talk`, add its word here too.
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
- **Off-hand** (`items/140`, `window.SQOFFHAND`): `eq_hoe` is slot `off` (kind `hoe`); `TL.hoe` = hoe in hand (farming code
  unchanged); outermost `occ`/`setSlot` handle it and drop 'hoe' from `SLOTS`; a hoe together with a bow/wand goes to the bag.
  X (124's `KA` 'off') = use off-hand: hoe → `attack()`, bow/wand → a synthetic right-click on `cv` at the cursor (082's code).
- **Mithril/adamant tools** (`items/141`): `eq_axe6/7`, `eq_pick6/7` = tool tiers 6/7 (same numbers and `TCOL` as the swords),
  anvil recipes from `mbar`/`abar`, `req:{s,l}` checked by the outermost `equipItem` (Woodcutting/Mining 30/45).
  Skill trees: `TREES[1|2].extra[30|45]`; Smithing's `ulSmith` (039) is rebuilt from `SM` after load and on `SQA.onApply`.
- **Perks**: production speed (039's `pSpeed`: level + `PSPD` perks) shortens 109's timed actions (`sqDo` divides the
  duration) instead of giving bonus XP. Flame Aura (`fi_aura`, 087) needs only the perk (`SQAURA`/`SQAURALIT`; 014's cave dark
  widens with it). fi_haven/fi_sacred act on all non-boss local monsters. `SELLB` (038) lists use functions where recipes grow.
- **Watering can off-hand** (140): `eq_can` slot `off` kind `can` (`TL.can`); hoe and can swap by themselves in the outermost
  `attack` (tillable ground with the can → hoe; dry crop with the hoe → can) and on the "Buy a watering can" message;
  `shootAim` (controller R1) uses hoe/can when that's the off-hand.
- **HIT never farms** (140, outermost `attack`): on every input HIT hides `TL.hoe`/`TL.can` for that call (`HID`); keyboard/mouse (`isPC`, no `GPON`) also gets
  `bowTarget` null. Touch: 082's `#aimb` shows TILL/WATER for a hoe/can off-hand (also in yards), a tap = `SQOFFHAND.use()`; hints via `SQOFFHINT(what)`. Off-hand use goes through `viaOff` (X, R1, the farming swaps) which skips the hiding.
- **Meals and food buffs** (`items/177-s184-meals.js`, `SQMEALS`): `window.SQFOODBUFF` {food:{b,s}} = eating it (outermost `eat`/`useFood`,
  by bag count drop) starts buff b for s s in 085's `LUX.BUFF` (085 lists/pills: str, iron, swift, wis, regen; wis = +20% XP in the
  outermost `addXp`, regen = 1 heart / 10 s in the outermost `upd`). Filled by 162 (Content food items' `buff`/`bs`) and 161b (Stats >
  Food & potions `buff`/`bs`). `window.SQSTOVE` = multi-ingredient stove meals (Content recipes `sk:'stove'`), listed under "Meals" in
  the outermost `stationHTML` and made by `stationAct('sv_<i>')`. COOKS entries with `st` are stove-only: 007's fire loop, 109, 110 and
  118 skip them (Stats > Recipes "Stove only"). Stats table fields can be `sel` [f,label,'sel',options|()=>options].
- **Fletching** (021 `makeFletch`; empty since Nov 23, see "Arrows and bows are smithed"): timed through 109's `sqDo('craft',n)` ("All" = as many as the materials allow); the generic
  "Made ..." line only when the recipe's own `f` didn't say anything (arrows say the arrow count, gear its name).
- **Pet powers** (`skills/180-s187-pet-powers.js`, `SQPETPOW`, Dev Suite > Pet powers): library `petab.<pet kind>` = {own (0 = its built-in
  ability off: `window.SQPETOFF(k)`, asked by 085's imp aggro, 098's fetchers, 116's treelings/mushling/glowcap), at
  melee|ranged|magic|aoe, ag hurt|near|yours, dmg, gr (+1 per 25 Attack/Archery/Magic), cd, rng, col, fx {slow,burn,poison,freeze:
  [%,s]} (the game's own n.slow/burn/poison/frozen), heal {h,e}, fetch {k,n,e}, ex {s skill (-1 any gathering),c}, xp, gold, guard}.
  Attacks come from where the pet is drawn (093's `PST.get('me')`, the imp's state); a melee pet is moved next to the monster and
  093's `petFollow` walks it back. Peers see the attacks via fx `pa` (`SQFXH.pa`, looks only). Powers are appended to `IDESC.pet_<k>`.
  A new pet with a built-in ability should check `SQPETOFF` and get a line in the tab's `own()`.
- **Eating / campfire cooking** (`ui/181-s188-better-eating.js`, `SQEATPICK`): the outermost `eat` moves the chosen food to the front of
  `FOODS` for the call (pinned `eatp` in the save, else smallest heal that covers what's missing, else least healing; potions and
  `SQFOODBUFF` meals left for USE; "You're full." at full health + food 95). At a fire with 2+ cookable kinds it opens a picker
  (`ptab` 41); a picked kind runs as 109's `sqDo('cook')` whose steps call `eat()` (BYPASS) with that COOKS entry moved first.
- **Cook everything at the stove** (`skills/270-s278-stove-cook-everything.js`, `window.SQCOOKALL`, Nov 22, Jace, check 92): the outermost
  `stationHTML` puts a `ckall` row before the stove's first `ck_` row when 2+ raw kinds (first COOKS entry per raw, level allowed) are
  in the bag/chests; `stationAct('ckall')` starts one `sqDo('cook', total)` whose steps call `stationAct('ck_<first kind left>')` (022's
  one-per-step cook, 039's burn saves and perks, chests lent by 033/109) and reset `SQDO.n`/`tot` from what's left (a level-up can
  unlock another kind). Meals (`sv_`) aren't included.
- **"N left" for make-all** (`skills/192-s200-make-all-count.js`): the outermost smithAct/makeGood/makeBuild work out how many the
  materials allow when `all`; the wrapped `sqDo` keeps it as `SQDO.tot` and 109 shows `min(n, tot-done)` (display only).
- **Jewelry make-all** (086, edited in place): `data-jw="all"` → `jwMake(k,true)` = `sqDo('craft',jwCan(j),...)` and `SQDO.tot` for 109's "N left".
- **Skill trees list every item** (`skills/214-s222-tree-unlocks-from-gear.js`, `window.SQTREEAUTO`): the outermost `treeGains(sk,l)` appends
  generated lines: wear/use requirements of every `EQ` item (library `gear.<k>.rq` first, then `e.tt` = Defence 50, 111a2's `defReq`, `e.req`)
  and making levels from SM (Smithing), GOODS/REC/BREC (Crafting), COOKS (Cooking). Skipped when the level's own text already names the item
  (or "<first word> armor"). Rebuilt on `SQA.onApply` and when those lists change size. A new requirement check elsewhere should be added to `reqOf`.
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
- **Campfire logs and feeding** (`skills/220-s228-firemaking-logs.js`, `window.SQFIRELOGS`, `ptab` 50): tiers `T` (wood, oak 15, willow 30, maple 45,
  yew 60, void 75: per-log XP `pl`, life multiplier `m`, feed seconds `fs`). The outermost `fire` opens the CAMPFIRE picker only when there's a choice
  (a tier log you can burn, or your own fire next to you); plain wood with nothing near builds as before (`SQFIREDIRECT` skips the picker).
  A tier build lends 3 wood to the game's own fire() (timed by 109) and `PEND` waits in the outermost `upd`: the new fire gets `lg`, life x`m`,
  extra XP; no new fire and no job running = wood taken back, logs returned. Feeding: 1 log, +`fs` s (cap 30 min), `pl` XP, `lg` raised.
  Extra/feed XP is added with `window.SQFIREXTRA` set, which 120/143/129 check so it doesn't count as another fire lit. `lg` is kept in
  saved fires (061 snap, 006 load) and shared fires (061 FIRE sync, clamped 0-5); the outermost `pF` draws it in `PAL` colours unless a
  `p:campfire` look exists. Skill tree lines via the outermost `treeGains`.
- **Feeding other players' fires** (Nov 20): 220's `myFire()` also finds shared fires (`_rp`, owner in `_o`); feeding one calls 061's
  `window.SQFIRETAKE(p)`: the proxy is dropped (and that owner's copy near there ignored for 30 s via `FIRE.taken`), a fire of your own
  takes its place (life, `lg`) with `tk` = the old owner, shared with `tk` for 20 s; the old owner's 061 removes its own fire near a
  shared fire whose `tk` is them. So the fire survives its lighter logging out. Check 44.
- **Sunken treasure and Davy** (`world/271-s279-sunken-treasure.js`, `window.SQTREASURE`, Nov 23, Jace, check 95): a step around the outermost
  `catchFish` (109's, so at the bite) rolls once per bite: 1/100,000 Davy's skeleton (only if `pet_np_newpet` exists; else a chest), else 1/500 a
  chest, reeled in through `sqDo('reel')` in place of that catch. Chest: gold 60+3L..+5L more, one or two `LOOT` finds (weights; items missing from
  INAME skipped), Fishing XP 2x your best fish, card `#sqtc`, fishing goes on (`resetFish`). Skeleton: scene `CS` (`PH` times, `speed` for tests)
  drawn in an SQHUD.before step (dark overlay, line, skeleton `SKELP`, mist, Davy from `SQA.petLook('np_newpet')` frame a, or a plain ghost) and an
  SQHUD.after step (letterbox, typed speech bubbles); an SQUPD wrap runs each frame with dt 1e-4 and holds you in place; HIT/EAT/TALK wraps do
  nothing; a key/tap after the rattle skips to the swoop. Then `inv.pet_np_newpet++` (bag), a card, chat "★ fished up Davy, the ghost pirate!"
  (not young players), save. Sounds `SFX.ghostwail`/`rattle`. Davy's bag description is filled in when the library's `d` is empty.
  `OPEN` (true since the Nov 23 release; false = random rolls only for developer accounts, `SQDEV()`, and no chat announcement); devs type
  /davy or /treasure (an `mpSend` wrap) to make the next bite the skeleton or a chest.
- **Fishing 70/80/90** (`skills/221-s229-deep-fishing.js`, `window.SQDEEPFISH`): moonfin (70, night: `dark()>.25`), abyssal eel (80, shattered/
  ironcrest), ancient koi (90, anywhere, 6%) through `window.SQFISHX`, which 093b's catch hook checks before the Dev Suite's `SQGFISH`
  (entries may have `ok()`). Raw `k` + cooked `c<k>`, COOKS/FOODS/icons/tree lines. Not in 200's turtle `RAW` (fixed by the rules).
- **Arrow ladder** (`items/224-s232-arrow-ladder.js`, `window.SQARROWS`): `mitharrow` (Archery 40) and `adarrow` (55), 15 a fletch; damage over
  plain arrows iron +1, mithril +2, adamant +3, meteorite +4 (216's LEND bonus is 3). The outermost shoot/shootAim lend the best special
  arrows to `inv.iarrow` for the call (meteorite left to 216's own lend) with `BON` added in `arrowDmg`; `bowTarget` counts them; shots get
  `p.ah` (head colour, 021's drawProj). 021's fletch/equipment lines and 010's arrow chip list every arrow kind: a new arrow goes there too.
- **Vessa's potion stall** (096, edited in place): NPC role `potions` at Emberwatch with an `afstall` item; `POTAF` (`window.SQPOTAF`) =
  potions she sells; she buys any of them for `potBuy(k)` = 1.5x SELLP, always below her own price (data-af `p<i>` buy, `q<key>` sell).
- **Campfire colours per log** (220 `PAL`/`GLOW`/`STICK`): flames oak gold, willow blue, maple crimson, yew green, void purple. 001's night glow
  takes each fire's colour from `window.SQFIREGLOW(f)` and only merges fires of the same colour; 114's `drawFire` (lighting) colours the sticks,
  base log and ember from `SQFIRELOGS.lighting()` (the pending tier build, else plain wood). Peers lighting a fire are drawn with plain wood.
- **Weekly event** (`ui/143-s148-weekly-event.js`, `window.SQWEEK`): week = `floor((day-4)/7)` (Monday 00:00 UTC), event `EV[week % 7]`;
  counting like 120's daily challenges (items with that skill's XP in the frame, `xpc` = XP gains of 200 or less, kills).
  `wev/<week>/t` total (only up, +500 a write at most) and `wev/<week>/p/<uid>` {n,c}; sent every 10 s. Tiers at 1/3, 2/3, 1 of
  `goal`, paid once each (`got`) if your count is at least `mins` (2%); last week's tiers paid at the turn. Only shown as a card in the
  quest log under the daily box (no HUD element). Saved as `wev` {w,c,got,q}. Rules: `wev` (publish them).
- **Daily challenges** (`ui/120-s125-daily-challenges.js`, `window.SQDAILY`): three tasks per real day (device date), picked
  from `T` by a hash of the date, skipping ones the character can't do yet (`r`), target scaled by skill level. Items count
  when they arrive in a frame where that task's skill gained XP (outermost `addXp` marks it; positive `inv` deltas in `upd`),
  `xpc` tasks count XP gains, `kill` uses the game's `kills` counter. Paid at once (gold + XP); all three = streak bonus.
  Saved as `dly` {d,q:[{t,n,p,c}],s,l}; shown at the top of the quest log (below the guide box). Separate from the
  townsfolk "daily jobs" in 020.
- **Quest tracker** (102): `TRK==='none'` = nothing tracked (stored in localStorage `sq_trk`): no quest box (010's old box
  checks `SQTRKOFF()` too), tapping that HUD spot doesn't open the log, and new quests don't grab the tracker. The main
  quest of type `village` gets its step and arrow from the first unfinished village line (`villNext`).
- **Getting started guide** (`ui/115-s117-getting-started.js`): 8 steps for new characters, shown through the quest
  tracker (102's `refresh` asks `SQGUIDE()` first), with hints, glowing buttons (`.sqglow`) and small rewards. Saved as `gd`
  (99 = done or skipped); a save without `gd`, or a game started without a save, is judged once play starts. Tapping the
  quest box opens the quest log (with "Skip the guide").
- **Farming seeds** (`skills/152-s158-farming-seeds.js`, `SQSEEDS(L)`): 016's harvest asks it for the seed count: 45% + 0.5%/level
  (cap 95%), second seed 5% per 10 levels (max 45%); perks (third choices, like 087's) `fm_pouch` (20, +15%), `fm_twin` (40,
  each seed 25% ×2), `fm_heir` (70, at least one). `TREES[11].step` lists the seed numbers. 038's `fm_seed` still adds its own.
- **Gluttony, bonus-item XP, background tab** (`skills/244-s252-gluttony-bonus-xp-background.js`, `SQIDEAS252`, Nov 20): Cooking 99 auto-eats
  (SQEATPICK.eat, respects SQEATCD) at 3 hearts or less, Options toggle `sq_glut`. 038's `gBoost` and 039's `prodBoost` are wrapped: bonus units
  get XP (gBoost: the last addXp of that skill within 1.5 s / base units; prodBoost: o.xp/o.n). A Worker ticks every 200 ms; while
  `document.hidden` the game runs `upd` (no draw) in 50 ms steps. Magic (202/036): mana regen boost `SQMREG()` x1 at Magic 1 to x3 at 25;
  Mana Shield is Mana Barrier (once every 30 s, `SQMSH`). Check 32.
- **Drop Cards** (`items/253-s261-drop-cards.js`, `window.SQDROPCARD`, Nov 20): 43 collectible cards for the coming Drop Card game (rules draft: the
  "Drop Card: Rules Draft" doc). `CARDS` rows = [key, name, group, stats, Jace's Content item key | [palette, 14x14 grid on his template]];
  every card is a `dc_<key>` item made here (Jace's first Content cards `it_new_item_5..8` were redrawn/restatted here at his request and
  never drop) (INVK/INAME/SN/SHORT/SELLP/IDESC/EXTRA_BAG, `iconURL` from `SQA.render`, a Dev Suite sprite for the key wins).
  1% (`RATE`) each: monsters through an `SQDROP` after-step (key = `SQPROPS.mkey` without `m:`, so per variant; dungeon bosses by type;
  skips `summon`, `_wb`, `ib`, `_pet`, once per monster `_dc`), world bosses through 071's `wbLoot` hook `window.SQWBWON` (fighters who
  claimed loot), island and guild bosses through 100's `ibReward` hook `window.SQIBWON` (`gt_`/`gu_` arena ids = Void Treant / Giant Turtle),
  trees through an `SQHIT` wrap (a swing that raised wood/oaklog/willowlog/maplelog/yewlog). Frame colours: gold monsters/trees, red world,
  purple dungeon, blue island, green guild. `SQDROPCARDALWAYS` forces the roll (check 48).
- **Card Binder, Drop Card for Dummies, pet/potion/forage cards** (`items/254-s262-drop-card-binder.js`, `window.SQBINDER`, Nov 20): `dc_binder`
  (given with the first card, the guide, or any `D.give`) replaces every card in the bag grid (the outermost `bagGridHTML` builds the bag with card
  counts set to 0 for that call, so trade/market/chest lists still show cards) and has OPEN; `dc_guide` (GEN, 1 gold) has READ. Panel
  `BTAB=52`: Collection (all cards, silhouettes for unfound, filters), Decks (3; 20-60 cards (`DMIN`/`DMAX`, Nov 21), max 2 copies, 1 per boss, trees unlimited, 4+ trees,
  1 pet card as Companion; `problems(d)`), Guide (`GP` pages). All controls are `<button>`s (023's navItems). Save `dcd` {a, d:[{n,c,pet}]}.
  Pet cards `pc_<pet item>`: 104's release calls `window.SQPETREL` (always gives the card); registered for every `EQ` pet now, on
  `SQA.onApply`, and for `pc_` keys in a save (`SQLOAD.before`); picture = the pet's icon on a teal card (async, cached). Potion cards: 218's
  `brewOne` calls `window.SQBREWED`; forage cards: an `SQHIT` wrap on berry/shroom/nuts/cfruit gains. Check 49 (controller + phone width).
- **Starter Deck and bad-luck protection** (Nov 20): 254's `giveStarter()` (first Drop Card for Dummies) gives 20 bound cards (`SDECK`: 6 Tree,
  2 Oak, 2 each Slime/Moss slime/Wolf/Skeleton/Bat/Healing potion) kept in `STARTER` (save `dcs` {g,c}), never in `inv`, so they can't be traded,
  sold or stored; `owned(k)` = inv + starter is what the binder and deck rules use; Deck 1 is filled (named "Starter Deck") if empty.
  253's `roll()` counts misses (`PITY`, save `dcp`): the 200th miss in a row (`PITYN`) gives the card; `rawRoll()` is the plain 1%.
- **Found-card moment, shiny cards, achievements** (`items/256-s264-card-found.js`, `window.SQCARDFOUND`; shiny in 253): 253's `give` picks shiny
  1 in `SHINY` (50; `SQSHINYALWAYS` forces it) = item `<key>_sh` (the whole card in inverted colours via `shinySpr`; a Sprites-tab card is inverted from its picture by `invertURL`, 10x sell value, counts as the card in
  decks: 254's `owned`) and calls `window.SQCARDGOT` hooks {ck,key,shiny,card,first,why}. 256 flips the card up (#sqdcf, 2.2 s, 3.5 s for boss/shiny,
  queued; click, any key or controller button dismisses), announces boss/shiny cards with your own chat line ("★ found a Drop Card: X!", not for
  young players) and adds 8 achievements (group "Drop Card", earned cards only). Check 50.
- **Dev Suite > Cards** (`dev/257-s265-cards-tab.js`): library `cards.<card key>` {n,d,g,r,src}; 253's `applyLib` (SQA.onApply) changes cards or adds
  `cu_*` cards that take over `src`'s drop (`SRC`), per-card rate `r` (`rateOf`, used by `roll(ck)`); raising a rate above the published one needs
  a second click. Art: Sprites tab by item key. Check 51. Nov 22: its list ends with "Pet cards": power (PTXT), summon cost, HP, ATK per
  pet → `draft/petcards/<pet item>` {p,c,h,a}; Dev Suite > New pets shows each new pet's card with "Change its card" (`SQCARDSTAB.pickPet`). Check 88.
- **Ace the Card Sharp** (`world/258-s266-card-sharp.js`, `window.SQCARDSHARP`): NPC kind `cardsharp` behind a card table at VX+8,VY+1 (BS),
  shop panel on ptab 2: buy the guide (GEN's entry, so the Starter Deck too), guide, binder, match (coming soon). Check 52.
- **Card frames** (`items/260-s268-card-frames.js`, `window.SQCARDFRAME`): furniture `cardframe` (BREC wood 4 + ibar 1, req 8; Marlo's via
  LUX.EMP.FURN2), drawn by the outermost `drawPiece`; HIT at home opens panel `FTAB=53`; save `dcf` {"<house id>:<tile>": item key}; the outermost
  `pickFurn` gives the card back. Visitors see the card (061/067 rows carry it, check 81). Since Nov 22 a 3 s sweep gives back any card
  whose home is gone (packed house, guild island left...): keys are `<house id>:<tile>`, yards `<house id>~y:<tile>`; homes the bank holds
  (267's `SQHTAX.heldIds()`) still count; `READY` is off between newGame's steps. Check 82.
- **Drop Card matches** (`items/261-s269-drop-card-engine.js` `window.SQDCE` = the rules; `items/262-s270-drop-card-matches.js` `window.SQDCM` =
  Ace and the table): `create({seed,decks,pets,names})`, `apply(s,side,move)` returns '' or why not (moves plant/chop/play/atk/end; targets
  'h0'/'h1' or minion uids), `options(s,side)`; seeded `rnd` so the same moves replay the same match (for player vs player later). Boss powers
  `POW`, spells `SPELL`, Companions `COMP` as in the rules doc; the Demon = "Last word: 3 damage to the enemy hero". 262: Ace's levels `LV`
  (decks, gold 50/150/400, a tenth after the first win of the day: save `dcw`), `aceMove` (Easy: one card a turn, random attacks, sometimes
  stops early), the #sqdcm table (Nov 20 polish: wood/felt, hero busts drawn by `cP` into an 80x80 crop, Groves from `hdSprites()` trees (083's recoloured oak/willow/maple/yew) and a drawn stump, Jace's card art via `iconURL`; tapping any card opens `M.zoom` = `{t:'hand'|'mon'|'tree'|'pet',v}`, the close-up `.dcm-zoom` (data-dcm `unzoom`, `play`, `attack`, `chop:j`); `E.chopPlan` marks the trees a hand card would chop; `playFx` turns `s.fx` into lunges, damage numbers, puffs; buttons only; SQNAVROOT returns the close-up when open, else the table; ○/Esc go back), `SQDCMFAST` skips Ace's 0.7 s pauses
  (checks). Simulated with the starter deck: a good player beats Easy ~65%, Normal ~45%, Hard ~10%. Achievement `dc_win`. Check 54.
- **Tree cards by the tree hit** (`items/253`, Nov 21): 253's SQHIT step reads the object in front before the swing (`frontO`, like 122's) and `window.SQTREECARD(o)` names its card: oak/willow/maple/yew/pine by `o.t`, `o.v` 'dead' = Dead tree, 'dark' = Void tree (199 swaps its logs for `voidlog`), `cactus` = Cactus fruit (only when no fruit came out; 254 rolls it when fruit does), else the log that went up. Cards Pine, Dead tree (1 Mana) and Void tree (6 Mana). 254's `openBinder` clears a peek unless 259's `peek` opened it.
- **Drop Card rules, Nov 21 (Jace)**: heroes 30 HP (`SQDCE.HERO`; Gold golem +3), Grove = 6 trees (`MAXT`, any Mana; was 10 Mana), decks 20-60 (254's `DMIN`/`DMAX`; trees up to 60). Ace's heal thresholds follow `E.HERO`.
- **Binder = the bag's CARDS tab** (254, Nov 21, Jace): `bagTabs()` puts ITEMS / CARDS (data-dcb `bag` / `open`) above the bag (ptab 4) and the binder panel (titled BAG); the `dc_binder` item is no longer given and is set to 0 on load (key kept). `window.SQKEEPFALL(k)` (cards, pet cards, old binder): 063's `grvFall` leaves them out of graves and 254's `reset` step keeps them through the wipe.
- **Pet cards in decks** (Nov 22, Jace; 261/254/262/263, check 88): pet cards are ordinary deck cards (max 2 each; a deck's old `pet`
  Companion is moved into `c` on load, `pet` is always null now). 261's `card('pc_<pet>')` = {kind:'pet', comp, cost, hp, atk}: `comp` from
  `COMP` (pet id) or `friendly`, stats from `PSTAT[comp]` (cost 1-4 by strength), both overridable per pet by library `petcards.<pet item>`
  {p,c,h,a} (`OV`, Dev Suite > Cards). Summoned pets live in `P.board` with `pet:true` (beside the hero on screen, `MAXP`=3, not counted in
  `MAXB` = `mons(P)`), so attacks, Guard, spells and random effects treat them like monsters. Powers count live, unsilenced pets
  (`has(P,comp)`, stacking); start-of-match powers became arrival effects (`summonPet`); once-only powers use the pet's `cf.used`. Texts:
  `PTXT`, card text `SQPETDESC(pk)` ("Pet card · Cost N · H HP A ATK. power") → IDESC (254's regPet; 261 refreshes on apply). Also fixed:
  `isWolf` read `m.id` (never set on the table) so wolf powers never fired; 254's deck loader clamped every count to 2 (trees too), and
  repairs a Starter Deck that came back under 20. Mithril wall (`gmith`) counts any Guard (`isGuard`: Iron skin's `m.guard` or a Guard boss), on arrival, on play and when Iron skin is cast (not twice). PvP rules version `r6` (263); `badDeck` accepts any `pc_` key. Ace: Normal +Dog, Hard
  +Wolf +Imp. Wiki and guide pages say "Pet cards".
- **Dragging cards** (`ui/268-s276-drop-card-drag.js`, `window.SQDCDRAG`, Nov 22, check 88): pointer events on 262's `#sqdcm`; a press
  that moves 10+ px drags (else 262's click opens the close-up). Hand: ghost card (`.dcm-ghost`), your board lit (`.dcm-dropme`),
  targeted spells use 262's `M.aim`; drop above the hand plays, on a glowing target casts. Board: arrow (`.dcm-arrow`) from your
  monster/pet, drop on a target attacks. The pointer is captured by `#sqdcm` itself (262 only redraws its inside); the click after a
  drag is swallowed until the next press. Styles live in 262's stylesheet. Ace's speech bubble no longer blocks taps (`pointer-events:none`).
- **Duplicate pets** (Nov 21): 093's `givePet` (`SQGIVEPET`) and 085's `LUX.giveImp` put another `pet_<k>` in the bag when you already have that pet (in the bag or out); only a pet you don't have is equipped. Check 57.
- **Blacksmith's bench and cores** (`items/272-s280-blacksmiths-bench.js`, `window.SQSMITHBENCH`, Nov 23, check 97): step 1 of the
  smithing overhaul (plan: Jace's "SQ Blacksmith's Bench" sheet, Future tab). The bench (`smithbench`) is a 022 station (STNS/BREC/BK,
  Iron bar 3 / Stone 4 / Wood 10, Crafting 12, 90 XP) in 033's `STCH`, so it uses the house's chests. Cores (`core_briar`/`ember`/`frost`/
  `silver`/`void`): 100 of 100's `ibs_<island>` shards -> 1 core, 1,000 Smithing XP, Smithing 40/50/60/60/70, timed through 109's
  `sqDo('smith')` (5 s a core, `SQDO.core` marks the job so the bench at `WORKAT` throws sparks). Sell price = 100 x the shard's (no new
  gold). Button actions are `smc_`/`smca_`: 107's daily shop stock tags every `b...` button on a ptab-2 screen (stations included) as a
  shop item. Tree lines via a `treeGains` wrap; wiki recipes via 075's new `window.SQWKREC` hook (075's `wkRecipes` is local). A Props
  look `p:smithbench` replaces the drawn bench. Coming next: upgrades (step 2), durability and repairs (step 3).
- **Arrows and bows are smithed** (`items/273-s281-smithing-recipe-moves.js`, `window.SQRECMOVE`, Nov 23, check 97): every arrow and bow in
  021's FREC moves to SM (anvil, Smithing, same level/materials/XP); arrows carry `q` (10/15/25) and `pl` (plural), read by 007's
  `smithAct` and 039's bonus items (a bonus is a whole batch). The bows are bag items (`eq_bow1`/`eq_bow2`) now. The ranger set moves to
  GOODS (Crafting, same levels). FREC ends up empty; 021's `fletchHTML` then says where things went. 004's REC no longer has tier-3 axes
  and pickaxes (iron ones only from the anvil, 133's `eq_axe3`/`eq_pick3`). 022's `smithRows` uses `matN` for material names.
- **Upgrades at the Blacksmith's bench** (`items/274-s282-bench-upgrades.js`, `window.SQUPGRADE`, Nov 23, check 98): step 2. `UP` (rebuilt on
  every library apply) = every upgradable base: SM (Smithing), GOODS (Crafting), REC's iron sword, Brann's steel sword (25/300), and
  `BOSS` (no recipe; cores, levels 70/80/90, XP base 1000). Not: starter gear, Crystal blade, Bone bow, tools, jewelry. Copies rule:
  10 of level L-1 -> 1 of L at make level + 10L, XP x2/x10/x50; the worn piece counts (bag first; if it's used, the result is worn).
  Upgraded copies are items `u<L>_<base>` (INAME/SELLP/INVK/EXTRA_BAG; EQ entries are **non-enumerable** copies so gear lists and
  214's tree don't grow; 129's collection log skips `^u[123]_`). Worn, they're the base (tiers, occ, looks, rules) and `UPS[slot]`
  = {b,l,n} keeps the level: the outermost `equipItem`/`unequipSlot` and a SQSETSLOT wrap put the right copy back in the bag; a
  per-frame `reconcile` (skipped while chests are merged) catches other paths by watching the base's bag count. Saved as `s.upe`
  (KNOWN49), copies of library gear that haven't loaded yet wait in `PENDV`. Effects: `meleeFlat`/`arrowDmg`/`spellDmg` +5%/level
  (fraction = chance of +1), daggers +1/+2 at +2/+3, `gSpeed(1|2)` +.05/level, `blockBonus` and `blockCap` +.01/level/piece, ranger
  pieces `bowRange` +5%; `window.SQPVDMG` sets NOUPG (PvP ignores them; PvP block is capped at 25% anyway). Icons get a gold level
  badge (`eqIcon`/SQICON, drawn async then `rPn()`). The equipment screen shows the worn level and lists upgraded copies.
