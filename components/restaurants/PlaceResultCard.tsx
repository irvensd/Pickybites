import { View, Text, Pressable } from "react-native";
import { memo } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { PlaceResult } from "@/lib/places/types";
import { APP_NAME } from "@/constants/branding";
import { Card } from "@/components/ui/Card";
import { formatPrice, formatDistance, cn } from "@/lib/utils";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";

export const PlaceResultCard = memo(function PlaceResultCard({
  place,
  onPress,
  actionLabel = "View",
  savrRating,
  distanceMeters,
  isBookmarked,
  onBookmark,
  onAddToList,
}: {
  place: PlaceResult;
  onPress: () => void;
  actionLabel?: string;
  savrRating?: number;
  distanceMeters?: number;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onAddToList?: () => void;
}) {
  const colors = useThemedColors();
  const priceLabel = place.priceLevelKnown ? formatPrice(place.priceLevel) : null;

  return (
    <Pressable onPress={onPress}>
      <Card className="flex-row gap-0 p-0 overflow-hidden">
        {place.imageUrl ? (
          <Image source={{ uri: place.imageUrl }} style={{ width: 88, height: 88 }} contentFit="cover" />
        ) : (
          <View className={cn("w-[88px] h-[88px] items-center justify-center", ui.surface.muted)}>
            <Ionicons name="restaurant" size={28} color={colors.brand} />
          </View>
        )}
        <View className="flex-1 py-3 px-3 justify-center gap-1">
          <View className="flex-row items-start justify-between gap-2">
            <Text className={`font-semibold flex-1 ${ui.text.primary}`} numberOfLines={1}>
              {place.name}
            </Text>
            <View className="flex-row items-center gap-0.5">
              {onAddToList && (
                <Pressable onPress={(e) => { e.stopPropagation?.(); onAddToList(); }} hitSlop={8} className="p-1">
                  <Ionicons name="list-outline" size={18} color={colors.iconMuted} />
                </Pressable>
              )}
              {onBookmark && (
                <Pressable onPress={(e) => { e.stopPropagation?.(); onBookmark(); }} hitSlop={8} className="p-1">
                  <Ionicons
                    name={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={18}
                    color={isBookmarked ? colors.brand : colors.iconMuted}
                  />
                </Pressable>
              )}
            </View>
          </View>

          <Text className={`text-sm ${ui.text.muted}`} numberOfLines={1}>
            {place.cuisine}{place.city ? ` · ${place.city}` : ""}
          </Text>

          <View className="flex-row items-center flex-wrap gap-1.5 mt-0.5">
            {distanceMeters != null && (
              <View className={cn("px-2 py-0.5 rounded-full", ui.surface.muted)}>
                <Text className={`text-xs font-medium ${ui.text.secondary}`}>{formatDistance(distanceMeters)}</Text>
              </View>
            )}
            {priceLabel ? (
              <Text className={`text-xs ${ui.text.secondary}`}>{priceLabel}</Text>
            ) : null}
            {place.openNow === true && (
              <View className="bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                <Text className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Open</Text>
              </View>
            )}
            {savrRating !== undefined ? (
              <Text className={`text-xs font-semibold ml-auto ${ui.text.secondary}`}>
                ★ {savrRating.toFixed(1)} on {APP_NAME}
              </Text>
            ) : (
              <Text className={`text-xs font-medium ml-auto ${ui.text.muted}`}>{actionLabel}</Text>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
});
