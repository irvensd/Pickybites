import {
  AUTHENTICATED_HOME,
  VISIBLE_TAB_LABELS,
  VISIBLE_TAB_ORDER,
  getTabDefinition,
  getVisibleTabs,
  isVisibleTab,
} from "@/lib/tabs";

describe("tab navigation configuration", () => {
  it("uses the required visible tab order", () => {
    expect(VISIBLE_TAB_ORDER).toEqual(["discover", "feed", "add", "bites", "profile"]);
  });

  it("exposes Discover, Feed, +, Bites, Profile labels", () => {
    expect(VISIBLE_TAB_LABELS).toEqual(["Discover", "Feed", "+", "Bites", "Profile"]);
  });

  it("opens Discover by default after authentication", () => {
    expect(AUTHENTICATED_HOME).toBe("/(tabs)/discover");
  });

  it("hides Home and Journal from the bottom bar while keeping routes", () => {
    expect(getTabDefinition("index")?.hidden).toBe(true);
    expect(getTabDefinition("index")?.href).toBeNull();
    expect(getTabDefinition("journal")?.hidden).toBe(true);
    expect(getTabDefinition("journal")?.href).toBeNull();
    expect(isVisibleTab("index")).toBe(false);
    expect(isVisibleTab("journal")).toBe(false);
  });

  it("marks the center add tab as the create action", () => {
    const add = getTabDefinition("add");
    expect(add?.isCenterAction).toBe(true);
    expect(add?.href).toBe("/(tabs)/add");
  });

  it("uses compass, newspaper, bookmark, and person icons for primary tabs", () => {
    const visible = getVisibleTabs();
    expect(visible.find((t) => t.name === "discover")?.icon.focused).toBe("compass");
    expect(visible.find((t) => t.name === "feed")?.icon.focused).toBe("newspaper");
    expect(visible.find((t) => t.name === "bites")?.icon.focused).toBe("bookmark");
    expect(visible.find((t) => t.name === "profile")?.icon.focused).toBe("person");
  });
});
