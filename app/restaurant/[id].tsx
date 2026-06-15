import { View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { DishCard } from "@/components/dishes/DishCard";
import { Rating } from "@/components/ui/Rating";
import { formatPrice } from "@/lib/utils";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRestaurant, reviews, dishes } = useAppStore();
  const restaurant = getRestaurant(id!);
  const restReviews = reviews.filter((r) => r.restaurantId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const restDishes = dishes.filter((d) => d.restaurantId === id);
  const avg = restReviews.length ? restReviews.reduce((s, r) => s + r.rating, 0) / restReviews.length : null;

  if (!restaurant) return <View className="flex-1 items-center justify-center bg-savr-50 dark:bg-savr-950"><Text className="text-savr-500">Restaurant not found.</Text></View>;

  return (
    <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="pb-6 gap-4">
      {restaurant.imageUrl ? (
        <Image source={{ uri: restaurant.imageUrl }} style={{ width: "100%", height: 220 }} contentFit="cover" transition={200} />
      ) : (
        <View className="h-[220px] bg-savr-100 dark:bg-savr-800 items-center justify-center">
          <Ionicons name="restaurant" size={48} color="#A85D3F" />
        </View>
      )}
      <View className="px-4 gap-4">
        <View>
          <Text className="text-2xl font-bold text-savr-900 dark:text-savr-100">{restaurant.name}</Text>
          <Text className="text-sm text-savr-600 dark:text-savr-300">{restaurant.cuisine}</Text>
          <Text className="text-sm text-savr-500 dark:text-savr-400 mt-1">{restaurant.address}, {restaurant.city}</Text>
          <View className="flex-row items-center gap-2 mt-2">
            <Text className="text-sm text-savr-600 dark:text-savr-300">{formatPrice(restaurant.priceLevel)}</Text>
            {avg && <Rating value={avg} size="sm" />}
          </View>
        </View>
        {restDishes.length > 0 && (
          <View className="gap-2">
            <Text className="font-semibold text-savr-900 dark:text-savr-100">Top Dishes</Text>
            {restDishes.sort((a, b) => b.rating - a.rating).slice(0, 5).map((d) => <DishCard key={d.id} dish={d} restaurant={restaurant} />)}
          </View>
        )}
        <View className="gap-2">
          <Text className="font-semibold text-savr-900 dark:text-savr-100">Reviews ({restReviews.length})</Text>
          {restReviews.map((r) => <ReviewCard key={r.id} review={r} showRestaurant={false} />)}
        </View>
      </View>
    </ScrollView>
  );
}
