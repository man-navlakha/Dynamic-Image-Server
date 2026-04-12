
# Dynamic Image Server

Production-ready dynamic image APIs built with Express. This project now includes a custom GitHub stats card endpoint that returns animated SVG cards suitable for GitHub profile READMEs.


![GitHub stats](https://img-server-theta.vercel.app/api/stats?username=man-navlakha)
## Base URL

Use your deployed host (example):

```text
https://img-server-theta.vercel.app
```

## Quick Start (Local)

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```env
PORT=3000
# Optional but strongly recommended for higher GitHub API limits
GITHUB_TOKEN=ghp_xxx
```

3. Run locally:

```bash
node man.js
```

4. Run tests:

```bash
npm test
```

## New Endpoint: GitHub Stats Card

- Method: `GET`
- Path: `/api/stats`
- Response content type: `image/svg+xml; charset=utf-8`

### Required Query Params

- `username` (required): GitHub login name.

### Optional Query Params

- `theme`: `dark` | `light` | `ocean` (default: `dark`)
- `title_color`: hex color override (`#RRGGBB` or `RRGGBB`)
- `text_color`: hex color override (`#RRGGBB` or `RRGGBB`)
- `icon_color`: hex color override (`#RRGGBB` or `RRGGBB`)
- `bg_color`: hex color override (`#RRGGBB` or `RRGGBB`)
- `show_languages`: `true`/`false`, `1`/`0`, `yes`/`no`

### API Examples

```text
/api/stats?username=man-navlakha
/api/stats?username=man-navlakha&theme=dark&title_color=blue
/api/stats?username=man-navlakha&theme=ocean&title_color=00e5ff&text_color=e8f9ff&icon_color=40f3ff&bg_color=022135
/api/stats?username=man-navlakha&show_languages=true
```

Note: only valid hex overrides are applied. Non-hex values (such as `blue`) are safely ignored.

### Markdown Embed Examples

```md
![GitHub Stats](https://img-server-theta.vercel.app/api/stats?username=man-navlakha)
![GitHub Stats - Dark](https://img-server-theta.vercel.app/api/stats?username=man-navlakha&theme=dark)
![GitHub Stats - Custom](https://img-server-theta.vercel.app/api/stats?username=man-navlakha&theme=ocean&show_languages=true&title_color=ecfeff&text_color=c9ecff&icon_color=3ddad7&bg_color=082f49)
```

## Theme Options

| Theme | title_color | text_color | icon_color | bg_color |
|---|---|---|---|---|
| dark | `#ffffff` | `#d5ddf0` | `#71f3c6` | `#0f172a` |
| light | `#0f172a` | `#334155` | `#0ea5e9` | `#ecfeff` |
| ocean | `#ecfeff` | `#b7e3f8` | `#3ddad7` | `#082f49` |

Color override precedence:

1. Query override (`title_color`, etc.)
2. Selected `theme`
3. `dark` fallback

## Error Behavior

Errors are always returned as SVG cards (never JSON), with appropriate HTTP status:

- `400`: missing/invalid query params (`username` missing or malformed)
- `404`: GitHub user not found
- `502`: upstream GitHub API unavailable/rate-limited/network failure

This keeps README embeds visually stable even on failures.

## Performance and Reliability

The stats endpoint includes:

- In-memory cache with TTL (`10 minutes`) to reduce repeated GitHub calls.
- HTTP cache headers:
  - `max-age=300`
  - `s-maxage=1800`
  - `stale-while-revalidate=43200`
- Strict query validation and sanitization.
- Modular architecture for extensibility:
  - `routes/stats.js`
  - `lib/stats/githubClient.js`
  - `lib/stats/query.js`
  - `lib/stats/themeConfig.js`
  - `lib/stats/svgRenderer.js`
  - `lib/stats/cache.js`

## Vercel Deployment Guide

### 1) Import Project

- Import this repository into Vercel.
- Framework preset: `Other` / Node serverless.

### 2) Build Settings

- Build command: none required
- Output directory: none required
- Install command: `npm install`
- Entrypoint already configured through `vercel.json` (`man.js`)

### 3) Environment Variables

Set in Vercel project settings:

- `GITHUB_TOKEN` (recommended, keeps you away from low anonymous API limits)
- `PORT` is optional for local usage only

### 4) Deploy and Test

After deployment:

```text
https://<your-project>.vercel.app/api/stats?username=man-navlakha
```

### 5) Verify Headers

Confirm response contains:

- `content-type: image/svg+xml; charset=utf-8`
- `cache-control: public, max-age=300, s-maxage=1800, stale-while-revalidate=43200`

## Scaling Suggestions

For higher traffic production usage:

1. Replace in-memory cache with Redis/Upstash for shared cache across instances.
2. Add ETag generation and conditional requests (`If-None-Match`) for bandwidth reduction.
3. Add ISR-like regeneration policies at edge/CDN layer.
4. Add explicit GitHub rate-limit backoff and circuit-breaker behavior.
5. Put endpoint behind CDN with regional caching.
6. Add observability: logs + metrics + alerting for upstream failures and latency.

## Existing Endpoints

- `/img?text=...`: generic Wikimedia image resolver and redirect.
- `/api/animal/:name`: returns configured animal image (or fetches from Pexels).
- `/api/vehicle/:name`: returns configured vehicle image or generated SVG fallback.
- `/api/users`: sample CRUD-like user endpoints.
