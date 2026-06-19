import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { calculateTasteDNA } from "@/lib/taste-dna";
import { calculateTasteLevel } from "@/lib/taste-level";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { useThemeStore } from "@/store/useThemeStore";
import { iconColors, ui } from "@/constants/ui";
import { cn } from "@/lib/utils";

const menu = [
  { href: "/journal" as const, icon: "book" as const, label: "Food Journal", desc: "Timeline of visits" },
  { href: "/(tabs)/rankings" as const, icon: "trophy" as const, label: "Rankings", desc: "Your top spots & dishes" },
  { href: "/taste-dna" as const, icon: "color-wand" as const, label: "Taste DNA", desc: "Your flavor profile" },
  { href: "/bookmarks" as const, icon: "bookmark" as const, label: "Want to Try", desc: "Saved spots to visit" },
  { href: "/lists" as const, icon: "list" as const, label: "My Lists", desc: "Curated restaurant lists" },
  { href: "/friends" as const, icon: "people" as const, label: "Friends", desc: "Follow & taste match" },
  { href: "/wrapped" as const, icon: "gift" as const, label: "Food Wrapped", desc: "Your year in food" },
  { href: "/settings" as const, icon: "settings" as const, label: "Settings", desc: "Account & preferences" },
];

export default function ProfileScreen() {
  const isDark = useThemeStore((s) => s.resolved) === "dark";
  const { currentUserId, users, reviews, dishes, restaurants } = useAppStore();
  const user = users.find((u) => u.id === currentUserId);
  const userReviews = reviews.filter((r) => r.userId === currentUserId);
  const dna = currentUserId ? calculateTasteDNA(currentUserId, reviews, dishes, restaurants) : null;
  const restaurantCount = new Set(userReviews.map((r) => r.restaurantId)).size;
  const tasteLevel = calculateTasteLevel(userReviews.length, restaurantCount, dna?.favoriteCuisines.length ?? 0);

  if (!user) return null;

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
      <ScrollView contentContainerClassName="pb-28 gap-5" showsVerticalScrollIndicator={false}>
        <View className={cn("mx-4 mt-2 rounded-3xl overflow-hidden", ui.accentCard)}>
          <View className="items-center px-6 py-8 gap-3">
            <Avatar name={user.displayName} src={user.avatarUrl} size="xl" />
            <Text className={`text-2xl font-bold ${ui.text.primary}`}>{user.displayName}</Text>
            <Text className={`text-sm ${ui.text.muted}`}>@{user.username}</Text>
            <View className="items-center mt-2">
              <Text className="text-xs uppercase tracking-widest text-savr-600 dark:text-savr-400 font-semibold">
                Taste Level
              </Text>
              <Text className="text-5xl font-black text-savr-700 dark:text-savr-200 mt-1">{tasteLevel}</Text>
            </View>
          </View>
          <View className="flex-row border-t border-savr-200/60 dark:border-savr-700/60">
            <View className="flex-1 items-center py-4">
              <Text className={`text-xl font-bold ${ui.text.primary}`}>{userReviews.length}</Text>
              <Text className={`text-xs ${ui.text.muted}`}>Reviews</Text>
            </View>
            <View className="w-px bg-savr-200/60 dark:bg-savr-700/60" />
            <View className="flex-1 items-center py-4">
              <Text className={`text-xl font-bold ${ui.text.primary}`}>{restaurantCount}</Text>
              <Text className={`text-xs ${ui.text.muted}`}>Restaurants</Text>
            </View>
            <View className="w-px bg-savr-200/60 dark:bg-savr-700/60" />
            <View className="flex-1 items-center py-4">
              <Text className={`text-xl font-bold ${ui.text.primary}`}>{dna?.favoriteCuisines.length ?? 0}</Text>
              <Text className={`text-xs ${ui.text.muted}`}>Cuisines</Text>
            </View>
          </View>
        </View>

        {user.bio ? (
          <Text className={`text-sm text-center px-6 ${ui.text.secondary}`}>{user.bio}</Text>
        ) : null}

        <View className="px-4 gap-3">
          {menu.map((m) => (
            <Pressable key={m.href} onPress={() => router.push(m.href)}>
              <Card className="flex-row items-center gap-4 py-4">
                <View className={`w-11 h-11 rounded-2xl items-center justify-center ${ui.surface.muted}`}>
                  <Ionicons name={m.icon} size={22} color={isDark ? iconColors.brandDark : iconColors.brand} />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold text-base ${ui.text.primary}`}>{m.label}</Text>
                  <Text className={`text-xs mt-0.5 ${ui.text.muted}`}>{m.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={isDark ? iconColors.mutedDark : iconColors.muted} />
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
