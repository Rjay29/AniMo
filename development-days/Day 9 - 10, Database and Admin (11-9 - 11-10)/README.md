# Day 9 - 10, Database and Admin (11/9 - 11/10)

This version introduces login and registration together with the Node.js server, local SQLite databases, API, and private Admin dashboard. Catalog changes, assistant knowledge, and order status are managed through the local app.

Requirements: Node.js 22.13 or newer. In PowerShell, from this folder:

```powershell
$env:ANIMO_ADMIN_USERNAME = "your-admin-name"
$env:ANIMO_ADMIN_PASSWORD = "use-a-long-private-password"
node server.js
```

Open `http://127.0.0.1:8000`. Runtime databases are created locally in `data\` on first start.

**Simulated debugging notes:** external payment processing, live maps/geocoding, customer-submitted reviews, real seller coordinates, and model-based AI are not connected. Do not expose this development server publicly.
