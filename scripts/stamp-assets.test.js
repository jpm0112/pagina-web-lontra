// Run with `npm test`.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { main, stampPage } = require('./stamp-assets');

test('stampPage adds or replaces the version on the one matching reference', () => {
  assert.strictEqual(stampPage('<link href="assets/css/built.css">', 'assets/css/built.css', 'abc123', 'p'),
    '<link href="assets/css/built.css?v=abc123">');
  assert.strictEqual(stampPage('<link href="../assets/css/built.css?v=0ld">', 'assets/css/built.css', 'abc123', 'p'),
    '<link href="../assets/css/built.css?v=abc123">');
});

test('stampPage fails loudly when the reference is missing or duplicated', () => {
  assert.throws(() => stampPage('<p></p>', 'assets/js/site.js', 'h', 'x.html'), /x\.html: expected 1 reference/);
  assert.throws(() => stampPage('"assets/js/site.js" "assets/js/site.js"', 'assets/js/site.js', 'h', 'x.html'), /found 2/);
});

test('main gives the same hash for CRLF and LF copies of an asset', () => {
  const stampSiteWith = eol => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stamp-'));
    for (const dir of ['assets/css', 'assets/js', 'en']) fs.mkdirSync(path.join(root, dir), { recursive: true });
    fs.writeFileSync(path.join(root, 'assets/css/built.css'), 'a{b:c}');
    fs.writeFileSync(path.join(root, 'assets/js/site.js'), ['one', 'two', ''].join(eol));
    const page = '<link href="assets/css/built.css"><script src="assets/js/site.js"></script>';
    fs.writeFileSync(path.join(root, 'index.html'), page);
    fs.writeFileSync(path.join(root, 'en/index.html'), page.replaceAll('assets/', '../assets/'));
    const log = console.log;
    console.log = () => {};
    try { main(root); } finally { console.log = log; }
    const stamped = fs.readFileSync(path.join(root, 'en/index.html'), 'utf8');
    fs.rmSync(root, { recursive: true });
    return stamped;
  };
  const lf = stampSiteWith('\n');
  assert.match(lf, /\.\.\/assets\/js\/site\.js\?v=[0-9a-f]{10}"/);
  assert.strictEqual(stampSiteWith('\r\n'), lf);
});
