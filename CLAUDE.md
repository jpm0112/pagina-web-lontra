# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing site for Lontra Consultores (operations research / AI consultancy, Santiago, Chile), live at https://lontraconsultores.com. Ten pages, Spanish (canonical) and English, built with Eleventy 3 + Tailwind 3 from `src/` into `_site/`, deployed as Cloudflare Workers static assets. GitHub remote: `jpm0112/pagina-web-lontra` (public).

## Commands

```bash
npm install
npm run dev     # eleventy --serve on :3000 (clean URLs work: /servicios, /en/services)
npm run build   # Tailwind, then Eleventy -> _site/, then the ES/EN structure check
npm test        # node:test for lib/
```

`_site/` and `src/assets/css/built.css` are generated and gitignored. Tailwind runs inside Eleventy's `eleventy.before` hook, so there is no separate CSS step.

## Deploy

- Cloudflare Workers Builds is connected to GitHub. A push to `main` deploys production. Any other branch builds a preview whose URL is in the commit's check run: `gh api repos/jpm0112/pagina-web-lontra/commits/<sha>/check-runs`. The branch alias is `https://<branch>-pagina-web-lontra.juanpablomorandec.workers.dev`.
- Workers Builds installs npm dependencies, then `wrangler deploy` runs the `[build]` command from `wrangler.toml` (`npm run build`) and uploads `_site/` only. A failing build (including the structure check) means no deploy, and the previous version stays live.
- The Cloudflare Web Analytics beacon is injected on the custom domain only, not on workers.dev previews.

## URLs

- Pages are written to `_site/<name>.html`. Cloudflare serves them at clean URLs (`/servicios`) and 307-redirects `/servicios.html` there.
- Every generated URL (canonical, hreflang, og:url, JSON-LD, sitemap, nav, footer) comes from `src/_data/routes.json`. Links inside page bodies are hand-written root-relative clean URLs (`/contacto`, `/en/solutions#faq`). Never link `.html` URLs.
- `llms.txt` is hand-written; update its URLs if routes change.

## Page structure

| key | Spanish (`src/`) | English (`src/en/`) |
|---|---|---|
| home | `index.html` | `index.html` |
| services | `servicios.html` | `services.html` |
| solutions | `soluciones.html` | `solutions.html` |
| about | `sobre-nosotros.html` | `about.html` |
| contact | `contacto.html` | `contact.html` |

- Each page is `---json` front matter plus body content only. Front matter: `key` (route key), `title`, `description`, optional `schema` (page-specific JSON-LD objects), optional `faq`, optional `spotlight`.
- `src/_includes/base.njk` (the default layout, set in `eleventy.config.js`) renders the whole `<head>` and wraps the body with `nav.njk` and `footer.njk`. Language comes from global data (`es`) overridden by `src/en/en.json`.
- `src/_data/`: `routes.json` (URL per key and language), `i18n.json` (nav labels, CTA, footer strings, locale codes), `organization.json` (ProfessionalService JSON-LD per language), `site.js` (base URL, nav order, build-time year), `eleventyComputed.js` (per-page `t` strings and the `ld` JSON-LD list: organization + page `schema` + FAQPage + breadcrumb + site navigation).
- The solutions FAQ lives in front matter (`faq: [{ q, a: [paragraphs] }]`). `_includes/faq.njk` renders it and `eleventyComputed.js` builds the FAQPage schema from the same data. Edit FAQ text only there.
- `src/sitemap.njk` generates `sitemap.xml` from the pages; `lastmod` is each source file's last git commit date.

## Spanish/English parity (enforced)

- Spanish is the reference layout. Each English page has exactly the same elements, ids and classes in the same order as its Spanish sibling; only text, translatable attributes and URLs differ.
- `lib/sibling-structure.js` checks this after every build and fails the build on any difference, printing the first mismatching element. A layout change therefore means editing both files the same way.
- Copy is written as UTF-8 in the source. Keep `&amp;` and `&nbsp;`; do not reintroduce accent entities. Copy in both languages has been trope-audited (see git log).

## Front-end

- `src/assets/js/site.js` is the only script (end of `<body>`); every feature runs only if its elements exist. The CSP is `script-src 'self' https://static.cloudflareinsights.com`, so no inline scripts or `on*=` handlers.
- `src/assets/css/input.css`: Tailwind layers, then plain CSS for the custom effects (grid, reveals, hero lines, marquee, data streams, FAQ, `.glow-sweep`). Plain CSS is never purged and comes after the utilities. `tailwind.config.js` holds the palette and fonts and scans `src/**/*.{html,njk}` and `src/assets/js/*.js`.
- Reveal animations: `.fade-up`/`.slide-*` get `in-view`, `.clip-reveal` gets `revealed`. Clip reveals must be observed at IntersectionObserver threshold 0, because a zero-size clip-path makes the visible ratio 0.
- `_headers` caches `/assets/css|js|img/*` for a year as immutable. CSS/JS links use the `hashed` filter (`?v=<content hash>`); images are not hashed, so a changed image needs a new filename. HTML gets Cloudflare's default always-revalidate.
- CSP allowlists: Google Fonts, `api.web3forms.com` (contact form), Google Maps (iframe), Cloudflare Insights. New external resources need a CSP update in `src/_headers`.

## Contact form

Both contact pages POST to Web3Forms (public access key in the HTML by design), with a `botcheck` honeypot and the same Spanish field names. `site.js` submits via `fetch`; messages come from `data-msg-*` on the `<form>`; without JS it falls back to a native POST. The only working mailbox is `contacto@lontraconsultores.com`.

## Non-code directories

- `Stitch Files/` (tracked, never deployed): original Google Stitch mockups. Reference only; the site has diverged. Do not edit.
- `claude design/` (gitignored, local): the `lontra-design` Claude skill (brand README, tokens, UI kit). `tailwind.config.js` is the site's colour source.
- `design-tropes.md` (gitignored): design anti-pattern list.
