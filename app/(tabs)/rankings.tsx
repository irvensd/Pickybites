import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { getRestaurantRankings, getDishRankings } from "@/lib/rankings";
import { CUISINES, REVIEW_TAGS, type RankingFilters } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { DishCard } from "@/components/dishes/DishCard";
import { formatPrice } from "@/lib/utils";

export default function RankingsScreen() {
  const { currentUserId, reviews, dishes, restaurants } = useAppStore();
  const [tab, setTab] = useState<"restaurants" | "dishes">("restaurants");
  const [filters, setFilters] = useState<RankingFilters>({});
  const restRank = currentUserId ? getRestaurantRankings(currentUserId, reviews, restaurants, filters) : [];
  const dishRank = currentUserId ? getDishRankings(currentUserId, reviews, dishes, restaurants, filters) : [];
  const cities = Array.from(new Set(restaurants.map((r) => r.city)));

  return (
    <SafeAreaView className="flex-1 bg-savr-50 dark:bg-savr-950" edges={["top"]}>
      <ScrollView contentContainerClassName="px-4 pb-28 gap-3">
        <View className="flex-row items-center gap-2 pt-2">
          <Ionicons name="trophy" size={22} color="#A85D3F" />
          <Text className="text-2xl font-bold text-savr-900">My Rankings</Text>
        </View>
        <View className="flex-row gap-2">
          {(["restaurants", "dishes"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} className={`flex-1 py-3 rounded-xl items-center ${tab === t ? "bg-savr-600" : "bg-savr-100"}`}>
              <Text className={`font-medium capitalize ${tab === t ? "text-white" : "text-savr-700"}`}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          <Pressable onPress={() => setFilters({})} className="bg-savr-100 px-3 py-2 rounded-full"><Text className="text-sm text-savr-700">All</Text></Pressable>
          {cities.map((c) => (
            <Pressable key={c} onPress={() => setFilters({ city: c })} className={`px-3 py-2 rounded-full ${filters.city === c ? "bg-savr-600" : "bg-savr-100"}`}>
              <Text className={`text-sm ${filters.city === c ? "text-white" : "text-savr-700"}`}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {tab === "restaurants" ? restRank.map((item, i) => (
          <Card key={item.review.id} className="flex-row items-center gap-3">
            <Text className="w-6 font-bold text-savr-500">{i + 1}</Text>
            <View className="flex-1">
              <Text className="font-semibold text-savr-900">{item.restaurant.name}</Text>
              <Text className="text-xs text-savr-500">{item.restaurant.cuisine} · {formatPrice(item.restaurant.priceLevel)}</Text>
            </View>
            <Rating value={item.rating} size="sm" />
          </Card>
        )) : dishRank.map((item, i) => (
          <View key={item.dish.id} className="flex-row items-center gap-2">
            <Text className="w-6 font-bold text-savr-500">{i + 1}</Text>
            <View className="flex-1"><DishCard dish={item.dish} restaurant={item.restaurant} /></View>
          </View>
        ))}
        {(tab === "restaurants" ? restRank : dishRank).length === 0 && <Card><Text className="text-savr-500 text-center py-4">No rankings yet.</Text></Card>}
      </ScrollView>
    </SafeAreaView>
  );
}
