import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { Restaurant, Review } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { CommunityRating } from "@/components/restaurants/CommunityRating";
import { formatPrice, formatDistance } from "@/lib/utils";
import { getCommunityRating } from "@/lib/restaurant-tags";
import { hapticLight } from "@/lib/haptics";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";

export function RestaurantListRow({
  restaurant,
  reviews = [],
  distanceMeters,
  onPress,
  trailing,
}: {
  restaurant: Restaurant;
  reviews?: Review[];
  distanceMeters?: number;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  const colors = useThemedColors();
  const { avgRating, reviewCount } = getCommunityRating(restaurant.id, reviews);
  const price = formatPrice(restaurant.priceLevel);

  return (
    <Pressable onPress={() => { hapticLight(); onPress(); }}>
      <Card className="flex-row items-center gap-3 p-3">
        {restaurant.imageUrl ? (
          <Image
            source={{ uri: restaurant.imageUrl }}
            style={{ width: 56, height: 56, borderRadius: 12 }}
            contentFit="cover"
          />
        ) : (
          <View className={`w-14 h-14 rounded-xl items-center justify-center ${ui.surface.muted}`}>
            <Ionicons name="restaurant" size={22} color={colors.brand} />
          </View>
        )}

        <View className="flex-1 gap-0.5 min-w-0">
          <Text className={`font-semibold ${ui.text.primary}`} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text className={`text-xs ${ui.text.muted}`} numberOfLines={1}>
            {[restaurant.cuisine, restaurant.city, price].filter(Boolean).join(" · ")}
          </Text>
          {distanceMeters != null ? (
            <Text className={`text-xs ${ui.text.faint}`}>{formatDistance(distanceMeters)} away</Text>
          ) : reviewCount > 0 ? (
            <CommunityRating avgRating={avgRating} reviewCount={reviewCount} size="sm" />
          ) : null}
        </View>

        {trailing ?? <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />}
      </Card>
    </Pressable>
  );
}
