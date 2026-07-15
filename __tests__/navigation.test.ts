import { routeAfterAuth, resolveEntryRoute, userProfileFallback } from "@/lib/navigation";
import { AUTHENTICATED_HOME } from "@/lib/tabs";
import type { User } from "@/lib/types";

const baseUser: User = {
  id: "user-1",
  email: "alex@example.com",
  username: "alextastes",
  displayName: "Alex",
  avatarUrl: null,
  city: "Los Angeles",
  bio: "",
  favoriteCuisines: ["Mexican"],
  hasCompletedTasteQuiz: true,
  createdAt: "2024-01-01T00:00:00Z",
};

describe("authentication redirects", () => {
  it("sends completed users to Discover", () => {
    expect(routeAfterAuth(baseUser)).toBe(AUTHENTICATED_HOME);
    expect(routeAfterAuth(baseUser)).toBe("/(tabs)/discover");
  });

  it("sends incomplete quiz users to the taste quiz", () => {
    expect(routeAfterAuth({ ...baseUser, hasCompletedTasteQuiz: false })).toBe("/taste-quiz");
  });

  it("resolves cold-start entry routes without breaking auth", () => {
    expect(resolveEntryRoute(false, false, false)).toBe("/onboarding");
    expect(resolveEntryRoute(true, false, false)).toBe("/login");
    expect(resolveEntryRoute(true, true, false)).toBe("/taste-quiz");
    expect(resolveEntryRoute(true, true, true)).toBe("/(tabs)/discover");
  });

  it("keeps profile fallbacks intact for friends and settings flows", () => {
    expect(userProfileFallback("friends")).toBe("/friends");
    expect(userProfileFallback()).toBe("/(tabs)/profile");
  });
});
