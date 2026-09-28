export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function setTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;

  // Remove both first to avoid stale classes
  root.classList.remove("light", "dark");

  if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.add("dark");
  }

  localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new Event("theme-updated"));
}

export function toggleTheme(): Theme {
  const current = getTheme();
  const next: Theme = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

export function initializeTheme() {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  const initial: Theme = stored === "light" ? "light" : "dark";
  setTheme(initial);
}