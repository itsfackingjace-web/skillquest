# SkillQuest — notes for whoever updates the game

- The whole game is `index.html` (served by GitHub Pages at skillquestmmo.com). Firebase rules are in `database.rules.json`
  and must be published in the Firebase console when they change.
- **Every update to the game must add a patch note.** Put a new entry at the top of `PATCH_NOTES` (search for
  `const PATCH_NOTES=`) with a new version (`YYYY.MM.DD-N`), the date, a short title and player-friendly bullet points.
  The version shown in Options and the wiki's "NEW!" badge both come from that first entry.
- Write patch notes for players, not developers: what's new or fixed and how to use it.
