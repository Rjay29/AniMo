# Day 7 - 8, JavaScript interactions (11/6 - 11/7)

This version includes the browser scripts and styles. Catalog pages use the bundled sample data when the API is unavailable. Search, filters, recipe matching, cart storage, and the sample map interactions can be explored in the browser.

To keep root-relative assets working, serve this folder with a static server from this directory, for example:

```powershell
python -m http.server 8080
```

Then open `http://127.0.0.1:8080/pages/home/home.html`.

**Simulated debugging notes:** the browser scripts are present, but no Node API or database is included. Login, registration, Admin, profile persistence, order creation, and server-side voucher/price checks are not included in this stage. The generated-recipe button and map are demonstrations, not external services.
