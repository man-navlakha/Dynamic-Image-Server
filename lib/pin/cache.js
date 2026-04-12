const DEFAULT_TTL_MS = 10 * 60 * 1000;

class MemoryCache {
  constructor() {
    this.map = new Map();
  }

  get(key) {
    const record = this.map.get(key);
    if (!record) return null;
    if (record.expiresAt <= Date.now()) {
      this.map.delete(key);
      return null;
    }
    return record.value;
  }

  set(key, value, ttl = DEFAULT_TTL_MS) {
    this.map.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }
}

const pinCache = new MemoryCache();

function createPinCacheKey(parsed) {
  return `${parsed.username.toLowerCase()}::${parsed.repo.toLowerCase()}`;
}

module.exports = {
  pinCache,
  createPinCacheKey,
  DEFAULT_TTL_MS
};
