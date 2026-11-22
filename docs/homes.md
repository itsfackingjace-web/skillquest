# Homes and building

Houses, castles, yards, pets at home, chests, building only at home, homes on guild islands.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

- **Visiting island castles** (067's `rhForeign`, 077): other players' island homes come from `build/<uid>.r._h` rows `[rg,x,y,id,furn,castle]`.
  067 passes `c:e[5]` to `buildForeign` (wrapped by 077), so a castle's furniture is read with the 22x14 hall's tile numbers; it used to be
  refreshed every call with a 14x10 house's filter (only the first 140 tiles: the back half of the hall, and walls built further in were
  missing, Nov 19). Check 36.
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
- **Home comforts** (`items/148-s154-home-comforts.js`, `window.SQHOME`): yard campfires (012's indoors check and 049's
  "too windy" let yards through; `fireKey64` gives each yard its own fire stash `yard:<house id>`; the fires are kept as `_fire`
  room items so they draw and sort, 083's `drawFurn`; other players' shared fires (`_rp`) are included, or visitors never saw them). No hunger drain inside a house/castle (`SCENE.id==='home'`, not a yard):
  the outermost `upd` adds 3x the drain first and takes it back, so starving can't trigger; eating still counts. The
  wardrobe opens the character screen, so it gets its own `#cwpk` PICK UP WARDROBE button (`pickFurn`/`pickStruct`).
- **Deposit bag** (`items/149-s155-deposit-bag.js`, `SQDEPOSIT`): a DEPOSIT BAG button in 011's `chestHTML` (YOUR BAG header);
  own chests move everything (not `chest`) and save once; a friend's shared chest (`CHEST_H._sh`, 072) goes per item through `chestMove`.
