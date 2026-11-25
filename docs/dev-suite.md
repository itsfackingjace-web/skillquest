# Dev Suite

The developer editor and everything it publishes through the asset library (`SQA`): sprites, gear, pets, props, monsters, content, balance, recipes, events, checks, admin and moderation tools.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

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
  when walking left. `SQA.petLook(kind)` = the look in use. `gh:1` = floats like a ghost (Nov 23, Davy; Pets editor checkbox `pgh`, check 94): 111a's `drawPetLook` draws a
  faint smaller shadow, the look 2 px higher with a ±1 px hover, and outdoors at night (`dark()>.2`) queues it in `GHQ` for an SQHUD.before
  step that draws a soft glow and a 'lighter' copy after the night tint (like 018's lit windows).
  when walking left. `SQA` draws them in place of the pet's own look through the outermost `pP` wrapper and
  `LUX.drawPeerPet`; `SQA.capturePet` copies the game's current look to start from. The Imp (`pets.imp`) isn't a follower: 111a
  overrides `window.SQIMPSP` (085 keeps every canvas it gets, so 111a hands out canvases it repaints in place on each library change).
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
- **Item-sprite swings** (`dev/123-s128-item-sprite-swings.js`, `window.SQISW`, Dev Suite > Swings): the outermost `pP`
  draws the held item's icon (`eqIcon`/`iconURL`, so redrawn sprites too) turned in 32 steps on the pixel grid for sword /
  sledge swings, chop/mine (`ACTN`), casts (`CASTT`, `CASTD`) and shots (`BOWT`, `BOWD`), hiding swing/CASTT/BOWT/ACTN from
  the inner drawers for that call; pointing up it's drawn behind you. Icons are assumed to point up-right (grip bottom-left),
  bows to face right. `SQSWING` (other players' swings) is wrapped too. Library `swings` = {all (default on), k:{key:'icon'|'own'}}.
  Facing left (tool `ACTN.face[0]<0`, a swing's `fx<0`, a cast's `CASTD[0]<0`, peers' swings) `put(...,flip)` draws the sprite turned to
  π − angle and mirrored about the grip column, so left is the mirror image of right (turning alone put an axe's blade on the trailing
  side; Nov 24, check 114). Bows aren't mirrored. 028's own `drawToolLine(...,side)` puts the head on the mirrored side too.
- **Dev Suite copy/paste** (111b `pxCopy`/`pxPaste`, Copy/Paste buttons, Ctrl+C/V; Erase all = `eraseall`, clears the current picture/layer, undoable): the clipboard is colours per pixel in
  localStorage `sq_dev_clip`, pasted bottom-middle aligned into any editor, colours added to the palette.
  Nov 22 (Jace: the turtle pet pasted into its item sprite came out tiny; check 87): **Paste to fit** (`pxfit`) trims the clip to its drawn
  box and scales it (`resample`: nearest when growing, majority colour with an opaque bias when shrinking; whole-number factors when ≥1) to fill
  the picture, bottom-middle. **More pixels ×2 / Fewer pixels ½** (`res2`/`resh`, item sprites and other single-layer pictures, ≤160 px) change
  the sprite's own resolution and halve/double its shown-at scale `s` when they can, so it keeps its size in the game. **Bigger ×2 / Smaller ½**
  (`lay2`/`layh`, pets and props) scale the drawing inside the canvas on every frame. All undo (undo stores `w`/`all` layers).
- **Select and zoom in every picture editor** (111b, Nov 22, Jace: the Art Room's new tools in the Dev Suite; check 89): tool `sel` (S) with
  Box/Free (`ed.selm`), `ed.sel` {m mask, dir} for the frame you're on (`selOf()` drops it on another frame/size; undo and other tools drop
  it). Drag inside to move (`selDrag` lifts the pixels, `stampSel` drops them; one undo step), arrows nudge, Delete clears, Crop
  (`scrop`): a sprite shrinks to the selection's box (undo entry with w/h/s), layered pictures (worn/pet/prop/monster) "Keep only this".
  Copy with a selection copies only its drawn pixels. Every editor has Move (M) and − / + (`zoomAt(f, ev)`: the pixel under the pointer
  or the view's middle stays put); sprites zoom too (`ed.fit` cached like the layered editors, reset when the size changes; the sprite
  and gear-icon editors use `.dv-cvw`). Wheel notches / Ctrl+wheel zoom (a trackpad's smooth scroll still scrolls); the middle button
  drags the view. Esc lets go of a selection before it closes the suite.
- **Bosses made in the Dev Suite** (`combat/146-s152-custom-bosses.js`, `window.SQBOSSES`, Dev Suite > Bosses): `bosses.cb_<id>` =
  {n, base, hp, sz, dmg, spd, cd, rs, atk:{ring,charge,slam,summon}, sk}; each becomes monster kind `cb:<letters>` (`keyOf`) in
  `SQISLIFE.MOBS` (island builder zones, island-dungeon monster lists; in a `cv_` dungeon one boss on the last floor via the
  outermost `buildFloor`). `rgMake` builds the base monster and tags it (`n.cb`, `big`, rk = the cb key so looks/rules use
  `m:cb:...`); the boss walks itself (`stepTo`), attacks from `upd` (bolts `SH`, slam marks `TG`, drawn in `pP`), is drawn scaled
  with a name and bar in the outermost `pS`. 053's population cap ignores `n.cb`/`n._cbs` (helpers get `RG_OWN`). After a
  kill it stays away `rs` minutes (localStorage `sq_cbdead`). Drops = the Monsters tab rules for `m:cb:...`.
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
- **Admin tab** (`dev/161-s167-admin.js`, `window.SQADMIN`, Dev Suite > Admin): Deaths (`deaths`, 252's records; newest 400 by key) and Bug reports (`bugs`, devs read; `st` status and
  `re` reply are dev-only children, a reply also goes to the player as a gift message), Players (`lb` list + dev read of
  `saves/<uid>`, gifts), News & events, Economy (gold/items summed over every account save, market offers/last trades).
  Game side: `gifts/<uid>/<id>` {k,n,g,m,t,f} written by devs, claimed once by the player's game (transaction to null, then
  bag/gold + message); `news` {m,t,until} = banner `#sqnews` (closed per `t` in localStorage); `events` {n,xp,until} = XP
  multiplier (outermost `addXp`, max ×5) and pill `#sqevp`. Rules: `gifts`, `news`, `events`, `bugs.st/re`, `saves.read` (publish them).
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
  perk:{'<TABLE>:<perk id>':%}, mat:{'<item key>':{x,t}}, wc:{base,step,qlog,start,t:{...}}} (wc: the Woodcutting sub-tab, 287 in skills-items.md: base chop time, Quick Chop
  seconds, logs a quarter, starting extra log limit, toughness per tree, and a table of chops and seconds per tree with each axe). `act` edits the xp field of COOKS/SM/GOODS/BREC/FREC/FISH_T/SQTIER entries in place (not `_cu`,
  not furnace/anvil recipes the Material XP table covers: `_mx`, see 276 in skills-items.md); the Material XP view edits `mat` and lists what each recipe comes to;
  `perk` edits the [id,value] pairs of 038/039's GSPD/GEXT/GRAR/GDBL/STAYP/FOODP/PSPD (one id can sit in two tables, hence the
  table in the key) and swaps the % in the perk's description. Originals captured at load. Perks written into code have no
  table and aren't editable. `sim()` = actions/time between two levels from XT.
- **History & search** (`dev/164-s170-history-search.js`, `window.SQHIST`, Dev Suite > History): the library diffed as units (one
  entry; one level deeper for stats/content/balance; swings whole). Publish some changes = live + the ticked units from the draft;
  versions list what each changed vs the one before; "Make live again"/"Undo the last publish" publish an old version as a new
  one (same hist/prune steps as 111b's goLive). Search covers items, monsters, islands (people, signs), bosses, content, look
  names, skills; results open the tab (Content through `SQCONTENT.edit(section,id)`).
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
- **Live publishes** (`ui/174-s180-live-updates.js`, `SQLIVEUPD`): the game watches `assets/live/v` (realtime listener once `SQFB` is up,
  plus a fetch of `assets/live/v.json` every 30 s and on returning to the tab); a new `v` runs `SQA.refresh()` (full library, applied
  in place) and `SQBETA.check()`. Anything a library section sets must therefore be safe to re-apply mid-game (`SQA.onApply` hooks).
- **See-through colours** (Nov 22, Jace: "I want to be able to make ghosts"; check 93): a palette colour is `#rrggbb` (solid) or `#rrggbbaa`
  (`SQA.alpha` in 111a: `a(c)` 0-255, `rgb(c)`, `set(c,a)` writes `#rrggbb` at 255, `bg(c)` = a swatch background over a checker, `ok(c)`).
  Canvas `fillStyle` takes both, so `render()` and everything drawn from it (icons, worn looks, pets, props, paintings, patron art) needs
  nothing else; `dyeMap` keeps a dyeable colour's alpha, 253's shiny inversion keeps it, 111b's `near()` reads only the rgb. Every 111b
  picture editor: an Opacity slider (`data-in="alpha"`, 10-100% in 5s, one undo step per drag) next to "Change this colour" (whose
  `<input type=color>` gets/keeps `rgb` + the colour's alpha); swatches and the hex box show it; hex boxes, Add hex and Paste palette take
  `#rrggbbaa`; the sprite canvas draws the checker under see-through pixels (it isn't cleared between paints). The Art Room (211) has the same
  slider (`#aral`, under the palette, not for the clear slot), via `SQA.alpha`. The island builder's ground tiles stay solid (no slider).
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
  Trees made here use their Toughness against the axe's chopping power (277: 1 to 3), up to 400; rocks and veins keep 1-40 and 1 + tier.
- **Worn looks for new gear** (111a apply): `WORN` takes every valid `worn.<eq_...>` without checking `EQ` (newgear items are registered
  by 111a2's onApply hook *after* the worn loop, so their looks used to be dropped on every normal load; drawWorn/hideFor check slots).
- **Recipes tab** (`dev/183-s191-recipes.js`, `SQRECIPES`, Dev Suite > Recipes): one list of every recipe (161b's `SQDATA.RREF` game
  recipes, Content `r_` recipes, newgear `sm`, Gathering fish/crop cooking), filter by station, search = "makes it" / "uses it".
  One editor saves each change where it lives: game rows to `stats.recipe.<key>` (mats written as item keys, so same-named items
  stay apart) + XP to `balance.act` (ids `<TABLE>:<key>`, originals `SQBAL.OA`), content to `content.recipes`, gear to
  `newgear.<k>.sm` (via `SQGEAR.ngClean`), fish/crops to `gather`. The game's cooking recipes keep their single raw food.
  111a's `apply` keeps a copy of the applied stats (`applied`), so a row deleted from the draft is still put back.
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
- **Chat log** (`dev/233-s241-chat-log.js`, `window.SQCHATLOG`, Dev Suite > Chat log): reads public `chat` (never `pm`) newest 1000 first, "Load older"
  pages by push key (`orderByKey`+`endBefore`+`limitToLast`), search, a "Possible bugs" filter (`BUGRX`), Download .txt / Copy. Players report
  bugs in chat a lot: check it with the bug reports. The checks' fake db now applies those three query parts in `get()` only.
- **New pets** (`dev/234-s242-new-pets.js`, `SQNEWPETS`, Dev Suite > New pets + "＋ New pet" in the Pets list): library `newpets.np_<id>`
  {n,d,v} (id ≤ 9 chars: 061 keeps 12 of `pet`) → LUX.PETS kind + item `pet_np_<id>` built like 104/151; look = `pets.np_<id>`.
  v>0 = sold at Marlo's, 0 = rare. Unknown pets in saves wait in `PEND` (bag) / `PPET` (PET slot). The dev's draft pets are registered on
  their device while the suite is loaded. Art Room's pet card can make "a new pet called <name>" from a submission. Never delete a published one.
