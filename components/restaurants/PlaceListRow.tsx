import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { PlaceResult } from "@/lib/places/types";
import { Card } from "@/components/ui/Card";
import { formatPrice, formatDistance } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";

export function PlaceListRow({
  place,
  distanceMeters,
  rating,
  reviewCount,
  onPress,
  onBookmark,
  isBookmarked,
}: {
  place: PlaceResult;
  distanceMeters?: number;
  rating?: number;
  reviewCount?: number;
  onPress: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}) {
  const colors = useThemedColors();
  const price = place.priceLevelKnown ? formatPrice(place.priceLevel) : null;

  return (
    <Pressable onPress={() => { hapticLight(); onPress(); }}>
      <Card className="flex-row items-center gap-3 p-3">
        {place.imageUrl ? (
          <Image
            source={{ uri: place.imageUrl }}
            style={{ width: 56, height: 56, borderRadius: 12 }}
            contentFit="cover"
          />
        ) : (
          <View className={`w-14 h-14 rounded-xl items-center justify-center ${ui.surface.muted}`}>
            <Ionicons name="location" size={22} color={colors.brand} />
          </View>
        )}

        <View className="flex-1 min-w-0 gap-0.5">
          <Text className={`font-semibold ${ui.text.primary}`} numberOfLines={1}>
            {place.name}
          </Text>
          <Text className={`text-xs ${ui.text.muted}`} numberOfLines={1}>
            {[place.cuisine, place.city, price].filter(Boolean).join(" · ")}
          </Text>
          <View className="flex-row items-center gap-2">
            {distanceMeters != null ? (
              <Text className={`text-xs ${ui.text.faint}`}>{formatDistance(distanceMeters)} away</Text>
            ) : null}
            {rating != null && reviewCount ? (
              <Text className={`text-xs font-medium ${ui.text.secondary}`}>
                {rating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? "" : "s"}
              </Text>
            ) : null}
          </View>
        </View>

        {onBookmark ? (
          <Pressable
            onPress={(e) => { e.stopPropagation?.(); onBookmark(); }}
            hitSlop={8}
            className="p-1"
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isBookmarked ? colors.brand : colors.iconMuted}
            />
          </Pressable>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
        )}
      </Card>
    </Pressable>
  );
}
