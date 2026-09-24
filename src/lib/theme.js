// The initial theme is applied by an inline script in index.html (before first
// paint, to avoid a light flash in dark mode); keep STORAGE_KEY and the colours in sync.
const STORAGE_KEY = 'ledger.theme';
const THEME_COLORS = { light: '#f4f4f6', dark: '#0e0e11' };

export function getTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private browsing) — the choice just won't persist.
  }
}
