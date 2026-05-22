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
  for (let index = 0; index < text.length; index++) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
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
  <circle cx="${width - 38}" cy="42" r="12" fill="${colors.iconColor}" opacity="0.8"/>
</svg>`;
}

function renderStatsSvg(data, options = {}) {
  const { theme, colors, card = {}, visibility = {} } = options;
  const merged = getThemeColors(theme, colors);

  const numberFontKey = String(options.numberFont || 'dm-mono').toLowerCase();
  const numberFontFamilies = {
    'dm-mono': "'DM Mono', 'IBM Plex Mono', monospace",
    'space-grotesk': "'Space Grotesk', 'Poppins', sans-serif",
    'montserrat': "'Montserrat', 'Poppins', sans-serif"
  };
  const numberFontFamily = numberFontFamilies[numberFontKey] || numberFontFamilies['dm-mono'];

  const showAvatar = visibility.showAvatar !== false;
  const showFollowers = visibility.showFollowers !== false;
  const showFollowing = visibility.showFollowing !== false;
  const showRepos = visibility.showRepos !== false;
  const vertical = Boolean(options.vertical);

  const hasExplicitWidth = Number.isFinite(card.cardWidth);
  const hasExplicitHeight = Number.isFinite(card.cardHeight);
  const visibleMetricCount = (showFollowers ? 1 : 0) + (showFollowing ? 1 : 0) + (showRepos ? 1 : 0);
  const estimatedTitleWidth = Math.max(320, String(data.login || '').length * 28 + 120);
  const estimatedMetricsWidth = Math.max(420, visibleMetricCount * 260 + 70);
  const autoWidth = Math.min(1200, Math.max(760, estimatedTitleWidth, estimatedMetricsWidth));
  const width = hasExplicitWidth ? card.cardWidth : autoWidth;
  const height = hasExplicitHeight ? card.cardHeight : 430;
  const radius = Number.isFinite(card.borderRadius) ? card.borderRadius : 32;
  const borderWidth = Number.isFinite(card.borderWidth) ? card.borderWidth : 1;
  const layoutScale = Math.max(0.82, Math.min(1.12, width / 780));
  const useVerticalMetrics = vertical || width < 700;

  const pad = Math.round(44 * layoutScale);
  const avatarSize = Math.round(94 * layoutScale);
  const avatarX = width - pad - avatarSize;
  const avatarY = Math.round(54 * layoutScale);
  const idSuffix = hashString(`${data.login}|${theme}|${width}|${height}`);
  const usernameFont = Math.round(fitFontSize(data.login, { base: 58, min: 32, maxChars: 16 }) * layoutScale);
  const titleFont = Math.max(24, Math.round(30 * layoutScale));
  const metricFont = Math.max(16, Math.round(24 * layoutScale));
  const metricValueFont = Math.max(18, Math.round(26 * layoutScale));

  const titleY = Math.round(98 * layoutScale);
  const userY = Math.round(172 * layoutScale);
  const divider1Y = Math.round(230 * layoutScale);

  const metrics = [];
  if (showFollowers) metrics.push({ key: 'followers', label: 'Followers', value: data.followers });
  if (showFollowing) metrics.push({ key: 'following', label: 'Following', value: data.following });
  if (showRepos) metrics.push({ key: 'repos', label: 'Repos', value: data.publicRepos });

  const metricGap = metrics.length > 0 ? (width - pad * 2) / metrics.length : width - pad * 2;
  const metricRowGap = Math.round(46 * layoutScale);
  const metricStartY = Math.round(278 * layoutScale);
  const metricEndY = metricStartY + Math.max(0, metrics.length - 1) * metricRowGap;
  const divider2Y = useVerticalMetrics ? metricEndY + Math.round(26 * layoutScale) : Math.round(314 * layoutScale);
  const labelY = useVerticalMetrics ? divider2Y + Math.round(34 * layoutScale) : Math.round(360 * layoutScale);
  const progressY = useVerticalMetrics ? labelY + Math.round(28 * layoutScale) : Math.round(378 * layoutScale);

  const totalBarW = width - pad * 2;
  const ratio = Math.max(0.08, Math.min(1, Number(data.publicRepos || 0) / 100));
  const progressW = Math.round(totalBarW * ratio);
  const footerLabel = useVerticalMetrics ? 'Progress' : 'Repos';
  const footerValue = useVerticalMetrics ? `${Math.round(ratio * 100)}%` : data.publicRepos;

  const renderIcon = (key, x, y) => {
    if (key === 'followers') {
      return `<circle cx="${x + Math.round(10 * layoutScale)}" cy="${y - Math.round(8 * layoutScale)}" r="${Math.round(5 * layoutScale)}" fill="${merged.iconColor}" opacity="0.95"/>
<rect x="${x}" y="${y + Math.round(2 * layoutScale)}" width="${Math.round(14 * layoutScale)}" height="${Math.round(10 * layoutScale)}" rx="${Math.round(5 * layoutScale)}" fill="${merged.iconColor}" opacity="0.95"/>`;
    }

    if (key === 'following') {
      return `<circle cx="${x + Math.round(7 * layoutScale)}" cy="${y - Math.round(8 * layoutScale)}" r="${Math.round(4 * layoutScale)}" fill="${merged.iconColor}" opacity="0.95"/>
