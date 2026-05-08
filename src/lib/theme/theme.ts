export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "sales-crm-theme";
export const DEFAULT_THEME: Theme = "dark";

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {}
  return DEFAULT_THEME;
}

export function writeStoredTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(THEME_STORAGE_KEY, theme); } catch {}
}

// Inline script — runs before React hydration to prevent FOUC.
// Default = dark when nothing stored. Stays in sync with constants above.
export const THEME_INIT_SCRIPT = `
(function() {
  try {
    var t = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (t !== 'light' && t !== 'dark' && t !== 'system') t = '${DEFAULT_THEME}';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`.trim();
