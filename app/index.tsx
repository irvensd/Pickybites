import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAppStore } from "@/store/useAppStore";

export default function Index() {
  const { hasSeenOnboarding, isAuthenticated, isInitializing, currentUserId, users } = useAppStore();
  const user = users.find((u) => u.id === currentUserId);

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-savr-50 dark:bg-savr-950">
        <ActivityIndicator size="large" color="#A85D3F" />
      </View>
    );
  }

  if (!hasSeenOnboarding) return <Redirect href="/onboarding" />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user && !user.hasCompletedTasteQuiz) return <Redirect href="/taste-quiz" />;
  return <Redirect href="/(tabs)" />;
}
