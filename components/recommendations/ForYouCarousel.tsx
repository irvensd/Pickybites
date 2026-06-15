import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Recommendation } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { hapticLight } from "@/lib/haptics";

const CARD_WIDTH = Dimensions.get("window").width * 0.72;

export function ForYouCarousel({ recommendations }: { recommendations: Recommendation[] }) {
  if (!recommendations.length) return null;

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2 px-4">
        <Ionicons name="sparkles" size={18} color="#A85D3F" />
        <Text className="text-lg font-semibold text-savr-900 dark:text-savr-100">For You</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
        contentContainerClassName="px-4 gap-3"
      >
        {recommendations.map((rec) => (
          <Pressable
            key={rec.restaurant.id}
            style={{ width: CARD_WIDTH }}
            onPress={() => {
              hapticLight();
              router.push(`/restaurant/${rec.restaurant.id}`);
            }}
          >
            <Card className="p-0 overflow-hidden">
              {rec.restaurant.imageUrl ? (
                <Image
                  source={{ uri: rec.restaurant.imageUrl }}
                  style={{ width: "100%", height: 120 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View className="h-[120px] bg-savr-100 dark:bg-savr-800 items-center justify-center">
                  <Ionicons name="restaurant" size={32} color="#A85D3F" />
                </View>
              )}
              <View className="p-4 gap-2">
                <View className="flex-row justify-between items-start gap-2">
                  <Text className="font-semibold text-base text-savr-900 dark:text-savr-100 flex-1" numberOfLines={1}>
                    {rec.restaurant.name}
                  </Text>
                  <View className="bg-savr-100 dark:bg-savr-800 px-2.5 py-1 rounded-full">
                    <Text className="text-xs font-bold text-savr-700 dark:text-savr-300">{rec.confidence}%</Text>
                  </View>
                </View>
                <Text className="text-xs text-savr-500 dark:text-savr-400">
                  {rec.restaurant.cuisine} · {rec.restaurant.city}
                </Text>
                <Text className="text-sm text-savr-600 dark:text-savr-300 leading-5" numberOfLines={2}>
                  {rec.reason}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
