import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@/store/useAppStore";
import { calculateTasteDNA } from "@/lib/taste-dna";
import { getTastePersonality } from "@/lib/taste-personality";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { ScoreMeter } from "@/components/taste/ScoreMeter";
import { FadeInView } from "@/components/ui/FadeInView";
import { DishCard } from "@/components/dishes/DishCard";
import { formatPrice } from "@/lib/utils";
import { ui } from "@/constants/ui";

export default function TasteDNAScreen() {
  const { currentUserId, reviews, dishes, restaurants, getRestaurant, users } = useAppStore();
  const user = users.find((u) => u.id === currentUserId);
  const dna = currentUserId ? calculateTasteDNA(currentUserId, reviews, dishes, restaurants) : null;
  if (!dna) return null;

  const reviewCount = reviews.filter((r) => r.userId === currentUserId).length;
  const topCuisine = dna.favoriteCuisines[0]?.cuisine ?? user?.favoriteCuisines[0] ?? "Calculating...";
  const personality = getTastePersonality(dna, reviewCount, user?.favoriteCuisines ?? []);

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["bottom"]}>
      <ScrollView contentContainerClassName="pb-8 gap-5">
        <FadeInView className="mx-4 rounded-3xl overflow-hidden bg-savr-700 dark:bg-savr-800">
          <View className="px-6 py-8 gap-2">
            <Text className="text-white/80 text-sm font-semibold uppercase tracking-widest">Taste DNA</Text>
            <Text className="text-white text-3xl font-black">Your flavor wrapped</Text>
            <Text className="text-white/90 text-base mt-2">You are a {personality}</Text>
            <Text className="text-white/90 text-base">Top cuisine: {topCuisine}</Text>
            <Text className="text-white text-4xl font-black mt-3">
              {reviewCount > 0 ? dna.averageRating.toFixed(1) : "—"}
            </Text>
            <Text className="text-white/80 text-xs">Average rating</Text>
          </View>
        </FadeInView>

        <View className="px-4 gap-4">
          <Card className="gap-5 p-5">
            <ScoreMeter label="Adventure Score" score={dna.adventureScore} reviewCount={reviewCount} kind="adventure" />
            <ScoreMeter label="Luxury Score" score={dna.luxuryScore} reviewCount={reviewCount} accent="#8B5CF6" />
            <ScoreMeter
              label="Hidden Gem Hunter"
              score={dna.hiddenGemScore}
              reviewCount={reviewCount}
              kind="hidden-gem"
              accent="#059669"
            />
            <ScoreMeter label="Date Night Score" score={dna.dateNightScore} reviewCount={reviewCount} accent="#DB2777" />
            <ScoreMeter label="Vegan Score" score={dna.veganFriendlyScore} reviewCount={reviewCount} accent="#16A34A" />
          </Card>

          <View className="flex-row gap-3">
            <Card className="flex-1 p-4 gap-1">
              <Text className={`text-xs ${ui.text.muted}`}>Top Cuisine</Text>
              <Text className={`text-lg font-bold ${ui.text.primary}`}>{topCuisine}</Text>
            </Card>
            <Card className="flex-1 p-4 gap-1">
              <Text className={`text-xs ${ui.text.muted}`}>Budget Style</Text>
              <Text className={`text-lg font-bold ${ui.text.primary}`}>
                {dna.preferredPriceLevel ? formatPrice(dna.preferredPriceLevel) : "$$"}
              </Text>
            </Card>
          </View>

          {dna.favoriteCuisines.length > 0 && (
            <View className="gap-3">
              <Text className={`text-lg font-semibold ${ui.text.primary}`}>Favorite Cuisines</Text>
              {dna.favoriteCuisines.slice(0, 5).map((c) => (
                <Card key={c.cuisine} className="flex-row justify-between items-center py-4 px-4">
                  <Text className={`font-medium text-base ${ui.text.primary}`}>{c.cuisine}</Text>
                  <Rating value={c.avgRating} size="md" />
                </Card>
              ))}
            </View>
          )}

          {dna.topRestaurants.length > 0 && (
            <View className="gap-3">
              <Text className={`text-lg font-semibold ${ui.text.primary}`}>Top Restaurants</Text>
              {dna.topRestaurants.map((item, i) => (
                <Pressable key={item.restaurant.id} onPress={() => router.push(`/restaurant/${item.restaurant.id}`)}>
                  <Card className="flex-row items-center gap-3 py-4 px-4">
                    <Text className="text-2xl font-black text-savr-600 dark:text-savr-400 w-8">{i + 1}</Text>
                    <Text className={`flex-1 font-medium ${ui.text.primary}`}>{item.restaurant.name}</Text>
                    <Rating value={item.rating} size="md" />
                  </Card>
                </Pressable>
              ))}
            </View>
          )}

          {dna.topDishes.length > 0 && (
            <View className="gap-3">
              <Text className={`text-lg font-semibold ${ui.text.primary}`}>Top Dishes</Text>
              {dna.topDishes.map((d) => {
                const r = getRestaurant(d.restaurantId);
                return r ? <DishCard key={d.id} dish={d} restaurant={r} /> : null;
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
