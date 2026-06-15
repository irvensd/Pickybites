import { Redirect } from "expo-router";
import { useAppStore } from "@/store/useAppStore";

export default function Index() {
  const { hasSeenOnboarding, isAuthenticated } = useAppStore();
  if (!hasSeenOnboarding) return <Redirect href="/onboarding" />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  return <Redirect href="/(tabs)" />;
}
