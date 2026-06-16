import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { calculateTasteDNA } from "@/lib/taste-dna";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { useThemeStore } from "@/store/useThemeStore";
import { iconColors, ui } from "@/constants/ui";

const menu = [
  { href: "/taste-dna" as const, icon: "color-wand" as const, label: "Taste DNA", desc: "Your flavor profile" },
  { href: "/bookmarks" as const, icon: "bookmark" as const, label: "Want to Try", desc: "Saved spots to visit" },
  { href: "/lists" as const, icon: "list" as const, label: "My Lists", desc: "Curated restaurant lists" },
  { href: "/friends" as const, icon: "people" as const, label: "Friends", desc: "Follow & taste match" },
  { href: "/journal" as const, icon: "book" as const, label: "Food Journal", desc: "Timeline of visits" },
  { href: "/wrapped" as const, icon: "gift" as const, label: "Food Wrapped", desc: "Your year in food" },
  { href: "/settings" as const, icon: "settings" as const, label: "Settings", desc: "Account & preferences" },
];

export default function ProfileScreen() {
  const isDark = useThemeStore((s) => s.resolved) === "dark";
  const { currentUserId, users, reviews, dishes, restaurants } = useAppStore();
  const user = users.find((u) => u.id === currentUserId);
  const userReviews = reviews.filter((r) => r.userId === currentUserId);
  const dna = currentUserId ? calculateTasteDNA(currentUserId, reviews, dishes, restaurants) : null;

  if (!user) return null;
  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
      <ScrollView contentContainerClassName="px-4 pb-28 gap-4">
        <View className="items-center pt-4">
          <Avatar name={user.displayName} src={user.avatarUrl} size="xl" />
          <Text className={`text-2xl font-bold mt-3 ${ui.text.primary}`}>{user.displayName}</Text>
          <Text className={`text-sm ${ui.text.muted}`}>@{user.username}</Text>
          {user.bio ? <Text className={`text-sm mt-2 text-center ${ui.text.secondary}`}>{user.bio}</Text> : null}
          <Text className={`text-xs mt-1 ${ui.text.faint}`}>{user.city}</Text>
        </View>
        <View className="flex-row gap-3">
          <Card className="flex-1 items-center py-3">
            <Text className={`text-2xl font-bold ${ui.text.primary}`}>{userReviews.length}</Text>
            <Text className={`text-xs ${ui.text.muted}`}>Reviews</Text>
          </Card>
          <Card className="flex-1 items-center py-3">
            <Text className={`text-2xl font-bold ${ui.text.primary}`}>{dna?.averageRating.toFixed(1) ?? "—"}</Text>
            <Text className={`text-xs ${ui.text.muted}`}>Avg Rating</Text>
          </Card>
          <Card className="flex-1 items-center py-3">
            <Text className={`text-2xl font-bold ${ui.text.primary}`}>{dna?.favoriteCuisines.length ?? 0}</Text>
            <Text className={`text-xs ${ui.text.muted}`}>Cuisines</Text>
          </Card>
        </View>
        {menu.map((m) => (
          <Pressable key={m.href} onPress={() => router.push(m.href)}>
            <Card className="flex-row items-center gap-4">
              <View className={`w-10 h-10 rounded-xl items-center justify-center ${ui.surface.muted}`}>
                <Ionicons name={m.icon} size={20} color={isDark ? iconColors.brandDark : iconColors.brand} />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${ui.text.primary}`}>{m.label}</Text>
                <Text className={`text-xs ${ui.text.muted}`}>{m.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? iconColors.mutedDark : iconColors.muted} />
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
