"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  applyTheme,
  DEFAULT_THEME,
  readStoredTheme,
  resolveTheme,
  writeStoredTheme,
  type Theme,
} from "@/lib/theme/theme";

interface ThemeContextValue {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [resolved, setResolved] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const initial = readStoredTheme();
    setThemeState(initial);
    setResolved(resolveTheme(initial));
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      applyTheme("system");
      setResolved(mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    writeStoredTheme(next);
    applyTheme(next);
    setThemeState(next);
    setResolved(resolveTheme(next));
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
