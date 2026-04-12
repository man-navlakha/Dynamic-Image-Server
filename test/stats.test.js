const test = require('node:test');
const assert = require('node:assert/strict');

const { parseStatsQuery, validateParsedQuery } = require('../lib/stats/query');
const { renderStatsSvg, renderErrorSvg } = require('../lib/stats/svgRenderer');

test('parseStatsQuery parses and normalizes inputs', () => {
  const parsed = parseStatsQuery({
    username: '@man-navlakha',
    theme: 'Light',
    title_color: 'abc',
    text_color: '#123456',
    icon_color: 'invalid',
    bg_color: '00ff00',
    show_languages: 'true'
  });

  assert.equal(parsed.username, 'man-navlakha');
  assert.equal(parsed.theme, 'light');
  assert.equal(parsed.showLanguages, true);
  assert.equal(parsed.colors.titleColor, '#aabbcc');
  assert.equal(parsed.colors.textColor, '#123456');
  assert.equal(parsed.colors.iconColor, null);
  assert.equal(parsed.colors.bgColor, '#00ff00');
});

test('validateParsedQuery rejects malformed username', () => {
  const parsed = parseStatsQuery({ username: 'bad user name' });
  const errors = validateParsedQuery(parsed);

  assert.ok(errors.length > 0);
  assert.match(errors[0], /Invalid username/i);
});

test('renderStatsSvg outputs SVG with expected stats fields', () => {
  const svg = renderStatsSvg(
    {
      login: 'man-navlakha',
      followers: 10,
      following: 11,
      publicRepos: 12,
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
      topLanguages: [{ name: 'JavaScript', count: 5 }]
    },
    {
      theme: 'dark',
      colors: {},
      showLanguages: true
    }
  );

  assert.match(svg, /<svg/);
  assert.match(svg, /GitHub Stats/);
  assert.match(svg, /man-navlakha/);
  assert.match(svg, /Followers:/);
  assert.match(svg, /TOP LANGUAGES/);
  assert.match(svg, /JavaScript/);
});

test('renderErrorSvg outputs safe escaped error message', () => {
  const svg = renderErrorSvg('Bad <input> & data', { theme: 'dark' });
  assert.match(svg, /Bad &lt;input&gt; &amp; data/);
  assert.match(svg, /GitHub Stats Error/);
});
