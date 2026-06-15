import { create } from "zustand";
import { Appearance } from "react-native";
import { colorScheme } from "nativewind";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
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
    setMode: (mode) => {
      const resolved = resolve(mode);
      apply(resolved);
      set({ mode, resolved });
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
    background: "#1A1210",
    card: "#2A201C",
    border: "#3D3028",
    tabBar: "#2A201C",
    tabActive: "#D4896A",
    tabInactive: "#8B7355",
    addBorder: "#1A1210",
    statusBar: "light" as const,
  },
};
