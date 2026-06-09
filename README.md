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

## Deployment

GitHub Pages serves the static files at the repository root. After rebuilding, copy the generated `out/` contents to the repository root before committing and pushing.

The root `.nojekyll` file is intentional. It prevents GitHub Pages from processing the site as a Jekyll project.
