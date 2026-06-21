import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { TrendingSpot } from "@/lib/trending";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { cn, formatPrice } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";

const CARD_WIDTH = Dimensions.get("window").width * 0.68;

function TrendingCard({
  spot,
  badge,
}: {
  spot: TrendingSpot;
  badge: string;
}) {
  const colors = useThemedColors();
  const { restaurant } = spot;

  return (
    <Pressable
      style={{ width: CARD_WIDTH }}
      onPress={() => {
        hapticLight();
        router.push(`/restaurant/${restaurant.id}`);
      }}
    >
      <Card className="p-0 overflow-hidden">
        {restaurant.imageUrl ? (
          <Image source={{ uri: restaurant.imageUrl }} style={{ width: "100%", height: 140 }} contentFit="cover" transition={200} />
        ) : (
          <View className={cn("h-[140px] items-center justify-center", ui.surface.muted)}>
            <Ionicons name="restaurant" size={36} color={colors.brand} />
          </View>
        )}
        <View className="p-4 gap-2">
          <View className={cn("self-start px-2.5 py-1 rounded-full", ui.surface.muted)}>
            <Text className={`text-xs font-semibold ${ui.text.secondary}`}>{badge}</Text>
          </View>
          <Text className={`font-semibold text-base ${ui.text.primary}`} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text className={`text-xs ${ui.text.muted}`}>
            {restaurant.cuisine} · {formatPrice(restaurant.priceLevel)}
          </Text>
          {spot.avgRating != null ? (
            <Rating value={spot.avgRating} size="sm" />
          ) : spot.saveCount != null ? (
            <Text className={`text-xs ${ui.text.secondary}`}>{spot.saveCount} saves this week</Text>
          ) : (
            <Text className={`text-xs ${ui.text.secondary}`}>{spot.reviewCount} reviews this week</Text>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

export function TrendingNearYouSection({
  mostReviewed,
  mostSaved,
  highestRated,
}: {
  mostReviewed: TrendingSpot[];
  mostSaved: TrendingSpot[];
  highestRated: TrendingSpot[];
}) {
  const rows = [
    { title: "Most reviewed", data: mostReviewed, badge: "Hot this week" },
    { title: "Most saved", data: mostSaved, badge: "Saved often" },
    { title: "Highest rated", data: highestRated, badge: "Top scores" },
  ].filter((r) => r.data.length > 0);

  if (!rows.length) return null;

  return (
    <View className="gap-5 px-4">
      <HomeSectionHeader title="Trending Near You" subtitle="What the community is loving" icon="flame" />
      {rows.map((row) => (
        <View key={row.title} className="gap-3">
          <Text className={`text-sm font-semibold ${ui.text.secondary}`}>{row.title}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
            {row.data.map((spot) => (
              <TrendingCard key={`${row.title}-${spot.restaurant.id}`} spot={spot} badge={row.badge} />
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}

