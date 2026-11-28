# Guilds

Guild founding, island, quests, perks, bank, bosses (Void Treant, Giant Turtle), capes, sails, ponds.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

- **Guilds** (`multiplayer/197-s205-guilds.js`, `window.SQGUILD`, START > Guild, `ptab` 44): found for `COST` (5,000,000) gold. Database:
  `guilds/<g>/{info{n,tag,col,lead,t}, m/<uid>{r l|o|m,n,j}, q{k,goal,p,c,t,by,done}, prog{qd}, perm{o,m} (withdrawals a day, -1 none), bank{i,v,lid},
  isl/<cell>=node key, wd/<uid>{d,n}}`, `glog/<g>/<id>` (create-only, read by leader/officers), `gname`, `gmem/<uid>`, `ginv/<uid>/<g>`. Every bank change
  is one multi-path update (`bankUpdate`): counts + `v` exactly +1 + `lid` naming a new glog entry in the same write, so the rules refuse stale/duplicate
  changes and unlogged ones. Quests `QK` (next goal = `prog/g<k>` (each claim writes this goal x2, capped at x1024; base wood/mine/forage 100,000, fish 50,000), or base x 2^rank for guilds from before Nov 20 (`goalOf(k)`; the rules check both); progress counts like 120's dailies
  (items arriving in a frame with that skill's XP) and is added with a transaction every 8 s (max +5,000 a write); when `done`, a leader/officer `claim(i)`s
  one of `QK[k].rw` (prog/qd +1 with q removed). Island = region `gi_<g>` registered only on members' games (`register`, cached in localStorage
  `sq_guild`; `routeOpen` wrapped, other `gi_` ids closed); the outermost `loadRegion` removes stray objects and plants `NODE` items from `isl`
  (`it._gn`; void sapling = tree with `v:'dark'`). Board/bank use `use:'gboard'|'gbank'` (outermost `useFurn`); banner `gflag` drawn in the outermost `drawFurn`.
  Presence carries `gt`/`gc` (061, both ends); `[TAG]` drawn via `SQPEERFX`. Player menu (130) asks `SQGUILDPM(u)`/`SQGUILDINVITE(u)`. Rules: `guilds`,
  `glog`, `gname`, `gmem`, `ginv` (publish them). Rules were tested with a local evaluator (scratchpad `rulesdb.cjs`/`rulestest.cjs`), not the real emulator. The real SDK's `ref(db,'')` throws (empty path): use `ref(db)` for the root (197's `ref` helper does). **RTDB rules have no `numChildren()`** (the console refused it): the 30-member cap is the game's (`MAXM`), and the rules let the leader delete the whole guild.
  Guild screen classes are all prefixed `gd` (`gdgr`, `gdgi`, ...): 011/007/022/... already use `.gr`/`.gi` (crafting/anvil/furnace rows), and
  197's first `#pn .gr` rules restyled every station screen. **Prefix the CSS classes of new panels** (check `grep 'class="name"'` first).
- **Guild perks** (197, see its header): `prog/<wood|mine|forage|fish>` = skill ranks (claim adds 1 to the quest's skill; the rules
  check it against `q.k`), +10% XP (outermost `addXp`, `arguments[1]` scaled) and 10%/rank extra items (upd, same frame rule as quests)
  per rank (max `RMAX` 5). Buildings `BLD` by guild level, placed at runtime by `applyBuildings` (`_gb` lm items in `spots(R)`, kept free of
  planting by `reserved`): horn (`routeGo(REG)`, 3 min cooldown in localStorage `sq_ghorn`), forge (`gstation` items drawn with
  `drawStation`, TALK = `openStation`), shrine (`LUX.BUFF` wis+regen 20 min, once a day `sq_gshrine`), hall (`maxM` 40, +5% XP).
  Planted nodes regrow after 60 s (`g2.at-=180` in upd, offline); online, 061 shares `gi_` islands like every region since Nov 24
  (`world/res/r_gi_<g>/<cell>`, `SQRES.regrow(loc)` = 60 s for `r_gi_`, 4 min elsewhere; the rules let `r_gi_` entries go after 55 s).
  Guild chat: `gchat/<g>/<id>` {u,n,m,t}, 061 has chat tab `gd`, `/g`, `.gld` lines, `window.SQMPLOG(k,m,extra)` = the block's `mpLog`,
  `window.SQGUILDSAY`. Leaderboard `glb/<g>` {n,tag,col,lv,m} (members write when it changes, `pubLB`). Rename: `info.rn`, cost
  `RENAME` after the first, gname moved in one update. Tag: `retag` (leader, free) writes `info/tag` (rules: 2-4 A-Z0-9). Panel messages: `tell()` = say + a note card on top of the guild screen (8 s).
  Rules: `gchat`, `glb`, `guilds.prog`, `guilds.info.rn`, `gname` (publish them).
