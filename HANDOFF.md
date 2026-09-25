# Handoff — 2026-09-25

How the site is built and deployed is in `CLAUDE.md`. This file covers where things stand and what is still open.

## State

Production (`main`, commit `a7608ec`) is the Eleventy build: templates and data for everything shared, clean URLs with 301s from the old `.html` addresses, and Spanish and English pages on one layout, which the build enforces. Behaviour checks, the CSP and the reveal animations were verified on the live domain.

This session also fixed:
- The home "Rigor Matemático + Precisión Estratégica" section and the about-page method steps were invisible after scrolling. They now reveal.
- Cloudflare Web Analytics was blocked by the CSP. It is now allowed.
- The live site served `/.git/` and `/CLAUDE.md`. Only `_site/` is deployed now.
- English pages used `contact@`, which does not work. Both languages use `contacto@`.

## Needs JP

1. Read the English about page. Its hero, approach cards and method steps are new translations of the Spanish copy.
2. Choose the LinkedIn link. Both contact pages now point to `linkedin.com/in/jpmorande`; the old English page had `linkedin.com/company/lontra`.
3. Send one real message from each contact form and confirm it reaches `contacto@lontraconsultores.com`. Only a mocked submission was tested.
4. Check in a few days that Cloudflare Web Analytics is recording visits.
5. Delete the merged branches `site-refactor` and `eleventy`.

## Decisions made on JP's behalf

- Spanish is the reference layout. English-only content was dropped: the solutions hero buttons, the about-page mission quote and founder paragraph, and an "Est. 2014" label that looked wrong.
- Both contact forms submit the same Spanish field names, so every email has the same format.
- Section ids are English on both languages (`#team`, `#methodology`).

## Known limits

- Sitemap `lastmod` comes from each page's last git commit. Edits to shared templates or data do not update it.
- Images are not content-hashed. Because `/assets/img/*` is cached for a year, a changed image needs a new filename.
- CSS/JS versioning is a query string on a fixed path, so a page opened just before a deploy can load the newer file.

## Checking a change

```bash
npm run build   # fails if an ES/EN page pair differs in structure
npm test
```

Push to a branch and open the preview URL from the commit's Cloudflare check run (`gh api repos/jpm0112/pagina-web-lontra/commits/<sha>/check-runs`) before merging to `main`.
