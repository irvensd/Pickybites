import { create } from "zustand";
import { Appearance } from "react-native";
import { colorScheme } from "nativewind";
import { loadThemeMode, saveThemeMode } from "@/lib/prefs";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  resolved: "light" | "dark";
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  hydrate: () => Promise<void>;
}

function resolve(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return Appearance.getColorScheme() === "dark" ? "dark" : "light";
  }
  return mode;
}

function apply(scheme: "light" | "dark") {
  colorScheme.set(scheme);
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = resolve("system");
  apply(initial);

  Appearance.addChangeListener(({ colorScheme: cs }) => {
    if (get().mode === "system") {
      const resolved = cs === "dark" ? "dark" : "light";
      apply(resolved);
      set({ resolved });
    }
  });

  return {
    mode: "system",
    resolved: initial,
    hydrated: false,
    setMode: (mode) => {
      const resolved = resolve(mode);
      apply(resolved);
      set({ mode, resolved });
      void saveThemeMode(mode);
    },
    hydrate: async () => {
      const saved = await loadThemeMode();
      if (saved) {
        const resolved = resolve(saved);
        apply(resolved);
        set({ mode: saved, resolved, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    },
  };
});

export const themeColors = {
  light: {
    background: "#FAFAF8",
    card: "#FFFFFF",
    border: "#E8DFD6",
    tabBar: "#FFFFFF",
    tabActive: "#A85D3F",
    tabInactive: "#B8956F",
    addBorder: "#FAFAF8",
    statusBar: "dark" as const,
  },
  dark: {
    background: "#141010",
    card: "#2F2520",
    border: "#5A4A40",
    tabBar: "#1E1816",
    tabActive: "#E09A7A",
    tabInactive: "#9A8470",
    addBorder: "#141010",
    statusBar: "light" as const,
  },
};
