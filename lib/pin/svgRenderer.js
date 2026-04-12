const { getPinTheme } = require('./themeConfig');

function escapeXml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(input, maxLen) {
  const text = String(input || '');
  if (text.length <= maxLen) return text;
  return `${text.slice(0, Math.max(0, maxLen - 1))}...`;
}

function hashString(input) {
  let hash = 0;
  const value = String(input || '');
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function maxCharsForWidth(width, pxPerChar = 10) {
  return Math.max(12, Math.floor(width / pxPerChar));
}

function formatCompactNumber(value) {
  const n = Number(value || 0);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}m`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function renderRepoPinSvg(data, options) {
  const width = options.layout?.cardWidth || 420;
  const height = options.layout?.cardHeight || 200;
  const padding = options.layout?.padding || 22;
  const borderRadius = options.layout?.borderRadius || 16;
  const borderWidth = options.layout?.borderWidth || 1;
  const titleSize = options.layout?.titleSize || 18;
  const descSize = options.layout?.descSize || 13;
  const metaSize = options.layout?.metaSize || 13;
  const showStats = options.display?.showStats !== false;
  const showLanguage = options.display?.showLanguage !== false;
  const showTopics = options.display?.showTopics !== false;
  const showBottomBar = options.display?.showBottomBar !== false && (showStats || showLanguage || showTopics);
  const showDescription = options.display?.showDescription !== false;
  const showOwner = options.display?.showOwner !== false;
  const showRepoIcon = options.display?.showRepoIcon !== false;
  const showOwnerIcon = options.display?.showOwnerIcon !== false;
  const showImage = options.display?.showImage === true && options.image?.imageUrl;
  const imageSize = options.image?.imageSize || 38;
  const leftVisualSize = showImage || showRepoIcon ? imageSize : 0;
  const titleLeftX = padding + (leftVisualSize ? leftVisualSize + 14 : 0);

  const theme = getPinTheme(options.theme, options.colors);
  const titleText = options.text?.title || data.repoName;
  const title = truncate(titleText, maxCharsForWidth(width - titleLeftX - padding - 8, 10));
  const ownerText = options.text?.ownerName || data.username;
  const descText = options.text?.description || data.description;
  const desc = truncate(descText, maxCharsForWidth(width - padding * 2, 7.8));
  const fontFamily = options.text?.fontFamily || 'Segoe UI, Arial, sans-serif';
  const iconText = options.text?.iconText || '📁';
  const tags = (Array.isArray(options.customTags) && options.customTags.length ? options.customTags : data.topics || [])
    .filter(Boolean)
    .slice(0, 3);
  if (tags.length === 0 && data.language) tags.push(data.language);

  const bottomBarHeight = showBottomBar ? 62 : 0;
  const bottomY = height - bottomBarHeight;
  const id = hashString(`${data.fullName}|${width}|${height}|${theme.bgColor}|${theme.bgColor2}`);

  const borderAttrs = options.hideBorder
    ? 'stroke="transparent" stroke-width="0"'
    : `stroke="${theme.borderColor}" stroke-width="${borderWidth}"`;

  const topicNodes = showTopics
    ? tags
        .map((tag, idx) => {
          const x = padding + idx * 130;
          const icon = idx === 0 ? '♨' : idx === 1 ? '⛁' : '◉';
          return `<text x="${x}" y="${height - 24}" fill="${theme.textColor}" font-size="${metaSize + 1}" font-family="${escapeXml(fontFamily)}"><tspan fill="${theme.iconColor}">${icon}</tspan> ${escapeXml(truncate(tag, 14))}</text>`;
        })
        .join('')
    : '';

  const statsNode = showStats
    ? `<text x="${width - padding - 150}" y="${height - 24}" text-anchor="start" fill="${theme.textColor}" font-size="${metaSize + 2}" font-family="${escapeXml(fontFamily)}">${options.showIcons ? `<tspan fill="${theme.iconColor}">★</tspan> ${formatCompactNumber(data.stars)}    <tspan fill="${theme.iconColor}">⑂</tspan> ${formatCompactNumber(data.forks)}` : `Stars ${data.stars} | Forks ${data.forks}`}</text>`
    : '';

  const visualNode = showImage
    ? `<clipPath id="imgClip-${id}"><rect x="${padding}" y="${padding + 1}" width="${imageSize}" height="${imageSize}" rx="10"/></clipPath>\n  <g clip-path="url(#imgClip-${id})"><image href="${escapeXml(options.image.imageUrl)}" x="${padding}" y="${padding + 1}" width="${imageSize}" height="${imageSize}" preserveAspectRatio="xMidYMid slice"/></g>`
    : showRepoIcon
      ? `<text x="${padding}" y="${padding + imageSize - 6}" fill="${theme.iconColor}" font-size="${imageSize - 4}" font-family="${escapeXml(fontFamily)}">${escapeXml(iconText)}</text>`
      : '';

  const ownerLineY = padding + 66;
  const ownerNode = showOwner
    ? `<text x="${padding}" y="${ownerLineY}" fill="${theme.textColor}" font-size="${metaSize + 3}" font-family="${escapeXml(fontFamily)}">${showOwnerIcon ? `<tspan fill="${theme.iconColor}">◔</tspan> ` : ''}${escapeXml(ownerText)}</text>`
    : '';

  const descLineY = showOwner ? ownerLineY + 34 : padding + 84;
  const descNode = showDescription
    ? `<text x="${padding}" y="${descLineY}" fill="${theme.textColor}" font-size="${descSize + 3}" font-family="${escapeXml(fontFamily)}">${escapeXml(desc)}</text>`
    : '';

  const dividerNode = showBottomBar
    ? `<line x1="${padding}" y1="${bottomY}" x2="${width - padding}" y2="${bottomY}" stroke="rgba(255,255,255,0.20)"/>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Repository card for ${escapeXml(data.fullName)}">
  <defs>
    <linearGradient id="pinBg-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.bgColor}" stop-opacity="0.98"/>
      <stop offset="100%" stop-color="${theme.bgColor2}" stop-opacity="0.95"/>
    </linearGradient>
    <filter id="pinGlow-${id}" x="-20%" y="-20%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
  </defs>

  <rect x="6" y="6" rx="${borderRadius}" width="${width - 12}" height="${height - 12}" fill="url(#pinBg-${id})" ${borderAttrs}/>
  <g filter="url(#pinGlow-${id})" opacity="0.25">
    <circle cx="${padding + 40}" cy="${height - 14}" r="34" fill="${theme.iconColor}"/>
  </g>

  ${visualNode}
  <text x="${titleLeftX}" y="${padding + 32}" fill="${theme.titleColor}" font-size="${titleSize + 2}" font-weight="700" font-family="${escapeXml(fontFamily)}">${escapeXml(title)}</text>
  ${ownerNode}
  ${descNode}

  ${dividerNode}
  ${showBottomBar ? topicNodes : ''}
  ${showBottomBar ? statsNode : ''}
</svg>`;
}

function renderPinErrorSvg(message, options = {}) {
  const width = options.layout?.cardWidth || 420;
  const height = 130;
  const theme = getPinTheme(options.theme || 'react', options.colors || {});

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Repository card error">
  <rect x="6" y="6" rx="14" width="${width - 12}" height="${height - 12}" fill="${theme.bgColor}" stroke="${theme.borderColor}"/>
  <text x="24" y="48" fill="${theme.titleColor}" font-size="17" font-weight="700">Repository Card Error</text>
  <text x="24" y="76" fill="${theme.textColor}" font-size="13">${escapeXml(message)}</text>
</svg>`;
}

module.exports = {
  renderRepoPinSvg,
  renderPinErrorSvg,
  escapeXml,
  truncate
};
