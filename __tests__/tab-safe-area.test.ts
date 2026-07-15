import { Platform } from "react-native";
import {
  CENTER_PLUS_ICON_SIZE,
  CENTER_PLUS_OFFSET,
  CENTER_PLUS_SHADOW,
  CENTER_PLUS_SIZE,
  TAB_SCROLL_BOTTOM_PADDING,
  getMaxPlusOverhang,
  getTabBarHeight,
  scrollPaddingClearsTabBar,
} from "@/lib/tab-bar";

describe("bottom navigation safe areas", () => {
  it("includes bottom inset in tab bar height on iOS and Android", () => {
    expect(getTabBarHeight(34)).toBe(90);
    expect(getTabBarHeight(0)).toBe(56);
    expect(Platform.OS === "ios" || Platform.OS === "android" || Platform.OS === "web").toBe(true);
  });

  it("nudges the center plus down so it aligns with tab icons", () => {
    expect(CENTER_PLUS_OFFSET).toBeGreaterThan(0);
    expect(CENTER_PLUS_OFFSET).toBeLessThanOrEqual(8);
  });

  it("sizes the center plus smaller so it belongs in the bar", () => {
    expect(CENTER_PLUS_SIZE).toBeGreaterThanOrEqual(40);
    expect(CENTER_PLUS_SIZE).toBeLessThanOrEqual(48);
  });

  it("sizes the plus icon to match the smaller button", () => {
    expect(CENTER_PLUS_ICON_SIZE).toBeGreaterThanOrEqual(20);
    expect(CENTER_PLUS_ICON_SIZE).toBeLessThanOrEqual(24);
  });

  it("uses a soft shadow instead of a heavy floating card", () => {
    expect(CENTER_PLUS_SHADOW.shadowOpacity).toBeLessThanOrEqual(0.15);
    expect(CENTER_PLUS_SHADOW.elevation).toBeLessThanOrEqual(4);
  });

  it("keeps scroll padding clear of the absolute tab bar and plus overhang", () => {
    expect(getMaxPlusOverhang()).toBe(0);
    expect(scrollPaddingClearsTabBar(0)).toBe(true);
    expect(scrollPaddingClearsTabBar(34)).toBe(true);
    expect(TAB_SCROLL_BOTTOM_PADDING).toBeGreaterThanOrEqual(
      getTabBarHeight(34) + getMaxPlusOverhang(),
    );
  });

  it("keeps plus diameter even for clean centering", () => {
    expect(CENTER_PLUS_SIZE % 2).toBe(0);
  });

  it("uses five equal flex slots for geometric center alignment", () => {
    const { VISIBLE_TAB_ORDER } = require("@/lib/tabs");
    expect(VISIBLE_TAB_ORDER).toHaveLength(5);
    expect(VISIBLE_TAB_ORDER[2]).toBe("add");
  });
});
