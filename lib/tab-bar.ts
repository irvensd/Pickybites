/** Shared tab bar geometry — keeps safe-area math consistent across platforms. */

export function getTabBarHeight(bottomInset: number) {
  return 56 + bottomInset;
}

/**
 * Vertical nudge for the center plus within its equal-width slot.
 * Positive moves it down toward the other tab icons (other tabs include a
 * label below the icon, so a centered circle sits too high without this).
 */
export const CENTER_PLUS_OFFSET = 4;

/** Circular center plus diameter — sized to sit with the 24px tab icons. */
export const CENTER_PLUS_SIZE = 44;

/** Plus glyph size inside the center button. */
export const CENTER_PLUS_ICON_SIZE = 22;

/** Soft shadow for the center plus — not a floating card. */
export const CENTER_PLUS_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
} as const;

/**
 * NativeWind `pb-28` ≈ 112px. Must clear tab bar height + plus overhang
 * for typical safe-area insets (0 Android / 34 iPhone home indicator).
 */
export const TAB_SCROLL_BOTTOM_PADDING = 112;

/** How far the plus can stick above the bar top (none when offset is downward). */
export function getMaxPlusOverhang() {
  return Math.max(0, -CENTER_PLUS_OFFSET);
}

/** True when scroll padding clears the absolute tab bar and plus overhang. */
export function scrollPaddingClearsTabBar(bottomInset: number) {
  const required = getTabBarHeight(bottomInset) + getMaxPlusOverhang();
  return TAB_SCROLL_BOTTOM_PADDING >= required;
}
