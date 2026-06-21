import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { Bookmark, BucketListStatus } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import {
  formatBookmarkDistance,
  formatSavedDate,
  getStatusLabel,
} from "@/lib/bucket-list";
import type { Coordinates } from "@/lib/places/types";
import { ui } from "@/constants/ui";

const STATUS_STYLES: Record<BucketListStatus, string> = {
  want_to_try: "bg-savr-100 dark:bg-savr-800 text-savr-700 dark:text-savr-200",
  planned: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200",
  visited: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200",
};

export function BucketListCard({
  bookmark,
  coords,
  onPress,
  onMarkPlanned,
  onMarkVisited,
  onRemove,
}: {
  bookmark: Bookmark;
  coords: Coordinates | null;
  onPress: () => void;
  onMarkPlanned?: () => void;
  onMarkVisited?: () => void;
  onRemove?: () => void;
}) {
  const distance = formatBookmarkDistance(bookmark, coords);
  const price = bookmark.placePriceLevel ? formatPrice(bookmark.placePriceLevel) : null;

  return (
    <Pressable onPress={onPress}>
      <Card className="p-0 overflow-hidden">
        <View className="flex-row gap-3">
          {bookmark.placeImageUrl ? (
            <Image
              source={{ uri: bookmark.placeImageUrl }}
              style={{ width: 88, height: 108 }}
              contentFit="cover"
            />
          ) : (
            <View className={`w-[88px] h-[108px] items-center justify-center ${ui.surface.muted}`}>
              <Ionicons name="restaurant" size={28} color="#A85D3F" />
            </View>
          )}

          <View className="flex-1 py-3 pr-3 gap-1.5">
            <View className="flex-row items-start justify-between gap-2">
              <Text className={`flex-1 font-semibold ${ui.text.primary}`} numberOfLines={1}>
                {bookmark.placeName}
              </Text>
              {onRemove ? (
                <Pressable onPress={(e) => { e.stopPropagation?.(); onRemove(); }} hitSlop={8}>
                  <Ionicons name="close-circle" size={20} color="#B8956F" />
                </Pressable>
              ) : null}
            </View>

            <View className={`self-start px-2 py-0.5 rounded-full ${STATUS_STYLES[bookmark.status]}`}>
              <Text className="text-[10px] font-semibold uppercase tracking-wide">
                {getStatusLabel(bookmark.status)}
              </Text>
            </View>

            <Text className={`text-xs ${ui.text.muted}`} numberOfLines={1}>
              {[bookmark.placeCuisine, price, distance, bookmark.placeCity].filter(Boolean).join(" · ")}
            </Text>

            <Text className={`text-xs ${ui.text.faint}`}>
              Saved {formatSavedDate(bookmark.createdAt)}
            </Text>

            <Text className={`text-xs italic ${ui.text.secondary}`} numberOfLines={2}>
              &ldquo;{bookmark.reasonSaved}&rdquo;
            </Text>
          </View>
        </View>

        {bookmark.status !== "visited" && (onMarkPlanned || onMarkVisited) ? (
          <View className={`flex-row gap-2 px-3 pb-3 pt-1 border-t ${ui.border.divider}`}>
            {bookmark.status === "want_to_try" && onMarkPlanned ? (
              <Pressable
                onPress={(e) => { e.stopPropagation?.(); onMarkPlanned(); }}
                className={`flex-1 flex-row items-center justify-center gap-1 py-2 rounded-xl ${ui.surface.muted}`}
              >
                <Ionicons name="calendar-outline" size={16} color="#A85D3F" />
                <Text className={`text-xs font-semibold ${ui.text.secondary}`}>Mark Planned</Text>
              </Pressable>
            ) : null}
            {onMarkVisited ? (
              <Pressable
                onPress={(e) => { e.stopPropagation?.(); onMarkVisited(); }}
                className="flex-1 flex-row items-center justify-center gap-1 py-2 rounded-xl bg-savr-500 dark:bg-savr-600"
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                <Text className="text-xs font-semibold text-white">Mark Visited</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}
