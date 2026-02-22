const express = require('express');

const router = express.Router();

const vehicleImages = {
  car: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/2018_Toyota_Corolla_Icon_Tech_VVT-i_HEV_CVT_1.8.jpg',
  bike: 'https://upload.wikimedia.org/wikipedia/commons/5/58/2009-03-01_White_motorcycle.jpg',
  bicycle: 'https://upload.wikimedia.org/wikipedia/commons/3/39/City_bicycle_in_Melbourne.jpg',
  bus: 'https://upload.wikimedia.org/wikipedia/commons/1/17/2016_New_Flyer_XN40_CNG.jpg',
  truck: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Freightliner_Cascadia_Sleeper_Cab.jpg',
  scooter: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Honda_Activa_125.jpg',
  maruti_swift_vdi_bsiv: 'https://cdn1.acedms.com/w709/photos/listing/2022-04-14/58ef3bac3064e9fff90e47d9fab177d4_extra_large.jpg',
  maruti_swift_vxi_bsiv: 'https://cdn1.acedms.com/w709/photos/listing/2022-04-14/58ef3bac3064e9fff90e47d9fab177d4_extra_large.jpg',
  maruti_swift_zxi_bsiv: 'https://cdn1.acedms.com/w709/photos/listing/2022-04-14/58ef3bac3064e9fff90e47d9fab177d4_extra_large.jpg',
  maruti_swift_zxi_plus_bsiv: 'https://cdn1.acedms.com/w709/photos/listing/2022-04-14/58ef3bac3064e9fff90e47d9fab177d4_extra_large.jpg',
  'maruti_eeco_5_seater_a/c_bs_iv': 'https://www.v3cars.com/media/model-imgs/1652417409-Maruti-Eeco.jpg',
  maruti_eeco_5_seater_a_c_bs_iv: 'https://www.v3cars.com/media/model-imgs/1652417409-Maruti-Eeco.jpg'
};

function safeDecode(input) {
  try {
    return decodeURIComponent(input);
  } catch {
    return String(input || '');
  }
}

function normalizeVehicleKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[\\/]+/g, '_')
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const normalizedVehicleImages = new Map(
  Object.entries(vehicleImages).map(([key, url]) => [normalizeVehicleKey(key), url])
);

function escapeXml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatVehicleLabel(name) {
  return String(name || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function splitLabel(text, maxCharsPerLine = 20, maxLines = 3) {
  const words = text.split(' ').filter(Boolean);
  if (!words.length) return ['VEHICLE MODEL'];

  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length === maxLines - 1) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (words.length > 0 && lines.join(' ').length < text.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1]}...`;
  }

  return lines.slice(0, maxLines);
}

function createVehicleLabelSvg(modelName) {
  const width = 1200;
  const height = 630;
  const label = formatVehicleLabel(modelName);
  const lines = splitLabel(label);
  const fontSize = lines.length === 1 ? 74 : lines.length === 2 ? 62 : 52;
  const lineHeight = Math.round(fontSize * 1.22);
  const startY = Math.round((height - lineHeight * (lines.length - 1)) / 2);

  const textNodes = lines
    .map((line, index) => {
      const y = startY + index * lineHeight;
      return `<text x="50%" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="#6B7280" font-size="${fontSize}" font-family="'Segoe UI', Arial, sans-serif" font-weight="600">${escapeXml(line)}</text>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}">
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  ${textNodes}
</svg>`;
}

// GET /api/vehicle/:name
// Supports names containing "/" (example: a/c) by capturing the full path.
router.get(/^\/(.+)$/, async (req, res) => {
  const rawVehicleName = safeDecode(req.params[0]);
  const vehicleName = normalizeVehicleKey(rawVehicleName);

  // Check local vehicle images
  if (normalizedVehicleImages.has(vehicleName)) {
    return res.redirect(normalizedVehicleImages.get(vehicleName));
  }

  const svg = createVehicleLabelSvg(rawVehicleName);
  res.set('Content-Type', 'image/svg+xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400');
  return res.status(200).send(svg);
});

module.exports = router;
