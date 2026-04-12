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
    border_color: 'fff',
    show_languages: 'true',
    show_avatar: 'false',
    show_followers: '0',
    border_radius: '30',
    border_width: '3',
    card_width: '520',
    compact: 'true'
  });

  assert.equal(parsed.username, 'man-navlakha');
  assert.equal(parsed.theme, 'light');
  assert.equal(parsed.showLanguages, true);
  assert.equal(parsed.colors.titleColor, '#aabbcc');
  assert.equal(parsed.colors.textColor, '#123456');
  assert.equal(parsed.colors.iconColor, null);
  assert.equal(parsed.colors.bgColor, '#00ff00');
  assert.equal(parsed.colors.borderColor, '#ffffff');
  assert.equal(parsed.visibility.showAvatar, false);
  assert.equal(parsed.visibility.showFollowers, false);
  assert.equal(parsed.visibility.showFollowing, true);
  assert.equal(parsed.visibility.showRepos, true);
  assert.equal(parsed.visibility.showTitle, true);
  assert.equal(parsed.visibility.showBorder, true);
  assert.equal(parsed.card.borderRadius, 30);
  assert.equal(parsed.card.borderWidth, 3);
  assert.equal(parsed.card.cardWidth, 520);
  assert.equal(parsed.card.compact, true);
});

test('parseStatsQuery defaults to showing key sections', () => {
  const parsed = parseStatsQuery({ username: 'man-navlakha' });

  assert.equal(parsed.visibility.showAvatar, true);
  assert.equal(parsed.visibility.showFollowers, true);
  assert.equal(parsed.visibility.showFollowing, true);
  assert.equal(parsed.visibility.showRepos, true);
  assert.equal(parsed.visibility.showTitle, true);
  assert.equal(parsed.visibility.showBorder, true);
  assert.equal(parsed.card.borderRadius, 22);
  assert.equal(parsed.card.borderWidth, 1);
  assert.equal(parsed.card.cardWidth, 430);
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

test('renderStatsSvg supports hiding avatar and selected metrics', () => {
  const svg = renderStatsSvg(
    {
      login: 'man-navlakha',
      followers: 10,
      following: 11,
      publicRepos: 12,
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
      topLanguages: []
    },
    {
      theme: 'dark',
      colors: { borderColor: '#ffffff' },
      card: { borderRadius: 30, borderWidth: 2, cardWidth: 500, compact: true },
      visibility: {
        showAvatar: false,
        showFollowers: false,
        showFollowing: true,
        showRepos: false,
        showLanguages: false,
        showTitle: true,
        showBorder: true
      },
      showLanguages: false
    }
  );

  assert.doesNotMatch(svg, /<image href=/);
  assert.doesNotMatch(svg, /Followers:/);
  assert.match(svg, /Following:/);
  assert.doesNotMatch(svg, /Repos:/);
  assert.match(svg, /width="500"/);
  assert.match(svg, /rx="30"/);
});

test('renderStatsSvg renders no-metrics state', () => {
  const svg = renderStatsSvg(
    {
      login: 'man-navlakha',
      followers: 10,
      following: 11,
      publicRepos: 12,
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
      topLanguages: []
    },
    {
      theme: 'dark',
      colors: {},
      card: {},
      visibility: {
        showAvatar: false,
        showFollowers: false,
        showFollowing: false,
        showRepos: false,
        showLanguages: false,
        showTitle: true,
        showBorder: true
      },
      showLanguages: false
    }
  );

  assert.match(svg, /No metrics selected\./);
});

test('renderErrorSvg outputs safe escaped error message', () => {
  const svg = renderErrorSvg('Bad <input> & data', { theme: 'dark' });
  assert.match(svg, /Bad &lt;input&gt; &amp; data/);
  assert.match(svg, /GitHub Stats Error/);
});
