const { normalizeName, SHORT_NAMES } = require('./library');

const ICONS_PER_LINE = 15;

function parseIconList(value) {
  const raw = String(value || '')
    .split(',')
    .map(token => normalizeName(token))
    .filter(Boolean);

  const seen = new Set();
  const icons = [];

  for (const token of raw) {
    const alias = normalizeName(SHORT_NAMES[token] || token);
    if (seen.has(alias)) continue;
    seen.add(alias);
    icons.push(alias);
  }

  return icons;
}

function parseIconQuery(query) {
  const iconParam = query.i || query.icons || query.tech || '';
  const icons = parseIconList(iconParam);
  const perLineValue = Number(query.perline || query.columns || query.cols || ICONS_PER_LINE);

  return {
    icons: iconParam && String(iconParam).toLowerCase() === 'all' ? ['all'] : icons,
    perLine: Number.isFinite(perLineValue) ? Math.min(50, Math.max(1, perLineValue)) : ICONS_PER_LINE,
    theme: String(query.t || query.theme || 'dark').toLowerCase(),
    title: String(query.title || '').trim()
  };
}

module.exports = {
  parseIconQuery,
  parseIconList,
  ICONS_PER_LINE
};