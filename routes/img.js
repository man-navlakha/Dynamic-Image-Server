const express = require('express');

const router = express.Router();

// Simple in-memory cache: normalizedQuery -> { url, expiresAt }
const cache = new Map();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FETCH_TIMEOUT_MS = 8000;

const allowInsecureTls = process.env.IMG_ALLOW_INSECURE_TLS === '1';
if (allowInsecureTls) {
  // This is process-wide and intentionally gated behind IMG_ALLOW_INSECURE_TLS=1.
  // Prefer fixing TLS properly via NODE_EXTRA_CA_CERTS instead.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn(
    'WARNING: IMG_ALLOW_INSECURE_TLS=1 is enabled. TLS certificate validation is disabled for /img requests.'
  );
}

function normalizeQuery(text) {
  return String(text || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function isLikelyTlsIssue(err) {
  const code = err?.cause?.code || err?.code;
  const message = String(err?.cause?.message || err?.message || '');
  return (
    code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' ||
    code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
    code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
    code === 'CERT_HAS_EXPIRED' ||
    code === 'ERR_TLS_CERT_ALTNAME_INVALID' ||
    message.includes('UNABLE_TO_GET_ISSUER_CERT_LOCALLY') ||
    message.includes('self signed certificate')
  );
}

function isLikelyNetworkIssue(err) {
  const code = err?.cause?.code || err?.code;
  return (
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'EAI_AGAIN' ||
    code === 'ENOTFOUND' ||
    err?.name === 'AbortError'
  );
}

async function fetchJson(url, { retries = 2 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'img-server/1.0 (image redirect)'
        }
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json();
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      await new Promise(r => setTimeout(r, 150 * Math.pow(2, attempt)));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastErr;
}

function categoryScore(categories) {
  const joined = (categories || []).join(' | ').toLowerCase();
  let score = 0;
  if (/\b(india|indian)\b/.test(joined)) score += 2;
  return score;
}

function titlePenalty(title) {
  const t = String(title || '').toLowerCase();
  if (/(logo|badge|emblem|icon|svg|vector|illustration)/.test(t)) return 10;
  return 0;
}

async function searchWikimediaCommonsBestImage(text) {
  const gsrsearch = `${text} filetype:bitmap -svg -logo -emblem -badge`;

  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrnamespace: '6', // File:
    gsrlimit: '20',
    gsrsearch,
    prop: 'imageinfo|categories',
    iiprop: 'url|size|mime',
    cllimit: '20',
    clshow: '!hidden'
  });

  const url = `https://commons.wikimedia.org/w/api.php?${params.toString()}`;
  const data = await fetchJson(url);
  const pages = data?.query?.pages ? Object.values(data.query.pages) : [];

  const candidates = [];
  for (const page of pages) {
    const info = page?.imageinfo?.[0];
    if (!info?.url || !info?.width || !info?.height) continue;
    if (!String(info.mime || '').startsWith('image/')) continue;
    if (String(info.mime || '').includes('svg')) continue;

    const categories = (page.categories || []).map(c => c.title || '').filter(Boolean);
    const size = info.width * info.height;
    const sizeScore = Math.log10(Math.max(size, 1));
    const catScore = categoryScore(categories);
    const penalty = titlePenalty(page.title) + (info.width < 500 ? 5 : 0);

    const score = sizeScore + catScore - penalty;

    candidates.push({
      title: page.title,
      url: info.url,
      width: info.width,
      height: info.height,
      mime: info.mime,
      score
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0] || null;
  return { best, candidates };
}

// GET /img?text=TVS%20RTR%20160
// Redirects to the "best" matching image from Wikimedia Commons.
// Optional: ?format=json or ?debug=1 to return JSON instead of redirect.
router.get('/', async (req, res) => {
  const text = String(req.query.text || '').trim();
  const format = String(req.query.format || '').toLowerCase();
  const debug = String(req.query.debug || '').toLowerCase() === '1';

  if (!text) return res.status(400).json({ message: 'Missing query param: text' });
  if (text.length < 2 || text.length > 120) {
    return res.status(400).json({ message: 'Invalid text length (2..120)' });
  }

  const normalized = normalizeQuery(text);
  const cached = cache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) {
    if (format === 'json' || debug) {
      return res.json({ text, best: { url: cached.url }, cached: true });
    }
    return res.redirect(cached.url);
  }

  try {
    const { best, candidates } = await searchWikimediaCommonsBestImage(text);
    if (!best?.url) return res.status(404).json({ message: 'No image found for this text' });

    cache.set(normalized, { url: best.url, expiresAt: Date.now() + CACHE_TTL_MS });

    if (format === 'json' || debug) {
      return res.json({
        text,
        best,
        cached: false,
        ...(debug ? { candidates: candidates.slice(0, 10) } : {})
      });
    }

    return res.redirect(best.url);
  } catch (err) {
    console.error('Error resolving /img:', err);
    if (isLikelyTlsIssue(err) || isLikelyNetworkIssue(err)) {
      return res.status(502).json({
        message:
          'Network/TLS error while fetching images. If you are behind a proxy (common on some networks), set NODE_EXTRA_CA_CERTS to your proxy CA cert. For local-only testing you can also set IMG_ALLOW_INSECURE_TLS=1 (not recommended for production).'
      });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