<circle cx="${x + Math.round(19 * layoutScale)}" cy="${y - Math.round(10 * layoutScale)}" r="${Math.round(3 * layoutScale)}" fill="${merged.iconColor}" opacity="0.95"/>
<rect x="${x}" y="${y + Math.round(2 * layoutScale)}" width="${Math.round(10 * layoutScale)}" height="${Math.round(9 * layoutScale)}" rx="${Math.round(4.5 * layoutScale)}" fill="${merged.iconColor}" opacity="0.95"/>
<rect x="${x + Math.round(12 * layoutScale)}" y="${y + Math.round(2 * layoutScale)}" width="${Math.round(12 * layoutScale)}" height="${Math.round(8 * layoutScale)}" rx="${Math.round(4 * layoutScale)}" fill="${merged.iconColor}" opacity="0.85"/>`;
    }

    return `<rect x="${x}" y="${y - Math.round(16 * layoutScale)}" width="${Math.round(16 * layoutScale)}" height="${Math.round(18 * layoutScale)}" rx="${Math.round(4 * layoutScale)}" fill="${merged.iconColor}" opacity="0.95"/>
<line x1="${x + Math.round(5 * layoutScale)}" y1="${y - Math.round(10 * layoutScale)}" x2="${x + Math.round(17 * layoutScale)}" y2="${y - Math.round(10 * layoutScale)}" stroke="${merged.bgColor}" stroke-width="2"/>
<line x1="${x + Math.round(5 * layoutScale)}" y1="${y - Math.round(5 * layoutScale)}" x2="${x + Math.round(15 * layoutScale)}" y2="${y - Math.round(5 * layoutScale)}" stroke="${merged.bgColor}" stroke-width="2"/>`;
  };

  const metricNodes = metrics.map((metric, index) => {
    if (useVerticalMetrics) {
      const rowY = metricStartY + index * metricRowGap;
      const iconNode = renderIcon(metric.key, pad, rowY);
      return `<g>
${iconNode}
<text x="${pad + Math.round(28 * layoutScale)}" y="${rowY}" fill="${merged.textColor}" font-size="${metricFont}" font-weight="600">${escapeXml(metric.label)}: <tspan class="numbers" fill="${merged.titleColor}" font-size="${metricValueFont}" font-weight="700">${escapeXml(metric.value)}</tspan></text>
</g>`;
    }

    const gx = Math.round(pad + index * metricGap);
    const iconNode = renderIcon(metric.key, gx, Math.round(280 * layoutScale));
    return `<g>
${iconNode}
<text x="${gx + Math.round(34 * layoutScale)}" y="${Math.round(286 * layoutScale)}" fill="${merged.textColor}" font-size="${metricFont}" font-weight="600">${escapeXml(metric.label)}: <tspan class="numbers" fill="${merged.titleColor}" font-size="${metricValueFont}" font-weight="700">${escapeXml(metric.value)}</tspan></text>
</g>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub stats for ${escapeXml(data.login)}">
  <defs>
    <linearGradient id="bg-${idSuffix}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${merged.bgColor}" stop-opacity="0.98"/>
      <stop offset="100%" stop-color="#2a3554" stop-opacity="0.96"/>
    </linearGradient>
    <linearGradient id="bar-${idSuffix}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${merged.iconColor}"/>
      <stop offset="100%" stop-color="#8ad6f7"/>
    </linearGradient>
  </defs>

  <style><![CDATA[
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&family=Space+Grotesk:wght@300..700&display=swap');
    svg { font-family: 'Montserrat', 'Poppins', sans-serif; }
    .username { font-family: 'Space Grotesk', 'Montserrat', sans-serif; font-weight: 700; }
    .numbers { font-family: ${numberFontFamily}; }
  ]]></style>

  <rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="${radius}" fill="url(#bg-${idSuffix})" stroke="rgba(255,255,255,0.2)" stroke-width="${borderWidth}"/>

  <text x="${pad}" y="${titleY}" fill="${merged.titleColor}" font-size="${titleFont}">GitHub Stats</text>
  <text x="${pad}" y="${userY}" fill="${merged.titleColor}" font-size="${usernameFont}" class="username">${escapeXml(data.login)}</text>

  ${showAvatar ? `<clipPath id="avatar-${idSuffix}">
    <circle cx="${avatarX + avatarSize / 2}" cy="${avatarY + avatarSize / 2}" r="${avatarSize / 2}"/>
  </clipPath>
  <g clip-path="url(#avatar-${idSuffix})">
    <image href="${escapeXml(data.avatarUrl)}" x="${avatarX}" y="${avatarY}" width="${avatarSize}" height="${avatarSize}" preserveAspectRatio="xMidYMid slice"/>
  </g>
  <circle cx="${avatarX + avatarSize / 2}" cy="${avatarY + avatarSize / 2}" r="${avatarSize / 2}" stroke="#b9c8e6" stroke-width="4" opacity="0.9"/>` : ''}

  <line x1="${pad}" y1="${divider1Y}" x2="${width - pad}" y2="${divider1Y}" stroke="rgba(197,214,239,0.52)" stroke-width="2"/>

  ${metricNodes}

  <line x1="${pad}" y1="${divider2Y}" x2="${width - pad}" y2="${divider2Y}" stroke="rgba(197,214,239,0.42)" stroke-width="2"/>

  <text x="${pad}" y="${labelY}" fill="${merged.titleColor}" font-size="${Math.max(16, Math.round(18 * layoutScale))}">${footerLabel}: <tspan class="numbers" fill="${merged.titleColor}" font-weight="700">${escapeXml(footerValue)}</tspan></text>

  <rect x="${pad}" y="${progressY}" width="${totalBarW}" height="18" rx="9" fill="rgba(199,215,236,0.26)"/>
  <rect x="${pad}" y="${progressY}" width="${progressW}" height="18" rx="9" fill="url(#bar-${idSuffix})"/>
</svg>`;
}

module.exports = {
  renderStatsSvg,
  renderErrorSvg,
  escapeXml,
  fitFontSize
};
