const express = require('express');

const { parseIconQuery } = require('../lib/icons/query');
const { renderIconsSvg, loadCatalog } = require('../lib/icons/svgRenderer');

const router = express.Router();

function setSvgHeaders(res) {
  res.set('Content-Type', 'image/svg+xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=43200');
}

router.get('/api/icons', (req, res) => {
  const labels = loadCatalog().baseNames;
  res.set('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).send(JSON.stringify(labels, null, 2));
});

router.get('/icons', (req, res) => {
  const parsed = parseIconQuery(req.query);

  setSvgHeaders(res);

  if (String(req.query.theme || req.query.t || 'dark').toLowerCase() === 'light' || String(req.query.theme || req.query.t || 'dark').toLowerCase() === 'dark') {
    // allowed
  } else if (req.query.theme || req.query.t) {
    return res.status(400).send('Theme must be either "light" or "dark"');
  }

  if (!parsed.icons.length && String(req.query.i || req.query.icons || req.query.tech || '').toLowerCase() !== 'all') {
    return res.status(400).send("You didn't specify any icons!");
  }

  if (Number.isNaN(parsed.perLine) || parsed.perLine < 1 || parsed.perLine > 50) {
    return res.status(400).send('Icons per line must be a number between 1 and 50');
  }

  return res.status(200).send(renderIconsSvg(parsed.icons, parsed));
});

module.exports = router;