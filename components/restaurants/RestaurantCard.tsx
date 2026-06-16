import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Restaurant } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { hapticLight } from "@/lib/haptics";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";

export const RestaurantCard = memo(function RestaurantCard({ restaurant, rating }: { restaurant: Restaurant; rating?: number }) {
  const colors = useThemedColors();
  const priceLabel = formatPrice(restaurant.priceLevel);

  return (
    <Pressable onPress={() => { hapticLight(); router.push(`/restaurant/${restaurant.id}`); }}>
      <Card className="flex-row gap-4 items-center p-0 overflow-hidden">
        {restaurant.imageUrl ? (
          <Image source={{ uri: restaurant.imageUrl }} style={{ width: 80, height: 80 }} contentFit="cover" transition={200} />
        ) : (
          <View className={cn("w-20 h-20 items-center justify-center", ui.surface.muted)}>
            <Ionicons name="restaurant" size={28} color={colors.brand} />
          </View>
        )}
        <View className="flex-1 py-3 pr-3">
          <Text className="font-semibold text-savr-900 dark:text-savr-100 text-base">{restaurant.name}</Text>
          <Text className="text-sm text-savr-500 dark:text-savr-400">{restaurant.cuisine} · {restaurant.city}</Text>
          {priceLabel ? (
            <Text className="text-sm text-savr-600 dark:text-savr-300 mt-0.5">{priceLabel}</Text>
          ) : null}
          {rating !== undefined && <View className="mt-1"><Rating value={rating} size="sm" /></View>}
        </View>
      </Card>
    </Pressable>
  );
});
