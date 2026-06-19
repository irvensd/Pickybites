import { useState, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { getRestaurantRankings, getDishRankings } from "@/lib/rankings";
import { CUISINES, REVIEW_TAGS, type RankingFilters } from "@/lib/types";
import { Tag } from "@/components/ui/Tag";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { RankingCard, DishRankingCard } from "@/components/rankings/RankingCard";
import { ui } from "@/constants/ui";
import { useThemedColors } from "@/lib/useThemedColors";

export default function RankingsScreen() {
  const colors = useThemedColors();
  const { currentUserId, reviews, dishes, restaurants } = useAppStore();
  const [tab, setTab] = useState<"restaurants" | "dishes">("restaurants");
  const [filters, setFilters] = useState<RankingFilters>({});

  const userReviews = useMemo(
    () => (currentUserId ? reviews.filter((r) => r.userId === currentUserId) : []),
    [currentUserId, reviews],
  );

  const restRank = currentUserId ? getRestaurantRankings(currentUserId, reviews, restaurants, filters, 10) : [];
  const dishRank = currentUserId ? getDishRankings(currentUserId, reviews, dishes, restaurants, filters, 10) : [];

  const cities = useMemo(
    () =>
      Array.from(
        new Set(
          userReviews.map((r) => restaurants.find((x) => x.id === r.restaurantId)?.city).filter(Boolean),
        ),
      ) as string[],
    [userReviews, restaurants],
  );

  const activeList = tab === "restaurants" ? restRank : dishRank;

  const setFilter = (patch: Partial<RankingFilters>) => {
    setFilters((f) => {
      const next = { ...f, ...patch };
      if (patch.city !== undefined && f.city === patch.city) delete next.city;
      if (patch.cuisine !== undefined && f.cuisine === patch.cuisine) delete next.cuisine;
      if (patch.tag !== undefined && f.tag === patch.tag) delete next.tag;
      return next;
    });
  };

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
      <ScrollView contentContainerClassName="px-4 pb-28 gap-5" showsVerticalScrollIndicator={false}>
        <View className="pt-2 gap-1">
          <View className="flex-row items-center gap-2">
            <Ionicons name="trophy" size={26} color={colors.brand} />
            <Text className={`text-3xl font-bold ${ui.text.primary}`}>My Rankings</Text>
          </View>
          <Text className={`text-sm ${ui.text.muted}`}>Your personal hall of fame</Text>
        </View>

        <SegmentedControl
          options={[
            { value: "restaurants", label: "Top Restaurants" },
            { value: "dishes", label: "Top Dishes" },
          ]}
          value={tab}
          onChange={setTab}
        />

        <View className="flex-row flex-wrap gap-2">
          <Tag label="All" active={!filters.city && !filters.cuisine && !filters.tag} onPress={() => setFilters({})} />
          {cities.map((c) => (
            <Tag key={c} label={c} active={filters.city === c} onPress={() => setFilter({ city: c })} size="sm" />
          ))}
        </View>

        <View className="flex-row flex-wrap gap-2">
          {CUISINES.slice(0, 8).map((c) => (
            <Tag key={c} label={c} active={filters.cuisine === c} onPress={() => setFilter({ cuisine: c })} size="sm" />
          ))}
        </View>

        {tab === "restaurants" && (
          <View className="flex-row flex-wrap gap-2">
            {REVIEW_TAGS.slice(0, 8).map((t) => (
              <Tag key={t} label={t} active={filters.tag === t} onPress={() => setFilter({ tag: t })} size="sm" />
            ))}
          </View>
        )}

        {activeList.length === 0 ? (
          <EmptyState
            icon="trophy-outline"
            title={tab === "dishes" ? "No dish rankings yet" : "No rankings yet"}
            description={
              tab === "dishes"
                ? "Log your favorite dish when you write reviews — your top plates will rank here."
                : "Rate restaurants to build your personal top 10."
            }
            actionLabel="Write a Review"
            onAction={() => router.push("/add-review")}
          />
        ) : tab === "restaurants" ? (
          <View className="gap-4">
            {restRank.map((item, i) => (
              <RankingCard
                key={item.review.id}
                rank={i + 1}
                restaurant={item.restaurant}
                rating={item.rating}
                visitDate={item.review.visitDate}
                onPress={() => router.push(`/restaurant/${item.restaurant.id}`)}
              />
            ))}
          </View>
        ) : (
          <View className="gap-4">
            {dishRank.map((item, i) => (
              <DishRankingCard
                key={item.dish.id}
                rank={i + 1}
                dishName={item.dish.name}
                restaurantName={item.restaurant.name}
                rating={item.rating}
                isBestDish={item.dish.isBestDish}
                onPress={() => router.push(`/dish/${item.dish.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
