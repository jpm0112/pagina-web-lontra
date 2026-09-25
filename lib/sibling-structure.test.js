// Run with `npm test`.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { skeleton, firstDifference, checkSiblings } = require('./sibling-structure');

test('skeleton keeps tags, ids and classes in order and ignores text and other attributes', () => {
  const html = '<head><title>x</title></head><body><main id="m" class="a  b"><a href="/x" class="c">Hola</a><br/></main></body>';
  assert.deepStrictEqual(skeleton(html), ['body', 'main#m.a.b', 'a.c', 'br']);
});

test('translated text and URLs do not count as differences', () => {
  const es = '<body><h1 class="t">Hola</h1><a href="/servicios">Servicios</a></body>';
  const en = '<body><h1 class="t">Hello</h1><a href="/en/services">Services</a></body>';
  assert.strictEqual(firstDifference(skeleton(es), skeleton(en)), null);
});

test('checkSiblings reports the first structural difference per page', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'siblings-'));
  fs.mkdirSync(path.join(dir, 'en'));
  fs.writeFileSync(path.join(dir, 'index.html'), '<body><div class="a"></div></body>');
  fs.writeFileSync(path.join(dir, 'en', 'index.html'), '<body><div class="a b"></div></body>');
  try {
    assert.throws(() => checkSiblings(dir, { home: { es: '/', en: '/en/' } }), /home: element 1 is <div\.a> in \/ but <div\.a\.b> in \/en\//);
  } finally {
    fs.rmSync(dir, { recursive: true });
  }
});
