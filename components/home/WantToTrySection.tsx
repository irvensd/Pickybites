import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Bookmark } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";

const CARD_WIDTH = Dimensions.get("window").width * 0.62;

export function WantToTrySection({
  bookmarks,
  onOpen,
}: {
  bookmarks: Bookmark[];
  onOpen: (bookmark: Bookmark) => void;
}) {
  const colors = useThemedColors();

  if (!bookmarks.length) {
    return (
      <View className="gap-3 px-4">
        <HomeSectionHeader title="Continue Your Food Journey" subtitle="Save spots before you visit" icon="bookmark" />
        <Card className={cn("gap-3 p-5", ui.accentCard)}>
          <Text className={`text-sm leading-5 ${ui.text.secondary}`}>
            Build your Want To Try list from Discover — save restaurants before you review them.
          </Text>
          <Button label="Explore Discover" variant="secondary" onPress={() => router.push("/(tabs)/discover")} />
        </Card>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <View className="px-4 flex-row items-end justify-between">
        <HomeSectionHeader title="Continue Your Food Journey" subtitle="Want To Try" icon="bookmark" />
        <Pressable onPress={() => router.push("/bookmarks")} hitSlop={8}>
          <Text className="text-sm font-semibold text-savr-600 dark:text-savr-400">See all</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-3">
        {bookmarks.slice(0, 8).map((bookmark) => (
          <Pressable
            key={bookmark.id}
            style={{ width: CARD_WIDTH }}
            onPress={() => {
              hapticLight();
              onOpen(bookmark);
            }}
          >
            <Card className="p-0 overflow-hidden">
              {bookmark.placeImageUrl ? (
                <Image source={{ uri: bookmark.placeImageUrl }} style={{ width: "100%", height: 120 }} contentFit="cover" />
              ) : (
                <View className={cn("h-[120px] items-center justify-center", ui.surface.muted)}>
                  <Ionicons name="restaurant" size={32} color={colors.brand} />
                </View>
              )}
              <View className="p-4 gap-1">
                <Text className={`font-semibold ${ui.text.primary}`} numberOfLines={1}>
                  {bookmark.placeName}
                </Text>
                <Text className={`text-xs ${ui.text.muted}`} numberOfLines={1}>
                  {bookmark.placeCuisine ?? "Restaurant"} · {bookmark.placeCity}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
