const { getThemeColors } = require('./themeConfig');

function escapeXml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function fitFontSize(text, { base = 20, min = 13, maxChars = 20 } = {}) {
  const length = String(text || '').length;
  if (length <= maxChars) return base;
  const reduced = base - Math.ceil((length - maxChars) / 2);
  return Math.max(min, reduced);
}

function hashString(input) {
  let hash = 0;
  const text = String(input || '');
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function buildMetrics(data, merged, visibility) {
  const metrics = [];

  if (visibility.showFollowers) {
    metrics.push(`<tspan fill="${merged.iconColor}">Followers:</tspan> ${data.followers}`);
  }
  if (visibility.showFollowing) {
    metrics.push(`<tspan fill="${merged.iconColor}">Following:</tspan> ${data.following}`);
  }
  if (visibility.showRepos) {
    metrics.push(`<tspan fill="${merged.iconColor}">Repos:</tspan> ${data.publicRepos}`);
  }

  return metrics;
}

function createLangRows(topLanguages, textColor, iconColor, startY) {
  if (!topLanguages.length) return { content: '', nextY: startY };

  const rows = topLanguages
    .map((lang, index) => {
      const y = startY + index * 24;
      return `<text x="36" y="${y}" fill="${textColor}" font-size="14" font-weight="500">\n  <tspan fill="${iconColor}">#</tspan> ${escapeXml(lang.name)} <tspan opacity="0.8">(${lang.count})</tspan>\n</text>`;
    })
    .join('\n');

  return {
    content: rows,
    nextY: startY + topLanguages.length * 24
  };
}

function renderStatsSvg(data, options) {
  const { theme, colors, showLanguages, card = {}, visibility = {} } = options;
  const merged = getThemeColors(theme, colors);

  const effectiveCard = {
    borderRadius: Number.isFinite(card.borderRadius) ? card.borderRadius : 22,
    borderWidth: Number.isFinite(card.borderWidth) ? card.borderWidth : 1,
    cardWidth: Number.isFinite(card.cardWidth) ? card.cardWidth : 430,
    compact: !!card.compact
  };

  const effectiveVisibility = {
    showAvatar: visibility.showAvatar !== false,
    showFollowers: visibility.showFollowers !== false,
    showFollowing: visibility.showFollowing !== false,
    showRepos: visibility.showRepos !== false,
    showLanguages: visibility.showLanguages === true || showLanguages === true,
    showTitle: visibility.showTitle !== false,
    showBorder: visibility.showBorder !== false
  };

  const width = effectiveCard.cardWidth;
  const innerPadX = 34;
  const avatarCenterX = width - 50;
  const textRightPad = effectiveVisibility.showAvatar ? 108 : 36;
  const titleMaxChars = Math.max(14, Math.floor((width - textRightPad - innerPadX) / 11));
  const usernameFont = fitFontSize(data.login, { base: effectiveCard.compact ? 21 : 24, min: 16, maxChars: titleMaxChars });
  const baseTop = effectiveCard.compact ? 38 : 48;
  const usernameY = effectiveVisibility.showTitle ? baseTop + 32 : baseTop + 10;
  const dividerY = effectiveVisibility.showTitle ? baseTop + 70 : baseTop + 44;

  const metrics = buildMetrics(data, merged, effectiveVisibility);
  const metricColumns = effectiveCard.compact ? 1 : 2;
  const metricRowHeight = 24;
  const metricStartY = dividerY + 28;
  const metricNodes = metrics
    .map((metricText, index) => {
      const row = Math.floor(index / metricColumns);
      const col = index % metricColumns;
      const x = col === 0 ? innerPadX + 2 : Math.round(width / 2);
      const y = metricStartY + row * metricRowHeight;
      return `<text x="${x}" y="${y}" fill="${merged.textColor}" font-size="14">${metricText}</text>`;
    })
    .join('\n  ');

  const metricsRows = metrics.length === 0 ? 1 : Math.ceil(metrics.length / metricColumns);
  let contentY = metricStartY + metricsRows * metricRowHeight;

  let emptyStateNode = '';
  if (metrics.length === 0) {
    emptyStateNode = `<text x="${innerPadX + 2}" y="${metricStartY}" fill="${merged.textColor}" font-size="14" opacity="0.9">No metrics selected.</text>`;
  }

  let langsHeader = '';
  let languageRowsContent = '';
  if (effectiveVisibility.showLanguages) {
    const langSectionY = contentY + 18;
    langsHeader = `<text x="${innerPadX + 2}" y="${langSectionY}" fill="${merged.titleColor}" font-size="13" letter-spacing="1.2">TOP LANGUAGES</text>`;
    const languageRows = createLangRows(data.topLanguages, merged.textColor, merged.iconColor, langSectionY + 20);
    languageRowsContent = languageRows.content;
    contentY = languageRows.nextY;
  }

  const height = Math.max(effectiveCard.compact ? 170 : 200, contentY + 34);
  const progressY = height - 30;
  const cardAria = `GitHub stats for ${data.login}`;
  const idSuffix = hashString(`${data.login}|${theme}|${width}|${height}`);
  const borderStroke = colors.borderColor || 'rgba(255,255,255,0.25)';
  const strokeWidth = effectiveVisibility.showBorder ? effectiveCard.borderWidth : 0;
  const glowY = Math.max(95, height - 55);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(cardAria)}">
  <defs>
    <linearGradient id="bgGradient-${idSuffix}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${merged.bgColor}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#050816" stop-opacity="0.84"/>
    </linearGradient>
    <radialGradient id="glassGlow-${idSuffix}" cx="0.1" cy="0.1" r="0.8">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="avatarClip-${idSuffix}">
      <circle cx="${avatarCenterX}" cy="50" r="30"/>
    </clipPath>
    <filter id="glassBlur-${idSuffix}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
  </defs>

  <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="${effectiveCard.borderRadius}" fill="url(#bgGradient-${idSuffix})"/>
  <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="${effectiveCard.borderRadius}" fill="url(#glassGlow-${idSuffix})"/>
  <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="${effectiveCard.borderRadius}" stroke="${borderStroke}" stroke-width="${strokeWidth}"/>

  <g filter="url(#glassBlur-${idSuffix})">
    <circle cx="70" cy="${glowY}" r="44" fill="${merged.iconColor}" opacity="0.25">
      <animate attributeName="cx" values="70;84;70" dur="8s" repeatCount="indefinite"/>
    </circle>
  </g>

  ${effectiveVisibility.showTitle ? `<text x="${innerPadX}" y="${baseTop}" fill="${merged.titleColor}" font-size="16" opacity="0.95">GitHub Stats</text>` : ''}
  <text x="${innerPadX}" y="${usernameY}" fill="${merged.titleColor}" font-size="${usernameFont}" font-weight="700">${escapeXml(data.login)}</text>

  <line x1="${innerPadX}" y1="${dividerY}" x2="${width - innerPadX}" y2="${dividerY}" stroke="rgba(255,255,255,0.24)"/>

  ${metricNodes}
  ${emptyStateNode}

  ${langsHeader}
  ${languageRowsContent}

  ${effectiveVisibility.showAvatar ? `<g clip-path="url(#avatarClip-${idSuffix})">\n    <image href="${escapeXml(data.avatarUrl)}" x="${avatarCenterX - 30}" y="20" width="60" height="60" preserveAspectRatio="xMidYMid slice"/>\n  </g>\n  <circle cx="${avatarCenterX}" cy="50" r="30" stroke="${merged.iconColor}" stroke-width="2" opacity="0.9"/>` : ''}

  <rect x="${innerPadX}" y="${progressY}" width="160" height="8" rx="4" fill="rgba(255,255,255,0.18)">
    <animate attributeName="width" values="80;160;120;160" dur="6s" repeatCount="indefinite"/>
  </rect>
</svg>`;
}

function renderErrorSvg(message, options = {}) {
  const title = options.title || 'GitHub Stats Error';
  const theme = options.theme || 'dark';
  const colors = getThemeColors(theme, options.colors);
  const card = options.card || {};
  const width = Number.isFinite(card.cardWidth) ? card.cardWidth : 430;
  const radius = Number.isFinite(card.borderRadius) ? card.borderRadius : 18;
  const idSuffix = hashString(`${title}|${width}`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="160" viewBox="0 0 ${width} 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="errorBg-${idSuffix}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.bgColor}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#2a0d16"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="${width - 12}" height="148" rx="${radius}" fill="url(#errorBg-${idSuffix})" stroke="rgba(255,255,255,0.25)"/>
  <text x="28" y="56" fill="${colors.titleColor}" font-size="18" font-weight="700">${escapeXml(title)}</text>
  <text x="28" y="92" fill="${colors.textColor}" font-size="14">${escapeXml(message)}</text>
  <circle cx="${width - 38}" cy="42" r="12" fill="${colors.iconColor}" opacity="0.8">
    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>`;
}

module.exports = {
  renderStatsSvg,
  renderErrorSvg,
  escapeXml,
  fitFontSize
};
