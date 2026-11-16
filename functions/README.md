# SkillQuest server functions (Patreon link)

Cloud Functions that link a player's Patreon membership to their SkillQuest account:

- `patreonAuth`: Patreon sends the player here after they allow access (the OAuth redirect URI).
- `patreonHook`: Patreon's webhooks for joins, renewals and cancellations (links a new member by email when it can).
- `patreonSync` (every 6 hours) and `patreonSyncNow` (when a developer presses Sync now, which writes `cfg/patreon/go`):
  read every campaign member with the Creator's Access Token (`cfg/patreon/ct`, renewed with `crt` when Patreon refuses it)
  and link members whose Patreon email is the (verified) email of a SkillQuest account. Counts go to `cfgpub/psync`.

They read their settings from the database (`cfg/patreon`, set in Dev Suite > Art Room > Patreon link), so deploying
never needs any secrets.

## Deploying (needs the Blaze plan)

In the Google Cloud console (console.cloud.google.com) with the skillquest project selected, open **Cloud Shell** (the `>_`
button at the top right) and run:

```
git clone https://github.com/itsfackingjace-web/skillquest
cd skillquest
npx -y firebase-tools@latest login --no-localhost
npx -y firebase-tools@latest deploy --only functions --project skillquest-913e2
```

The first deploy asks to turn on a few Google Cloud services (Cloud Functions, Cloud Build, Artifact Registry): answer yes.
The scheduled sync also needs Cloud Scheduler (answer yes if asked). The two web URLs must be:

- https://us-central1-skillquest-913e2.cloudfunctions.net/patreonAuth
- https://us-central1-skillquest-913e2.cloudfunctions.net/patreonHook

To update later: `cd skillquest && git pull` and run the deploy line again.

## Testing

`node functions/test.js` runs both functions against an in-memory database and a fake Patreon.
