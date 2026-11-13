# SkillQuest

An open-world survival RPG in a GBA art style, with OSRS-style skills.

Play: https://skillquestmmo.com

## Online play (sign in with Google)
- One shared world: the same day and night, trees/rocks/berries, monsters, campfires and villagers for everyone.
- Dungeons and caves together; public buildings (shops, inns) are shared; friends can visit each other's houses.
- Chat (All / Public / Private / Friends / Game), friends list, private messages (`/w name message`).
- Your skills, quests and items are always your own, saved to your account.
- OG crown for everyone who signed in before Dec 3, 2026.
- BUG button for beta testers (reports land in Realtime Database > `bugs`).

## Setup notes
`database.rules.json` holds the Firebase Realtime Database security rules. After changing it, paste the whole file into
Firebase console > Realtime Database > Rules and click Publish.

## Working on the code
The game is one page, `index.html`, built from the files in `src/` (listed in build order in `src/manifest.txt`).
Edit `src/`, then run `node tools/build.mjs` (Node 18+, no installs needed) and commit both. `node tools/build.mjs --check`
confirms `index.html` is up to date; GitHub runs it on every push.

## Credits
Music instrument samples: FluidR3_GM SoundFont by Frank Wen, CC BY 3.0 (see `music/README.md`). Songs are original.
