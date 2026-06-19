import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Restaurant, Review, Bookmark } from "@/lib/types";
import { formatPrice, formatDistance, cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { CommunityRating } from "@/components/restaurants/CommunityRating";
import { RestaurantTagRow } from "@/components/restaurants/RestaurantTagRow";
import { getCommunityRating, getRestaurantCommunityTags } from "@/lib/restaurant-tags";
import { hapticLight } from "@/lib/haptics";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";
import { FadeInView } from "@/components/ui/FadeInView";

export const RestaurantCard = memo(function RestaurantCard({
  restaurant,
  reviews = [],
  bookmarks = [],
  userCity,
  distanceMeters,
  isBookmarked,
  onBookmark,
  index = 0,
}: {
  restaurant: Restaurant;
  reviews?: Review[];
  bookmarks?: Bookmark[];
  userCity?: string | null;
  distanceMeters?: number;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  index?: number;
}) {
  const colors = useThemedColors();
  const priceLabel = formatPrice(restaurant.priceLevel);
  const { avgRating, reviewCount } = getCommunityRating(restaurant.id, reviews);
  const tags = getRestaurantCommunityTags(restaurant, reviews, bookmarks, userCity);

  return (
    <FadeInView delay={index * 60}>
      <Pressable onPress={() => { hapticLight(); router.push(`/restaurant/${restaurant.id}`); }}>
        <Card className="p-0 overflow-hidden">
          {restaurant.imageUrl ? (
            <Image
              source={{ uri: restaurant.imageUrl }}
              style={{ width: "100%", height: 148 }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View className={cn("h-[148px] items-center justify-center", ui.surface.muted)}>
              <Ionicons name="restaurant" size={36} color={colors.brand} />
            </View>
          )}

          <View className="p-4 gap-2">
            <View className="flex-row items-start justify-between gap-2">
              <Text className={`font-semibold text-lg flex-1 ${ui.text.primary}`} numberOfLines={1}>
                {restaurant.name}
              </Text>
              {onBookmark && (
                <Pressable onPress={(e) => { e.stopPropagation?.(); onBookmark(); }} hitSlop={8} className="p-1">
                  <Ionicons
                    name={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={22}
                    color={isBookmarked ? colors.brand : colors.iconMuted}
                  />
                </Pressable>
              )}
            </View>

            <CommunityRating avgRating={avgRating} reviewCount={reviewCount} />

            <Text className={`text-sm ${ui.text.muted}`}>
              {restaurant.cuisine} · {restaurant.city}
              {priceLabel ? ` · ${priceLabel}` : ""}
            </Text>

            {distanceMeters != null && (
              <View className={cn("self-start px-2.5 py-1 rounded-full", ui.surface.muted)}>
                <Text className={`text-xs font-medium ${ui.text.secondary}`}>
                  {formatDistance(distanceMeters)} away
                </Text>
              </View>
            )}

            <RestaurantTagRow tags={tags} />
          </View>
        </Card>
      </Pressable>
    </FadeInView>
  );
});
