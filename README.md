# SpinGame

An online spin-the-wheel game hosted on GitHub Pages.

## How it works

1. Player enters their name.
2. Player spins the wheel and lands on one of four outcomes:
   - **Winner**
   - **Big Winner**
   - **Grand Prize**
   - **Better Luck Next Time**
3. A confetti "party" animation fires when the spin finishes, scaled to the outcome (Grand Prize gets the biggest celebration).

## Admin panel

Visit `admin.html` (linked from the game page) to adjust the relative weight/odds of each outcome. It's protected by a password (`decentra`).

> This is a static, client-only site — the admin password check and saved odds live in the browser's `localStorage`. It's a basic deterrent, not real security, and settings are per-browser/per-device, not shared globally. For real access control or a shared config across all players, you'd need a backend.

## Running locally

Just open `index.html` in a browser, or serve the folder with any static file server:

```bash
python3 -m http.server 8000
```

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/pages.yml`) that deploys the site automatically on every push to `main`.

To enable it:

1. Go to the repo's **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

The site will be published at `https://<username>.github.io/<repo>/`.
