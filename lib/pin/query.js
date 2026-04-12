const HEX_COLOR_RE = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function sanitizeText(input, { maxLen = 200 } = {}) {
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

function normalizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeHexColor(value) {
  const raw = String(value || '').trim();
  if (!raw || !HEX_COLOR_RE.test(raw)) return null;
  const color = raw.startsWith('#') ? raw : `#${raw}`;
  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toLowerCase();
  }
  return color.toLowerCase();
}

function parseTags(value) {
  return String(value || '')
    .split(',')
    .map(v => sanitizeText(v, { maxLen: 24 }))
    .filter(Boolean)
    .slice(0, 4);
}

function parsePinQuery(query) {
  const title = sanitizeText(query.title || query.name, { maxLen: 80 });
  const description = sanitizeText(query.description, { maxLen: 240 });
  const ownerName = sanitizeText(query.owner_name, { maxLen: 80 });
  const iconText = sanitizeText(query.icon_text || '📁', { maxLen: 4 });

  return {
    username: sanitizeText(query.username, { maxLen: 39 }).replace(/^@+/, ''),
    repo: sanitizeText(query.repo, { maxLen: 100 }),
    theme: sanitizeText(query.theme || 'react', { maxLen: 40 }).toLowerCase(),
    showIcons: toBoolean(query.show_icons, true),
    hideBorder: toBoolean(query.hide_border, false),
    text: {
      title,
      description,
      ownerName,
      iconText,
      fontFamily: sanitizeText(query.font_family || 'Segoe UI, Arial, sans-serif', { maxLen: 100 })
    },
    display: {
      showOwner: toBoolean(query.show_owner, true),
      showDescription: toBoolean(query.show_description, true),
      showStats: toBoolean(query.show_stats, true),
      showLanguage: toBoolean(query.show_language, true),
      showTopics: toBoolean(query.show_topics, true),
      showBottomBar: toBoolean(query.show_bottom_bar, true),
      showRepoIcon: toBoolean(query.show_repo_icon, true),
      showOwnerIcon: toBoolean(query.show_owner_icon, true),
      showImage: toBoolean(query.show_image, false)
    },
    customTags: parseTags(query.tags),
    image: {
      imageUrl: normalizeUrl(query.image_url),
      imageSize: toClampedInt(query.image_size, { min: 22, max: 72, defaultValue: 36 })
    },
    layout: {
      cardWidth: toClampedInt(query.card_width, { min: 340, max: 900, defaultValue: 420 }),
      cardHeight: toClampedInt(query.card_height, { min: 140, max: 320, defaultValue: 170 }),
      borderRadius: toClampedInt(query.border_radius, { min: 8, max: 40, defaultValue: 16 }),
      borderWidth: toClampedInt(query.border_width, { min: 0, max: 6, defaultValue: 1 }),
      padding: toClampedInt(query.padding, { min: 16, max: 40, defaultValue: 22 }),
      titleSize: toClampedInt(query.title_size, { min: 14, max: 40, defaultValue: 19 }),
      descSize: toClampedInt(query.desc_size, { min: 11, max: 24, defaultValue: 13 }),
      metaSize: toClampedInt(query.meta_size, { min: 11, max: 22, defaultValue: 13 })
    },
    colors: {
      bgColor: normalizeHexColor(query.bg_color),
      bgColor2: normalizeHexColor(query.bg_color2),
      titleColor: normalizeHexColor(query.title_color),
      iconColor: normalizeHexColor(query.icon_color),
      textColor: normalizeHexColor(query.text_color),
      borderColor: normalizeHexColor(query.border_color)
    }
  };
}

function validatePinQuery(parsed) {
  const errors = [];

  if (!parsed.username) {
    errors.push('Missing required query parameter: username');
  } else if (!/^[a-zA-Z0-9-]{1,39}$/.test(parsed.username)) {
    errors.push('Invalid username format.');
  }

  if (!parsed.repo) {
    errors.push('Missing required query parameter: repo');
  } else if (!/^[A-Za-z0-9._-]{1,100}$/.test(parsed.repo)) {
    errors.push('Invalid repo format.');
  }

  return errors;
}

module.exports = {
  parsePinQuery,
  validatePinQuery,
  toBoolean,
  normalizeHexColor,
  sanitizeText,
  toClampedInt,
  normalizeUrl,
  parseTags
};
