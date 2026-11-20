# Patrons, art and paintings

Patreon link, patron perks, the Art Room (and editing submissions), paintings and the gallery, wearables and pets from art, capes.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

- **Patrons** (`multiplayer/210-s218-patrons.js`, `window.SQPATRON`): `patron/<uid>` {s,u (paid through, ms),c (fire cape, kept)} written
  only by devs (Dev Suite > Art Room > Patrons; later the payment server), read by everyone signed in (onValue on the whole node, `PR`).
  Active (u > now) = our own 9x11 pixel flame (`FL`, 2 frames; `SQFLAMEURL`) left of the name/OG crown over heads (outermost drawHUD,
  same layout as 061's `one`) and before `b.nm[data-u]` in chat lines (MutationObserver on #mpl). Fire cape: worn from START > Style (212), save `fcw`
  (always written), gearCH `fcp:1`; 201's `spec` gives `fire:1` (fireCol palette, flame tongues on the hem, 8 frames at 110 ms via
  `tickFor`); peers' `ch.fcp` is deleted every frame unless their patron record has `c`. Credits = ptab 46 (Options > ABOUT > Credits):
  `pcred/<uid>` {n,t} written by each patron's own game (opt-out `sq_pcred`; rules: patron record exists, not under 13), alphabetical,
  no amounts; `artcred/<id>` {n,w} for approved art. `PATREON` = the page URL. **Patron screen** (START > Patron, `ptab` 48, `showScreen('patron')`, `SQPATRON.open()`): status, perk cards (fire cape → Style, Art Room, credits toggle), a fire-cape picture (212's `SQCAPEX.picWith`), Become a Patron (`.sqpatlink`, signed in, age band known and not `c`, not active) and Link Patreon. The SMI item is added/removed in a `rSM` wrapper (`showMenu()`: signed in and a patron record, or a known non-`c` age band); Options keeps Credits + a Patron button. Patreon membership isn't linked to accounts automatically yet: devs grant `patron/<uid>` by hand (Art Room > Patrons). terms/refund/privacy.html name Patreon. **Don't name file-level consts `W`, `H`, `P`, `T`, `K`... : they hide the game's
  globals (`W`/`H` = screen size, `P` = the player) inside the section** (the flame first drew nothing because of a colour named W).
- **Art Room** (`ui/211-s219-art-room.js`, `window.SQARTROOM`, ptab 47): for active Patrons who aren't under 13. Pixel editor (up to
  48x48, 8 frames, onion skin, preview, palette slot 0 = clear, draft in localStorage `sq_art_draft`); SEND writes `art/<uid>/<id>`
  {n,k,w,h,f,ms,note,who,t} (f = JSON {p:[hex],fr:[one `CH` char per pixel, '.' clear]}); rules: create-only by active 13+ patrons, no
  st/re from players, no deleting approved pieces. Dev Suite > Art Room (`artroom` tab): animated previews, Approve / Not this time (st,
  re, a gift message, `artcred` on approval; separate `set`s, not a multi-path update), "Copy frame" = Dev Suite clipboard `sq_dev_clip`
  {w,h,p:[hex|'']} for pasting into any picture editor, Patrons list with +1 month / End now and add-by-search. The game-wide CSS
  `canvas{position:fixed;inset:0;width:100%;height:100%}` covers every canvas: panel canvases need `position:static` and sizes.
