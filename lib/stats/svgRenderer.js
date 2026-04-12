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
    const { theme, colors, card = {}, visibility = {} } = options;
    const merged = getThemeColors(theme, colors);

    const showAvatar = visibility.showAvatar !== false;
    const showFollowers = visibility.showFollowers !== false;
    const showFollowing = visibility.showFollowing !== false;
    const showRepos = visibility.showRepos !== false;
const hasExplicitWidth = Number.isFinite(card.cardWidth);
const hasExplicitHeight = Number.isFinite(card.cardHeight);

const visibleMetricCount =
  (showFollowers ? 1 : 0) +
  (showFollowing ? 1 : 0) +
  (showRepos ? 1 : 0);

const estimatedTitleWidth = Math.max(320, data.login.length * 28 + 120);
const estimatedMetricsWidth = Math.max(420, visibleMetricCount * 260 + 70);

const autoWidth = Math.min(1200, Math.max(760, estimatedTitleWidth, estimatedMetricsWidth));
const width = hasExplicitWidth ? card.cardWidth : autoWidth;
const height = hasExplicitHeight ? card.cardHeight : 430;
    const radius = Number.isFinite(card.borderRadius) ? card.borderRadius : 32;
    const borderWidth = Number.isFinite(card.borderWidth) ? card.borderWidth : 1;

    const pad = 44;
    const avatarSize = 94;
    const avatarX = width - pad - avatarSize;
    const avatarY = 54;

        const idSuffix = hashString(`${data.login}|${theme}|${width}|${height}`);
        const usernameFont = fitFontSize(data.login, { base: 58, min: 32, maxChars: 16 });

    const titleY = 98;
    const userY = 172;
    const divider1Y = 230;
    const metricsY = 280;
    const divider2Y = 314;
    const labelY = 360;
    const progressY = 378;

    const metrics = [];
    if (showFollowers) metrics.push({ key: 'followers', label: 'Followers', value: data.followers });
    if (showFollowing) metrics.push({ key: 'following', label: 'Following', value: data.following });
    if (showRepos) metrics.push({ key: 'repos', label: 'Repos', value: data.publicRepos });

    const metricAreaWidth = width - pad * 2;
    const metricGap = metrics.length > 0 ? metricAreaWidth / metrics.length : metricAreaWidth;

    const metricNodes = metrics.map((m, i) => {
        const gx = Math.round(pad + i * metricGap);
        const textX = gx + 34;

        let iconNode = '';
        if (m.key === 'followers') {
            iconNode = `<circle cx="${gx + 10}" cy="${metricsY - 8}" r="5" fill="${merged.iconColor}" opacity="0.95"/>
<rect x="${gx + 0}" y="${metricsY + 2}" width="14" height="10" rx="5" fill="${merged.iconColor}" opacity="0.95"/>`;
        } else if (m.key === 'following') {
            iconNode = `<circle cx="${gx + 7}" cy="${metricsY - 8}" r="4" fill="${merged.iconColor}" opacity="0.95"/>
<circle cx="${gx + 19}" cy="${metricsY - 10}" r="3" fill="${merged.iconColor}" opacity="0.95"/>
<rect x="${gx + 0}" y="${metricsY + 2}" width="10" height="9" rx="4.5" fill="${merged.iconColor}" opacity="0.95"/>
<rect x="${gx + 12}" y="${metricsY + 2}" width="12" height="8" rx="4" fill="${merged.iconColor}" opacity="0.85"/>`;
        } else {
            iconNode = `<rect x="${gx + 0}" y="${metricsY - 16}" width="16" height="18" rx="4" fill="${merged.iconColor}" opacity="0.95"/>
<line x1="${gx + 5}" y1="${metricsY - 10}" x2="${gx + 17}" y2="${metricsY - 10}" stroke="${merged.bgColor}" stroke-width="2"/>
<line x1="${gx + 5}" y1="${metricsY - 5}" x2="${gx + 15}" y2="${metricsY - 5}" stroke="${merged.bgColor}" stroke-width="2"/>`;
        }

        return `<g>
${iconNode}
<text x="${textX}" y="${metricsY + 6}" fill="${merged.iconColor}" font-size="30" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.iconColor}" font-size="31" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.iconColor}" font-size="30" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.iconColor}" font-size="31" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.iconColor}" font-size="31" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.iconColor}" font-size="29" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.iconColor}" font-size="30" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.iconColor}" font-size="30" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.iconColor}" font-size="30" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="27" opacity="0">.</text>
<text x="${textX}" y="${metricsY + 6}" fill="${merged.textColor}" font-size="28" font-weight="600">${escapeXml(m.label)}: <tspan fill="${merged.titleColor}" font-weight="700">${m.value}</tspan></text>
</g>`;
    }).join('\n');

    const totalBarW = width - pad * 2;
    const ratio = Math.max(0.08, Math.min(1, Number(data.publicRepos || 0) / 100));
    const progressW = Math.round(totalBarW * ratio);

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

  <rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="${radius}" fill="url(#bg-${idSuffix})" stroke="rgba(255,255,255,0.2)" stroke-width="${borderWidth}"/>

  <text x="${pad}" y="${titleY}" fill="${merged.titleColor}" font-size="52" opacity="0">.</text>
  <text x="${pad}" y="${titleY}" fill="${merged.titleColor}" font-size="48" opacity="0">.</text>
  <text x="${pad}" y="${titleY}" fill="${merged.titleColor}" font-size="50" opacity="0">.</text>
  <text x="${pad}" y="${titleY}" fill="${merged.titleColor}" font-size="50" opacity="0">.</text>
  <text x="${pad}" y="${titleY}" fill="${merged.titleColor}" font-size="50" opacity="0">.</text>
  <text x="${pad}" y="${titleY}" fill="${merged.titleColor}" font-size="50" opacity="0">.</text>
  <text x="${pad}" y="${titleY}" fill="${merged.titleColor}" font-size="30">GitHub Stats</text>
  <text x="${pad}" y="${userY}" fill="${merged.titleColor}" font-size="${usernameFont}" font-weight="700">${escapeXml(data.login)}</text>

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

  <text x="${pad}" y="${labelY}" fill="${merged.iconColor}" font-size="27" opacity="0">.</text>
  <text x="${pad}" y="${labelY}" fill="${merged.titleColor}" font-size="42" opacity="0">.</text>
  <text x="${pad}" y="${labelY}" fill="${merged.titleColor}" font-size="41" opacity="0">.</text>
  <text x="${pad}" y="${labelY}" fill="${merged.titleColor}" font-size="18">Repos: <tspan fill="${merged.titleColor}" font-weight="700">${data.publicRepos}</tspan></text>

  <rect x="${pad}" y="${progressY}" width="${totalBarW}" height="18" rx="9" fill="rgba(199,215,236,0.26)"/>
  <rect x="${pad}" y="${progressY}" width="${progressW}" height="18" rx="9" fill="url(#bar-${idSuffix})"/>
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
    <circle cx="${width - 38}" cy="42" r="12" fill="${colors.iconColor}" opacity="0.8"/>
</svg>`;
}

module.exports = {
    renderStatsSvg,
    renderErrorSvg,
    escapeXml,
    fitFontSize
};
