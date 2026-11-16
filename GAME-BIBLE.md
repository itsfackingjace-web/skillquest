# SkillQuest — Game Bible

*Draft 1, Nov 16 2026. Owner: Jace Holman (Head Developer). Lead Administrator: Heather Holman.*

This document records what SkillQuest **is**, so every change can be checked against it. `CLAUDE.md` says *how* the
code works; this file says *what the game should be*. If a feature idea fights this file, either drop the idea or
change this file on purpose. Don't let the game drift into something else by accident.

---

## 1. The one-sentence pitch

**A cosy, shared-world skilling RPG in a Game Boy Advance art style: OSRS-style skills, Pokémon-style looks,
Zelda-style adventure, made for families to play together on any device.**

The game started because of the developer's kids and nephews. It should always be something you'd happily hand to
them, and that their parents would enjoy playing next to them.

## 2. Design pillars (in priority order)

When two pillars disagree, the higher one wins.

1. **Safe and kind.** Under-13 players get phrases-only chat and friends-only trades. There are anti-grief and
   anti-theft rules, a chat filter and moderation tools. Nothing in the game should reward hurting other players
   outside opt-in PvP and duels. No loot boxes sold for money, and no pay-to-win.
2. **Your progress is yours.** Skills, quests, items and homes belong to the player and must never be lost: no
   migrations that drop save fields, no renaming published items, no "reset" without a backup. A bug that loses
   progress is the most serious kind of bug.
3. **One shared world.** Everyone shares the same day and night, the same trees, rocks and monsters, and the same
   villages. Playing next to someone should feel natural. The world is shared, but **progress is never shared or
   skipped**: a new player still does every quest themselves.
4. **Every skill matters from 1 to 99.** Each level band should unlock something you can *see*: a new tree, ore,
   fish, recipe, perk or piece of gear. Long dead stretches with nothing to unlock are bugs in the design.
5. **Plays great on a phone.** The main test device is an iPhone. Touch, controller and keyboard all count, but if
   something only works well with a mouse, it isn't finished.
6. **Looks like a GBA game.** Gen 3 Pokémon / Minish Cap pixel rules everywhere: a limited palette per sprite, dark
   outlines, and no smooth gradients or blurry scaling. Characters must work with every piece of gear and every
   customisation option.

## 3. Audience

- **Core:** families. A parent and kids (6-14) playing on separate accounts, often in the same room.
- **Second:** OSRS / Minecraft fans who like long-term skilling goals and a small, friendly community.
- **Not for:** competitive PvP players or speed-runners. Those players are welcome, but we don't design for them.

Reading level: write in-game text so a 9-year-old can follow it. Use short sentences and plain words, and avoid
jargon (say "health", not "HP pool").

## 4. Tone and world

- **Warm, a little whimsical, never grim.** Monsters are "beaten", not killed in gory ways. There is no blood, and
  scary moments stay Zelda-level scary.
- **Islands and voyages.** The world is Hollow Island (the starting island: villages, Saltmere port, Dusthaven
  desert, Frostfang) plus islands you reach by boat as Sera charts voyages. Each island has one clear theme
  (fire, ice, void, tides...), its own resources and its own song.
- **Music:** soft orchestral music like OSRS, original melodies only, one theme per region.
- **Names:** simple and readable (Hollow, Saltmere, Ashfall). Avoid names that are hard to read aloud.

## 5. Core loop

```
gather (chop, mine, fish, forage, farm)  →  process (smelt, smith, cook, craft, fletch)
        ↑                                              ↓
   new areas / voyages  ←  quests, bosses, gold  ←  gear and food let you go further
```

Social layers sit on top of the loop: trading and the World Market, friends, parties, guilds, duels and chess,
homes and yards you can visit, and daily and weekly challenges.

## 6. Skills

There are 14 skills. **No Strength skill, ever.** Attack and Tactics cover that role.

| Group | Skills |
|---|---|
| Gathering | Woodcutting, Mining, Fishing, Foraging, Farming |
| Production | Smithing, Cooking, Crafting, Firemaking |
| Combat | Attack, Archery, Magic, Defence, Tactics |

Rules:
- Levels go from 1 to 99 on the shared XP table (`XT`). Never change the curve for existing players.
- Each skill has a **skill tree** with perks: up to 3 choices at a level, and choices are permanent.
- **Every unlock appears in the skill tree** (214 generates gear, recipe and wear requirements automatically). If a
  player can't find out from the tree when something unlocks, that's a bug.
