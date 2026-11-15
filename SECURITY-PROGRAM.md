# SkillQuest data security program

Last reviewed: November 15, 2026. Review again by November 15, 2027, and after any security incident.

This is the written information security program the amended COPPA rule requires for services that collect personal
information from children under 13. It covers every part of SkillQuest that stores player data.

## Who is responsible

The game's owner (the account that owns the Firebase project `skillquest-913e2` and the GitHub repository
`itsfackingjace-web/skillquest`) coordinates this program and is the contact for any security or privacy problem:
support@skillquestmmo.com.

## What we hold, and where

| Data | Where | Who can read it |
| --- | --- | --- |
| Google account ID, name, email | Firebase Authentication | The owner (Firebase console) |
| Game saves and backups (`saves`, `bak`) | Firebase Realtime Database | The player and developer accounts (`devs/`) |
| Age group (`age`) | Realtime Database | The player and developers |
| Chat, private messages, guild and party chat | Realtime Database | Recipients; developers for moderation |
| Bug reports, player reports, play-time statistics | Realtime Database | Developers only |
| Public game state (presence, houses, leaderboard, market) | Realtime Database | Signed-in players |

No payment details are ever stored; a payment provider handles them.

## Risks we've identified

1. Someone reading data they shouldn't (another player's save, private messages, reports).
2. A player writing data they shouldn't (changing someone else's records, granting themselves items or supporter status).
3. A developer account being taken over.
4. Adults contacting children through chat, private messages or trades.
5. Keeping data longer than needed.

## Safeguards

- **Database rules** (`database.rules.json`, published in the Firebase console) limit every path to its owner, with
  read access to private data only for the owner and the accounts listed under `devs/`.
- **Under-13 protections** are enforced by the database rules, not only by the game: phrase-only chat, and private
  messages and trade, duel and party requests only with the child's friends.
- **Developer accounts** are added by hand in the Firebase console. Each must use two-step verification on its Google account.
- **Supporter status** (when it launches) will be written only by a server function after the payment provider confirms
  a payment, never by the game itself.
- **Retention**: chat and private messages are deleted after 90 days, bug and player reports and daily play-time
  numbers after a year (see `privacy.html`). Players can delete their account in Options at any time.
- **No third-party trackers or ads** are loaded by the game.

## Testing and review

- Every rules change is tested against a local copy of the rules before it's published.
- Once a year (and after any incident): check the `devs/` list, check two-step verification on developer accounts,
  read through the rules for any path that has become too open, and confirm the retention clean-up is running.

## If something goes wrong

1. Close the hole (tighten the rules, remove the developer account, or take the game offline).
2. Find out what data was affected and whose.
3. Tell affected players (and parents, for children's data) without delay, and the FTC or state authorities where the law requires.
4. Write down what happened and update this program.
