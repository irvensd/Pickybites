import { useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { getRecommendations } from "@/lib/recommendations";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ForYouCarousel } from "@/components/recommendations/ForYouCarousel";
import { EmptyState } from "@/components/ui/EmptyState";

export default function HomeScreen() {
  const { currentUserId, users, reviews, restaurants, follows, refreshFeed, isRefreshing } = useAppStore();
  const user = users.find((u) => u.id === currentUserId);
  const followingIds = follows.filter((f) => f.followerId === currentUserId).map((f) => f.followingId);
  const feed = reviews
    .filter((r) => followingIds.includes(r.userId) || r.userId === currentUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recs = currentUserId ? getRecommendations(currentUserId, reviews, restaurants, follows, 6) : [];

  const onRefresh = useCallback(() => refreshFeed(), [refreshFeed]);

  return (
    <SafeAreaView className="flex-1 bg-savr-50 dark:bg-savr-950" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-2 pb-28 gap-5"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#A85D3F" />}
      >
        <View className="px-4">
          <Text className="text-sm text-savr-500 dark:text-savr-400">Good to see you</Text>
          <Text className="text-3xl font-bold text-savr-900 dark:text-savr-100 mt-0.5">{user?.displayName ?? "Foodie"}</Text>
        </View>

        {recs.length > 0 && <ForYouCarousel recommendations={recs} />}

        <View className="gap-3 px-4">
          <Text className="text-lg font-semibold text-savr-900 dark:text-savr-100">Activity Feed</Text>
          {feed.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="Your feed is quiet"
              description="Follow friends to see their latest restaurant reviews and discoveries."
              actionLabel="Find Friends"
              onAction={() => router.push("/friends")}
            />
          ) : (
            feed.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
