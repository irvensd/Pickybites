import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/utils";
import { ui } from "@/constants/ui";

export default function BookmarksScreen() {
  const { bookmarks, removeBookmark, ensureRestaurantFromPlace } = useAppStore();

  const openBookmark = async (bm: (typeof bookmarks)[0]) => {
    if (bm.restaurantId) {
      router.push(`/restaurant/${bm.restaurantId}`);
      return;
    }
    if (!bm.googlePlaceId || bm.latitude == null || bm.longitude == null) return;

    const result = await ensureRestaurantFromPlace({
      googlePlaceId: bm.googlePlaceId,
      name: bm.placeName,
      address: bm.placeAddress,
      city: bm.placeCity,
      cuisine: bm.placeCuisine ?? "American",
      priceLevel: 2,
      imageUrl: bm.placeImageUrl,
      latitude: bm.latitude,
      longitude: bm.longitude,
    });
    if ("error" in result) Alert.alert("Error", result.error);
    else router.push(`/restaurant/${result.id}`);
  };

  return (
    <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="px-4 pb-6 gap-3">
      {bookmarks.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title="Nothing saved yet"
          description="Tap the bookmark icon on spots in Discover to save places you want to try."
          actionLabel="Discover Spots"
          onAction={() => router.push("/(tabs)/discover")}
        />
      ) : (
        bookmarks.map((bm) => (
          <Pressable key={bm.id} onPress={() => openBookmark(bm)}>
            <Card className="flex-row gap-3 p-0 overflow-hidden">
              {bm.placeImageUrl ? (
                <Image source={{ uri: bm.placeImageUrl }} style={{ width: 72, height: 72 }} contentFit="cover" />
              ) : (
                <View className={`w-[72px] h-[72px] items-center justify-center ${ui.surface.muted}`}>
                  <Ionicons name="restaurant" size={24} color="#A85D3F" />
                </View>
              )}
              <View className="flex-1 py-3 pr-3 justify-center">
                <Text className={`font-semibold ${ui.text.primary}`}>{bm.placeName}</Text>
                <Text className={`text-sm ${ui.text.muted}`}>
                  {bm.placeCuisine ?? "Restaurant"} · {bm.placeCity || bm.placeAddress}
                </Text>
                <View className="flex-row items-center justify-between mt-1">
                  <Text className={`text-xs font-medium ${ui.text.secondary}`}>Want to try</Text>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation?.();
                      removeBookmark(bm.id);
                    }}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={20} color="#B8956F" />
                  </Pressable>
                </View>
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
