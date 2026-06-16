import { useThemeStore, themeColors } from "@/store/useThemeStore";

export function useThemedColors() {
  const resolved = useThemeStore((s) => s.resolved);
  const isDark = resolved === "dark";
  const palette = themeColors[resolved];

  return {
    isDark,
    resolved,
    palette,
    brand: isDark ? "#E09A7A" : "#A85D3F",
    brandSoft: isDark ? "#D4896A" : "#C4785A",
    icon: isDark ? "#C4A882" : "#8B4A32",
    iconMuted: isDark ? "#9A8470" : "#B8956F",
    placeholder: isDark ? "#7A6B5C" : "#D4C4B5",
    spinner: isDark ? "#D4896A" : "#A85D3F",
    heart: "#ef4444",
    danger: "#ef4444",
    divider: isDark ? "#4A3D35" : "#E8DFD6",
  };
}
