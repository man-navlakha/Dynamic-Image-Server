const express = require('express');
const { getGitHubStats } = require('../lib/stats/githubClient');
const { parseStatsQuery, validateParsedQuery } = require('../lib/stats/query');
const { renderStatsSvg, renderErrorSvg } = require('../lib/stats/svgRenderer');
const { statsCache, createCacheKey, DEFAULT_TTL_MS } = require('../lib/stats/cache');

const router = express.Router();

function setSvgHeaders(res) {
  res.set('Content-Type', 'image/svg+xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=43200');
}

router.get('/stats', async (req, res) => {
  const parsed = parseStatsQuery(req.query);
  const errors = validateParsedQuery(parsed);

  setSvgHeaders(res);

  if (errors.length) {
    return res.status(400).send(
      renderErrorSvg(errors[0], {
        title: 'Invalid Request',
        theme: parsed.theme,
        colors: parsed.colors
      })
    );
  }

  const cacheKey = createCacheKey(parsed);
  const cached = statsCache.get(cacheKey);
  if (cached) {
    return res.status(200).send(renderStatsSvg(cached, parsed));
  }

  try {
    const stats = await getGitHubStats(parsed.username, {
      showLanguages: parsed.showLanguages
    });

    statsCache.set(cacheKey, stats, DEFAULT_TTL_MS);
    return res.status(200).send(renderStatsSvg(stats, parsed));
  } catch (error) {
    console.error('GET /api/stats failed:', error.message);

    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).send(
        renderErrorSvg(`User "${parsed.username}" was not found on GitHub.`, {
          title: 'User Not Found',
          theme: parsed.theme,
          colors: parsed.colors
        })
      );
    }

    return res.status(502).send(
      renderErrorSvg('Unable to load data from GitHub API. Please try again shortly.', {
        title: 'GitHub Unavailable',
        theme: parsed.theme,
        colors: parsed.colors
      })
    );
  }
});

module.exports = router;
