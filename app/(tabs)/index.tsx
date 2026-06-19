import { useMemo, useCallback, useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { getRecommendations } from "@/lib/recommendations";
import { calculateTasteDNA } from "@/lib/taste-dna";
import { getTrendingRestaurants, getMostSavedThisWeek, getHighestRatedThisWeek } from "@/lib/trending";
import { loadTastePreferences } from "@/lib/taste-preferences";
import { ForYouCarousel } from "@/components/recommendations/ForYouCarousel";
import { TasteProfileSection } from "@/components/home/TasteProfileSection";
import { TrendingNearYouSection } from "@/components/home/TrendingNearYouSection";
import { WantToTrySection } from "@/components/home/WantToTrySection";
import { GettingStartedCard } from "@/components/home/GettingStartedCard";
import { FoodJournalSection, MonthlyRecapCard } from "@/components/home/FoodJournalSection";
import { getMonthStats } from "@/lib/journal-stats";
import { useReviews } from "@/hooks/useReviews";
import { useTasteDna } from "@/hooks/useTasteDna";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewCardSkeleton } from "@/components/ui/Skeleton";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { Card } from "@/components/ui/Card";
import { FadeInView } from "@/components/ui/FadeInView";
import { Button } from "@/components/ui/Button";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";
import { cn } from "@/lib/utils";
import type { Bookmark } from "@/lib/types";

export default function HomeScreen() {
  const colors = useThemedColors();
  const currentUserId = useAppStore((s) => s.currentUserId);
  const user = useAppStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const follows = useAppStore((s) => s.follows);
  const reviews = useAppStore((s) => s.reviews);
  const restaurants = useAppStore((s) => s.restaurants);
  const dishes = useAppStore((s) => s.dishes);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notifications = useAppStore((s) => s.notifications);

  const [prefs, setPrefs] = useState<Awaited<ReturnType<typeof loadTastePreferences>>>(null);

  useEffect(() => {
    if (!currentUserId) return;
    loadTastePreferences(currentUserId).then(setPrefs);
  }, [currentUserId]);

  const unread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const { activityFeed, myReviewCount, isLoading: reviewsLoading, isRefreshing, refresh } = useReviews();
  const { dna: coreDna, isLoading: dnaLoading } = useTasteDna();
  const { saved, isLoading: savedLoading } = useSavedRestaurants();
  const followingCount = useMemo(
    () => follows.filter((f) => f.followerId === currentUserId).length,
    [follows, currentUserId],
  );

  const dna = useMemo(
    () => (currentUserId ? calculateTasteDNA(currentUserId, reviews, dishes, restaurants) : null),
    [currentUserId, reviews, dishes, restaurants],
  );

  const recs = useMemo(
    () =>
      currentUserId
        ? getRecommendations(currentUserId, reviews, restaurants, follows, 6, user, bookmarks, prefs)
        : [],
    [currentUserId, reviews, restaurants, follows, user, bookmarks, prefs],
  );

  const myBookmarks = saved;

  const mostReviewed = useMemo(
    () => getTrendingRestaurants(user?.city, reviews, restaurants, 5),
    [user?.city, reviews, restaurants],
  );
  const mostSaved = useMemo(
    () => getMostSavedThisWeek(bookmarks, restaurants, 5),
    [bookmarks, restaurants],
  );
  const highestRated = useMemo(
    () => getHighestRatedThisWeek(user?.city, reviews, restaurants, 5),
    [user?.city, reviews, restaurants],
  );

  const monthStats = useMemo(
    () => (currentUserId ? getMonthStats(currentUserId, reviews, restaurants, dishes) : null),
    [currentUserId, reviews, restaurants, dishes],
  );

  const onRefresh = useCallback(() => refresh(), [refresh]);
  const isLoading = reviewsLoading || dnaLoading || savedLoading;

  const openBookmark = useCallback(
    async (bookmark: Bookmark) => {
      if (bookmark.restaurantId) {
        router.push(`/restaurant/${bookmark.restaurantId}`);
        return;
      }
      if (bookmark.googlePlaceId) {
        const existing = restaurants.find((r) => r.googlePlaceId === bookmark.googlePlaceId);
        if (existing) {
          router.push(`/restaurant/${existing.id}`);
          return;
        }
      }
      router.push("/bookmarks");
    },
    [restaurants],
  );

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-28 gap-8 pt-2"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.spinner} />
        }
      >
        {isLoading && myReviewCount === 0 && (
          <View className="px-4 gap-4">
            <ReviewCardSkeleton />
            <ReviewCardSkeleton />
          </View>
        )}

        {!isLoading && (
        <>
        <View className="px-4 flex-row justify-between items-start">
          <View className="flex-1 pr-3">
            <Text className={`text-sm ${ui.text.muted}`}>Your food companion</Text>
            <Text className={`text-3xl font-bold mt-0.5 ${ui.text.primary}`}>{user?.displayName ?? "Foodie"}</Text>
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

        <GettingStartedCard
          displayName={user?.displayName ?? "Foodie"}
          hasTasteQuiz={user?.hasCompletedTasteQuiz ?? false}
          reviewCount={myReviewCount}
          followingCount={followingCount}
        />

        {myReviewCount === 0 && (
          <View className="px-4">
            <Card className={cn("gap-3 p-5", ui.accentCard)}>
              <Text className={`font-semibold text-lg ${ui.text.primary}`}>Start your taste map</Text>
              <Text className={`text-sm leading-6 ${ui.text.secondary}`}>
                Rate your first restaurant to unlock your taste profile, personalized picks, and food journal.
              </Text>
              <Button label="Write Your First Review" onPress={() => router.push("/add-review")} />
            </Card>
          </View>
        )}

        {monthStats && myReviewCount > 0 && (
          <>
            <FoodJournalSection stats={monthStats} />
            <MonthlyRecapCard stats={monthStats} />
          </>
        )}

        {dna && (myReviewCount > 0 || (user?.favoriteCuisines.length ?? 0) > 0) && (
          <TasteProfileSection
            dna={dna}
            quizCuisines={user?.favoriteCuisines ?? []}
            reviewCount={myReviewCount}
            tasteLabel={coreDna?.taste_label}
          />
        )}

        {recs.length > 0 && (
          <FadeInView delay={100}>
            <ForYouCarousel recommendations={recs} />
          </FadeInView>
        )}

        <TrendingNearYouSection
          mostReviewed={mostReviewed}
          mostSaved={mostSaved}
          highestRated={highestRated}
        />

        <WantToTrySection bookmarks={myBookmarks} onOpen={openBookmark} />

        <View className="px-4 gap-3">
          <Button label="Open Food Journal" variant="secondary" onPress={() => router.push("/journal")} />
          <Button label="View Rankings" variant="ghost" onPress={() => router.push("/(tabs)/rankings")} />
        </View>

        {activityFeed.length > 0 && (
          <View className="gap-3 px-4">
            <HomeSectionHeader title="Activity Feed" subtitle="From you and people you follow" icon="people" />
            {activityFeed.slice(0, 5).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </View>
        )}
        </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