- **Building only at home** (`items/173-s179-build-at-home-only.js`, `SQHOMEBUILD`): the outermost `startBuild`/`placeBuild` refuse every
  piece outside a `home` scene (house, castle, yard/courtyard) except house/castle and seeds (`FREE`). On load (outermost `applySave`)
  Hollow's `STR` and the islands' `RB` (065's `window.SQRB`) are packed into the bag and saved. 061's `buildSync` no longer adds other
  players' `build/<uid>.s` and 065's `rbForeign` returns nothing (island houses `r._h` still go through `rhForeign`).
- **Yards count as outdoors for weather and fighting** (`items/198-s206-yard-weather-and-training.js`, `SQYARDOUT`): `ROOMS.yard/court.cave`
  is a getter that is true only while the outermost `castSpell`/`shootAim`/`castUlt`/`drawCrosshair` run in a yard (the "Not indoors!" checks
  read `SCENE.room.cave`; everything else still sees a normal room: no cave darkness/music/caveAttack). The outermost `drawHUD` draws 021's
  `drawWeather` in yards, and `biomeHere` in a yard = the Hollow biome around the house door (`SCENE.ret`), grass for island homes.
- **Pets at home** (`items/206-s214-pets-at-home.js`, `window.SQHOMEPETS`): every pet item (`pet_<kind>`, 104) is pushed into `BK` (also on
  `SQA.onApply`), so the bag shows PLACE and every home loader/publisher keeps rows `[i,'pet_<kind>']` like furniture (houses, castles,
  island/guild homes, yards). The row is only the pet's home spot (not solid: the outermost `solid` treats it as a rug). Each pet is a local
  simulation (`PS`, key `<house _oid|id>:<i>`, modes idle/walk/nap/chase/flee/zoom/greet/follow/petted, `choose`/`tick`, walls via
  `solid`), run and drawn in the outermost `pP` (before the player when above, after when below) through the game's drawers with a state
  {x,y,mv,t,fl}: 111a `window.SQPETLOOK`, 093 `SQDRAWNPET` (`SQNPET`/`SQSIDEMAP`), 085 `LUX.drawPetS`, Imp `LUX.impDrawS`. Nothing is sent;
  visitors run their own copy. HIT finds the pet by where it stands (`front()`): pat = hop + heart; the owner's second HIT within 3 s =
  `pickFurn`. 118's hitWord says PET / PICK UP. 145's yard `canPlaceIn` refuses pond tiles (`fishWaterAt`). Old clients drop unknown
  furniture rows on load, so pets need this version.
- **Chest tools** (`items/204-s212-chest-tools.js`, `window.SQCHEST`): chest screen header with the name, ✎ RENAME (inline form, owner only: not
  `_sh`/`_foreign`), TAKE ALL (own chests at once + one save; shared chests through 072's `chestMove` per item) and SORT (type/name/amount/value,
  localStorage `sq_chsort`; `gridHTML` is wrapped only during `chestHTML`). Name = `nm` on the chest object, `SQCHNAME` cleans it (max 12):
  furniture rows are `[i,t,items,nm]` in 012/067/145 saves and `[i,t,0,nm]` in what 061 (`houses/`) and 145 (`yards/`) publish; 061's
  `buildForeign` and 145's visitor read take it back; island homes (incl. guild islands) go out through 067's `rbPub` `_h` (same `[i,t,0,nm]` rows,
  read back by `rhForeign` → `buildForeign`). The outermost `drawStruct` draws the placard (text shrunk to fit, `fillText` maxWidth).
  010's document keydown (capture) stops every key typed into an input and blurs on Enter, so Enter/Escape for a panel input must be
  handled by a `window` capture listener (forms in panels never get `submit` from Enter).
- **Homes on guild islands** (197): 067's applySave drops `rh` houses whose region isn't registered, and a save loads before the
  database says which guild you're in, so a house on the guild island vanished on a device without `sq_guild`. 197's outermost
  applySave registers the `gi_` island named in the save's `rh`/`region` first (adopting it as G.id when none is known); `rh` entries
  on another guild's island are packed into the bag (`packRaw`: house/castle, furniture, chest and yard contents), and `leftGuild`
  packs homes on the island being left (`packLeft`).
- **Home tax** (`items/267-s275-home-tax.js`, `window.SQHTAX`, Nov 22; Kevin's #ideas post, Jace's numbers): Penny the Banker (NPCS kind
  `banker`, ptab 2 panel by an SQRPN step) at a stall placed beside 079's World Market hall (`SQWMK.spot`, first free 5x3 box from a list of
  spots; BS on the two counter tiles, PROT around it; drawn through `LHOOK`). She never wanders: `wt:1e12` for 006's roaming and `H` far away
  so 061's shared wandering treats her as "on a routine". Per account (one home, 144): save `htax` {u paid-until (server ms = Date.now()+SQMP.off;
  061's `mpNow` isn't global), l paid time kept while you have no home, k house/castle, f free month given, h {id,at,debt,k,w} while held}.
  A 1 s tick starts the 30 free days when the first home appears, converts time left by price when house <-> castle, warns at 7/3/1 days
  and 1 hour, and when `u` passes (only once `.info/serverTimeOffset` has answered) takes the home: walks you out, removes it from `HOUSES`
  (BS tiles) or `SQRH`, sets `h._ypk` so 145 doesn't pack the yard, debt = price x 1.1. While held the outermost snap (`SQSAVE.wrap`) puts it
  back into its list for the call, so every save step writes it; the load step takes it out again. `startBuild` of a house/castle is refused
  while held, or with no home and no paid time. Paying: Hollow homes go back if `houseFits()` at their spot (P moved there for the call),
  island homes go back to `SQRH` (`_htchk`: on your next visit, another player's home within 6x1 tiles sends it to the bag); otherwise
  `toBag` (house item, furniture, chest/yard contents, framed cards). Others: 061's `myHousesData` adds `u`, 067's `_h` rows `[6]=u`
  (`[5]=0` then, 077 sets 1 for castles); `housesSync`/`rhForeign` skip rows `SQHTAX.gone(u)` (no `u` = an older game: paid until Dec 23),
  and 061 re-syncs foreign houses once a minute. The bag (`bagGridHTML`) and map (`SQMAPHTML`) show the status. Library `hometax`
  {house, castle, days, free, interest, ahead} overrides the numbers. Check 82.
