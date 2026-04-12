const THEMES = {
  dark: {
    titleColor: '#ffffff',
    textColor: '#d5ddf0',
    iconColor: '#71f3c6',
    bgColor: '#0f172a'
  },
  light: {
    titleColor: '#0f172a',
    textColor: '#334155',
    iconColor: '#0ea5e9',
    bgColor: '#ecfeff'
  },
  ocean: {
    titleColor: '#ecfeff',
    textColor: '#b7e3f8',
    iconColor: '#3ddad7',
    bgColor: '#082f49'
  }
};

function getThemeColors(theme, overrides = {}) {
  const base = THEMES[theme] || THEMES.dark;
  return {
    titleColor: overrides.titleColor || base.titleColor,
    textColor: overrides.textColor || base.textColor,
    iconColor: overrides.iconColor || base.iconColor,
    bgColor: overrides.bgColor || base.bgColor
  };
}

function listThemes() {
  return Object.keys(THEMES);
}

module.exports = {
  THEMES,
  getThemeColors,
  listThemes
};
