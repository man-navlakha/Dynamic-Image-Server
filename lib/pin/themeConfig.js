const THEMES = {
  react: {
    bgColor: '#20232a',
    bgColor2: '#0b1220',
    titleColor: '#61d9fa',
    iconColor: '#f8d866',
    textColor: '#c9d1d9',
    borderColor: '#2f3b4a'
  },
  dark: {
    bgColor: '#0d1117',
    bgColor2: '#05070b',
    titleColor: '#f0f6fc',
    iconColor: '#58a6ff',
    textColor: '#9fb3c8',
    borderColor: '#30363d'
  },
  light: {
    bgColor: '#f6f8fa',
    bgColor2: '#eef2f8',
    titleColor: '#0969da',
    iconColor: '#8250df',
    textColor: '#57606a',
    borderColor: '#d0d7de'
  }
};

function getPinTheme(themeName, overrides = {}) {
  const base = THEMES[themeName] || THEMES.react;
  return {
    bgColor: overrides.bgColor || base.bgColor,
    bgColor2: overrides.bgColor2 || base.bgColor2,
    titleColor: overrides.titleColor || base.titleColor,
    iconColor: overrides.iconColor || base.iconColor,
    textColor: overrides.textColor || base.textColor,
    borderColor: overrides.borderColor || base.borderColor
  };
}

module.exports = {
  THEMES,
  getPinTheme
};
