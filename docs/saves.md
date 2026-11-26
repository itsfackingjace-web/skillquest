# Saves and accounts

Account-only saves, backups, gear tiers kept on load, graves, items lent to the bag, late pet items.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

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
- **Top-tier gear on load** (`items/147-s153-keep-top-tier-gear.js`, `window.SQTFX`): 020's `applySave` clamps sword/axe/pick tiers
  to 4; later sections restore only their own tiers (035: 5, 084: 6/7). 147 restores any tier above 4 that has an `eq_<slot><tier>`
  item, from the save's `tl`, after every clamp. **A new tier above 4 needs nothing more, but never clamp again.** Bows too: 021 clamps `TL.bow` to 2, so 147 restores any `tl.bow` above 2 with an `eq_bow<t>` (the Bone bow, 3, became a Longbow on every load until Nov 14); `tfx` 2 saves get a lost Bone bow back once (in hand in place of the clamp's Longbow, else in the bag). Saves without
  `tfx` get a one-time return of `LOST` items that are in `ach.col` but nowhere in the save and not in hand.
- **Backups in Options** (106): players no longer restore backups themselves (restoring after a trade duplicated items/gold); Options
  shows one line pointing to Report a bug, devs restore via Admin > Players (161 `fixes` restore). Backups are still made (061/008).
- **Graves on a quick respawn** (063, in the MP block, edited in place): the grave is made by `grvFall()`, run by the 100 ms timer and also by a
  `reset` wrapper before 001's reset wipes `inv` (a respawn before the timer fired, or with throttled timers, lost the bag with no grave). With no
  `GRV.lastSpot`, `GRV.nospot` makes the wrapper keep the bag's non-gear items through reset instead. 220's `SQSAVE.wrap` step saves a campfire
  build's lent wood as the tier logs while `PEND` waits. 071's narrow-screen `#wbb` sits below 115's guide hint (`SQHINTB`).
- **No saves of borrowed chest items** (`items/230-s238-no-saves-while-chests-merged.js`, Nov 18): while `BMERGE` is set (027/033 station clicks,
  109's timed steps) the bag holds every nearby/house chest's contents too. 007's smithAct saves on every step, so saves held the chests
  twice (players' house chests "doubled"). Its `SQSAVE.wrap` step runs `benchSplit()`, snapshots, and merges the same chests again.
  **Anything else that lends items to `inv` for longer than one call must also be taken out of `snap`.**
- **Grave lock** (063, in the MP block, edited in place): `GRAVE_LOCK` 5 min from `g.at`, `grvLock(g)`; others see the items but no TAKE
  buttons and `grvTake` refuses. The rules check it too: `graves/$gid/i/$k` writes need the grave's `u` or `at < now - 300000` (publish them).
- **Late pet items** (`items/151-s157-late-pet-items.js`): 104 makes `pet_<kind>` items only for pets already in `LUX.PETS`;
  pets added later (116's `pmush`/`pglow`) get theirs here (else the PET slot shows empty and bag copies aren't in `INVK`).
  A pet added by a section after 151 needs the same.
- **Unknown items are kept** (`core/264-s272-keep-unknown-items.js`, `window.SQUNKNOWN`, Nov 21): 006 loads only `INVK` keys, so a game that didn't know an item (an older copy on another device, or an item registered late) dropped it and its next save erased it. 264 keeps every unknown `S.inv` key aside, writes it into every save (`s.inv[k]=max(...)`), and moves it into the bag (max, never add) once it's in `INVK` (every 3 s). Check 56.
- **Old games can't save** (Nov 21, Jace's and Kevin's cards): a tab open since before Drop Cards ran old code; PLAY HERE INSTEAD loaded the account save into it (006 loads only known `INVK` keys) and its next save erased every card. `saves/$uid` now requires the save JSON to contain `"dc_voidtree":` (every game since 2026.11.21-1 writes all `INVK` keys), and 061's `sqTakeBack` reloads the page (`?r=`) instead of loading the save in place. When a later item must be protected the same way, move the rule's key forward (games since 2026.11.21-8 keep unknown items anyway, 264). Check 58.
- **Saving behind screens** (`core/282-s290-saves-behind-screens.js`, `window.SQBGSAVE`, Nov 26, Joe's report, check 123): 006's 3 s local
  and 15 s account saves run in the frame's step, which doesn't run while a screen or the START menu is open, though fishing, brewing and
  make-alls go on behind them. A 1 s timer watches 006's `cloudT`: when it hasn't moved for 5 s it saves locally, and to the account at
  most every 15 s (`SQBGSAVE.n` counts).
- **Buffs kept** (`items/283-s291-buffs-kept.js`, Nov 26, Aztu, check 128): 085's `LUX.BUFF` holds end times on `performance.now()`, which
  restarts with the page. The save keeps the seconds left as `bf` {kind: s} (written every time, even empty; at most 3,600 s each) and a
  load starts them again with that time left, so the clock pauses while you're away. `SQNEWGAME` clears them. 218's dagger coating
  (20 s) isn't kept.
- **Lost progress reports** (`items/284-s292-pet-watch.js`, `window.SQPETWATCH` {n, last, log}, Nov 26, Kevin's golem and Joe's revert,
  check 129): report only. "[auto] Another device took over before this one saved": on the rising edge of `SQSTRICT.lost`, compares
  gold, XP total, item count and pets with what they were when 006/040's `lastCloud` last changed; reports when the pets differ, or the
  rest differ and that save is over 30 s old (`lost` diff, `savedAgo`). "[auto] Pet vanished: <kind>": a load while signed in that drops
  the pet in the PET slot (the loaded save's `savedAt`/`dev`/`cos.pet`). Both carry the last 12 `say` messages, once a session each.
  (While playing, 104's `sync` always moves a pet that leaves the slot into the bag, so there's no in-play check.)
- **Screens without lent chest items** (`ui/285-s293-bag-without-lent-chests.js`, Nov 26, sniffynose, check 133): 109's job steps lend
  the chests (`BMERGE`) and the step's own `rPn()` (022's `stationAct`, 039's wrapper) drew the open bag with them. The outermost `rPn`
  runs `benchSplit()`, draws, and merges the same chests again (like 230 does for `snap`); 033/027 still lend chests for their own
  workstation screens.
