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
  const { theme, colors, showLanguages } = options;
  const merged = getThemeColors(theme, colors);

  const width = 430;
  const extraHeight = showLanguages ? Math.max(data.topLanguages.length, 1) * 24 + 16 : 0;
  const height = 220 + extraHeight;

  const usernameFont = fitFontSize(data.login, { base: 24, min: 16, maxChars: 17 });
  const langSectionY = 205;
  const languageRows = showLanguages
    ? createLangRows(data.topLanguages, merged.textColor, merged.iconColor, langSectionY)
    : { content: '', nextY: langSectionY };

  const langsHeader = showLanguages
    ? `<text x="36" y="${langSectionY - 12}" fill="${merged.titleColor}" font-size="13" letter-spacing="1.2">TOP LANGUAGES</text>`
    : '';

  const dividerY = 118;
  const cardAria = `GitHub stats for ${data.login}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(cardAria)}">
  <defs>
    <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${merged.bgColor}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#050816" stop-opacity="0.84"/>
    </linearGradient>
    <radialGradient id="glassGlow" cx="0.1" cy="0.1" r="0.8">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="avatarClip">
      <circle cx="380" cy="50" r="30"/>
    </clipPath>
    <filter id="glassBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
  </defs>

  <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="22" fill="url(#bgGradient)"/>
  <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="22" fill="url(#glassGlow)"/>
  <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="22" stroke="rgba(255,255,255,0.25)"/>

  <g filter="url(#glassBlur)">
    <circle cx="70" cy="185" r="44" fill="${merged.iconColor}" opacity="0.25">
      <animate attributeName="cx" values="70;84;70" dur="8s" repeatCount="indefinite"/>
    </circle>
  </g>

  <text x="34" y="48" fill="${merged.titleColor}" font-size="16" opacity="0.95">GitHub Stats</text>
  <text x="34" y="80" fill="${merged.titleColor}" font-size="${usernameFont}" font-weight="700">${escapeXml(data.login)}</text>

  <line x1="34" y1="${dividerY}" x2="${width - 34}" y2="${dividerY}" stroke="rgba(255,255,255,0.24)"/>

  <text x="36" y="147" fill="${merged.textColor}" font-size="14"><tspan fill="${merged.iconColor}">Followers:</tspan> ${data.followers}</text>
  <text x="36" y="171" fill="${merged.textColor}" font-size="14"><tspan fill="${merged.iconColor}">Following:</tspan> ${data.following}</text>
  <text x="220" y="147" fill="${merged.textColor}" font-size="14"><tspan fill="${merged.iconColor}">Repos:</tspan> ${data.publicRepos}</text>

  ${langsHeader}
  ${languageRows.content}

  <g clip-path="url(#avatarClip)">
    <image href="${escapeXml(data.avatarUrl)}" x="350" y="20" width="60" height="60" preserveAspectRatio="xMidYMid slice"/>
  </g>
  <circle cx="380" cy="50" r="30" stroke="${merged.iconColor}" stroke-width="2" opacity="0.9"/>

  <rect x="34" y="${height - 30}" width="160" height="8" rx="4" fill="rgba(255,255,255,0.18)">
    <animate attributeName="width" values="80;160;120;160" dur="6s" repeatCount="indefinite"/>
  </rect>
</svg>`;
}

function renderErrorSvg(message, options = {}) {
  const title = options.title || 'GitHub Stats Error';
  const theme = options.theme || 'dark';
  const colors = getThemeColors(theme, options.colors);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="430" height="160" viewBox="0 0 430 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="errorBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.bgColor}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#2a0d16"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="418" height="148" rx="18" fill="url(#errorBg)" stroke="rgba(255,255,255,0.25)"/>
  <text x="28" y="56" fill="${colors.titleColor}" font-size="18" font-weight="700">${escapeXml(title)}</text>
  <text x="28" y="92" fill="${colors.textColor}" font-size="14">${escapeXml(message)}</text>
  <circle cx="392" cy="42" r="12" fill="${colors.iconColor}" opacity="0.8">
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
