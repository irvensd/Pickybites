import { View, Text } from "react-native";
import { Rating } from "@/components/ui/Rating";
import { ui } from "@/constants/ui";
import { formatRating } from "@/lib/utils";

export function CommunityRating({
  avgRating,
  reviewCount,
  size = "md",
}: {
  avgRating: number | null;
  reviewCount: number;
  size?: "sm" | "md";
}) {
  if (avgRating == null || reviewCount === 0) {
    return (
      <Text className={`${size === "sm" ? "text-xs" : "text-sm"} ${ui.text.muted}`}>
        No reviews yet
      </Text>
    );
  }

  return (
    <View className="gap-0.5">
      <Rating value={avgRating} size={size === "sm" ? "sm" : "md"} />
      <Text className={`${size === "sm" ? "text-[11px]" : "text-xs"} ${ui.text.muted}`}>
        ({reviewCount} review{reviewCount === 1 ? "" : "s"})
      </Text>
    </View>
  );
}

export function CommunityRatingInline({
  avgRating,
  reviewCount,
}: {
  avgRating: number | null;
  reviewCount: number;
}) {
  if (avgRating == null || reviewCount === 0) return null;
  return (
    <Text className={`text-sm font-semibold ${ui.text.secondary}`}>
      ⭐ {formatRating(avgRating)} ({reviewCount} review{reviewCount === 1 ? "" : "s"})
    </Text>
  );
}
