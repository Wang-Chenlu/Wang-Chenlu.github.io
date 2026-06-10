# Chenlu Wang Academic Website

This repository contains the source code and static output for Chenlu Wang's academic homepage:

https://wang-chenlu.github.io/

The site is built with Next.js and exported as static files for GitHub Pages.

## Development

Install dependencies:

```bash
npm install
```

Run a local preview:

```bash
npm run dev
```

Build the static site:

```bash
npm run build
```

## Content

- Profile, navigation, and page settings live in `content/` and `content_zh/`.
- Publications are managed in `content/publications.bib`.
- Publication figures are stored under `public/images/publications/`.
- Source components and styling live in `src/`.

## Analytics

The site loads Statcounter analytics for visitor activity and IP-level logs.

The default Statcounter project is configured in `src/components/analytics/StatcounterAnalytics.tsx`. To override it locally, copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_STATCOUNTER_PROJECT_ID=your_project_id
NEXT_PUBLIC_STATCOUNTER_SECURITY_CODE=your_security_code
```

For GitHub Pages deployment, add repository secrets named `STATCOUNTER_PROJECT_ID` and `STATCOUNTER_SECURITY_CODE`. The deploy workflow injects them during `npm run build`.

Repository secrets are optional because the default Statcounter project is already configured in source. After deployment, verify the live site by opening `https://wang-chenlu.github.io/`, checking the browser Network tab for `counter.js`, and confirming the visit appears in Statcounter's Visitor Activity view.

## Deployment

GitHub Pages serves the static files at the repository root. After rebuilding, copy the generated `out/` contents to the repository root before committing and pushing.

The root `.nojekyll` file is intentional. It prevents GitHub Pages from processing the site as a Jekyll project.
