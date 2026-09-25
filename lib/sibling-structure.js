// Spanish and English versions of a page must share one layout: same elements,
// classes and ids in the same order. Only text, translatable attributes and
// language-specific URLs may differ. Run after every build (eleventy.config.js).
const { readFileSync } = require('node:fs');
const path = require('node:path');

/** Ordered `tag#id.class` for every opening tag in <body> and `/tag` for every closing tag, so nesting counts. */
function skeleton(html) {
  const body = html.slice(html.indexOf('<body'));
  return [...body.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g)].map(([, closing, tag, attrs]) => {
    if (closing) return `/${tag}`;
    const id = /\sid="([^"]*)"/.exec(attrs);
    const cls = /\sclass="([^"]*)"/.exec(attrs);
    return `${tag}${id ? '#' + id[1] : ''}${cls ? '.' + cls[1].trim().split(/\s+/).join('.') : ''}`;
  });
}

/** First difference between two skeletons, or null if they match. */
function firstDifference(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) return { index: i, a: a[i] || '(end)', b: b[i] || '(end)' };
  }
  return null;
}

/** Throw if any route's es/en output files in `siteDir` differ in structure. */
function checkSiblings(siteDir, routes) {
  const file = (url) => path.join(siteDir, url.endsWith('/') ? url + 'index.html' : url + '.html');
  const problems = [];
  for (const [key, { es, en }] of Object.entries(routes)) {
    const diff = firstDifference(skeleton(readFileSync(file(es), 'utf8')), skeleton(readFileSync(file(en), 'utf8')));
    if (diff) problems.push(`${key}: element ${diff.index} is <${diff.a}> in ${es} but <${diff.b}> in ${en}`);
  }
  if (problems.length) throw new Error(`Spanish and English pages differ in structure:\n  ${problems.join('\n  ')}`);
}

module.exports = { skeleton, firstDifference, checkSiblings };