- **Patreon link** (`functions/` + 210 + 211): Firebase Cloud Functions (v1, us-central1, Node 22; `firebase.json`/`.firebaserc` at
  the root, deployed by hand, see `functions/README.md`): `patreonAuth` = OAuth redirect (state `<uid>.<nonce>` must match `plink/<uid>`
  {n,t} written by the game on click, 20 min, used once), reads the membership (identity.memberships), keeps `pmap/<patreon user>` = uid (webhooks for a Patreon user not linked yet are kept in `ppend/<patreon user>` {a,t} and used at link time within 3 days; both functions log statuses, no personal data; a relink to another player removes a patron record started in the last 7 days from the player it was linked to before, or ends an older one)
  and `puser/<uid>` (no client access) and writes `patron/<uid>` {s,u,c} with the admin SDK; `patreonHook` = webhooks (HMAC-MD5 of the
  raw body with `ws`) keep `u` in step. Decisions in `functions/lib.js` (`paidThrough`: active = next charge + 3 days; else last paid
  charge + 31 days; `merge`: active never shortens, inactive never extends, cape kept), tested by `node functions/test.js`. Settings:
  `cfg/patreon` {cid,cs,ws,camp} (write devs, read nobody: only the functions) and `cfgpub/patreon` {cid, cs/ws/camp booleans, t} (read
  signed in), both written from Dev Suite > Art Room > "Patreon link". The game shows Link Patreon (a real `<a>` to Patreon's authorize
  page, `data-plink`) only when `cfgpub/patreon.cid` is set, signed in, age band known and not `c`. `.sqpatlink` clicks are kept from the
  panel's button handlers (they ran `shopAct`). Rules: `plink`, `cfg`, `cfgpub` (publish them).
  **Email matching** (Nov 15): `patreonSync` (every 6 h) / `patreonSyncNow` (database trigger on `cfg/patreon/go`, the Art Room's Sync now)
  list the campaign's members with the creator token (`cfg/patreon/ct`/`crt`, renewed on a 401 and saved), and link members not in `pmap`
  whose Patreon email = a verified Firebase Auth email (`getUserByEmail`); a player already linked to another *active* member is never taken
  over (`mayRelink`); a link to an account with no membership is replaced. The webhook tries the same match before `ppend`. Emails are never
  stored or logged. Result counts in `cfgpub/psync` (server-only write). Tests: `node functions/test.js` (24 checks).
- **One cape picker** (`ui/212-s220-one-cape-picker.js`, `window.SQCAPEX`): 085's Style screen (ptab 31) lists Marlo capes plus `SQCAPEX.opts()`
  (guild cape while in a guild, fire cape when `patron/<uid>.c`), with a back/front picture (`preview()`, cP at 3x). Picking one takes the
  others off (`pick(id)` sets 201's `SQGCAPE.wear` / 210's `SQPATRON.wearing`; 085 clears `COS.cape`). Saves unchanged (`gcw`, `fcw`, `cos.cape`).
  The guild screen's cape card and Options > PATRON only link to Style (`gcp:style`, `data-pcr="style"`). A new cape goes in `opts()`/`pick()`.
- **Art Room editor** (211, rebuilt Nov 15): sticky icon toolbar (pen/erase/fill/pick, move when zoomed, mirror, undo/redo, zoom 1-6, grid),
  canvas sized by `fit()` (width, and half the screen height on phones) × `A.zoom` in `#arbox` (scrolls when zoomed; two fingers / move tool /
  Space / middle button pan), palette strip + current colour (a colour input over it), frames strip with `+`, preview and speed, then a
  separate `send` view (name, kind, note). `#pn.sqart` widens the panel to 980px; two columns at ≥760px. Keys: B E G I M, Ctrl+Z/Y, +/-.
- **Paintings and the Patron Art Gallery** (`items/213-s221-paintings-and-gallery.js`, `window.SQPAINT`): `paintings/<id>` {n,by,u,w,h,f,ms,p,t,off}
  (devs write via Dev Suite > Art Room "Approve as a painting"; signed-in read, onValue; cached in localStorage `sq_paint`). Items `pt_<id>` (bag/easel)
  and `pw_<id>` (hung): a hung painting is stored on the floor tile under the wall (row 2) because every home loader drops rows 0-1; it isn't
  solid and is drawn on the wall band. Placing facing the wall row (`facingWall()`) hangs it (`wallOK`: not over windows/room wall items, not
  the back door, houses and castles only); HIT facing it picks it up. `applySave` first registers every `pt_/pw_` key found in the save
  (`scan`), so saves never lose them before the records arrive. Artist's free copy: `ptg` in the save (KNOWN49). Gallery: BLD `gallery`
  placed at library `places.gallery` {tx,ty} (Dev Suite > Art Room "Put the gallery's door where I'm standing": you stand on the doorstep, `standHere`/`tryPlace`, saved to the draft; applied through `SQA.onApply` → `applyChosen`) or else `spot()` (free 5x2 + a free row in front, nearest the village centre, inside the village preferred, never on/against `HOUSES`); `place`/`unplace` record and undo everything a spot changes (obj, BS, PROT, sign), room `gallery` (wall frames `_ptw`, easels `_pte`,
  `fill()` = newest first), curator Iris (NPC kind `gallery`, shop on ptab 2 via the outermost `rPn`, `data-ptbuy`). A label naming the
  painting and artist is drawn in the outermost `drawHUD` when you face one. `SQPAINT.charLayer(dir,gear)` = your character as a 96x112
  worn layer (211 shadows `CH`, so it draws it). Rules: `paintings`, `art.k 'wear'`, `art.sl` (publish them).
- **Art Room wearables** (211): mode "Something to wear" (`A.mode==='wear'`, own draft `sq_art_wear`; `sq_art_mode`): 48x76 pixels = the worn
  layer from (24,28), three frames = front/back/side, `sl` helm|body|legs, your character underneath (`under`). Sent as `k:'wear'`. Dev Suite >
  Art Room: "Put it in the Gear editor" builds `worn.<item>` (f/b/s, `h:1`) with `SQA.PXC`/`SQA.pack`, saves it to the draft and opens Gear on it.
- **Art Room pets** (211): mode "A pet" (`A.mode==='pet'`, `PT()`, draft `sq_art_pet`): square 12-32 px (`PSZ`, resizing keeps the feet in
  place), four fixed frames `PFN` Idle 1/Idle 2/Walk 1/Walk 2 = the pet look's a/c/b/d; onion shows Idle 1 (Walk 1 under Walk 2). Preview
  (`petPv`) = a ground strip, standing (0.5 s) or walking to and fro (125 ms steps, mirrored going left) beside the character (`SQPAINT.charLayer`),
  same frame fallbacks as 111a's `drawPetLook`. Sent as `k:'pet'` (rules unchanged). Dev Suite > Art Room: "Put it in the Pets editor" =
  `petFrom` → `pets.<EQ[item].pet>` {w,h,s:2,ox:-w/2,oy:7-h} in the draft (one art pixel = one game pixel), then opens Pets on that item.
- **Editing patron art** (211, `SQARTROOM.edit(x,done)`): Dev Suite > Art Room > ✎ Edit it opens a submission in the Art Room editor (mode
  from `k`/size, frames from `unpack`, `A.edit` set: no drafts saved, no mode tabs, Cancel/Save changes). Saving updates `art/<u>/<id>`
  {n,w,h,f,ms} and keeps the artist's first version as `fo/fw/fh/fms` ("Put back the artist's version"). Paintings/pets/gear made after use the edit.
