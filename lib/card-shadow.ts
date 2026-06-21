import { Platform, type ViewStyle } from "react-native";

/** Soft elevation without harsh outlines — opacity border classes often render black on Android. */
export function cardShadow(isDark: boolean): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: isDark ? "#000000" : "#3D2E24",
      shadowOffset: { width: 0, height: isDark ? 6 : 8 },
      shadowOpacity: isDark ? 0.24 : 0.07,
      shadowRadius: isDark ? 20 : 22,
    },
    android: {
      elevation: isDark ? 3 : 2,
    },
    default: {},
  }) as ViewStyle;
}

