# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing site for Lontra Consultores (operations research / AI consultancy, Santiago, Chile), live at https://lontraconsultores.com. Ten hand-written static HTML pages, no templating engine, no framework. Spanish is canonical at the root; English lives under `en/`. Deployed as Cloudflare Workers static assets. GitHub remote: `jpm0112/pagina-web-lontra` (public).

## Commands

```bash
npm install          # Tailwind 3 + plugins (devDependencies only)
npm run build        # Tailwind -> assets/css/built.css, then stamp ?v=<hash> on the CSS/JS links in every page
npm test             # node:test for scripts/stamp-assets.js
npx serve -l 3000 .  # local preview (what .claude/launch.json runs; `serve` is not a devDependency)
```

Run `npm run build` after any change to HTML classes, `input.css`, `tailwind.config.js` or `site.js`, and commit the results (`built.css` and the re-stamped pages). Cloudflare also runs it on every deploy, so a forgotten rebuild cannot ship mismatched CSS, but the committed files should still match.

## Deploy

- Cloudflare Workers Builds is connected to GitHub. A push to `main` deploys production. A push to any other branch builds a preview whose URL appears in the commit's GitHub check run (`gh api repos/jpm0112/pagina-web-lontra/commits/<sha>/check-runs`). The branch alias is `https://<branch>-pagina-web-lontra.juanpablomorandec.workers.dev`.
- Workers Builds installs npm dependencies, then `wrangler deploy` runs the `[build]` command from `wrangler.toml` (`npm run build`) before uploading. Verified with a probe branch.
- The deploy directory is the repo root (`[assets] directory = "./"`), so every file is public unless `.assetsignore` lists it. Adding a non-public file or folder at the root means adding it to `.assetsignore`. Check with `curl -I <preview>/<path>`.

## Page map

| Spanish (canonical, root) | English (`en/`) |
|---|---|
| `index.html` | `en/index.html` |
| `servicios.html` | `en/services.html` |
| `soluciones.html` | `en/solutions.html` |
| `sobre-nosotros.html` | `en/about.html` |
| `contacto.html` | `en/contact.html` |

Every content change is bilingual: edit both siblings. Copy in both languages has been trope-audited (see git log); keep it that way. The sibling pages are not strict translations: several ES/EN pairs have different hero layouts and sections, so do not assume a change in one maps line-for-line onto the other.

## Architecture

- **Shared chrome is copied into each page.** The desktop `<nav class="fixed ...">`, mobile menu `#mobileMenu` and `<footer>` are identical within each language except the active link (`font-bold text-slate-900` + `aria-current="page"`) and the ES/EN toggle href, which links straight to the sibling file. A change to the chrome means editing all 10 files. Diff the blocks afterwards to confirm they still match.
- **`<head>` per page**, in order: canonical, hreflang (`es-CL`, `en`, `x-default` -> ES page), OG/Twitter, 3-5 JSON-LD blocks (`ProfessionalService` + `ItemList` of `SiteNavigationElement` on every page; plus `WebSite` on home, `OfferCatalog`/`BreadcrumbList` on services, `FAQPage` on solutions, `Person` on about), `built.css`, Google Fonts (Inter, Source Serif 4, JetBrains Mono; Material Symbols Outlined).
- **`assets/js/site.js`** is the only script, loaded at the end of `<body>` on every page. Each feature runs only if its elements exist: mobile menu, spotlight and hero glitch/network viz (home), trail dots, grid cells (`#gridCells`), data streams (`[data-stream]`), scroll reveals (`.fade-up`, `.slide-*`, `.clip-reveal`), services sidebar scroll-spy, contact form. No inline scripts or `on*=` handlers: the CSP is `script-src 'self'`, so they would be blocked.
- **CSS**: `tailwind.config.js` holds the brand palette (`primary #1a3fb8`, `navy-brand`, `accent-teal`, `accent-cyan`, `bright-blue`, `warm-amber`) and font families, and scans `*.html`, `en/*.html` and `assets/js/*.js` (the script adds utility classes). `assets/css/input.css` holds the Tailwind layers, then plain CSS for the custom effects (grid, reveals, hero lines, marquee, data streams, FAQ, `.glow-sweep`). Plain CSS there is never purged, and it sits after the utilities so it wins ties. No inline `<style>` blocks.
- **Cache busting**: `_headers` caches `/assets/css/*`, `/assets/js/*` and `/assets/img/*` for a year as `immutable`. CSS and JS links carry `?v=<hash>` from `scripts/stamp-assets.js`. Images have no stamp, so a changed image needs a new filename.

## Headers and SEO files

- `_headers` also sets HSTS and a CSP that allowlists exactly the external hosts in use: Google Fonts, `api.web3forms.com` (contact form), `google.com`/`maps.google.com` (map iframe). Any new external resource needs a CSP update or it will be blocked.
- `sitemap.xml` carries a hand-maintained `lastmod`; bump it when body copy or schema changes. `llms.txt` and `robots.txt` (explicit AI-crawler allows) are hand-maintained too.
- `f004b54ba5db18d97e4500fc6ec3a278.txt` is the IndexNow key file. Keep it.

## Contact form

`contacto.html` / `en/contact.html` POST to Web3Forms. The access key is in the HTML by design (Web3Forms keys are public). Hidden `botcheck` honeypot. `site.js` submits with `fetch` and shows status in `#formStatus`, and the form falls back to a native POST without JS. Status messages live in `data-msg-*` attributes on the `<form>`. The only working mailbox is `contacto@lontraconsultores.com`, used on both languages.

## Non-code directories

- `Stitch Files/` (tracked, not deployed): original Google Stitch design exports (`code.html` + `screen.png` per screen). Source mockups only; the live pages have diverged (different primary colour, compiled CSS). Do not edit or "fix" them.
- `claude design/` (gitignored, local only): the `lontra-design` Claude skill with brand README, `colors_and_type.css`, SVG assets, preview cards and React UI-kit components. The site no longer links its tokens file; `tailwind.config.js` is the site's colour source.
- `design-tropes.md` (gitignored): the design anti-pattern list used when the site was built.
