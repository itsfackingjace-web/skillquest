# Screens, controls and HUD

Controllers, custom controls, touch layout, camera, HUD layout on phones, the update check, the wiki.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

- **Cursors** (`ui/251-s259-cursors.js`, `window.SQCURSOR`): Options > CURSOR (free choices, localStorage `sq_cur`/`sq_curL`): 16x16 pixel
  grids `G` drawn at 2x (Normal) or 3x (Large) as CSS `cursor:url()` on everything (text inputs keep the text cursor). `inv`: the pointer is
  hidden and a white crosshair `<img>` with `mix-blend-mode:difference` follows pointermove. `off`: the off-hand item's `iconURL` turned 90°
  counter-clockwise, hot spot = the opaque pixel nearest the top-left (`OFF`, rebuilt when `occ('off')` changes, checked every 0.5 s).
  Controller: `navigator.getGamepads` is wrapped (like 023's PS4 fix): in screens (`pnOpen`/`menuOpen`/`smOpen`/chat) the right stick is
  taken out for the game and moves `VC` (`#sqvcur`, the same picture); while it shows, ✕ is taken out too and clicks under it
  (synthetic pointer/mouse/click events); D-pad or left stick hides it; at a scrolling screen's top/bottom edge it scrolls. Out in the world
  the right stick still aims. `window.__SQPADTEST` feeds fake pads in checks. Check 45.
- **Last input wins** (`ui/250-s258-mouse-hides-controller-ring.js`): a trusted pointerdown (mouse/touch) calls `gpActivate(false)` while `GPON`,
  hiding 172's ring and the pad button words; 081 turns controller mode back on at the next pad input, and the repeated
  "Controller connected!" message is dropped once. 023's A-button clicks are synthetic (not trusted), so they don't count. Check 43.
- **Hold HIT on touch** (`ui/248-s256-hold-hit-on-touch.js`, `window.SQHOLDHIT`): a touch on `#a` (004's HIT) that stays on the button
  repeats `attack()` after 0.35 s whenever `swing<=0` (not fishing/building/with a screen open), like 023's R2. Check 37.
- **The touch ULT / SLAM button** (`ui/269-s277-ult-button-check.js`, `window.SQULTBTN`, Nov 22, Derek on an iPhone: SLAM did nothing,
  but a copy of his save slams fine in the checks): window-capture `pointerdown`/`touchstart` take taps on `#ub` before 030's listeners
  (one cast per 350 ms, whichever arrives first); a tap inside `#ub`'s box on a non-control layer still casts; a tap that changes nothing
  (slam/ult cooldown, message, Dragon Form, dagger) says so and sends one `[auto] ULT button did nothing` report a session (state, button
  box, touch layout); a covered tap sends `[auto] ULT button covered` with what was on top. Leaves taps alone while a screen is open.
  Derek turned out to be on a laptop: 010's HUD chips now record their boxes in `window.SQCHIPS` ({k,x,y,w,h}, canvas pixels) and the ult
  chip is purple when ready (grey with a countdown); on a keyboard (`isPC && !GPON`) 269 wraps `hudLayout` to add the key (`SQKEYS.keys.ult`,
  default V) to a ready chip ("SLAM (V)"), and a click or tap on the chip (canvas pointerdown inside an `ult` box) fires like the button.
  The V / L1+R1 help lines (029, 023, 124) say "ultimate (wand, Ground Slam, Dragon Form...)".
  Nov 23: a tap while the picked ultimate recharges (`cdLeft()`: SQSLAM.cd for slam, ULTCD for a wand) says "... is recharging (Ns)." and
  is never reported (Lincoln's were: the game's own message hadn't shown yet, so 269 thought nothing happened). Check 91.
- **Hold CAST / BOW on touch** (`core/082-s63-aiming-...js`, `window.SQHOLDAIM`, Nov 21): holding `#aimb` without dragging fires at
  `nearestFoe()` (or straight ahead) after 0.35 s whenever `swing<=0`; a hold that fired doesn't fire again on release; a tap
  (< 0.35 s) still fires once on release, and dragging still aims. Check 70.
- **Chat on touch screens** (`ui/121-s126-chat-at-bottom.js`): `#mpchat.sqbot` sits at the bottom when `!isPC`, lifted
  above the keyboard using `visualViewport` (gap below the visible part), with a shorter message list.
- **Custom controls** (`ui/124-s129-custom-controls.js`, `window.SQKEYS`, Options > Controls, `ptab` 45): keyboard binds in
  localStorage `sq_keys` (action -> key, only changes), controller in `sq_pad` (PADB name -> button index). A window capture
  listener turns a trusted key into the game's own key for that action (new KeyboardEvent on the same target) and swallows a
  game key whose action moved; untrusted events (the controller's `gpKey`), text boxes, the Dev Suite and Ctrl/Alt/Meta
  combos pass untouched. Middle/side mouse buttons bind as `mouse1/3/4` (pointer events). The outermost `pollPad` swaps
  PADB to the player's buttons only during play (no menu/`navRoot`, title, chess, START menu, fallen) and puts it back.
  New key-driven actions should be added to `KA` (keyboard) or `PA` (controller) there.
- **Check for updates** (`ui/125-s130-check-for-updates.js`, `window.SQUPD`): fetches `index.html?upd=<time>` with
  `cache:'no-store'` (the query skips the Pages CDN cache), reads the first `PATCH_NOTES` version from the text and compares
  it with `window.SQVER` (set at the end of 074; PATCH_NOTES itself is inside the multiplayer block). UPDATE saves
  (`saveLocal(true)` + `saveCloud(true)`, 2.5 s at most) and loads `?v=<version>`; the query is removed again on load.
  Options button, auto-check every 10 min / on returning to the tab, and a top bar (hidden while a panel is open).
- **Touch button layout** (`ui/126-s131-touch-layout.js`, `window.SQTOUCH`, Options > Controls > Touch): localStorage
  `sq_touch` = {p|l:{id:{x,y,s}}} (centre as a share of the screen, size), per orientation (`innerWidth>innerHeight` = l).
  `apply()` (outermost `upd`, every frame, only writes changed values) sets left/top/transform with `!important` on
  a, e, f, tk, rl, ub, aimb (beats 082's `placeBtn` for BOW/CAST). Edit mode: pnOpen=true (game paused), all buttons
  shown, window-capture listeners turn touches into drags and keep them from the game; closePanel ends it.
- **Camera** (001 `camX()/camY()` + `graphics/127-s132-smooth-camera.js`): the view's top-left is `round(P.x*Z)/Z - floor(W/Z/2)`
  (screen-pixel precise; a whole number of world pixels to the centre). Always use `camX()/camY()` for overlays that redraw
  in world space (never `Math.round(P.x-(W/Z)/2)`: with a fractional half screen that made the player jump a world pixel
  back and forth, the old "shaky camera"). The outermost `pP` translates by the player's sub-pixel offset so you and
  everything drawn with you stay put.
- **Wiki** (075, inside the MP block: edit in place): `start` tab is "Home" (next steps from `QS[Q.i]`/VOYS, `.hub` buttons to
  every tab, controls, tips); `wkGrid` puts runs of `.c` cards in a 2-column `.cg` grid at ≥900px (panel max 1100px); patch notes
  show 12 until `WK.allp` (`data-wkm`); islands say how to get there via `wkRoute(id)` (charted / which voyage); the voyage guide
  lists each voyage with the player's own progress.
- **Descriptions**: `SQSTRIPSTATS` (084) removes a leading stats line from saved description text, so library items saved
  with their stats in them don't show them twice. `SQPROPS.mkey` uses `rv` or `vr` (dungeon monsters keep variants in `vr`);
  the Monsters tab lists dungeon-only variants. The wiki (075, inside the MP block) redraws monster pictures on every open
  and shows health through `wkHp` (monster rules).
- **Discord button** (`ui/137`): a real `<a target="_blank">` (class `tsdc`) in the title menu (`#tsmn`, 061's block, so found by
  id) after OPTIONS; `window.open` from the title menu opened nothing. The Windows app sends it to the browser.
- **Message box on phones** (010's `drawHUD`): touch screens held upright (`H>=W`) draw the text box in the strip above the status
  box (`ty=top-th-3U`, 44U tall, `MSGBOX.top`); the players-online pill (139) skips drawing while it's there.
- **Controllers everywhere** (`ui/150-s156-controller-everywhere.js`, `SQOSK`): `navRoot` also returns the request popups
  (#trpop/#ptpop/#dlpop/#updbar, 0.5 s after they appear) and #sqlost/#sqsess; ○ there clicks `.no`. `navItems` adds textarea/select;
  `navPress` with `GPON`: text inputs/textareas open the on-screen keyboard #sqosk (number inputs get digits), checkboxes tick,
  selects cycle. The keyboard's ○/△/□/R1/Options are taken in the outermost `pollPad` before 023 (marked held in `GPPREV`).
  OK writes the value (input/change events) and submits a one-line input's form (chat #mpf, name). New text boxes need nothing.
  A visible `[role=dialog]` inside the panel (011's chest item card) becomes `navRoot` (the highlight stays in it); ○/Options
  click its close (`[data-chx]`/aria-label Close/×). Give new in-panel cards `role="dialog"` and a close button.
- **Controller cards** (`ui/158-s164-controller-cards.js`): the outermost `navMove` measures to the nearest edge (gap in the
  direction + side gap ×3 + centre offset ×.15) so wide buttons are reachable; the thing a `[role=dialog]` card was opened from
  (`data-k`/`data-a`) gets the highlight back when the card closes (checked every 60 ms).
- **Controller highlight ring** (`ui/172-s178-controller-highlight.js`, `#sqgpr`): a fixed overlay (top z-index, pointer-events none)
  follows `GPF`'s rect every frame while `GPON`, so pixel frames can't clip it (081's inset ring stays underneath). Side arrows
  only on items 300 px wide or more. Hidden when `elementFromPoint` at points inside GPF finds something else on top (`covered`). Nothing needed for new screens: anything `setFocus` highlights gets the ring.
- **Title hero looks** (`ui/178-s185-title-hero-looks.js`): when `gearCH().wr` is set, a 96x112 `hd2` canvas (2x transform) over 061's
  16x32 title hero draws the whole character through `cP` (kit at (16,19) of the 48x56 box; size/position set with `!important`).
- **Tidy phone screen** (`ui/182-s189-tidy-screen.js` + edits): every minimap drawer uses `L.mw||L.dw` (right-aligned to the day box);
  182's outermost `hudLayout` sets `mw` on sideways touch screens so the minimap ends above the action buttons under it. 111's
  `sqPlaceBtns`: ONLINE/BUG are 30px and in a row (upright phones: under the minimap; sideways touch: under the left HUD stack,
  `window.SQHUDBTN` = the row's bottom). 115's guide hint is drawn under the quest box (and under that row), 11 units, left aligned.
  131's floating words go under your feet (`q.hi`) while XP numbers (`drops`) rise over your head. 118's HIT says TALK only when
  the TALK button (`tk`) isn't already showing TALK. Fixed elements have no `offsetParent`: test visibility with `offsetWidth`.
- **Party list placement** (136's HUD): starts under the left HUD stack, then under 111's CHAT/BUG row when that row is in the left
  column (`SQHUDBTN`, phones without a minimap, e.g. indoors) and under 115's guide hint (`window.SQHINTB` {b,f}, its bottom in canvas
  px this frame). Anything else drawn in that column should record its bottom the same way.
- **Leaderboards in the menu** (`ui/190-s198-menu-leaderboard.js`, `window.SQMENULB`): SMI item `leaderboard` after Achievements;
  the outermost `showScreen('leaderboard')` closes the menu and calls 068's `lbOpen()`; pnOpen is held true while `SQLB.open`, and
  closing returns to the START menu when opened from it. Same file: `#sm` gets a max-height + scrolling, and three tighter columns on
  short wide screens (`max-height:520px` and `min-width:560px`, phones held sideways).
- **Sound for controller players** (`core/196-s204-controller-sound.js`, `SQPADSND`): browsers don't count gamepad buttons as a user
  gesture, so 006's `ac()` never woke `ACX` for controller-only players. A newly pressed button (own `PREV` after the outermost
  `pollPad`) calls `ac()`; if `ACX` is still not running while `GPON` (and not muted), bar `#sqsnd` asks for a click/key after 1.5 s;
  any trusted pointer/key/touch event wakes it.
- **Character tab cards and stats** (`ui/229-s237-gear-tab-cards-and-stats.js`): the outermost `equipHTML` puts an item card (`.sqgcard`: icon,
  name, `IDESC` with 084/111a2's stats, `SQVALUELINE(k)` = shop pays + 079's market price) under the selected slot's header (028's
  `EQSEL` panel), and extra rows after 028's "Block chance" row: health, `armorPts`, `blockCap`, `critCh`, every non-zero `SQGEAR.fxSum` effect
  (`FXN` names), `SQTURT`/`SQMETGEAR.worn()` pieces, `LUX.BUFF` buffs with time left. A newly tapped slot scrolls its card into view. Worn jewelry names (086's rows) become `.sqjwn` buttons (`data-jwc`, `JWSEL`) that open the same card in place of 086's
  description line. Mana regen = 028 base × (1 + 036's Magic level/perk share) + 086 sapphire .25, × (1 + `mreg`%) × 202's `MREG` (matches the measured rate).
  The bag's item text (228) shows the full value line. New stats/effects worth showing go in `extraRows()`.
- **Wiki pages** (075 edited in place + `ui/239-s247-wiki-pages.js`, `window.SQWKPAGES`): 075 keeps `WK.pg` {k,id} and `WK.hist`; `SQWK.pages[kind](id)`
  returns a page's HTML, opened by `data-wkp="kind:id"` (and every item link `data-wki`), ◀ Back = `data-wkb`; `SQWK.go(kind,id)` opens one from
  anywhere; `SQWK.h` exposes 075's helpers and `WK2`/`WK_TABS`. 239 registers `item`, `mob` (`rg:<SQISLIFE key>` or `h:<075 WK_MK name>`) and
  `place`, the tabs Brewing/Playing together/Patrons/Achievements, and Home's extra cards (calls the built-in `start` cards with `WK2.start` removed).
  Drops come from `src/data/239a-wiki-drops.js` (`SQWKDROPS`, generated: **rerun `node tools/wiki/drops.cjs` after changing monster drops in code**)
  plus live Dev Suite monster rules and Content loot tables. New recipe kinds go in 239's `recipes()`, new gathering in `gathered()`.
- **Wiki overhaul** (075 edited in place + `ui/278-s286-wiki-overhaul.js`, `window.SQWIKI2`, Nov 24): the tab row is now a left `.wnav`
  sidebar of sections (075's `WK_SECT`: Home, Getting started, Skills, Items, Making things, Monsters, World, Quests, Together, What's new;
  tabs no section lists fall under "More"); a one-tab section is a `data-wkt` button, a bigger one `data-wkg` (opens its first tab) with its
  tabs as `.wsub` buttons; on phones (≤760px) the sections become a row along the top and the section's tabs a `.wsr` row over the page.
  Every tab gets a `.wph` header from `WK_TDESC`; `SQWK.sections()` lists them. **A new tab must be added to a section in `WK_SECT`** (or it
  lands in More). 278: a new `WK2.start` Home (next steps, `nextUnlocks()` = "Coming up next" with `.wkpbar` bars, unlocked lately, skills not
  tried (`data-wksk`), latest patch note via `window.SQPATCH`, Browse hub), Items in groups (`catOf(k)`, `listed()` drops `u1-3_`/`w#_`
  copies; chips `data-wkic`, `SQWK.state.icat`; search ignores the group), `gearCard(k)` on item pages (slot, `SQGEAR.statLine`, needs,
  `SQREPAIR.maxD` uses, axe chopping power and time per tree, +1/+2/+3), `fixDescs()` (axe text from `SQCHOP`, furnace/anvil/iron/bars/cores),
  `clean()` strips "Your block chance now" from wiki text, the Controls tab and four more guides. Skill rows: `SQWKACT` (array of
  `(skill, rows)=>{}` hooks, rows `{n,xp,lv,t?,k?}`) fills Woodcutting times and the void tree row; WK2.skills shows a time column (`t`, seconds)
  and Unlocks from `treeGains`. Check 108.
  Fishing (Nov 24, check 111): 278's `fishList()` (on `SQWIKI2`) reads every catch source (FISH_T, the rainbow fish, `SQRFISH`,
  `SQDEEPFISH`, `SQPONDS.FISHOF`, `SQGFISH`) into Fishing's Training rows with `w` (where) and `ck`/`h` (Cooking level, hearts), which 075's
  table shows as Where and Cooking columns for any skill whose rows carry them; 278 also sets `WK_SKILL.Fishing` and adds the island fish
  to Fishing's `treeGains`. **A new fish shows up there by itself if it's in one of those lists.**
  **`.wc` needs `min-height:0`**: in the phone layout (`.wm` is a column) it otherwise grows to the page's full height and `.wb` can't
  scroll (Nov 24, live for 4 hours). Check 109 swipes and wheels Home and Items on a 390×844 touch phone; a case can now pass `context`
  (browser context options) to run.cjs.
- **Town names** (`ui/245-s253-town-names.js`, `SQTOWNNAME`, Nov 20): `here()` from the towns' own box tests (VX/VY, inTownBox, inFHBox,
  inDHBox, inTWBox, SQBW.town, SQAF.town, the dustwater landmark); drawn at the top of the minimap (wrapped `drawMini52`) and as a wooden sign
  sliding in at y 96*U for 3 s when the town changes (SQHUD step). Check 33.
- **Wiki > Drop Card** (`ui/255-s263-wiki-drop-card.js`, Nov 20): tab `dropcard` after Brewing: an intro, the guide's pages (254's `SQBINDER.GP`,
  one source for both), your collection count, every card by group (picture, stats, where it drops, link to its item page) and every pet card's
  Companion power. Check 49 opens it.
- **HUD colours** (`ui/281-s289-hud-colours.js`, `window.SQTHEME`, Nov 25, Jace; check 119): bg `#FFECA6`, text `#69411B`, border `#35611D`
  (+ shades: ring, sh, lite, tan, tab, tabOn, dark). Reassigns 059's `g3box`/`g3bar` and `g3text` (light fills → bg; `#404040` → text;
  the old blue accents `#3058c8`/`#3878b8`/`#5878b8` → border green); frames the minimap (wraps `drawMini52`); 010's day bar outline
  reads `SQTHEME.bd`. Every game `<style>` (now and added later) and every inline `style` has the old palette swapped (`MAP`: slate
  `#485870`, ring `#a8c0e0`, `#404040`, `#f8f8f8`, the blue tabs and light blues; `background:#fff` → light cream) by a
  MutationObserver; style-attribute changes re-check only that element (`SQTHEME.n` counts: 0 while walking). `#sqtheme` (its own
  rules) is moved back to the end of `<head>` when a stylesheet is added. Dark screens' navy (Dev Suite, card binder) is left alone.
  A new screen that uses the old palette is themed automatically; a new colour meant as a UI colour goes in `MAP`.
