const express = require('express');
const { getGitHubStats } = require('../lib/stats/githubClient');
const { parseStatsQuery, validateParsedQuery } = require('../lib/stats/query');
const { renderStatsSvg, renderErrorSvg } = require('../lib/stats/svgRendererResponsive');
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
        colors: parsed.colors,
        card: parsed.card
      })
    );
  }

  const cacheKey = createCacheKey(parsed);
  const cached = statsCache.get(cacheKey);
  if (cached) {
    // If caller requested avatar embedding, ensure avatar is inlined as data URI
    if (parsed.visibility && parsed.visibility.embedAvatar && cached.avatarUrl && !cached.avatarUrl.startsWith('data:')) {
      try {
        const dataUri = await fetchAsDataUri(cached.avatarUrl);
        cached.avatarUrl = dataUri;
      } catch (err) {
        console.warn('Failed to inline cached avatar:', err.message);
      }
    }
    return res.status(200).send(renderStatsSvg(cached, parsed));
  }

  try {
    const stats = await getGitHubStats(parsed.username, {
      showLanguages: parsed.showLanguages
    });

    // Optionally inline avatar as data URI to make SVG self-contained (works on GitHub)
    if (parsed.visibility && parsed.visibility.embedAvatar && stats.avatarUrl && !stats.avatarUrl.startsWith('data:')) {
      try {
        const dataUri = await fetchAsDataUri(stats.avatarUrl);
        stats.avatarUrl = dataUri;
      } catch (err) {
        console.warn('Failed to inline avatar:', err.message);
      }
    }

    statsCache.set(cacheKey, stats, DEFAULT_TTL_MS);
    return res.status(200).send(renderStatsSvg(stats, parsed));
  } catch (error) {
    console.error('GET /api/stats failed:', error.message);

    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).send(
        renderErrorSvg(`User "${parsed.username}" was not found on GitHub.`, {
          title: 'User Not Found',
          theme: parsed.theme,
          colors: parsed.colors,
          card: parsed.card
        })
      );
    }

    return res.status(502).send(
      renderErrorSvg('Unable to load data from GitHub API. Please try again shortly.', {
        title: 'GitHub Unavailable',
        theme: parsed.theme,
        colors: parsed.colors,
        card: parsed.card
      })
    );
  }
});

// Helper: fetch a remote image and return a data URI
const { request: httpRequest } = require('http');
const { request: httpsRequest } = require('https');
const { URL } = require('url');

function fetchAsDataUri(urlStr, timeout = 5000) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(urlStr);
      const lib = urlObj.protocol === 'https:' ? httpsRequest : httpRequest;
      const req = lib(urlObj, { method: 'GET', timeout }, (res) => {
        const chunks = [];
        const contentType = res.headers['content-type'] || 'image/png';
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          const b64 = buf.toString('base64');
          resolve(`data:${contentType};base64,${b64}`);
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy(new Error('timeout'));
      });
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = router;
