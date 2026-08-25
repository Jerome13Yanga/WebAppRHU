/**
 * Light Theme Manager
 * Clean, bright, modern healthcare theme with high readability and crisp aesthetics.
 */

const THEME_KEY = 'rhu_theme';

export function initTheme() {
  applyTheme('light');
}

export function getTheme() {
  return 'light';
}

export function applyTheme(theme = 'light') {
  document.documentElement.classList.add('light');
  document.documentElement.classList.remove('dark');
  localStorage.setItem(THEME_KEY, 'light');
}

export function toggleTheme() {
  applyTheme('light');
}

export function updateThemeIcons() {
  // No-op for standard light theme
}
