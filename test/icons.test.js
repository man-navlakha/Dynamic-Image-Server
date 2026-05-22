const test = require('node:test');
const assert = require('node:assert/strict');

const { parseIconList, parseIconQuery } = require('../lib/icons/query');
const { renderIconsSvg } = require('../lib/icons/svgRenderer');
const { resolveIconFileName, resolveRequestedIcons } = require('../lib/icons/library');

test('parseIconList normalizes common tech aliases', () => {
  const icons = parseIconList('html,css,js,react,next,node');

  assert.equal(icons.length, 6);
  assert.deepEqual(icons, ['html', 'css', 'javascript', 'react', 'nextjs', 'nodejs']);
});

test('parseIconQuery derives layout from query parameters', () => {
  const parsed = parseIconQuery({ i: 'html,css,js', perline: '3', theme: 'light' });

  assert.equal(parsed.icons.length, 3);
  assert.equal(parsed.perLine, 3);
  assert.equal(parsed.theme, 'light');
});

test('resolveIconFileName maps aliases to files in public/icons', () => {
  assert.equal(resolveIconFileName('html', 'light'), 'HTML.svg');
  assert.equal(resolveIconFileName('css', 'light'), 'CSS.svg');
  assert.equal(resolveIconFileName('js', 'light'), 'JavaScript.svg');
  assert.equal(resolveIconFileName('react', 'light'), 'React-Light.svg');
});

test('resolveRequestedIcons reads svg assets from public/icons', () => {
  const resolved = resolveRequestedIcons(['html', 'css', 'js'], 'light');

  assert.equal(resolved.length, 3);
  assert.equal(resolved[0].fileName, 'HTML.svg');
  assert.equal(resolved[1].fileName, 'CSS.svg');
  assert.equal(resolved[2].fileName, 'JavaScript.svg');
  assert.match(resolved[0].svg, /<svg/);
  assert.match(resolved[2].svg, /viewBox="0 0 256 256"/);
});

test('renderIconsSvg outputs a tech stack strip', () => {
  const svg = renderIconsSvg(['html', 'css', 'js'], {
    theme: 'light',
    perLine: 3
  });

  assert.match(svg, /<svg/);
  assert.match(svg, /viewBox="0 0 856 256"/);
  assert.match(svg, /fill="#E14E1D"/);
  assert.match(svg, /fill="#0277BD"/);
  assert.match(svg, /fill="#F0DB4F"/);
});