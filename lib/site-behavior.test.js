const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');

test('mobile menu opens, closes with Escape, and restores focus', () => {
  const listeners = {};
  let focused;
  function element(name) {
    const attributes = {};
    return {
      inert: true,
      style: {},
      events: {},
      focus() { focused = name; },
      setAttribute(key, value) { attributes[key] = value; },
      getAttribute(key) { return attributes[key]; },
      addEventListener(key, handler) { this.events[key] = handler; },
    };
  }
  const menuToggle = element('toggle');
  const menuClose = element('close');
  const mobileMenu = element('menu');
  const nodes = { menuToggle, menuClose, mobileMenu };
  const document = {
    getElementById(id) { return nodes[id] || null; },
    querySelectorAll() { return []; },
    addEventListener(key, handler) { listeners[key] = handler; },
  };
  runInNewContext(readFileSync('src/assets/js/site.js', 'utf8'), {
    document,
    window: { matchMedia() { return { matches: false }; } },
  });

  menuToggle.events.click();
  assert.equal(mobileMenu.inert, false);
  assert.equal(menuToggle.getAttribute('aria-expanded'), 'true');
  assert.equal(focused, 'close');

  listeners.keydown({ key: 'Escape' });
  assert.equal(mobileMenu.inert, true);
  assert.equal(menuToggle.getAttribute('aria-expanded'), 'false');
  assert.equal(focused, 'toggle');
});
