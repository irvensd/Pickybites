import { useCallback, useRef } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useScrollToTop } from "@react-navigation/native";
import { useAppStore } from "@/store/useAppStore";
import { useReviews } from "@/hooks/useReviews";
import { GettingStartedCard } from "@/components/home/GettingStartedCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";

export default function FeedScreen() {
  const colors = useThemedColors();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const currentUserId = useAppStore((s) => s.currentUserId);
  const user = useAppStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const follows = useAppStore((s) => s.follows);
  const { activityFeed, myReviewCount, isLoading, isRefreshing, refresh } = useReviews();

  const followingCount = follows.filter((f) => f.followerId === currentUserId).length;
  const onRefresh = useCallback(() => refresh(), [refresh]);
  const showSkeleton = isLoading && activityFeed.length === 0;

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-28 gap-6 pt-2"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.spinner} />
        }
      >
        <View className="px-4 gap-1">
          <Text className={`text-sm ${ui.text.muted}`}>Recent activity</Text>
          <Text className={`text-3xl font-bold ${ui.text.primary}`}>Feed</Text>
        </View>

        <GettingStartedCard
          displayName={user?.displayName ?? "Foodie"}
          hasTasteQuiz={user?.hasCompletedTasteQuiz ?? false}
          reviewCount={myReviewCount}
          followingCount={followingCount}
        />

        {showSkeleton ? (
          <View className="px-4 gap-4">
            <ReviewCardSkeleton />
            <ReviewCardSkeleton />
          </View>
        ) : activityFeed.length === 0 ? (
          <EmptyState
            icon="newspaper-outline"
            title="Your feed is quiet."
            description="Reviews and food discoveries will appear here."
            actionLabel="Discover Restaurants"
            onAction={() => router.push("/(tabs)/discover")}
          />
        ) : (
          <View className="gap-3 px-4">
            {activityFeed.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
