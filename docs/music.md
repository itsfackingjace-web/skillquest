# Music

The soundtrack engine, the Dev Suite song editor, the Patron Song Studio and song zones.

Part of the SkillQuest notes: start at `CLAUDE.md` (the rules every change follows). File numbers like 061 are the source files in `src/` (see `src/manifest.txt`).

- **Soundtrack** (`world/155-s161-soundtrack.js`, `window.SQMUSIC`): orchestral samples (FluidR3_GM, CC BY 3.0, credited in
  Options, `README.md` and `music/README.md`) in `music/<inst>.json` ({s:{midi:base64 mp3}}, one every 4 semitones), fetched
  per song (`loadSong`; a new song starts once loaded, the old one keeps playing meanwhile). 014's scheduler still runs and
  owns `MG` (volume/fade bus) but its `PARSED` tracks are emptied every tick. Songs in `S`: {bpm, m (8ths per bar: 8 = 4/4,
  6 = 3/4 or 6/8), lead, harm (second voice: chord tone a third+ below, on quarter notes or longer), pad, arp + arps
  (harp8/strum/stab/ost8/sparkle), bass + bs (held/pedal/pizz/drive/walk/root5/waltz/shanty), perc (timp/march/timp8/taiko/
  tamb/boss), swing, parts {name:[chords, melody, {lead,harm}?]}, order}; instruments in `INST` (range, sustained or not).
  Melody tokens are 8ths ("X/Y" two 16ths, "-" hold, "." rest, "|" bar line); one chord per bar ("C,G" = half each). `VOL`
  evens loudness (re-measure with `SQMUSIC.render(name,secs)` → AudioBuffer when adding a song). The outermost `wantSong`:
  boss near (boss/_wb/cb/ib, or `big` inside a dungeon; held 6 s) > `sail` > island theme by region (`REGION_SONG`) > the
  older names (day night indoor cave port frost tide desert icecave sandcave seacave). Unknown names fall back to cave/day.
  Write only original melodies.
- **Song editor** (`dev/165-s171-song-editor.js`, `window.SQSONGS`, Dev Suite > Songs): library `songs.<key>` = a song in 155's format
  (+ `vol`); built-in keys replace that song, `su_<id>` are new; `songmap.<region>` = song key (155's `REGION_SONG`). `check()`
  validates chords/notes/bar lengths/order and builds it; originals restored when removed. The tab is a composer (since 190, `window.SQCOMPOSER`): per part a chord lane + a 16th-step piano roll (one note at a time); grid edits go back to text through `melText`/`parseMel` (round trip keeps every built-in melody's pitches; flats in flat keys), songs may carry `key` (scale rows, the key's chords in the picker), band presets `PRE`, 💡 `idea()` writes a melody over the chords, undo/redo, Space plays the part. `SQMUSIC.note(inst,midi,dur)` (155) plays one note; 155 also exposes `chord`/`midi`. Redraws go through `redraw()` (API.draw doesn't run the tab's `after`). 155 exposes `VOL`, `force` (play a song
  regardless of `wantSong`; the editor plays its working copy as `__ed`), `restart()`, `step`, `len`. Write only original melodies.
- **Song Studio** (`ui/235-s243-song-studio.js`, `SQSTUDIO`, ptab 51, START > Patron): beginner composer for Patrons (and devs via Dev Suite >
  Patron songs). Moods (`MOODS`: band + key + chords), sections A-D of 4 bars, one chord a bar from `CHD(key)` (named by feeling), a grid of
  the key's notes only (pentatonic rows bright), notes stored as midi {s eighth,d,m}; `toDef()` = 155's format (checked by SQSONGS.check,
  played as `__st`). Draft `sq_song_draft`. Sends `songsub/<uid>/<id>` {n,s (JSON),note,who,t}; rules like `art` plus no st/re on create.
  `dev/236-s244-patron-songs.js` (`SQPSONGS`, Dev Suite > Patron songs): play, approve/no (gift + `artcred/s<id>`), `toDraft(def)` =
  draft `songs.su_<name>`, `openSongs(k)`. The studio never shows the game's own songs.
- **Song zones** (111c palette "🎵 Song zone", `world/237-s245-song-zones.js`, `SQSONGZONES.here()`): `sz` [{x,y,w,h,s,n}] on `cu_` islands
  (+ISL_PAD), `ed_<region>` and `ed_hollow`; the outermost wantSong plays `s` outdoors inside the box (boss/sail still win), `n` is said once on
  entering. 169 checks the song exists. (Also fixed 111c's dungeon entrance panel: a missing `+` hid Layout and its monster list.)
