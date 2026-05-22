const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', '..', 'public', 'icons');

const SHORT_NAMES = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  tailwind: 'tailwindcss',
  vue: 'vuejs',
  nuxt: 'nuxtjs',
  go: 'golang',
  cf: 'cloudflare',
  wasm: 'webassembly',
  postgres: 'postgresql',
  k8s: 'kubernetes',
  next: 'nextjs',
  node: 'nodejs',
  mongo: 'mongodb',
  md: 'markdown',
  ps: 'photoshop',
  ai: 'illustrator',
  pr: 'premiere',
  ae: 'aftereffects',
  scss: 'sass',
  sc: 'scala',
  net: 'dotnet',
  gatsbyjs: 'gatsby',
  gql: 'graphql',
  vlang: 'v',
  amazonwebservices: 'aws',
  bots: 'discordbots',
  express: 'expressjs',
  googlecloud: 'gcp',
  mui: 'materialui',
  windi: 'windicss',
  unreal: 'unrealengine',
  nest: 'nestjs',
  ktorio: 'ktor',
  pwsh: 'powershell',
  au: 'audition',
  rollup: 'rollupjs',
  rxjs: 'reactivex',
  rxjava: 'reactivex',
  ghactions: 'githubactions',
  sklearn: 'scikitlearn'
};

let catalogCache = null;

function normalizeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function stripThemeSuffix(name) {
  return String(name || '').replace(/-(dark|light)$/i, '');
}

function loadCatalog() {
  if (catalogCache) return catalogCache;

  const files = fs
    .readdirSync(ICONS_DIR, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.svg'))
    .map(entry => entry.name);

  const byNormalizedName = new Map();
  const themedVariants = new Map();
  const baseNames = new Set();

  for (const fileName of files) {
    const baseName = fileName.replace(/\.svg$/i, '');
    const normalized = normalizeName(baseName);
    byNormalizedName.set(normalized, fileName);

    const themedMatch = baseName.match(/^(.*?)-(dark|light)$/i);
    const canonicalBase = normalizeName(themedMatch ? themedMatch[1] : stripThemeSuffix(baseName));
    baseNames.add(canonicalBase);

    if (!themedVariants.has(canonicalBase)) {
      themedVariants.set(canonicalBase, { dark: null, light: null, base: null });
    }

    const variantEntry = themedVariants.get(canonicalBase);
    if (themedMatch) {
      variantEntry[themedMatch[2].toLowerCase()] = fileName;
    } else {
      variantEntry.base = fileName;
    }
  }

  catalogCache = {
    files,
    byNormalizedName,
    themedVariants,
    baseNames: [...baseNames].sort()
  };

  return catalogCache;
}

function resolveIconFileName(token, theme = 'dark') {
  const catalog = loadCatalog();
  const normalizedToken = normalizeName(token);
  const alias = SHORT_NAMES[normalizedToken] || normalizedToken;
  const normalizedAlias = normalizeName(alias);
  const preferredTheme = theme === 'light' ? 'light' : 'dark';

  const candidates = [
    normalizeName(`${normalizedAlias}-${preferredTheme}`),
    normalizeName(`${normalizedToken}-${preferredTheme}`),
    normalizedAlias,
    normalizedToken
  ];

  for (const candidate of candidates) {
    if (catalog.byNormalizedName.has(candidate)) {
      return catalog.byNormalizedName.get(candidate);
    }
  }

  const themed = catalog.themedVariants.get(normalizedAlias);
  if (themed) {
    return themed[preferredTheme] || themed.base || themed.dark || themed.light || null;
  }

  return null;
}

function resolveRequestedIcons(tokens, theme = 'dark') {
  const catalog = loadCatalog();
  const requested = Array.isArray(tokens) ? tokens : [];
  const expanded = requested.length === 1 && normalizeName(requested[0]) === 'all'
    ? catalog.baseNames
    : requested;

  const seen = new Set();
  const resolved = [];

  for (const token of expanded) {
    const fileName = resolveIconFileName(token, theme);
    if (!fileName || seen.has(fileName)) continue;
    seen.add(fileName);

    resolved.push({
      token,
      fileName,
      svg: fs.readFileSync(path.join(ICONS_DIR, fileName), 'utf8')
    });
  }

  return resolved;
}

module.exports = {
  ICONS_DIR,
  SHORT_NAMES,
  loadCatalog,
  normalizeName,
  resolveIconFileName,
  resolveRequestedIcons
};