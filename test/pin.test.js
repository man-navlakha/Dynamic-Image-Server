function escapeXml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderRepoPinSvg(repo, options) {
  const {
    theme,
    colors = {},
    hideBorder,
    showIcons,
    text = {},
    display = {},
    layout = {}
  } = options;

  const width = layout.cardWidth || 560;
  const height = layout.cardHeight || 220;

  const title = escapeXml(text.title || repo.repoName);
  const owner = escapeXml(text.ownerName || repo.username);
  const description = escapeXml(
    text.description || repo.description || "No description provided."
  );

  const language = escapeXml(repo.language || "Unknown");

  const bg1 = colors.bgColor || "#20232a";
  const bg2 = colors.bgColor2 || "#0b1220";
  const border = hideBorder ? "transparent" : colors.borderColor || "#2f3b4a";

  const titleColor = colors.titleColor || "#61d9fa";
  const textColor = colors.textColor || "#c9d1d9";

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>

  <!-- Card -->
  <rect 
    x="0" y="0" 
    width="${width}" 
    height="${height}" 
    rx="${layout.borderRadius || 20}" 
    fill="url(#bg)" 
    stroke="${border}" 
    stroke-width="${layout.borderWidth || 1}"
  />

  <style>
    .title { fill: ${titleColor}; font-size: ${layout.titleSize || 28}px; font-weight: 600; }
    .owner { fill: #8b949e; font-size: ${layout.metaSize || 13}px; }
    .desc { fill: ${textColor}; font-size: ${layout.descSize || 14}px; }
    .meta { fill: ${textColor}; font-size: ${layout.metaSize || 13}px; }
  </style>

  <!-- ICON -->
  ${
    display.showRepoIcon !== false
      ? `<text x="20" y="45" font-size="26">${text.iconText || "📁"}</text>`
      : ""
  }

  <!-- TITLE -->
  <text x="60" y="45" class="title">${title}</text>

  <!-- OWNER -->
  ${
    display.showOwner
      ? `<text x="60" y="70" class="owner">${display.showOwnerIcon ? "🟡 " : ""}${owner}</text>`
      : ""
  }

  <!-- DIVIDER -->
  <line x1="20" y1="90" x2="${width - 20}" y2="90" stroke="#2f3b4a"/>

  <!-- DESCRIPTION -->
  ${
    display.showDescription
      ? `<text x="20" y="120" class="desc">${description}</text>`
      : ""
  }

  <!-- LANGUAGE -->
  ${
    display.showLanguage
      ? `<text x="20" y="${height - 20}" class="meta">🔥 ${language}</text>`
      : ""
  }

  <!-- STARS -->
  ${
    display.showStats
      ? `<text x="${width - 120}" y="${height - 20}" class="meta">★ ${repo.stars}</text>`
      : ""
  }

  <!-- FORKS -->
  ${
    display.showStats
      ? `<text x="${width - 60}" y="${height - 20}" class="meta">⑂ ${repo.forks}</text>`
      : ""
  }

</svg>
`;
}

function renderPinErrorSvg(message, options = {}) {
  const safe = escapeXml(message);

  return `
<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0d1117"/>
  <text x="20" y="40" fill="#ff6b6b" font-size="16">
    Repository Card Error
  </text>
  <text x="20" y="70" fill="#c9d1d9" font-size="14">
    ${safe}
  </text>
</svg>
`;
}

module.exports = {
  renderRepoPinSvg,
  renderPinErrorSvg
};