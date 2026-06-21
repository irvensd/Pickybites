import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import type { Review, Restaurant } from "@/lib/types";
import type { FoodJournalEntry } from "@/lib/foodJournal";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { ReviewScoreSummary } from "@/components/reviews/ReviewScoreSummary";
import { getReviewOverallRating } from "@/lib/review-scores";
import { formatDate, cn } from "@/lib/utils";
import { ui } from "@/constants/ui";

export function JournalVisitCard({
  review,
  restaurant,
  photoUrl,
  entry,
}: {
  review: Review;
  restaurant: Restaurant;
  photoUrl?: string | null;
  entry?: FoodJournalEntry;
}) {
  const image = photoUrl ?? restaurant.imageUrl;
  const dishes = entry?.dishes ?? [];

  return (
    <Pressable onPress={() => router.push(`/restaurant/${restaurant.id}`)}>
      <Card className="p-0 overflow-hidden">
        {image ? (
          <Image source={{ uri: image }} style={{ width: "100%", height: 160 }} contentFit="cover" transition={200} />
        ) : (
          <View className={cn("h-40 items-center justify-center", ui.surface.muted)}>
            <Text className={`text-sm ${ui.text.muted}`}>No photo</Text>
          </View>
        )}
        <View className="p-4 gap-2">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className={`text-lg font-semibold ${ui.text.primary}`}>{restaurant.name}</Text>
              <Text className={`text-xs ${ui.text.muted}`}>
                {restaurant.cuisine}
                {restaurant.city ? ` · ${restaurant.city}` : ""}
                {` · ${formatDate(review.visitDate)}`}
              </Text>
            </View>
            <Rating value={getReviewOverallRating(review)} size="md" />
          </View>
          <ReviewScoreSummary review={review} compact />
          {review.text ? (
            <Text className={`text-sm leading-5 ${ui.text.secondary}`} numberOfLines={3}>
              {review.text}
            </Text>
          ) : null}
          {dishes.length > 0 ? (
            <View className="gap-1 pt-1">
              <Text className={`text-xs font-semibold uppercase ${ui.text.muted}`}>Dishes reviewed</Text>
              {dishes.map((d) => (
                <Text key={d.dish_id} className={`text-sm ${ui.text.secondary}`}>
                  {d.dish_name}
                  {d.is_favorite ? " ★" : ""}
                  {` · ${d.dish_rating.toFixed(1)}`}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
