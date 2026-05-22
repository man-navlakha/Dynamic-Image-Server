const { resolveRequestedIcons, loadCatalog } = require('./library');

const ONE_ICON = 48;
const CELL_SIZE = 300;
const SCALE = ONE_ICON / (CELL_SIZE - 44);

function renderIconsSvg(tokens, options = {}) {
  const theme = String(options.theme || 'dark').toLowerCase();
  const perLine = Math.min(50, Math.max(1, Number(options.perLine || options.perline || 15)));
  const resolved = resolveRequestedIcons(tokens, theme);

  const iconSvgList = resolved.map(entry => entry.svg);
  const length = Math.min(perLine * CELL_SIZE, Math.max(resolved.length, 1) * CELL_SIZE) - 44;
  const height = Math.max(CELL_SIZE - 44, Math.ceil(Math.max(resolved.length, 1) / perLine) * CELL_SIZE - 44);
  const scaledHeight = height * SCALE;
  const scaledWidth = length * SCALE;

  if (resolved.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${ONE_ICON}" height="${ONE_ICON}" viewBox="0 0 48 48" role="img" aria-label="No icons selected">
  <rect width="48" height="48" rx="10" fill="#f3f4f6"/>
  <text x="24" y="28" text-anchor="middle" fill="#374151" font-size="8" font-family="Segoe UI, Arial, sans-serif">No icons</text>
</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${length} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" role="img" aria-label="Tech stack icons">
  ${iconSvgList
    .map(
      (iconSvg, index) => `
    <g transform="translate(${(index % perLine) * CELL_SIZE}, ${Math.floor(index / perLine) * CELL_SIZE})">
      ${iconSvg}
    </g>`
    )
    .join('\n')}
</svg>`;
}

module.exports = {
  renderIconsSvg,
  loadCatalog
};