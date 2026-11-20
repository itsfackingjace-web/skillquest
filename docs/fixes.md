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
