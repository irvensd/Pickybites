import { View, Text, ScrollView, Share } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { calculateFoodWrapped } from "@/lib/taste-dna";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

export default function WrappedScreen() {
  const { currentUserId, reviews, dishes, restaurants } = useAppStore();
  const year = new Date().getFullYear();
  const w = currentUserId ? calculateFoodWrapped(currentUserId, year, reviews, dishes, restaurants) : null;
  if (!w) return null;

  const share = () => Share.share({ message: `My ${year} Savr Food Wrapped: ${w.totalRestaurants} restaurants, ${w.totalDishes} dishes!` });

  return (
    <ScrollView className="flex-1 bg-savr-50" contentContainerClassName="px-4 pb-8 gap-4">
      <View className="items-center py-4">
        <Ionicons name="gift" size={48} color="#A85D3F" />
        <Text className="text-3xl font-bold text-savr-900 mt-2">{year}</Text>
        <Text className="text-savr-600">Your year in food</Text>
      </View>
      <Card className="bg-savr-600 border-0">
        <View className="flex-row justify-around py-2">
          <View className="items-center"><Text className="text-4xl font-bold text-white">{w.totalRestaurants}</Text><Text className="text-sm text-savr-200">Restaurants</Text></View>
          <View className="items-center"><Text className="text-4xl font-bold text-white">{w.totalDishes}</Text><Text className="text-sm text-savr-200">Dishes</Text></View>
        </View>
      </Card>
      {w.favoriteCuisine && <Card><Text className="text-xs text-savr-500 uppercase">Favorite Cuisine</Text><Text className="text-xl font-bold text-savr-900">{w.favoriteCuisine}</Text></Card>}
      {w.mostVisitedCity && <Card><Text className="text-xs text-savr-500 uppercase">Most Visited City</Text><Text className="text-xl font-bold text-savr-900">{w.mostVisitedCity}</Text></Card>}
      {w.highestRatedRestaurant && <Card><Text className="text-xs text-savr-500 uppercase">Top Restaurant</Text><Text className="font-bold text-savr-900">{w.highestRatedRestaurant.restaurant.name}</Text><Rating value={w.highestRatedRestaurant.rating} size="sm" /></Card>}
      {w.highestRatedDish && <Card><Text className="text-xs text-savr-500 uppercase">Top Dish</Text><Text className="font-bold text-savr-900">{w.highestRatedDish.dish.name}</Text><Text className="text-sm text-savr-500">{w.highestRatedDish.restaurant.name}</Text><Rating value={w.highestRatedDish.dish.rating} size="sm" /></Card>}
      {w.biggestSurprise && <Card><Text className="text-xs text-savr-500 uppercase">Biggest Surprise</Text><Text className="font-bold text-savr-900">{w.biggestSurprise.restaurant.name}</Text><Rating value={w.biggestSurprise.rating} size="sm" /></Card>}
      {w.biggestDisappointment && <Card><Text className="text-xs text-savr-500 uppercase">Biggest Disappointment</Text><Text className="font-bold text-savr-900">{w.biggestDisappointment.restaurant.name}</Text><Rating value={w.biggestDisappointment.rating} size="sm" /></Card>}
      <Button label="Share Your Wrapped" onPress={share} />
    </ScrollView>
  );
}
