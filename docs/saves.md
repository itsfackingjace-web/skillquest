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
