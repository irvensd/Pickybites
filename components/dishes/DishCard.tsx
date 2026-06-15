import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Dish, Restaurant } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";

export function DishCard({ dish, restaurant }: { dish: Dish; restaurant: Restaurant }) {
  return (
    <Pressable onPress={() => router.push(`/dish/${dish.id}`)}>
      <Card className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-xl bg-savr-100 items-center justify-center">
          {dish.isBestDish ? <Ionicons name="trophy" size={20} color="#A85D3F" /> : <Text>🍽️</Text>}
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-savr-900">{dish.name}</Text>
          <Text className="text-xs text-savr-500">{restaurant.name}</Text>
        </View>
        <Rating value={dish.rating} size="sm" />
      </Card>
    </Pressable>
  );
}
