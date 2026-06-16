import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Logo } from "@/components/ui/Logo";
import { useThemeStore, themeColors } from "@/store/useThemeStore";
import { useAppStore } from "@/store/useAppStore";
import { initMonitoring } from "@/lib/monitoring";
import { APP_NAME } from "@/constants/branding";

initMonitoring();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const resolved = useThemeStore((s) => s.resolved);
  const colors = themeColors[resolved];
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const initialize = useAppStore((s) => s.initialize);
  const isInitializing = useAppStore((s) => s.isInitializing);

  useEffect(() => {
    void hydrateTheme();
    initialize().finally(() => SplashScreen.hideAsync());
  }, [hydrateTheme, initialize]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, gap: 16 }}>
        <Logo size="lg" />
        <ActivityIndicator size="large" color="#A85D3F" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={colors.statusBar} />
        <Stack
          screenOptions={{
            headerShown: false,
            headerBackButtonDisplayMode: "minimal",
            contentStyle: { backgroundColor: colors.background },
            headerTintColor: resolved === "dark" ? "#F5F0EB" : "#4A2819",
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: {
              color: resolved === "dark" ? "#FAFAF8" : "#4A2819",
              fontWeight: "600",
            },
            headerShadowVisible: resolved !== "dark",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" options={{ headerShown: true, title: "Forgot Password" }} />
          <Stack.Screen name="reset-password" options={{ headerShown: true, title: "Reset Password" }} />
          <Stack.Screen name="taste-quiz" options={{ headerShown: true, title: "Taste Quiz", gestureEnabled: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: true, title: "Notifications" }} />
          <Stack.Screen name="bookmarks" options={{ headerShown: true, title: "Want to Try" }} />
          <Stack.Screen name="(tabs)" options={{ title: APP_NAME }} />
          <Stack.Screen name="restaurant/[id]" options={{ headerShown: true, title: "Restaurant" }} />
          <Stack.Screen name="dish/[id]" options={{ headerShown: true, title: "Dish" }} />
          <Stack.Screen name="user/[id]" options={{ headerShown: true, title: "Profile" }} />
          <Stack.Screen name="compare/[id]" options={{ headerShown: true, title: "Compare Rankings" }} />
          <Stack.Screen name="add-review" options={{ headerShown: true, title: "Add Review", presentation: "modal" }} />
          <Stack.Screen name="add-dish" options={{ headerShown: true, title: "Add Dish", presentation: "modal" }} />
          <Stack.Screen name="lists" options={{ headerShown: true, title: "My Lists" }} />
          <Stack.Screen name="create-list" options={{ headerShown: true, title: "New List", presentation: "modal" }} />
          <Stack.Screen name="list/[id]" options={{ headerShown: true, title: "List" }} />
          <Stack.Screen name="friends" options={{ headerShown: true, title: "Friends" }} />
          <Stack.Screen name="taste-dna" options={{ headerShown: true, title: "Taste DNA" }} />
          <Stack.Screen name="journal" options={{ headerShown: true, title: "Food Journal" }} />
          <Stack.Screen name="wrapped" options={{ headerShown: true, title: "Food Wrapped" }} />
          <Stack.Screen name="settings" options={{ headerShown: true, title: "Settings" }} />
          <Stack.Screen name="privacy" options={{ headerShown: true, title: "Privacy Policy" }} />
          <Stack.Screen name="terms" options={{ headerShown: true, title: "Terms of Service" }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: true, title: "Edit Profile" }} />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
