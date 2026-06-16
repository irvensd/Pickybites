import { useMemo, useCallback } from "react";
import { View, Text, RefreshControl, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { getRecommendations } from "@/lib/recommendations";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ForYouCarousel } from "@/components/recommendations/ForYouCarousel";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReviewCardSkeleton } from "@/components/ui/Skeleton";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";

function HomeHeader({
  displayName,
  unread,
  recs,
  showFirstReviewCta,
  colors,
}: {
  displayName: string;
  unread: number;
  recs: ReturnType<typeof getRecommendations>;
  showFirstReviewCta: boolean;
  colors: ReturnType<typeof useThemedColors>;
}) {
  return (
    <View className="gap-5 pb-3">
      <View className="px-4 flex-row justify-between items-start">
        <View>
          <Text className={`text-sm ${ui.text.muted}`}>Good to see you</Text>
          <Text className={`text-3xl font-bold mt-0.5 ${ui.text.primary}`}>{displayName}</Text>
        </View>
        <Pressable onPress={() => router.push("/notifications")} className="p-2 relative">
          <Ionicons name="notifications-outline" size={26} color={colors.brand} />
          {unread > 0 && (
            <View className="absolute top-1 right-1 bg-red-500 rounded-full min-w-[16px] h-4 items-center justify-center px-1">
              <Text className="text-white text-[10px] font-bold">{unread > 9 ? "9+" : unread}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {recs.length > 0 && <ForYouCarousel recommendations={recs} />}

      {showFirstReviewCta && (
        <View className="px-4">
          <Card className={cn("gap-3", ui.accentCard)}>
            <Text className={`font-semibold ${ui.text.primary}`}>Start your taste map</Text>
            <Text className={`text-sm leading-5 ${ui.text.secondary}`}>
              Rate your first restaurant to unlock recommendations, taste matches, and your personal journal.
            </Text>
            <Button label="Write Your First Review" onPress={() => router.push("/add-review")} />
          </Card>
        </View>
      )}

      <Text className={`text-lg font-semibold px-4 ${ui.text.primary}`}>Activity Feed</Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useThemedColors();
  const currentUserId = useAppStore((s) => s.currentUserId);
  const user = useAppStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const follows = useAppStore((s) => s.follows);
  const reviews = useAppStore((s) => s.reviews);
  const restaurants = useAppStore((s) => s.restaurants);
  const notifications = useAppStore((s) => s.notifications);
  const refreshFeed = useAppStore((s) => s.refreshFeed);
  const isRefreshing = useAppStore((s) => s.isRefreshing);
  const isDataLoaded = useAppStore((s) => s.isDataLoaded);
  const useSupabase = useAppStore((s) => s.useSupabase);

  const unread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const feed = useMemo(() => {
    if (!currentUserId) return [] as Review[];
    const followingIds = new Set(
      follows.filter((f) => f.followerId === currentUserId).map((f) => f.followingId),
    );
    return reviews
      .filter((r) => followingIds.has(r.userId) || r.userId === currentUserId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, follows, currentUserId]);

  const myReviewCount = useMemo(
    () => reviews.filter((r) => r.userId === currentUserId).length,
    [reviews, currentUserId],
  );

  const recs = useMemo(
    () => (currentUserId ? getRecommendations(currentUserId, reviews, restaurants, follows, 6, user) : []),
    [currentUserId, reviews, restaurants, follows, user],
  );

  const onRefresh = useCallback(() => refreshFeed(), [refreshFeed]);

  const renderItem = useCallback(({ item }: { item: Review }) => (
    <View className="px-4 pb-4">
      <ReviewCard review={item} />
    </View>
  ), []);

  const ListHeader = useCallback(() => (
    <HomeHeader
      displayName={user?.displayName ?? "Foodie"}
      unread={unread}
      recs={recs}
      showFirstReviewCta={myReviewCount === 0}
      colors={colors}
    />
  ), [user?.displayName, unread, recs, myReviewCount, colors]);

  const ListEmpty = useCallback(() => {
    if (useSupabase && !isDataLoaded) {
      return (
        <View className="px-4 gap-4">
          <ReviewCardSkeleton />
          <ReviewCardSkeleton />
        </View>
      );
    }
    return (
      <View className="px-4">
        <EmptyState
          icon="people-outline"
          title="Your feed is quiet"
          description="Follow friends to see their latest restaurant reviews and discoveries."
          actionLabel="Find Friends"
          onAction={() => router.push("/friends")}
        />
      </View>
    );
  }, [useSupabase, isDataLoaded]);

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
      <FlashList
        data={feed}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 112 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.spinner} />
        }
      />
    </SafeAreaView>
  );
}
