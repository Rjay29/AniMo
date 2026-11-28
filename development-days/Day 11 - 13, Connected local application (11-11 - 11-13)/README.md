# Day 11 - 13, Connected local application (11/11 - 11/13)

This stage builds on the Day 10 introduction of login, registration, and Admin. It connects the HTML/CSS/JavaScript pages to the Node.js server and SQLite-backed catalog, accounts, orders, and assistant data. It does not include runtime database files; they are created when the server starts.

Start with Node.js 22.13 or newer:

```powershell
$env:ANIMO_ADMIN_USERNAME = "your-admin-name"
$env:ANIMO_ADMIN_PASSWORD = "use-a-long-private-password"
node server.js
```

Open `http://127.0.0.1:8000`. Read [`FINALIZATION.md`](./FINALIZATION.md) before treating this local demo as complete.

**Remaining:** real payment and delivery providers, map tiles/geocoding and real coordinates, customer reviews, password recovery/email verification, and any approved AI model integration.
