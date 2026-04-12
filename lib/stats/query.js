const HEX_COLOR_RE = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function sanitizeText(input, { maxLen = 120 } = {}) {
  return String(input || '')
    .replace(/[<>"'`]/g, '')
    .trim()
    .slice(0, maxLen);
}

function toBoolean(value, defaultValue = false) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return defaultValue;
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
}

function normalizeHexColor(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (!HEX_COLOR_RE.test(raw)) return null;
  const color = raw.startsWith('#') ? raw : `#${raw}`;
  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toLowerCase();
  }
  return color.toLowerCase();
}

function parseStatsQuery(query) {
  const username = sanitizeText(query.username, { maxLen: 39 }).replace(/^@+/, '');
  const theme = sanitizeText(query.theme || 'dark', { maxLen: 30 }).toLowerCase();
  const showLanguages = toBoolean(query.show_languages, false);

  const colors = {
    titleColor: normalizeHexColor(query.title_color),
    textColor: normalizeHexColor(query.text_color),
    iconColor: normalizeHexColor(query.icon_color),
    bgColor: normalizeHexColor(query.bg_color)
  };

  return {
    username,
    theme,
    showLanguages,
    colors
  };
}

function validateParsedQuery(parsed) {
  const errors = [];

  if (!parsed.username) {
    errors.push('Missing required query parameter: username');
  }

  if (parsed.username && !/^[a-zA-Z0-9-]{1,39}$/.test(parsed.username)) {
    errors.push('Invalid username. Use GitHub login format (1-39 chars, letters, numbers, hyphen).');
  }

  return errors;
}

module.exports = {
  parseStatsQuery,
  validateParsedQuery,
  normalizeHexColor,
  toBoolean,
  sanitizeText
};
