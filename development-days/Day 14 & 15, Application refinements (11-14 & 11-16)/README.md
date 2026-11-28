# Day 14 & 15, Application refinements (11/14 & 11/16)

This stage carries forward Day 13's connected local application and its login, registration, API, SQLite data, and Admin tools. It represents the map, profile, catalog, and Admin refinements before the present listing-backed Home statistics. Runtime database files are not included; they are created when the server starts.

Start with Node.js 22.13 or newer:

```powershell
$env:ANIMO_ADMIN_USERNAME = "your-admin-name"
$env:ANIMO_ADMIN_PASSWORD = "use-a-long-private-password"
node server.js
```

Open `http://127.0.0.1:8000`. Read [`FINALIZATION.md`](./FINALIZATION.md) before treating this local demo as complete.

**Remaining:** real payment and delivery providers, map tiles/geocoding and real coordinates, customer reviews, password recovery/email verification, and any approved AI model integration.
