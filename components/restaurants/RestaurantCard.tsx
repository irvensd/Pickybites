import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Restaurant } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { hapticLight } from "@/lib/haptics";

export function RestaurantCard({ restaurant, rating }: { restaurant: Restaurant; rating?: number }) {
  return (
    <Pressable onPress={() => { hapticLight(); router.push(`/restaurant/${restaurant.id}`); }}>
      <Card className="flex-row gap-4 items-center p-0 overflow-hidden">
        {restaurant.imageUrl ? (
          <Image source={{ uri: restaurant.imageUrl }} style={{ width: 80, height: 80 }} contentFit="cover" transition={200} />
        ) : (
          <View className="w-20 h-20 bg-savr-100 dark:bg-savr-700 items-center justify-center">
            <Ionicons name="restaurant" size={28} color="#A85D3F" />
          </View>
        )}
        <View className="flex-1 py-3 pr-3">
          <Text className="font-semibold text-savr-900 dark:text-savr-100 text-base">{restaurant.name}</Text>
          <Text className="text-sm text-savr-500 dark:text-savr-400">{restaurant.cuisine} · {restaurant.city}</Text>
          <Text className="text-sm text-savr-600 dark:text-savr-300 mt-0.5">{formatPrice(restaurant.priceLevel)}</Text>
          {rating !== undefined && <View className="mt-1"><Rating value={rating} size="sm" /></View>}
        </View>
      </Card>
    </Pressable>
  );
}
