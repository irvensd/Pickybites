import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { router } from "expo-router";
import type { DishDiscovery } from "@/lib/dish-discovery";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { ui } from "@/constants/ui";
import { hapticLight } from "@/lib/haptics";

const CARD_WIDTH = Dimensions.get("window").width * 0.72;

export function DishPickCarousel({ picks }: { picks: DishDiscovery[] }) {
  if (!picks.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + 12}
      contentContainerClassName="gap-3"
    >
      {picks.map((pick) => (
        <Pressable
          key={pick.dish.id}
          style={{ width: CARD_WIDTH }}
          onPress={() => {
            hapticLight();
            router.push(`/restaurant/${pick.restaurant.id}`);
          }}
        >
          <Card className="gap-2">
            <Text className={`font-semibold text-base ${ui.text.primary}`} numberOfLines={1}>
              {pick.dish.name}
            </Text>
            <Text className={`text-sm ${ui.text.muted}`} numberOfLines={1}>
              {pick.restaurant.name}
            </Text>
            <Text className={`text-xs ${ui.text.faint}`} numberOfLines={2}>
              {pick.reason}
            </Text>
            <View className="flex-row items-center justify-between pt-1">
              <Rating value={pick.avgRating} size="sm" />
              <Text className={`text-xs font-medium ${ui.text.secondary}`}>{pick.restaurant.cuisine}</Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}

