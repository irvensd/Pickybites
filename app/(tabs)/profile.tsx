import { useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScrollToTop } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { calculateTasteDNA } from "@/lib/taste-dna";
import { averageOverallRating } from "@/lib/review-scores";
import { calculateFoodWrappedSummary, getDefaultWrappedPeriod } from "@/lib/food-wrapped";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { FriendsTab } from "@/components/profile/FriendsTab";
import { useThemeStore } from "@/store/useThemeStore";
import { iconColors, ui } from "@/constants/ui";
import { brandColors } from "@/constants/branding";
import { cn } from "@/lib/utils";

const menu = [
  { href: "/taste-dna" as const, icon: "color-wand" as const, label: "Taste DNA", desc: "Your flavor profile" },
  { href: "/rankings" as const, icon: "trophy" as const, label: "Rankings", desc: "Your top spots & dishes" },
  { href: "/journal" as const, icon: "book" as const, label: "Food Journal", desc: "Timeline of visits" },
  { href: "/lists" as const, icon: "list" as const, label: "Lists", desc: "Curated restaurant lists" },
  { href: "/wrapped" as const, icon: "gift" as const, label: "Food Wrapped", desc: "Swipeable year, month & all-time recap" },
  { href: "/settings" as const, icon: "settings" as const, label: "Settings", desc: "Account & preferences" },
];

export default function ProfileScreen() {
  const isDark = useThemeStore((s) => s.resolved) === "dark";
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const { currentUserId, users, reviews, dishes, restaurants } = useAppStore();
  const [section, setSection] = useState<"me" | "friends">("me");
  const user = users.find((u) => u.id === currentUserId);
  const userReviews = reviews.filter((r) => r.userId === currentUserId);
  const dna = currentUserId ? calculateTasteDNA(currentUserId, reviews, dishes, restaurants) : null;
  const wrappedPreview = useMemo(() => {
    if (!currentUserId || userReviews.length === 0) return null;
    return calculateFoodWrappedSummary(
      currentUserId,
      getDefaultWrappedPeriod(),
      reviews,
      dishes,
      restaurants,
    );
  }, [currentUserId, userReviews.length, reviews, dishes, restaurants]);
  const avgRating = userReviews.length
    ? averageOverallRating(userReviews).toFixed(1)
    : "—";

  if (!user) return null;

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
      <ScrollView
        ref={scrollRef}
        contentContainerClassName="pb-28 gap-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-2 gap-3">
          <Text className={`text-sm ${ui.text.muted}`}>Who am I as a food user?</Text>
          <Text className={`text-2xl font-bold ${ui.text.primary}`}>Profile</Text>
          <SegmentedControl
            options={[
              { value: "me" as const, label: "You" },
              { value: "friends" as const, label: "Friends" },
            ]}
            value={section}
            onChange={setSection}
          />
        </View>

        {section === "friends" ? (
          <View className="px-4">
            <FriendsTab />
          </View>
        ) : (
          <>
            <View className={cn("mx-4 rounded-3xl overflow-hidden", ui.accentCard)}>
              <View className="items-center px-6 py-8 gap-3">
                <Avatar name={user.displayName} src={user.avatarUrl} size="xl" />
                <Text className={`text-2xl font-bold ${ui.text.primary}`}>{user.displayName}</Text>
                <Text className={`text-sm ${ui.text.muted}`}>@{user.username}</Text>
              </View>
              <View className="flex-row border-t border-savr-200/60 dark:border-savr-700/60">
                <View className="flex-1 items-center py-4">
                  <Text className={`text-xl font-bold ${ui.text.primary}`}>{userReviews.length}</Text>
                  <Text className={`text-xs ${ui.text.muted}`}>Reviews</Text>
                </View>
                <View className="w-px bg-savr-200/60 dark:bg-savr-700/60" />
                <View className="flex-1 items-center py-4">
                  <Text className={`text-xl font-bold ${ui.text.primary}`}>{avgRating}</Text>
                  <Text className={`text-xs ${ui.text.muted}`}>Avg Rating</Text>
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

            {wrappedPreview ? (
              <Pressable onPress={() => router.push("/wrapped")} className="mx-4">
                <View
                  className="rounded-3xl overflow-hidden px-5 py-5 gap-2"
                  style={{ backgroundColor: brandColors.navy }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white/70 text-xs font-bold uppercase tracking-widest">Food Wrapped</Text>
                    <Ionicons name="gift" size={20} color="#F5D0A8" />
                  </View>
                  <Text className="text-white text-2xl font-black">{wrappedPreview.periodLabel} recap</Text>
                  <Text className="text-white/85 text-sm">
                    {wrappedPreview.restaurantsVisited} restaurants · {wrappedPreview.cuisinesTried} cuisines ·{" "}
                    {wrappedPreview.tasteDnaLabel}
                  </Text>
                  <Text className="text-[#F5D0A8] text-sm font-semibold mt-1">Tap to open your story →</Text>
                </View>
              </Pressable>
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
