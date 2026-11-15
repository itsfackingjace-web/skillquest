# SkillQuest server functions (Patreon link)

Two Cloud Functions that link a player's Patreon membership to their SkillQuest account:

- `patreonAuth`: Patreon sends the player here after they allow access (the OAuth redirect URI).
- `patreonHook`: Patreon's webhooks for joins, renewals and cancellations.

They read their settings from the database (`cfg/patreon`, set in Dev Suite > Art Room > Patreon link), so deploying
never needs any secrets.

## Deploying (needs the Blaze plan)

In the Google Cloud console (console.cloud.google.com) with the skillquest project selected, open **Cloud Shell** (the `>_`
button at the top right) and run:

```
git clone https://github.com/itsfackingjace-web/skillquest
cd skillquest
npx -y firebase-tools@13 login --no-localhost
npx -y firebase-tools@13 deploy --only functions --project skillquest-913e2
```

The first deploy asks to turn on a few Google Cloud services (Cloud Functions, Cloud Build, Artifact Registry): answer yes.
When it finishes it prints the two function URLs; they must be:

- https://us-central1-skillquest-913e2.cloudfunctions.net/patreonAuth
- https://us-central1-skillquest-913e2.cloudfunctions.net/patreonHook

To update later: `cd skillquest && git pull` and run the deploy line again.

## Testing

`node functions/test.js` runs both functions against an in-memory database and a fake Patreon.
