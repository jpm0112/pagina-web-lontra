// Stamp a content hash (?v=...) onto the CSS and JS URLs in every page.
// _headers caches /assets/* for a year as immutable, so a changed file must get
// a new URL or returning visitors keep the old one. Run by `npm run build`,
// which Cloudflare also runs on every deploy (wrangler.toml [build]).
const { createHash } = require('node:crypto');
const { readFileSync, writeFileSync, readdirSync } = require('node:fs');
const path = require('node:path');

const ASSETS = ['assets/css/built.css', 'assets/js/site.js'];

/** Relative paths of the site pages: root-level and en/ HTML files. */
function listPages(root) {
  const inDir = dir => readdirSync(path.join(root, dir)).filter(f => f.endsWith('.html')).map(f => path.join(dir, f));
  return [...inDir('.'), ...inDir('en')];
}

/** Set ?v=<hash> on the single reference to `asset` in `html`; throw if there is not exactly one. */
function stampPage(html, asset, hash, page) {
  const escaped = asset.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const re = new RegExp(`(${escaped})(\\?v=[^"]*)?"`, 'g');
  const count = (html.match(re) || []).length;
  if (count !== 1) throw new Error(`${page}: expected 1 reference to ${asset}, found ${count}`);
  return html.replace(re, `$1?v=${hash}"`);
}

/** Hash each asset under `root` and stamp its references in every page. */
function main(root) {
  // Hash with LF line endings so Windows (CRLF checkout) and Cloudflare (LF) agree.
  const hashes = ASSETS.map(a => createHash('sha256')
    .update(readFileSync(path.join(root, a), 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 10));
  for (const page of listPages(root)) {
    const file = path.join(root, page);
    const before = readFileSync(file, 'utf8');
    const after = ASSETS.reduce((html, asset, i) => stampPage(html, asset, hashes[i], page), before);
    if (after !== before) writeFileSync(file, after);
  }
  ASSETS.forEach((a, i) => console.log(`stamped ${a}?v=${hashes[i]}`));
}

if (require.main === module) main(process.cwd());

module.exports = { main, stampPage };
