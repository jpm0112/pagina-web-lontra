// Eleventy builds src/ into _site/, which Cloudflare deploys (wrangler.toml).
const { execSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');

const INPUT = 'src';
const CSS_IN = `${INPUT}/assets/css/input.css`;
const CSS_OUT = `${INPUT}/assets/css/built.css`;

/**
 * Append ?v=<content hash> to a root-relative asset URL under src/.
 * _headers caches /assets/* for a year as immutable, so changed files need new URLs.
 * Line endings are normalized so Windows (CRLF checkout) and Cloudflare (LF) agree.
 */
function hashed(url) {
  const body = readFileSync(`${INPUT}${url}`, 'utf8').replace(/\r\n/g, '\n');
  return `${url}?v=${createHash('sha256').update(body).digest('hex').slice(0, 10)}`;
}

module.exports = function (eleventyConfig) {
  // Compile Tailwind first, so templates hash the fresh CSS.
  eleventyConfig.on('eleventy.before', () => {
    execSync(`npx tailwindcss -i ${CSS_IN} -o ${CSS_OUT} --minify`, { stdio: 'inherit' });
  });
  eleventyConfig.watchIgnores.add(CSS_OUT);
  eleventyConfig.addWatchTarget(CSS_IN);
  eleventyConfig.addWatchTarget('tailwind.config.js');
  eleventyConfig.addWatchTarget(`${INPUT}/assets/js/`);

  eleventyConfig.addFilter('hashed', hashed);
  eleventyConfig.addFilter('isoDate', (date) => date.toISOString().slice(0, 10));

  eleventyConfig.addPassthroughCopy({ [CSS_OUT]: 'assets/css/built.css' });
  eleventyConfig.addPassthroughCopy(`${INPUT}/assets/img`);
  eleventyConfig.addPassthroughCopy(`${INPUT}/assets/js`);
  eleventyConfig.addPassthroughCopy(`${INPUT}/*.{txt,xml}`);
  eleventyConfig.addPassthroughCopy(`${INPUT}/_headers`);

  // Pages are Spanish unless their directory data says otherwise (src/en/en.json).
  eleventyConfig.addGlobalData('lang', 'es');
  eleventyConfig.addGlobalData('layout', 'base.njk');
  // Page dates (sitemap lastmod) come from each source file's last git commit.
  eleventyConfig.addGlobalData('date', 'git Last Modified');

  // Keep the .html file names: Cloudflare serves /servicios from servicios.html,
  // and old /servicios.html links keep redirecting there.
  eleventyConfig.addGlobalData('permalink', () => (data) => `${data.page.filePathStem}.${data.page.outputFileExtension}`);

  return { dir: { input: INPUT, output: '_site' }, htmlTemplateEngine: 'njk' };
};
