# AniMo local full-stack setup

AniMo now runs through a small Node.js server. It serves the website, requires an account before opening site pages, and stores listings, user profiles, sessions, and orders in SQLite databases.

The Home page's farm-product and local-farm totals reflect the product and farmer listings returned by the catalog API.

## Requirements

- Node.js 22.13 or newer with the built-in `node:sqlite` module.
- A modern browser.

No npm packages are required.

## Start AniMo on Windows

Open PowerShell in this project folder. Before the first start, set a private administrator username and password. Use a password with at least 12 characters:

```powershell
$env:ANIMO_ADMIN_USERNAME = "your-admin-name"
$env:ANIMO_ADMIN_PASSWORD = "use-a-long-private-password"
node server.js
```

Open `http://127.0.0.1:8000` (or `http://127.0.0.1:8000/pages/login/login.html`). AniMo always starts at the sign-in page. Create a customer account, or use **Administrator? Sign in to the admin dashboard** with the configured administrator credentials. Opening `http://127.0.0.1:8000/admin/` while signed out also sends you to the sign-in page and returns administrators to the dashboard. Do not open `index.html` directly as a `file://` URL; login, logout, profiles, and database APIs require the Node.js server.

If you already initialized the database without administrator settings, set both environment variables and restart the server; it creates the administrator account on startup. If that username was previously registered as a customer, choose a different administrator username.

To stop the server, press **Ctrl+C** in its PowerShell window.

## What is stored

The server creates three separate files in `data\`:

- `users.sqlite` — usernames, scrypt password hashes, browser sessions, profile names and picture paths, and orders.
- `listings.sqlite` — marketplace products, farmers, recipes, meal kits, and image paths. Built-in demo records are loaded the first time this database is created.
- `ai.sqlite` — assistant knowledge entries managed in the administrator dashboard. The assistant uses matching enabled entries and built-in help; no external AI service is configured or called.

Back up the `data\` folder while the server is stopped. Keep it private; it contains personal order information. The files are ignored by Git.

## Add or edit a listing

Sign in as the configured administrator and open **`/admin/`**. The private page supports adding, editing, and removing products, farmers, recipes, and meal kits; photo uploads; changing customer order statuses; and adding, editing, enabling, or removing assistant knowledge entries. Listing photos are stored in their category folders under `shared\assets\` and their paths are saved in `listings.sqlite`. Users can upload or remove a profile picture from their profile page; those images are stored in `shared\assets\profiles\` and their paths in `users.sqlite`. Enabled assistant entries are matched to questions by topic.

## Authentication and deployment notes

- Passwords are **hashed**, not encrypted reversibly. AniMo uses Node's scrypt password key-derivation function with a separate random salt per user.
- Sessions use random, `HttpOnly`, `SameSite=Lax` cookies; stored session tokens are hashed.
- The included server binds only to `127.0.0.1` and is intended for local development/demo use.
- Do not expose this development server directly to the internet. A public deployment needs HTTPS, secure server hosting, backups, monitoring, production-grade rate limiting, and a reviewed operational security setup.
- Checkout records demo orders but does not process payments.
- `ai.sqlite` is storage only; there is no AI API configured or called.

## Seven-day learning snapshots

The `development-days\` folder contains seven copies showing the project progression from HTML-only through the current connected local app. Login, registration, and the Admin dashboard first appear together on Day 4. Day 7 matches the current website. Each snapshot has a `README.md` with its launch instructions and intentionally unfinished areas; the Day 5 copy also has a short `FINALIZATION.md`. These are educational versions, not production deployments. Each Node-backed copy creates its own databases on first run.
