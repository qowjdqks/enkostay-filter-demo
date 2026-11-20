# Enkostay Filter Demo

A browser demo of the Enkostay accommodation filters. It uses 500 randomly generated virtual listings; it is not connected to Enkostay or real listing data.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Deploy to GitHub Pages

The included GitHub Actions workflow builds and deploys the site after each push to `main`. The repository is expected to be named `enkostay-filter-demo` so Vite can use the correct Pages base path.

After the first push, check **Actions** for the Pages deployment to finish. GitHub Pages can then be enabled under **Settings → Pages → Build and deployment → GitHub Actions**. The public site URL will be `https://<your-GitHub-username>.github.io/enkostay-filter-demo/`.

All listing names, prices, options, and matching results are generated for demonstration only. Card photos are loaded from Unsplash.
