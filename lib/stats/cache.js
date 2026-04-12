const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const record = this.store.get(key);
    if (!record) return null;

    if (record.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }

    return record.value;
  }

  set(key, value, ttlMs = DEFAULT_TTL_MS) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }
}

const statsCache = new MemoryCache();

function createCacheKey(parsedQuery) {
  const { username, showLanguages } = parsedQuery;
  return `${username.toLowerCase()}::${showLanguages ? 'lang' : 'no-lang'}`;
}

module.exports = {
  MemoryCache,
  statsCache,
  createCacheKey,
  DEFAULT_TTL_MS
};
