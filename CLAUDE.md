# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing site for Lontra Consultores (operations research / AI consultancy, Santiago, Chile), live at https://lontraconsultores.com. Ten hand-written static HTML pages, no templating engine, no framework, no tests. Spanish is canonical at the root; English lives under `en/`. Deployed as Cloudflare Workers static assets. GitHub remote: `jpm0112/pagina-web-lontra`.

## Commands

```bash
npm install                     # Tailwind 3 + plugins (devDependencies only)
npm run build:css               # input.css -> assets/css/built.css (minified). Run after ANY class change in HTML.
npx serve -l 3000 .             # local preview (what .claude/launch.json runs; `serve` is not a devDependency)
```

Deploy: Cloudflare Workers static assets via `wrangler.toml` (`directory = "./"`). `wrangler` is not installed locally and the deploy path (local `wrangler deploy` vs Cloudflare git integration) is not recorded in the repo. Confirm with JP before deploying.

## Page map

| Spanish (canonical, root) | English (`en/`) |
|---|---|
| `index.html` | `en/index.html` |
| `servicios.html` | `en/services.html` |
| `soluciones.html` | `en/solutions.html` |
| `sobre-nosotros.html` | `en/about.html` |
| `contacto.html` | `en/contact.html` |

Every content change is bilingual: edit both siblings. Copy in both languages has been trope-audited (see git log); keep it that way.

## Architecture: what is duplicated, and where

There is no include mechanism. Each of the 10 pages carries its own copy of:

1. `<head>` SEO block, in this order: canonical, hreflang (`es-CL`, `en`, `x-default` -> ES page), OG/Twitter, 3-5 JSON-LD blocks (`ProfessionalService` + `ItemList` of `SiteNavigationElement` on every page; plus `WebSite` on home, `OfferCatalog`/`BreadcrumbList` on services, `FAQPage` on solutions, `Person` on about).
2. Desktop `<nav class="fixed ...">` (~27 lines), mobile menu `#mobileMenu` (~15 lines), `<footer>` (~40 lines). The active nav link and the ES/EN toggle href are hand-set per page. The toggle links to the sibling file directly (`en/index.html`, `../sobre-nosotros.html`).
3. One inline `<style>` block (20-70 lines; 325 on `index.html`) holding the custom animation/motif classes (`grid-cells`, `fade-up`, `clip-reveal`, `faq-*`, marquee, hero line) that Tailwind does not generate.
4. One inline IIFE `<script>` with the shared behaviours (mobile menu toggle, mouse-trail dots, animated grid on `#gridCells`, IntersectionObserver reveals) plus page-specific parts: hero SVG/glitch on home, sidebar scroll-spy on services, Web3Forms submit handler on contact.

A change to any shared block means editing all 10 files and grepping to confirm they match. Drift already exists between pages (footer contrast classes, active-link classes, missing active state on the solutions pages).

## CSS layering

- `tailwind.config.js` defines the brand palette (`primary #1a3fb8`, `navy-brand`, `accent-teal`, `accent-cyan`, `bright-blue`, `warm-amber`) and the three font families (`display` Inter, `serif` Source Serif 4, `mono` JetBrains Mono). Content scan covers `./*.html` and `./en/*.html` only.
- `assets/css/input.css` = Tailwind directives + a few site-wide base rules and display helpers (`.hero-headline`, `.hero-serif`, `.glass-nav`).
- `assets/css/built.css` is generated output but is committed and is what production serves. Nothing rebuilds it automatically: if you touch HTML classes and do not run `npm run build:css`, the deployed site silently loses those utilities.
- `assets/css/tokens.css` is a byte-identical copy of the local design kit's `colors_and_type.css`, linked on every page but referenced only 2-6 times per page via `var(--...)`.
- Icons are Material Symbols Outlined via Google Fonts; fonts are Inter + Source Serif 4 via Google Fonts.

## Deploy config

- `.assetsignore` keeps `.claude/`, `Stitch Files/`, `node_modules/`, the npm/tailwind config files and `input.css` out of the uploaded bundle. It does not list `claude design/` or `design-tropes.md`; both are gitignored local files, so a local `wrangler deploy` may upload them.
- `_headers` sets HSTS, a CSP, and cache rules. The CSP allowlists exactly the external hosts the pages use: Google Fonts, `lh3.googleusercontent.com` (six service images hot-linked from Stitch), `api.web3forms.com` (contact form), `google.com`/`maps.google.com` (map iframe). Adding any new external resource means updating the CSP or it will be blocked. `script-src` needs `'unsafe-inline'` only because the site JS is inline.
- `/assets/css/*` and `/assets/img/*` are cached `immutable, max-age=1y` with no cache-busting in the filenames or link tags. A rebuilt `built.css` will not reach returning visitors until their cache expires.
- `sitemap.xml` carries a hand-maintained `lastmod`; bump it when body copy or schema changes.
- `f004b54ba5db18d97e4500fc6ec3a278.txt` is the IndexNow key file. Keep it.

## Non-code directories

- `Stitch Files/` (tracked, not deployed): original Google Stitch design exports (`code.html` + `screen.png` per screen). Source mockups only; the live pages have diverged (different primary colour, compiled CSS). Do not edit or "fix" them.
- `claude design/` (gitignored, local only): the `lontra-design` Claude skill with brand README, `colors_and_type.css`, SVG assets, preview cards and React UI-kit components. Some statements in it are stale (it says the site uses the Tailwind CDN; it does not since commit 174f5cd).
- `design-tropes.md` (gitignored): the design anti-pattern list used when the site was built.

## Contact form

`contacto.html` / `en/contact.html` POST to Web3Forms. The access key is in the HTML by design (Web3Forms keys are public). Hidden `botcheck` honeypot, JS `fetch` submit with status in `#formStatus`, native POST fallback without JS. ES pages use `contacto@lontraconsultores.com`, EN pages `contact@lontraconsultores.com`.
