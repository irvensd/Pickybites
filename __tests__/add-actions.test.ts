import { ADD_ACTIONS } from "@/lib/add-actions";

describe("center plus / add workflows", () => {
  it("opens the existing review, dish, and save-to-bites workflows", () => {
    expect(ADD_ACTIONS.map((a) => a.title)).toEqual([
      "Restaurant Review",
      "Quick Dish Log",
      "Save To Bites",
    ]);
    expect(ADD_ACTIONS.map((a) => a.href)).toEqual([
      "/add-review",
      "/add-dish",
      "/(tabs)/discover",
    ]);
  });

  it("does not invent new review routes", () => {
    expect(ADD_ACTIONS.every((a) => typeof a.href === "string")).toBe(true);
    expect(ADD_ACTIONS.some((a) => a.href === "/add-review")).toBe(true);
  });
});
