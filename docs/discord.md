# Discord: update feed and roles

## Patch notes feed
- `.github/workflows/discord-patch-notes.yml` runs `tools/discord/post-patch-notes.mjs <old> <new>` when a push to main changes
  `src/data/074-patch-notes.js`: it posts only the top entry's bullets that weren't there before (a new day posts the whole entry),
  split into messages under 2000 characters, no pings. Webhook URL: repo secret `DISCORD_WEBHOOK_URL` (#updates). "Run workflow"
  posts a test message. `--dry` prints instead of posting.

## Roles (SQ Bot)
- Bot app "SQ Bot" (Discord developer portal, application 1573430647484055733): private (Install Link: None, Public Bot off), Server
  Members + Message Content intents, permissions Manage Roles, Manage Channels, Manage Nicknames, View Channels, Send Messages, Read
  Message History (invite: `https://discord.com/oauth2/authorize?client_id=1573430647484055733&scope=bot&permissions=402721808`;
  Manage Nicknames was added Nov 21: the server that had the bot already gets it from Server Settings > Roles > SQ Bot). Token: repo secret
  `DISCORD_BOT_TOKEN`. **No Firebase service account**: the bot reads only public data.
- Game side (`src/multiplayer/249-s257-discord-link.js`, `window.SQDLINK`): Options > ONLINE > Link Discord writes `dlink/<code>` (the
  same code for 20 h per account, kept in localStorage `sq_dlink` {c,u,at}; old codes are never deleted, so a posted code keeps working) =
  {u, t} (8 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`; rules: read one code only, write only your own, t = server time).
  `window.SQLBX` hooks (called by 068's `lbTick` while building `lb/<uid>`) add gid/gn/gt (guild), pa/pu (patron, paid-through),
  mo (mod), dv (dev); the `lb` rules accept each only when it's true (membership in `guilds/<gid>/m`, `patron/<uid>/u > now`,
  `mods/<uid>`, `devs/<uid>`). Flags are as fresh as the player's last leaderboard write (every 20 s while online).
- Sync (`tools/discord/sync-roles.mjs`, `.github/workflows/discord-roles.yml`, every 30 min at :07/:37 and after every push to main (timed runs are best-effort); "Run workflow" with
  "dry run" lists changes): reads #link (needs a text channel named `link`), first post of a code wins, code must be made at most a
  day before the post, a member's latest working code wins; replies once to each request (its replies are how it knows). Roles it
  owns (creates when needed, the only ones it adds/removes): `Total Level 100+` ... `1750+`, `Total Level Maxed`, `Guild: <name>
  [TAG]`, `Game Patron`, `Game Moderator`, `Game Developer`; empty guild roles are deleted. The bot's role must be above them.
- Guild channels: each guild with at least one linked member in the server gets a private text channel (slug of its name) under
  a "Guilds" category: @everyone can't view, its guild role can view/send/read history, the bot can view/send/manage. Found again by
  `[sq:<guild id>]` in the topic, so a renamed guild's channel is renamed; the role's overwrite is re-added if the role was remade.
  Channels are never deleted (history stays; with the role gone only admins see it).
- Checks 39 (rules + code) and 40 (sync against a pretend server, including the guild channels).
- Nicknames (Nov 21; the bot never set them before): a linked member's server nickname is their in-game name (`lb/<uid>.n`, up to 32
  letters), set whenever it differs, so a renamed character is renamed in Discord too. Needs Manage Nicknames (or Administrator; read
  from `/users/@me/guilds` permissions, else it logs what's missing). Discord never lets a bot rename the server owner (`/guilds/<id>`
  owner_id: skipped, noted once) or a member whose top role is above the bot's (the PATCH fails: noted, the run goes on). Unlinking
  doesn't undo a nickname. Check 40.
