# Multiplayer and social

The multiplayer block (061-080) and everything social: player menus, duels, chess, parties, emotes, chat, moderation, young players, the market.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

- **Name button** (`multiplayer/119-s124-trade-button.js`): when another player stands within ~2 tiles and no other code
  wants the TALK button that frame (it hides the button before the inner `upd` runs and yields if anything shows it again),
  the button shows their name (class `sqpn`) and a tap / T / ✕ opens the player menu `SQPLAYERMENU(uid)` (130).
  062 exposes `SQTRREQ`, `SQTRNEAR` (its `trNearList`) next to `SQTRADE`.
  Skipped for players with `pk` while `SQPVP.on` (a controller's ✕ is also the attack, via `SQPADUSE`).
- **Player menu and duels** (`multiplayer/130-s135-player-menu-and-duels.js`, `window.SQDUEL`/`SQDUELAPI`, `ptab` 36/37):
  menu = TRADE (`SQTRREQ`), ADD FRIEND (`SQADDFRIEND`, exposed in 061), INVITE TO PARTY, DUEL, CHESS. Duels: `dreq/<to>/<from>`
  {n,s,t} and `duels/<a_b>/<uid>` {i,g,s,a,c,f,l,d,t}; `s` = a per-duel nonce (in the key, and sides with another `s`
  are ignored). Stakes leave the bag when both accept twice (f), countdown, fight: 064's `pvTarget`/`pvMelee`/
  `pvProjHits`/`pvIncoming` let the two hit each other (`pvDuel`); `P.hp` gets a setter so reaching 0 = loss with full
  health on the spot (no death). Winner adds both stakes; loc change or 20 s offline = loss; 3 min = draw. Rules for
  `dreq`/`duels` are in `database.rules.json` (publish them).
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
- **Chess ladder** (`multiplayer/142-s147-chess-ladder.js`, `window.SQCHR`): Elo from 1000 (K 40 for 10 games, then 24) through
  `SQDUELEND(kind,res,foe,why)` (called from 130's win/lose/draw3); opponent rating read from `lb/<foe>.cr` at `SQPVC.begin`.
  Unrated: < 10 plies, > 3 games against one player a day. 068 posts `cr`/`cg` and has the `cr` "Chess" category. Saved as `chr`.
- **Party chat and shared gold** (061 + 136): chat tab `pt`; party messages are pm's starting with `[Party] ` and are logged as `pt`
  (not pm). `SQPARTYSAY(msg)` sends; 061's block `mpSend` routes the Party tab and `/p`. Beating a monster (`enemyDrop`) with a
  member nearby sends fx `pg` {g,p,x,y}: members within 20 steps get half (the kill's 2-6 gold counted as 4 + the drop's gold, max 100).
- **Moderation** (`multiplayer/170-s176-moderation.js`, `SQMOD`, Dev Suite > Moderation): `mod/<uid>` {mu, ba (until, ms), r, by, t};
  the rules refuse chat/pm from muted or suspended accounts and presence/market offers from suspended ones (a missing `mu`/`ba`
  must pass: the rules use `!exists() || val() < now`). Game side: `#sqban` notice + `upd` stopped while suspended; 061's
  `mpSend`/pm send ask `SQMOD.blockChat()`. `reports/<id>` from the player menu's REPORT (130 → `SQREPORT(u,name)`, `ptab` 40).
  Devs can delete chat messages. "Find a player" (`findView`) searches every `lb` account plus players online now (`SQMP.players`,
  `seen` within 60 s, performance clock) by name or account id, with the same mute/suspend buttons, so no report is needed.
  Rules: `mod`, `reports`, `chat`, `pm`, `presence`, `market/offers` (publish them).
- **Two player menus**: tapping a name in chat opens 070's `#mppm` (message/friend/trade/IGNORE/REPORT); walking up to someone opens
  130's panel menu (now with IGNORE/UNIGNORE via `SQIGNSET`/`SQIGNORED` and REPORT via 170). Both REPORTs write `reports/<id>`
  (070 adds `m` = their recent messages). The ignore list is 070's `IGN` (saved as `ign`), shown under IGNORED in Chat > Friends.
- **Chat commands after the MP block**: 061's chat box calls `window.mpSend`; 080 (end of the block) sets `window.mpSend=mpSend`
  (the block's chain: 062 /trade, 070 /ignore, 072 dev commands). Sections after the block (111b /suite, 136 emotes) wrap
  the global `mpSend`; before this, the box called the block's own binding and those commands were sent as plain chat.
- **Controller wrap / name button** (158, 119): with nothing in the d-pad's direction, `navMove` wraps to the far item that overlaps
  the current one on the cross axis (same row/column), or stays put. 119 compares only the word before `<small>` on `tk` (the
  key hint is rewritten by 023/124's controller labels; comparing the whole label made the name button flash).
- **Chat bubbles** (`multiplayer/187-s195-chat-bubbles.js`, `window.SQBUBBLES`): the outermost `drawHUD` nulls every `r.said` and
  `MP.selfSaid` for the inner call (061 then draws names only) and draws speech bubbles itself: wrapped (3 lines), 4 s + 70 ms a
  character, newest first (your own always first), stacked upward, else under the speaker's feet, else a "…" dot; never over the
  HUD corners (`hudLayout`) or the touch buttons / ONLINE / BUG / event pills (DOM rects, keep-out list `KO`). Cap 4 (5 on big screens).
- **Emote animations** (136 `act`): the body is redrawn from `OFF` with dx/dy (hop/sway), `hx/hy` (the head, rows 0-39, moved on its own),
  `sq` (a torso row dropped on landing) and `arms` ([[side,sway]] → `armUp`, which clears the kit's hanging arm at columns 17-18 / 29-30, rows 42-48, and re-outlines the torso edge at 19 / 28); sleep draws the whole OFF rotated -90° on the ground.
  Effects use pixel glyphs (`GL`: heart, check, cross, ?, note, star, spark, z) through `glyph(C,k,x,y,col,outline)`.
- **Hide chat** (`ui/191-s199-hide-chat.js`, `SQHIDECHAT()`): Options button, localStorage `sq_hidechat`; `body.sqnochat` hides `#mpb`, and 187
  skips players' bubbles (yours too) when it's on. **Island people's speech bubbles** (117) are handed to 187 through `window.SQNPCSAY`
  {x,y,said:{m,at},seen} (refreshed while 117 draws the person) so they get the same HUD-avoiding placement; 117's own world-space bubble
  is only drawn when 187 didn't place one last frame (`SQBUBBLES.last.npc`, e.g. offline).
- **Young players** (`ui/207-s215-young-players.js`, `window.SQAGE`): once per account a birth-year question (`#sqage`, pauses `upd`, owns
  `navRoot`) stores only the age band in `age/<uid>` {b:'c'|'t'|'a',t} (player can write it once; devs can correct it) + localStorage
  `sq_age_<uid>`. `c` (under 13): chat input read-only, PHRASES only (outermost `window.mpSend` checks `PHRASES`), `SQTRREQ` only to friends,
  PNAME 'Adventurer' instead of the Google name. **The database rules enforce it too**: chat/gchat/pm text from a `c` account must match
  the phrase regex (apostrophes are `.` in it), pm/treq/dreq to or from a `c` account need the child's `friends/<child>/<other>`.
  **Keep `PHRASES` and the rules regex identical.** The PHRASES button (everyone) sits in 061's `#mpf`, list `#agpl`. Test harness:
  mp3lib's `world(n,co,ages)` seeds `sq_age_<uid>`='a' unless `ages[uid]==='ask'` (fake3's db only enforces rules on guild paths: test
  rules with `rulesdb.cjs` directly, scratchpad `kidrules.js`).
- **Chat filter** (`multiplayer/208-s216-chat-filter.js`, `SQFILTER.clean/bad`): lists stored shifted by one letter (`un`); long words match
  anywhere after letters-only + leetspeak + squashed repeats, short ones whole-word; emails, phone numbers and links (not skillquestmmo.com)
  starred. Wraps window.mpSend, SQGUILDSAY, SQPARTYSAY, window.SQCHNAME (204's rename calls it), refuses names at 061's `#nmf`.
- **Account and privacy** (`ui/209-s217-account-and-privacy.js`, `SQACCOUNT`): Options > ABOUT (links to `terms.html`, `privacy.html`,
  `refund.html` + `legal.css` at the repo root, plain files, not built) and "Delete my account" (type DELETE; stops saveLocal/saveCloud,
  removes the owner-deletable records, deleteUser, sign out, clears sq_* storage, reloads; guild members leave first). Retention promised in
  privacy.html and done here: own pm > 90 days on sign-in; a dev's game once a day removes chat > 90 days, bugs/reports/stats days > 1 year
  (rules let devs delete bugs and stats/d days). `SECURITY-PROGRAM.md` = the COPPA written security program (review yearly).
  **If data handling changes, update privacy.html.**
- **Moderators** (`multiplayer/219-s227-moderators.js`, `window.SQMODS`, Options > MODERATION or `/mod`, `ptab` 49): `mods/<uid>` = true,
  written by devs only from the panel's Moderators tab (refused unless `age/<uid>/b==='a'`; the rules' `MOD` also needs it). Tabs: open
  reports (`reports`, Mark handled = `st:'done'`), public chat (delete), private messages (reads the whole `pm` node, filters to/from the
  player), Guild chat (guilds from `glb`, last 150 of `gchat/<g>`, delete; rules let mods/devs read and delete gchat), Muted, plus Moderators and Log for devs. Mute 1h/24h/7d, suspend 24h/7d, lift → `mod/<u>` {mu,ba,r,by,t}; the rules let a moderator
  write only `by` = themselves, never self/devs/mods, at most now+7 days, and never change a longer (dev) mute/suspension. Every pm look
  and action pushes `modlog/<id>` {by,a,u,x,t} (create-only, devs read). Players see a notice in the Private chat tab. Disclosed in
  privacy.html (Moderation section), terms.html and SECURITY-PROGRAM.md: **keep them in step if what moderators can see changes.**
  Rules: `mods`, `mod`, `reports`, `chat`, `pm`, `gchat`, `age`, `modlog` (publish them). Rules test: scratchpad `modrules.js`, panel `modui.js`.
- **Peer monster timers** (061's monster sync): fields matching `CDK` (`tcd`, `scd`, `gcd`, `lcd`, `cd`, `cbt`, `cast`...) are only taken from
  the owner when the copy is created; after that the copy keeps its own. Copying them on every update (the owner's skeleton timer runs
  far below 0 when nobody is in range) made copies of skeletons throw on every database update. New reload timers: end the name in `cd`.
- **Arrows online** (`multiplayer/203-s211-arrows-seen-online.js`): 064 only sent fx 'ar' from its `shoot` wrapper (021's old HIT
  auto-shot); every off-hand shot goes through `shootAim`, so the outermost `shootAim` now sends 'ar' for the arrows it added. A new way
  to fire projectiles must send its own fx event (`SQPVSEND`), or other players won't see it and PvP can't count it.
- **Projectiles over water** (021's `projBlocked`, a top-level const, edited in place): any tile `fishWaterAt` counts as water (islands'
  `R.tiles===0`, Hollow's sea, 145's yard ponds) lets arrows, spells and other players' projectile ghosts through; before, scenes used
  `solid()` only, so on islands every shot stopped at the shore and a shot from a boat (`SQRSAIL.on`) died on its first frame.
- **World Market box** (079): deliveries carry `o` (the box owner's offer) and `b` (writer); the rules only take them from someone
  else and tied to an offer of the owner's for that item. So the offer must still exist when the box is written: filled offers
  are removed by their owner after `HOLD` (30 s, `sweep()`), and cancelling an offer that already traded keeps it as `x:1`
  with `q=f` (removed by the same sweep). Offers with `f>=q` don't count toward the caps and aren't listed.
- **World Market rules** (`items/079`, inside the multiplayer block, so edit it in place): `SQWMRULES` = per-item cap (`PERK` 2 of the 8),
  price band `lo(k)`..`hi(k)`: at least half the shop value (`SELLP`), no top price since Nov 13 (`hi` = 1e7, the database's limit), expiry `expAt(o)` = 7 days from `t`
  (old offers from `RULES_AT`). Matching, browsing and the order book ignore expired and out-of-band offers; the owner's
  client cancels its own expired offers (refund). The database rules keep `t` unchanged when others fill an offer and
  no later than now (publish `database.rules.json` in the Firebase console).
- **Market prices and tax** (079, edited in place + `items/228-s236-market-prices.js`): `market/last/<k>` = {p,t,h} where `h` = the last `HMAX` (20)
  trades as "price:count:seconds36" joined by commas (written in a transaction by `rec()` after every fill; the rules already allowed extra children).
  `mkt(k)` = the quantity-weighted middle price of the last 30 days' in-band trades ({p,n,q,t,h}; falls back to `p` alone for older records);
  `window.SQMKT` {price, info, hist, spark, TAX, taxOf}. 079's form shows it with an SVG chart of recent trades (`spark`), `guide()` and the
  lists use it; 228 adds a line to the bag text (`bagGridHTML`) and the chest card (`chestCardHTML`). Tax: `taxOf(total)` = 1% (floored) of a
  fill worth 100+ gold, taken from the seller (the matcher's own GLD, or the gold box written to the seller). It is a gold sink; the buyer pays the
  full price. Enforcement is client-side like the rest of the market.
- **Players online** (`ui/139`, `window.SQONLINE`): a pill with a green dot and the count (you + players seen in the last 20 s)
  right above the day box, drawn in the outermost `drawHUD` while online.
- **HERE map players** (`ui/238-s246-online-list-on-here-map.js`): the outermost mapHTML adds 061's "Players online" list (class `sqonl`)
  on the HERE view, players on your island marked (here).
- **Player stats** (`ui/171-s177-player-stats.js`, `SQSTATS`, Dev Suite > Player stats): `stats/d/<UTC day>/<uid>` minutes played (sent
  every 5 min), `stats/f/<uid>` first day, `stats/dz/<day>/<where~monster>` deaths (+1 transactions). The tab shows players per
  day, new players and next-day / week returns, deaths, and (reading saves) the quest/guide step/total level of players who
  stopped. Rules: `stats` (publish them).
- **Merchant skill and GE-style market** (`skills/246-s254-merchant.js`, `SQMERCH`, + 079 in place, Nov 20): skill added after Brewing (never
  insert a skill before an existing one: saves keep XP by index). `sale(k,m,price)` = m x min(price, 3 x SELLP) / 6 XP (cap 50,000): 079 calls it
  when you fill a buyer's offer yourself, and on COLLECT for gold boxes, which now carry `i` (item) and `m` (units). `slots()` = 8 + 1 per 20
  levels (max 12), 079's `maxO()`. 079's screens: `slotsHTML()` (offer boxes), `finder()` (search + `CATS` chips, `WMK.cat`, `catOf(k)`),
  item cards in `.wmgrid`; CSS classes `wm*`. Check 10 checks the Merchant XP.

- **Chat length** (Nov 20): public chat, PMs, guild chat: up to 160 characters (061 `#mpi` maxlength, mpSend / send / mpChat / PM slices, 197
  SQGUILDSAY and its log); party chat 152 + the "[Party] " prefix (136); rules `chat` m <= 160, `pm` m <= 168, `gchat` m <= 160. 187's
  bubbles wrap to 5 lines, shown up to 12 s. Check 41.
