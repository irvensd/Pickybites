import { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, TextInput, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { getRecommendations } from "@/lib/recommendations";
import { CUISINES } from "@/lib/types";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { Tag } from "@/components/ui/Tag";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DiscoverScreen() {
  const { currentUserId, reviews, restaurants, follows, refreshFeed, isRefreshing } = useAppStore();
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const recs = currentUserId ? getRecommendations(currentUserId, reviews, restaurants, follows, 5) : [];
  const filtered = useMemo(() => restaurants.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q);
    const matchC = !cuisine || r.cuisine === cuisine;
    return matchQ && matchC;
  }), [restaurants, search, cuisine]);

  const onRefresh = useCallback(() => refreshFeed(), [refreshFeed]);

  return (
    <SafeAreaView className="flex-1 bg-savr-50 dark:bg-savr-950" edges={["top"]}>
      <ScrollView
        contentContainerClassName="px-4 pb-28 gap-4"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#A85D3F" />}
      >
        <Text className="text-2xl font-bold text-savr-900 dark:text-savr-100 pt-2">Discover</Text>
        <View className="flex-row items-center bg-white dark:bg-savr-800 border border-savr-200 dark:border-savr-700 rounded-xl px-3 min-h-[52px]">
          <Ionicons name="search" size={20} color="#D4C4B5" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search restaurants or cities..."
            className="flex-1 ml-2 text-base text-savr-900 dark:text-savr-100"
            placeholderTextColor="#D4C4B5"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          <Tag label="All" active={!cuisine} onPress={() => setCuisine(null)} />
          {CUISINES.slice(0, 8).map((c) => <Tag key={c} label={c} active={cuisine === c} onPress={() => setCuisine(cuisine === c ? null : c)} />)}
        </ScrollView>
        {!search && !cuisine && recs.length > 0 && (
          <View className="gap-2">
            <Text className="font-semibold text-savr-900 dark:text-savr-100">Recommended</Text>
            {recs.map((rec) => (
              <View key={rec.restaurant.id}>
                <RestaurantCard restaurant={rec.restaurant} />
                <Text className="text-xs text-savr-500 dark:text-savr-400 mt-1 px-1">{rec.reason}</Text>
              </View>
            ))}
          </View>
        )}
        <Text className="font-semibold text-savr-900 dark:text-savr-100">Restaurants</Text>
        {filtered.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            rating={reviews.filter((rev) => rev.restaurantId === r.id).reduce((s, rev, _, arr) => s + rev.rating / arr.length, 0) || undefined}
          />
        ))}
        {filtered.length === 0 && (
          <EmptyState
            icon="search-outline"
            title="No restaurants found"
            description="Try a different search term or clear your cuisine filter."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
