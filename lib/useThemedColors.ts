import { useThemeStore, themeColors } from "@/store/useThemeStore";
import { brandColors } from "@/constants/branding";

export function useThemedColors() {
  const resolved = useThemeStore((s) => s.resolved);
  const isDark = resolved === "dark";
  const palette = themeColors[resolved];

  return {
    isDark,
    resolved,
    palette,
    brand: isDark ? brandColors.roseLight : brandColors.roseDark,
    brandSoft: isDark ? brandColors.roseMuted : brandColors.rose,
    icon: isDark ? brandColors.roseLight : brandColors.navy,
    iconMuted: isDark ? brandColors.grey : brandColors.greyLight,
    placeholder: isDark ? "#6B6570" : "#CFC5C8",
    spinner: isDark ? brandColors.roseMuted : brandColors.roseDark,
    heart: "#ef4444",
    danger: "#ef4444",
    divider: isDark ? "#4A4450" : "#E8E0E2",
  };
}
