import type { User } from "@/lib/types";

export function routeAfterAuth(user: User | undefined): "/(tabs)" | "/taste-quiz" {
  return user && !user.hasCompletedTasteQuiz ? "/taste-quiz" : "/(tabs)";
}
