// Utilities to manage user theme based on design tokens in index.css
import { secureStorage } from '@/lib/SecureStorage';
export type ThemePreset = "emerald" | "blue" | "violet";

export type ThemeSettings = {
  preset: ThemePreset;
  radius: number; // px
};

const defaultTheme: ThemeSettings = { preset: "blue", radius: 12 };

export function loadTheme(): ThemeSettings {
  try {
    // For immediate access, try localStorage first as fallback
    const stored = localStorage.getItem("as-theme");
    return { ...defaultTheme, ...(stored ? JSON.parse(stored) : {}) as ThemeSettings };
  } catch {
    return defaultTheme;
  }
}

export async function loadThemeAsync(): Promise<ThemeSettings> {
  try {
    const stored = await secureStorage.getItem("as-theme");
    return { ...defaultTheme, ...(stored || {}) as ThemeSettings };
  } catch {
    return defaultTheme;
  }
}

export function saveTheme(theme: ThemeSettings) {
  // Save to both for immediate access and secure storage
  localStorage.setItem("as-theme", JSON.stringify(theme));
  secureStorage.setItem("as-theme", theme, { encrypt: true });
}

export function applyUserTheme(theme?: ThemeSettings) {
  const t = theme || loadTheme();
  const root = document.documentElement;
  const map: Record<ThemePreset, { primary: string; primaryFg: string; accent: string; emerald: string; emeraldDark: string; emeraldDarker: string; background?: string }>= {
    emerald: { primary: "160 51% 58%", primaryFg: "222 47% 8%", accent: "160 51% 58%", emerald: "160 51% 58%", emeraldDark: "160 51% 48%", emeraldDarker: "160 51% 38%" },
    blue:    { primary: "210 100% 60%", primaryFg: "222 47% 8%", accent: "210 100% 60%", emerald: "210 100% 60%", emeraldDark: "210 90% 52%", emeraldDarker: "210 80% 44%" },
    violet:  { primary: "270 90% 65%", primaryFg: "222 47% 8%", accent: "270 90% 65%", emerald: "270 90% 65%", emeraldDark: "270 85% 55%", emeraldDarker: "270 80% 45%" },
  };
  const c = map[t.preset];
  root.style.setProperty("--primary", c.primary);
  root.style.setProperty("--primary-foreground", c.primaryFg);
  root.style.setProperty("--accent", c.accent);
  root.style.setProperty("--accent-foreground", c.primaryFg);
  root.style.setProperty("--emerald", c.emerald);
  root.style.setProperty("--emerald-dark", c.emeraldDark);
  root.style.setProperty("--emerald-darker", c.emeraldDarker);
  root.style.setProperty("--radius", `${t.radius}px`);
}
