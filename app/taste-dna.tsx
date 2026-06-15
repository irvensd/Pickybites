import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { calculateTasteDNA } from "@/lib/taste-dna";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { DishCard } from "@/components/dishes/DishCard";
import { formatPrice } from "@/lib/utils";

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <View>
      <View className="flex-row justify-between mb-1"><Text className="text-sm text-savr-700">{label}</Text><Text className="text-sm font-semibold text-savr-900">{score}%</Text></View>
      <View className="h-2 bg-savr-100 rounded-full overflow-hidden"><View className="h-full bg-savr-600 rounded-full" style={{ width: `${score}%` }} /></View>
    </View>
  );
}

export default function TasteDNAScreen() {
  const { currentUserId, reviews, dishes, restaurants, getRestaurant } = useAppStore();
  const dna = currentUserId ? calculateTasteDNA(currentUserId, reviews, dishes, restaurants) : null;
  if (!dna) return null;

  return (
    <ScrollView className="flex-1 bg-savr-50" contentContainerClassName="px-4 pb-6 gap-4">
      <Card className="items-center py-6">
        <Ionicons name="color-wand" size={40} color="#A85D3F" />
        <Text className="text-lg font-bold text-savr-900 mt-2">Your Flavor Profile</Text>
        <Text className="text-3xl font-bold text-savr-600 mt-2">{dna.averageRating.toFixed(1)}</Text>
        <Text className="text-xs text-savr-500">Average Rating</Text>
      </Card>
      <Card className="gap-4">
        <ScoreBar label="Adventure" score={dna.adventureScore} />
        <ScoreBar label="Hidden Gem Hunter" score={dna.hiddenGemScore} />
        <ScoreBar label="Date Night" score={dna.dateNightScore} />
        <ScoreBar label="Vegan Friendly" score={dna.veganFriendlyScore} />
      </Card>
      {dna.mostReviewedCuisine && <Card><Text className="text-sm text-savr-600">Most Reviewed</Text><Text className="font-semibold text-savr-900">{dna.mostReviewedCuisine}</Text></Card>}
      {dna.preferredPriceLevel && <Card><Text className="text-sm text-savr-600">Preferred Price</Text><Text className="font-semibold text-savr-900">{formatPrice(dna.preferredPriceLevel)}</Text></Card>}
      {dna.favoriteCuisines.length > 0 && (
        <View className="gap-2">
          <Text className="font-semibold text-savr-900">Favorite Cuisines</Text>
          {dna.favoriteCuisines.slice(0, 5).map((c) => (
            <Card key={c.cuisine} className="flex-row justify-between items-center">
              <Text className="font-medium text-savr-900">{c.cuisine}</Text>
              <Rating value={c.avgRating} size="sm" />
            </Card>
          ))}
        </View>
      )}
      {dna.topRestaurants.length > 0 && (
        <View className="gap-2">
          <Text className="font-semibold text-savr-900">Top Restaurants</Text>
          {dna.topRestaurants.map((item, i) => (
            <Pressable key={item.restaurant.id} onPress={() => router.push(`/restaurant/${item.restaurant.id}`)}>
              <Card className="flex-row items-center gap-3">
                <Text className="font-bold text-savr-500">{i + 1}</Text>
                <Text className="flex-1 font-medium text-savr-900">{item.restaurant.name}</Text>
                <Rating value={item.rating} size="sm" />
              </Card>
            </Pressable>
          ))}
        </View>
      )}
      {dna.topDishes.length > 0 && (
        <View className="gap-2">
          <Text className="font-semibold text-savr-900">Top Dishes</Text>
          {dna.topDishes.map((d) => { const r = getRestaurant(d.restaurantId); return r ? <DishCard key={d.id} dish={d} restaurant={r} /> : null; })}
        </View>
      )}
    </ScrollView>
  );
}
