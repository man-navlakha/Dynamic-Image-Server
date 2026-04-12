const express = require('express');

const { parsePinQuery, validatePinQuery } = require('../lib/pin/query');
const { getRepositoryPinData } = require('../lib/pin/githubClient');
const { renderRepoPinSvg, renderPinErrorSvg } = require('../lib/pin/svgRenderer');
const { pinCache, createPinCacheKey, DEFAULT_TTL_MS } = require('../lib/pin/cache');

const router = express.Router();

function setSvgHeaders(res) {
  res.set('Content-Type', 'image/svg+xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=43200');
}

router.get('/pin', async (req, res) => {
  const parsed = parsePinQuery(req.query);
  const errors = validatePinQuery(parsed);

  setSvgHeaders(res);

  if (errors.length > 0) {
    return res.status(400).send(
      renderPinErrorSvg(errors[0], {
        theme: parsed.theme,
        colors: parsed.colors,
        layout: parsed.layout
      })
    );
  }

  const cacheKey = createPinCacheKey(parsed);
  const cached = pinCache.get(cacheKey);

  if (cached) {
    return res.status(200).send(renderRepoPinSvg(cached, parsed));
  }

  try {
    const repoData = await getRepositoryPinData(parsed.username, parsed.repo);
    pinCache.set(cacheKey, repoData, DEFAULT_TTL_MS);
    return res.status(200).send(renderRepoPinSvg(repoData, parsed));
  } catch (error) {
    console.error('GET /api/pin failed:', error.message);

    if (error.code === 'REPO_NOT_FOUND') {
      return res.status(404).send(
        renderPinErrorSvg(`Repository ${parsed.username}/${parsed.repo} was not found.`, {
          theme: parsed.theme,
          colors: parsed.colors,
          layout: parsed.layout
        })
      );
    }

    return res.status(502).send(
      renderPinErrorSvg('Unable to load repository data from GitHub API.', {
        theme: parsed.theme,
        colors: parsed.colors,
        layout: parsed.layout
      })
    );
  }
});

module.exports = router;
