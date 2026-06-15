import { View, Text, ScrollView, Alert, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { useThemeStore, type ThemeMode } from "@/store/useThemeStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { hapticSelection } from "@/lib/haptics";

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: "light", label: "Light", icon: "sunny-outline" },
  { mode: "dark", label: "Dark", icon: "moon-outline" },
  { mode: "system", label: "System", icon: "phone-portrait-outline" },
];

export default function SettingsScreen() {
  const logout = useAppStore((s) => s.logout);
  const user = useAppStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const { mode, setMode } = useThemeStore();

  const handleLogout = () => {
    Alert.alert("Log out?", "You'll need to sign in again.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => { logout(); router.replace("/login"); } },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="px-4 pb-6 gap-4">
      <Card className="gap-2">
        <Text className="font-semibold text-savr-900 dark:text-savr-100">Account</Text>
        <Text className="text-sm text-savr-600 dark:text-savr-300">{user?.email}</Text>
        <Text className="text-xs text-savr-400 dark:text-savr-500">Avatar upload available when Supabase Storage is configured.</Text>
      </Card>

      <Card className="gap-3">
        <Text className="font-semibold text-savr-900 dark:text-savr-100">Appearance</Text>
        <View className="flex-row gap-2">
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.mode}
              onPress={() => { hapticSelection(); setMode(opt.mode); }}
              className={`flex-1 items-center py-3 rounded-xl border ${
                mode === opt.mode
                  ? "bg-savr-100 dark:bg-savr-700 border-savr-600"
                  : "bg-savr-50 dark:bg-savr-900 border-savr-200 dark:border-savr-700"
              }`}
            >
              <Ionicons name={opt.icon} size={22} color={mode === opt.mode ? "#A85D3F" : "#B8956F"} />
              <Text className={`text-xs font-medium mt-1 ${mode === opt.mode ? "text-savr-800 dark:text-savr-100" : "text-savr-500"}`}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Button label="Edit Profile" variant="secondary" onPress={() => router.push("/edit-profile")} />
      <Button label="Log Out" variant="danger" onPress={handleLogout} />
    </ScrollView>
  );
}
