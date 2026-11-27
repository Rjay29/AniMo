# AniMo local marketplace demo

AniMo is a responsive Filipino farm-marketplace demo built with HTML, CSS, browser JavaScript, Node.js, and built-in SQLite. Visitors can browse the public catalog without signing in; checkout, profile/order actions, chats, and farmer tools require the appropriate account.

## Run locally (Windows)

Requirements: Node.js 22.13+ (built-in `node:sqlite`) and a modern browser. No npm dependencies are used. The optional generative assistant needs Ollama running locally with the configured model installed.

In PowerShell from this folder:

```powershell
$env:ANIMO_ADMIN_USERNAME = "your-admin-name"
$env:ANIMO_ADMIN_PASSWORD = "use-a-long-private-password"
node server.js
```

Open `http://127.0.0.1:8000`. The server starts at AniMo Home and prints a unique private administrator sign-in URL in the terminal. Use that URL to sign in with the configured admin credentials; it changes when the server restarts. Do not expose the development server to the internet.

## Accounts and demo flows

- **Buyer:** browse listings, register with name, username, profile picture, email or Philippine mobile, verify the on-page demo OTP, accept the terms, then sign in.
- **Farmer:** choose Farmer during registration and submit farm details, a government ID, proof of address, bank proof, and (for groups) DA accreditation. Documents are stored under private `data\farmer-documents\`; an admin must approve the application before the farmer can sign in.
- **Farmer dashboard:** create product/recipe/meal-kit submissions, edit stock/listings, manage order delivery, and chat. New submissions remain hidden until an admin approves them.
- **Admin:** review farmer documents and listing submissions, manage catalog records and order delivery, and edit assistant help data.

The local OTP is intentionally displayed in the browser; it is not sent by email or SMS. Seeded buyer reviews are labeled demo reviews. Listing ratings, delivered-order reviews, and order counts use local demo data.

The first server start seeds 25 additional Philippine farmer profiles, 155 product listings, 20 recipes, 15 meal kits, demo comments for the added listings, and AniMo assistant FAQ records. Seeding is idempotent. The `jev`/`austin` demo chat is associated with five existing completed cassava orders when those accounts and orders are present.

## Local implementation boundaries

- Checkout records orders and supports COD, BPI/BDO transfer, and InstaPay/e-wallet **as labels only**. No bank, e-wallet, or payment provider is contacted.
- The Home local map uses Leaflet, OpenStreetMap tiles, Nominatim geocoding, and OSRM road routes. Map searches, seller pins, current location, and directions are limited to Philippine bounds. Public map services require an internet connection and are subject to their usage policies; this is not a courier booking or delivery guarantee.
- Farmer document approval is a manual local workflow. There is no government-ID, DA, bank, or address validation service.
- Email/phone OTP, delivery tracking, SMS/email messages, and chats are local demos; chats refresh by polling.
- This is not a production deployment. Production use needs HTTPS, external provider integrations, legal/privacy review, hardened operational rate limiting, backups, audit/retention policy for sensitive documents, and deployment security review.

## Data and assets

The server creates `data\users.sqlite`, `data\listings.sqlite`, and `data\ai.sqlite`. Farmer verification files remain under `data\farmer-documents\`, outside the static asset tree. Uploaded catalog/profile images are validated and saved as files beneath their matching `shared\assets\` subfolders.

Existing local visuals are organized under `shared\assets\`: brand/profile photos at the root and categorized `icons\`, `marketplace\`, `farmers\`, `recipes\`, and `meal_kits\` folders. The Home map loads Leaflet from unpkg and map data/tiles from OpenStreetMap-compatible services; these are the only required third-party map assets/services.

## Optional generative assistant

The assistant always has local AniMo catalog/help responses and exact-match Assistant Data answers. For free-form generated answers, install Ollama, download a local model, and run the Ollama service:

```powershell
ollama pull llama3.1
ollama serve
```

By default the server calls `http://127.0.0.1:11434` using model `llama3.1`. Override these with `OLLAMA_URL` and `OLLAMA_MODEL` before starting `node server.js`. No cloud AI credentials are required or sent.

## Development snapshots

The `development-days\` directory contains the project's learning snapshots, from HTML-only through the locally connected application. Each snapshot's README records its intended stage and run instructions; snapshots are educational copies and may not include current demo features.
