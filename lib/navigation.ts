import { router, type Href } from "expo-router";
import type { User } from "@/lib/types";
import { AUTHENTICATED_HOME } from "@/lib/tabs";

type BackNavigation = {
  canGoBack: () => boolean;
  goBack: () => void;
};

type AuthRoute = "/taste-quiz" | typeof AUTHENTICATED_HOME;

export type EntryRoute = "/onboarding" | "/login" | "/taste-quiz" | typeof AUTHENTICATED_HOME;

export function routeAfterAuth(user: User | null | undefined): AuthRoute {
  if (user && !user.hasCompletedTasteQuiz) return "/taste-quiz";
  return AUTHENTICATED_HOME;
}

/** Cold-start / index redirect after onboarding + auth state is known. */
export function resolveEntryRoute(
  hasSeenOnboarding: boolean,
  isAuthenticated: boolean,
  hasCompletedTasteQuiz: boolean,
): EntryRoute {
  if (!hasSeenOnboarding) return "/onboarding";
  if (!isAuthenticated) return "/login";
  if (!hasCompletedTasteQuiz) return "/taste-quiz";
  return AUTHENTICATED_HOME;
}

/** Pop the stack, or navigate to a sensible fallback when there is no history. */
export function goBackOr(
  fallback: Href = "/(tabs)/profile",
  navigation?: BackNavigation,
) {
  if (navigation?.canGoBack()) {
    navigation.goBack();
    return;
  }
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}

export function userProfileHref(userId: string, from?: string) {
  return from
    ? ({ pathname: "/user/[id]", params: { id: userId, from } } as const)
    : ({ pathname: "/user/[id]", params: { id: userId } } as const);
}

export function userProfileFallback(from?: string): Href {
  if (from === "friends") return "/friends";
  return "/(tabs)/profile";
}
