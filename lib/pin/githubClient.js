const GITHUB_API_URL = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 8000;

function getHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'dynamic-image-server-pin/1.0'
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
    return await fetch(url, {
      headers: getHeaders(),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function getRepositoryPinData(username, repo) {
  const response = await fetchWithTimeout(
    `${GITHUB_API_URL}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}`
  );

  if (response.status === 404) {
    const err = new Error('Repository not found');
    err.code = 'REPO_NOT_FOUND';
    throw err;
  }

  if (!response.ok) {
    const err = new Error(`GitHub repository request failed with status ${response.status}`);
    err.code = 'GITHUB_API_ERROR';
    err.status = response.status;
    throw err;
  }

  const data = await response.json();

  return {
    username: data.owner?.login || username,
    repoName: data.name || repo,
    fullName: data.full_name || `${username}/${repo}`,
    description: data.description || 'No description provided.',
    stars: Number(data.stargazers_count || 0),
    forks: Number(data.forks_count || 0),
    language: data.language || 'Unknown',
    topics: Array.isArray(data.topics) ? data.topics.filter(Boolean).slice(0, 4) : [],
    ownerAvatar: data.owner?.avatar_url || null,
    ownerType: data.owner?.type || 'User',
    repoUrl: data.html_url || `https://github.com/${username}/${repo}`
  };
}

module.exports = {
  getRepositoryPinData
};
