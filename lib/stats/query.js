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

function toClampedInt(value, { min, max, defaultValue }) {
  const num = Number(value);
  if (!Number.isFinite(num)) return defaultValue;
  const rounded = Math.round(num);
  return Math.min(max, Math.max(min, rounded));
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
    bgColor: normalizeHexColor(query.bg_color),
    borderColor: normalizeHexColor(query.border_color)
  };

  const card = {
    borderRadius: toClampedInt(query.border_radius, { min: 0, max: 40, defaultValue: 22 }),
    borderWidth: toClampedInt(query.border_width, { min: 0, max: 6, defaultValue: 1 }),
    cardWidth: toClampedInt(query.card_width, { min: 320, max: 1200, defaultValue: 430 }),
    compact: toBoolean(query.compact, false)
  };
  const rawCardWidth = Number(query.card_width);
const cardWidth = Number.isFinite(rawCardWidth)
  ? toClampedInt(query.card_width, { min: 320, max: 1200, defaultValue: 430 })
  : null;

  const visibility = {
    showAvatar: toBoolean(query.show_avatar, true),
    showFollowers: toBoolean(query.show_followers, true),
    showFollowing: toBoolean(query.show_following, true),
    showRepos: toBoolean(query.show_repos, true),
    showLanguages,
    showTitle: toBoolean(query.show_title, true),
    showBorder: toBoolean(query.show_border, true)
  };
  // option to inline avatar image as data URI (useful for GitHub README SVG rendering)
  visibility.embedAvatar = toBoolean(query.embed_avatar, false);

  const vertical = toBoolean(query.vertical, false);

  // optional number font selection: 'dm-mono' | 'space-grotesk' | 'montserrat'
  const rawNumberFont = String(query.number_font || query.numberFont || '').trim().toLowerCase();
  const allowedNumberFonts = new Set(['dm-mono', 'space-grotesk', 'montserrat']);
  const numberFont = allowedNumberFonts.has(rawNumberFont) ? rawNumberFont : undefined;

  return {
    username,
    theme,
    showLanguages,
    colors,
    card,
    numberFont,
    vertical,
    cardWidth,
    visibility
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
  sanitizeText,
  toClampedInt
};
