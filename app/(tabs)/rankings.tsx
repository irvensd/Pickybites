import { useState, useMemo, type ReactNode } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { getRestaurantRankings, getDishRankings } from "@/lib/rankings";
import { CUISINES, REVIEW_TAGS, type RankingFilters } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { Tag } from "@/components/ui/Tag";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice, formatDate } from "@/lib/utils";
import { ui } from "@/constants/ui";
import { useThemedColors } from "@/lib/useThemedColors";

const PODIUM_COLORS = ["#D4A017", "#9CA3AF", "#CD7F32"] as const;

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <View
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: `${PODIUM_COLORS[rank - 1]}22` }}
      >
        <Text style={{ color: PODIUM_COLORS[rank - 1], fontSize: 16, fontWeight: "700" }}>{rank}</Text>
      </View>
    );
  }
  return (
    <View className="w-9 h-9 rounded-full bg-savr-100 dark:bg-savr-800 items-center justify-center">
      <Text className="font-bold text-savr-600 dark:text-savr-300">{rank}</Text>
    </View>
  );
}

function FilterRow({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap gap-2">{children}</View>;
}

export default function RankingsScreen() {
  const colors = useThemedColors();
  const { currentUserId, reviews, dishes, restaurants } = useAppStore();
  const [tab, setTab] = useState<"restaurants" | "dishes">("restaurants");
  const [filters, setFilters] = useState<RankingFilters>({});

  const userReviews = useMemo(
    () => (currentUserId ? reviews.filter((r) => r.userId === currentUserId) : []),
    [currentUserId, reviews]
  );

  const restRank = currentUserId ? getRestaurantRankings(currentUserId, reviews, restaurants, filters, 25) : [];
  const dishRank = currentUserId ? getDishRankings(currentUserId, reviews, dishes, restaurants, filters, 25) : [];

  const cities = useMemo(
    () => Array.from(new Set(userReviews.map((r) => restaurants.find((x) => x.id === r.restaurantId)?.city).filter(Boolean))) as string[],
    [userReviews, restaurants]
  );

  const avgRating = userReviews.length
    ? userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length
    : 0;

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
      <ScrollView contentContainerClassName="px-4 pb-28 gap-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-2 pt-2">
          <Ionicons name="trophy" size={24} color={colors.brand} />
          <View>
            <Text className={`text-2xl font-bold ${ui.text.primary}`}>My Rankings</Text>
            <Text className={`text-sm ${ui.text.muted}`}>Your personal top spots</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <Card className="flex-1 items-center py-3">
            <Text className="text-2xl font-bold text-savr-900 dark:text-savr-100">{userReviews.length}</Text>
            <Text className={`text-xs ${ui.text.muted}`}>Reviews</Text>
          </Card>
          <Card className="flex-1 items-center py-3">
            <Text className="text-2xl font-bold text-savr-900 dark:text-savr-100">
              {userReviews.length ? avgRating.toFixed(1) : "—"}
            </Text>
            <Text className={`text-xs ${ui.text.muted}`}>Avg Score</Text>
          </Card>
          <Card className="flex-1 items-center py-3">
            <Text className="text-2xl font-bold text-savr-900 dark:text-savr-100">{dishRank.length}</Text>
            <Text className={`text-xs ${ui.text.muted}`}>Dishes</Text>
          </Card>
        </View>

        <SegmentedControl
          options={[
            { value: "restaurants", label: "Restaurants" },
            { value: "dishes", label: "Dishes" },
          ]}
          value={tab}
          onChange={setTab}
        />

        <FilterRow>
          <Tag label="All" active={!filters.city && !filters.cuisine && !filters.tag} onPress={() => setFilters({})} />
          {cities.map((c) => (
            <Tag key={c} label={c} active={filters.city === c} onPress={() => setFilter({ city: c })} />
          ))}
        </FilterRow>

        <FilterRow>
          {CUISINES.slice(0, 6).map((c) => (
            <Tag key={c} label={c} active={filters.cuisine === c} onPress={() => setFilter({ cuisine: c })} size="sm" />
          ))}
        </FilterRow>

        {tab === "restaurants" && (
          <FilterRow>
            {REVIEW_TAGS.slice(0, 5).map((t) => (
              <Tag key={t} label={t} active={filters.tag === t} onPress={() => setFilter({ tag: t })} size="sm" />
            ))}
          </FilterRow>
        )}

        {activeList.length === 0 ? (
          <EmptyState
            icon="trophy-outline"
            title={tab === "dishes" ? "No dish rankings yet" : "No rankings yet"}
            description={
              tab === "dishes"
                ? "Log dishes when you write reviews — your highest-rated dishes will appear here."
                : "Rate restaurants and log dishes — your top spots will show up here automatically."
            }
            actionLabel="Write a Review"
            onAction={() => router.push("/add-review")}
          />
        ) : tab === "restaurants" ? (
          <View className="gap-2">
            {restRank.map((item, i) => (
              <Pressable key={item.review.id} onPress={() => router.push(`/restaurant/${item.restaurant.id}`)}>
                <Card className={`flex-row items-center gap-3 ${i < 3 ? "border-savr-300 dark:border-savr-600" : ""}`}>
                  <RankBadge rank={i + 1} />
                  <View className="flex-1">
                    <Text className="font-semibold text-savr-900 dark:text-savr-100" numberOfLines={1}>
                      {item.restaurant.name}
                    </Text>
                    <Text className="text-xs text-savr-500 dark:text-savr-400 mt-0.5">
                      {item.restaurant.cuisine} · {item.restaurant.city} · {formatPrice(item.restaurant.priceLevel)}
                    </Text>
                    <Text className="text-xs text-savr-400 mt-0.5">Visited {formatDate(item.review.visitDate)}</Text>
                  </View>
                  <Rating value={item.rating} size="sm" />
                </Card>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="gap-2">
            {dishRank.map((item, i) => (
              <Pressable key={item.dish.id} onPress={() => router.push(`/dish/${item.dish.id}`)}>
                <Card className="flex-row items-center gap-3">
                  <RankBadge rank={i + 1} />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="font-semibold text-savr-900 dark:text-savr-100" numberOfLines={1}>
                        {item.dish.name}
                      </Text>
                      {item.dish.isBestDish ? <Ionicons name="star" size={14} color="#A85D3F" /> : null}
                    </View>
                    <Text className="text-xs text-savr-500 dark:text-savr-400 mt-0.5" numberOfLines={1}>
                      {item.restaurant.name} · {item.restaurant.cuisine}
                    </Text>
                    {item.dish.notes ? (
                      <Text className="text-xs text-savr-400 mt-0.5" numberOfLines={1}>{item.dish.notes}</Text>
                    ) : null}
                  </View>
                  <Rating value={item.rating} size="sm" />
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
