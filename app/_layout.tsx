import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useThemeStore, themeColors } from "@/store/useThemeStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const resolved = useThemeStore((s) => s.resolved);
  const colors = themeColors[resolved];

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={colors.statusBar} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            headerTintColor: resolved === "dark" ? "#F5F0EB" : "#4A2819",
            headerStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="restaurant/[id]" options={{ headerShown: true, title: "Restaurant" }} />
          <Stack.Screen name="dish/[id]" options={{ headerShown: true, title: "Dish" }} />
          <Stack.Screen name="user/[id]" options={{ headerShown: true, title: "Profile" }} />
          <Stack.Screen name="add-review" options={{ headerShown: true, title: "Add Review", presentation: "modal" }} />
          <Stack.Screen name="add-dish" options={{ headerShown: true, title: "Add Dish", presentation: "modal" }} />
          <Stack.Screen name="lists" options={{ headerShown: true, title: "My Lists" }} />
          <Stack.Screen name="friends" options={{ headerShown: true, title: "Friends" }} />
          <Stack.Screen name="taste-dna" options={{ headerShown: true, title: "Taste DNA" }} />
          <Stack.Screen name="journal" options={{ headerShown: true, title: "Food Journal" }} />
          <Stack.Screen name="wrapped" options={{ headerShown: true, title: "Food Wrapped" }} />
          <Stack.Screen name="settings" options={{ headerShown: true, title: "Settings" }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: true, title: "Edit Profile" }} />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