- Gathering has a **tier ladder** (logs, ores, fish, crops). Each new tier needs both a higher level and a better tool.
- The **Combat triangle** is melee, bow and wand, and the three should give similar damage per second at the same
  level (measured in `202`: roughly 10 / 25 / 35 at levels 10 / 45 / 90). New weapons have to fit that band.

### Tier ladders (as of today)

- **Metal:** wood → stone → iron → steel → mithril → adamant. Crystal (dungeon drop), Warlord and Turtle are
  special sets, not smithing tiers. *The next smithing tier above adamant should be planned as a full set: ore, bar,
  tools, weapons, armour and arrows.*
- **Logs:** normal → oak → willow → maple → yew → void (the guild island). Dead wood comes from Ashfall.
- **Fish:** shrimp 1 → trout 10 → salmon 20 → swordfish 35 → (library fish, including void fish at 60). Planned:
  squid 70, shark 80, a top fish at 90.

## 7. Economy

- **Gold comes in** from monster drops, quests, shop sales, dailies and events. **Gold goes out** through shops,
  houses, boats, guild founding (5,000,000), renames and prints.
- The **World Market** (player-to-player): the floor price is half the shop value, there's no ceiling, offers last 7
  days, and there are caps on how many offers each player can list.
- **Never add a gold or item source without a matching sink** in mind. Use Admin > Economy to watch total gold.
- Rare items should stay rare. Pets drop at 1 in 5,000 from a matching node. The boss pet chance is 5%.

## 8. Money (Patrons)

- **Patreon, about $5/month.** Patrons get cosmetic and community perks only: a flame by their name, the fire cape,
  the Art Room, credits and paintings in the Gallery.
- **Never sell power, XP, gold, items that affect stats, or skips.** Never rank supporters by how much they paid.
- Under-13 accounts never see payment buttons.
- Patron art is credited forever. Don't approve art that shows a recognisable copyrighted character.

## 9. Safety (non-negotiable)

- Age band per account (`age/<uid>`). Under-13 accounts use phrases-only chat, friends-only trading and messaging,
  and a generic display name. **The game and the database rules must agree** (`PHRASES` = the rules' regex).
- Chat filter, mute/suspend, reports, and a 14-day response promise for reports.
- `privacy.html` must stay true. Any change to how data is handled means updating it in the same change.
- Never use `prompt()`. Never store more personal data than a feature needs.

## 10. Technical guardrails (summary; see CLAUDE.md for details)

- Edit `src/` only, rebuild `index.html`, and run `--check` before every push.
- **One patch note entry per day**, written for players.
- New features go in a **new file**, wrapped as an IIFE, and wrap the *outermost* function.
- **Never** rename or delete published items, clamp gear tiers, reorder `QS` without a migration, reuse a `ptab`
  number, or shadow globals (`W`, `H`, `P`, `CH`...).
- New presence fields or listeners on whole nodes cost download for every player. Keep them small and rare.
- Database rule changes need to be published in the Firebase console.
- Test in the harness (phone viewport and desktop) before you say something works.

## 11. How to judge a new idea

Before building something, answer these questions:

1. **Which pillar does it serve?** If none, why build it?
2. **Does it break a pillar?** Safety and lost progress are hard stops.
3. **Who is it for?** New players, mid-game players, veterans, families or Patrons. Keep a balance across updates.
4. **What's the smallest version** that players would notice and enjoy?
5. **What does it cost later?** New save fields, new database paths, more traffic, more to moderate.
6. **Can it be done in the Dev Suite instead of code?** Content (items, fish, recipes, islands, quests) should come
   from the library whenever possible, so it can be tuned without a deploy.

## 12. Balance of attention (rough guide per month)

- ~40% content players asked for (new tiers, fish, islands, quests)
- ~25% fixing and polishing what exists (bug reports, phone UI, controller)
- ~20% social and community (guilds, events, chat, Patrons)
- ~15% tools that make future content cheaper (Dev Suite)

If a month is 80% one bucket, the next month should even it out.

## 13. Open questions (decide and then write the answer here)

- ~~What is the top smithing tier?~~ **Decided Nov 16: Meteorite.** Meteorite ore comes **only from meteor
  strikes**: random, shared world events, never a fixed node on the map. A strike should feel like an event.
- What is the level 90 fish: pufferfish or octopus?
- What role do daggers play? (Proposal: an off-hand throwing weapon whose special attack uses a potion from your bag.)
- Do bonus items from perks (double crafts, extra catches) also give XP? Players have asked. Pick one answer and
  state it in the perk text.
- What's the long-term plan for islands? How many, and what's the final voyage?