- **Void Treant** (`combat/199-s207-void-treant.js`, `window.SQGTREANT`): a weekly guild boss. Void trees (`o.v==='dark'`) give `voidlog`
  instead of plain logs (outermost `attack`, log deltas converted). The leader/an officer spends 10,000 void logs (`SUM`, 50,000 before Nov 24's slower void trees; the rules check the same number) from the bank (197's
  `bankUpdate`, log `w:'boss'`) and writes `guilds/<g>/boss` {w: week = floor((now-4 days)/7 days), t, by}; any member writes `k` when it
  falls (sqEvent 'islandboss' with a `gt_` id is swallowed there: no chapter-two `ibk`, achievements' `ibw` +1). While `w` is this week
  and no `k`, 197's applyBuildings adds a `gportal` lm item (use `gtreant`) on the guild island; the fight is 100's island-boss arena
  under id `gt_<guild id>` (the `SQIB` entry is non-enumerable so 111a/111d don't list it; `DKIND['ib_'+id]` registered every frame),
  drawn through `SQIBART` from the `TP`/`TR` pixel rows. Loot every fight: `eq_wvoid` (wand, element `void` in `WSP`, spellDmg +4,
  Magic 50, every 4th void hit heals a heart; 029's storm branch becomes VOID RIFT for it). Melee hits on it add 1 + axe tier +
  Woodcutting/10. 197 exposes `SQGUILD.api` (bankUpdate, tell, fail, boss, ref, DB, rec = G.boss, applyBuildings...). Rules: `guilds.$g.boss`.
- **Guild bosses framework** (199, `window.SQGBOSS`, alias `SQGTREANT`): `SQGBOSS.add(kind,{path,pre,need,unit,costTxt,have(bank),pay(bank)->changes,
  DEF (the SQIB entry), sk, bonus(), spots(R), spr, draw(b,tm), drawPortal, texts...})`. Each kind = record `guilds/<g>/<path>` {w,t,by,k} (its own
  rules node), arena id `<pre><gid>`, a `gportal` lm item with `bk` = kind (197's applyBuildings adds `SQGBOSS.portals(R)`; spots must have dry
  open ground below, where `ibEnter` puts you back), the guild screen's **Bosses** tab (`data-g="gtb:sum:<kind>"`). 199's outermost `upd`
  re-applies the island's buildings when `SQGBOSS.key()` differs from the room's `_bk` stamp. A summon also spends 1 rank of the boss's skill
  (`pk`: treant `wood`, turtle `fish`; `prog/<pk>` - 1 in the same update, `prk(k)` reads it): the boss/turt rules require
  `prog/<pk>` >= 1 and exactly one less in the write, and `prog` has a matching branch (leader/officer, qd unchanged, only that skill
  down by one, the boss record written with by = you and t = now). Ranks above RMAX are kept, so spending one there shows no change.
  Or (Nov 22, Jace) twice the materials and no rank: `summon(k,true)` (`gtb:sum2:<kind>`, `pay(bank,2)`, no `prog` in the update);
  the boss/turt rules take either (treant: void logs -10,000 with wood -1, or -20,000 with wood unchanged; turtle: the raw fish sum
  -5,000 with fish -1, or -10,000 with fish unchanged). Check 83. Kinds: `treant` (path `boss`, `gt_`),
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
- **Wiki > Guilds** (075, `WK_TABS` `guild`, `WK2.guild`): founding, island, quests/ranks, buildings, bank, guild bosses (pictures from
  `SQGBOSS.K[k].spr()`, costs from `need`), Turtle armor and capes. Update it when guild features change.
- **Guild ponds and one angler per spot** (`skills/222-s230-ponds-and-fishing-spots.js`, `window.SQPONDS`): 197's `QK.fish.rw` = pond items
  `gp_trout/salmon/sword/moon/koi` (+ bait); `NODE` has them (`PONDK`), `canPlant(k)` checks a 3x3 patch in front (middle = front cell +
  facing) plus a ring of land around it, `plant` stores `isl/<middle>`, `dig`/`spotOK` find a pond by any of its cells (`pondAt`).
  197's `applyNodes` calls `SQPONDS.apply(R,want,pondCells)`: those cells become water (`R.tiles` 0, originals in `R._pondO`, put back when
  dug), `R._ponds`, and the island's `RGCK` chunks are dropped so the ground is rebaked. Pond cells are added to `R.solid` (rooms walk by it;
  Nov 28, Applez walked on a koi pond, check 145), and the ones it added (`R._pondS`) are freed when the pond is dug up. Pond fishing = entries at the front of
  `window.SQFISHX` (093b, which now calls an entry's `got()` after a catch) whose `ok()` checks the bobber is in a pond of that kind with
  stock left (per player, localStorage `sq_pond`, 30, +1 per 120 s); chances trout/salmon/sword .6, moon .4 any time, koi .15. Library
  `ponds` {p,stock,refill} overrides. The rules needed no change (isl values are any short string, rewards aren't checked).
  One angler per spot (everywhere): the outermost `attack` calls off a new cast whose bobber tile equals another player's (same `mpLoc()`,
  presence `ak` 3-5, their bobber = tx/ty + facing x 24); two casts at once: the larger uid reels in within 3 s (outermost `upd`).
- **Guild sails** (`items/226-s234-guild-sails.js`, `window.SQSAILS`): START > Style gets a Boat section (added after 085's Style screen in the
  outermost `rPn`, `#sqboatsec`, `data-bsail`); save `gsw` (always written). gearCH carries the guild cape design as `slc` (c+1) `sls slp slt
  sle slx` while worn in a guild. The outermost `drawBoat26` finds whose boat it is (a sailing peer exactly at P, else you) and sets `CURD`;
  `BOAT85.back` is wrapped to return a recoloured sail layer (SA colours → main colour, RD band/pennant → second colour, pattern by position,
  trim on edges, emblem as large as fits (4x4 at 3x/2x, 8x8 at 2x/1x) with a contrasting outline, on cloth outside the sailor's box x±9, y -38..2, nearest the free cloth's centroid; end-on sails (symmetric about the mast) put it on the centre line and only search its height), cached per canvas + design. Furled/moored boats stay plain. Wiki > Guilds mentions it.
- **Guild boss mechanics** (`combat/241-s249-guild-boss-mechanics.js`, `SQGBMECH`, Nov 20): both bosses' `DEF` hp x3 and new attack lists. New engine hooks in 100:
  `SQIBFIRE[kind](b,o,T)` (`.now` skips the wind-up), `SQIBACT[k](b,A,dt)` (owner), `SQIBHZ(b,h,dt,owner)` and `SQIBHZDRAW` for new hazard kinds,
  `SQIBRING.un/hit` for rings that can't be rolled through (`kind` 'push' knocks back, 'poison' = `SQGBMECH.POI` 9 s of half-hearts). Treant: burrow
  (act, `b.inv`), seek (hz `kind` = the hunted uid, owner moves it and swaps target every 8 s, the hunted player's own game checks the hit),
  poison, mirror (`b.mir` seconds: hits heal; owner undoes drops between and during frames). Turtle: pull (hz), shell (act, `b.inv`, contact 2).
  `mir`/`inv` ride on SQMOBX/SQMOBRX. Knockback/pull never move you into the arena's bottom rows (its exit). 035 drops far dungeon monsters from
  `en`; 241 puts the guild boss back. Damage board: each fighter's own damage = boss hp drop during their own frame; `guilds/<g>/bd/<boss|turt>/<uid>`
  {n,d,w,t} written at the kill, the Bosses tab shows this week's top 5. Check 29.
