# Combat

HIT, PvP balance, ultimates, damage numbers, game feel.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

- **Tool swings / HIT** (`combat/122-s127-tool-swings-and-hit.js`, `window.SQTOOLSW`): the outermost `attack` sets `ACTN`
  chop/mine for any object whose `SKOF` is 1/2 (also boulders, regions, dungeons; 028 only knew tree/pine/cactus/rock/ore on
  Hollow) and sets `SQPVQUIET` for that call so peers don't get a sword swing. The outermost `pP` hides `swing` while a tool
  swing or a cast (plus its tail) runs, and draws `drawAct` in scenes. `wandTarget()` returns null during HIT, so HIT never
  casts (028's old auto-cast); casting is the CAST button / mouse / controller aim.
- **PvP balance** (`combat/154-s160-pvp-balance.js`, hooks called from 064's `pvHit`/`pvIncoming`, which can't be wrapped from outside
  the MP block): `SQPVDMG(kind,el)` = hearts from the monster damage numbers (melee `1+TL.sword+lv/15+meleeFlat`, `arrowDmg`,
  `spellDmg`; <7 = 1, 7-13 = 2, 14+ = 3; `ul` +4), receivers accept up to 3; `SQPVARM` (12+ armour points: -1 on hits of 2+);
  `SQPVIF` (0.5 s invulnerability after a player hit); `SQPVBLK` (block vs players capped at 25%). While fighting
  (`SQPVHEAL.fighting()`: duel, or `SQPVP.fight` within 10 s) healing is halved with carry, from food (outermost `eat`, `EATCD`
  5 s) and anything else (outermost `upd`, also between frames); duels after 60 s = sudden death (no healing, `#dlbar` text).
  A duel that ends in a frame restores health untouched.
- **Ult picker** (`combat/159-s165-ult-picker.js`, `SQULT`): `avail()` = slam (`SLEDGE`), dragon (`SQJW.neck==='ja_dsoul'`), wand
  (`WAND`); the gear tab (`equipHTML`, `data-ultp`) picks one, saved as `ultp`. The outermost `castUlt` hides the others
  (SLEDGE / SQJW.neck / WAND) for the call and puts them back. A new ultimate source must be added to `avail()` and hidden there.
- **Combat balance** (`combat/202-s210-combat-balance.js`, `window.SQCOMBAT`): the outermost `attack` ignores a swing that would hit a
  monster (`target()`: within 20 px of `front(13)`, 30 for big/boss) until `MELEE_GAP` (0.4 s) after the last swing that hurt one; the
  game's own `swing` is 0.25 s, which holding R2 (023's repeat) or Space used fully. Gathering swings aren't affected. Measured sustained
  damage per second vs one target (scratchpad `bal/dps.js`, levels 10/45/90 with that tier's best gear): melee 10/25/36 (52 with Tactics
  at the same level), bow 6/24/34, wand 2/16/~12 (mana: cost 2-3, regen ~0.5-2/s, so a wand empties in seconds).
  Since Nov 15 the same file also makes `WSP[el].cost` an accessor (base - 1, at least 1; 111a2's setCosts and Dev Suite `mp` rules write
  the base), triples mana regen (small per-frame rises in the outermost `upd` get 2x more added; potions untouched), and adds +1 to
  `arrowDmg` and `spellDmg`. Measured after: melee 10/25/36, bow 8/28/35, wand 7/22/31 (mana holds).
- **Mana pause** (`combat/265-s273-mana-pause.js`, `window.SQMANAPAUSE`, Nov 21): after 202, a mage in mage armour got more back than
  holding CAST spends (measured 4.8/s at Magic 47, 6.5/s at 99, vs 2.5/s for fire/ice), so mana never ran out. An `SQUPD.wrap` (outside every
  regen step: 028, 036, 086, 179, 202) starts a 1.5 s pause whenever MANA went down since the last frame or during this one, and while
  paused takes back small gains (< 1.5 a frame, 202's regen test); bigger ones (Siphon, potions) stay. Setting MANA lower by hand counts as
  spending. 229's stats row says so. Check 71.
- **Game feel** (`combat/195-s203-game-feel.js`, `SQFEEL`): end of the outermost `upd` compares nearby monsters' health with last frame:
  hit = sparks, killed (hp<=0 or `_kp` from the outermost `killEnemy`) = smoke puff in `COL` colours; shake = CSS transform on `cv`
  (Options "Screen shake", localStorage `sq_shake`, also gates 015's `shakeScreen`). Monsters inside a solid tile for 0.75 s are moved
  to the nearest free spot (skips big/boss/cb/under/_rp/ghost/wisp). 192 now counts make-all materials when `sqDo` is called (after
  039's station merge).
- **Death log** (`combat/252-s260-death-log.js`, `window.SQDEATHS`, Nov 20): the moment you fall (100 ms watch on `dead`, as 063's graves, plus a
  `reset` wrapper) one `deaths/<push id>` record is written: u, n, t, w (region/room), x, y, lv, dk (night), v, and from 227's `SQGHOSTHIT.hits`
  in the 10 s before: `by` (the last hit's message, else the last message), `m`/`md`/`ms` (nearest monster's rk, distance, ms since drawn on
  screen, -1 never) and `h` (hits). 227 now also looks at the monsters from before the update, since 001 empties `en` when you fall. Devs read
  them in Dev Suite > Admin > Deaths (24 h summary of causes and places, filter, red rows = "Ouch!" from an unseen monster). Rules: `deaths`
  (own uid, write once, `t === now`, fixed fields); 209's cleanup drops records after 90 days. Check 47.
