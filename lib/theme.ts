export type Theme = "dark" | "light";

const KEY = "marshal-store-theme";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

export function setTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new Event("theme-updated"));
}

export function toggleTheme(): Theme {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }
}

export function initializeTheme() {
  applyTheme(getTheme());
}