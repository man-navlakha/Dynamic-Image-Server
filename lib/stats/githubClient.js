const GITHUB_API_URL = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 8000;
const TOP_LANGUAGE_REPOS = 50;

function getGitHubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'dynamic-image-server-stats/1.0'
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function getUserProfile(username) {
  const response = await fetchWithTimeout(`${GITHUB_API_URL}/users/${encodeURIComponent(username)}`);

  if (response.status === 404) {
    const err = new Error('User not found');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  if (!response.ok) {
    const err = new Error(`GitHub profile request failed with status ${response.status}`);
    err.code = 'GITHUB_API_ERROR';
    err.status = response.status;
    throw err;
  }

  const data = await response.json();

  return {
    login: data.login,
    followers: data.followers,
    following: data.following,
    publicRepos: data.public_repos,
    avatarUrl: data.avatar_url,
    htmlUrl: data.html_url
  };
}

async function getTopLanguages(username, limit = 4) {
  const response = await fetchWithTimeout(
    `${GITHUB_API_URL}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${TOP_LANGUAGE_REPOS}&type=owner`
  );

  if (!response.ok) {
    const err = new Error(`GitHub repos request failed with status ${response.status}`);
    err.code = 'GITHUB_API_ERROR';
    err.status = response.status;
    throw err;
  }

  const repos = await response.json();
  const languageCount = new Map();

  for (const repo of repos) {
    const lang = typeof repo.language === 'string' ? repo.language.trim() : '';
    if (!lang) continue;

    languageCount.set(lang, (languageCount.get(lang) || 0) + 1);
  }

  return Array.from(languageCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

async function getGitHubStats(username, { showLanguages = false } = {}) {
  const profile = await getUserProfile(username);
  let topLanguages = [];

  if (showLanguages) {
    topLanguages = await getTopLanguages(username);
  }

  return {
    ...profile,
    topLanguages
  };
}

module.exports = {
  getGitHubStats,
  getUserProfile,
  getTopLanguages
};
