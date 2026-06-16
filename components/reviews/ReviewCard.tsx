import { View, Text, Pressable, TextInput, Alert } from "react-native";
import { Image } from "expo-image";
import { memo, useCallback, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import type { Review } from "@/lib/types";
import { formatDate, formatRelative } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Rating";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import { shareReview } from "@/lib/share";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";
import { cn } from "@/lib/utils";

type ReviewCardProps = { review: Review; showRestaurant?: boolean };

function ReviewCardInner({ review, showRestaurant = true }: ReviewCardProps) {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const user = useAppStore((s) => s.users.find((u) => u.id === review.userId));
  const restaurant = useAppStore((s) =>
    showRestaurant ? s.restaurants.find((r) => r.id === review.restaurantId) : undefined,
  );
  const photo = useAppStore((s) => s.reviewPhotos.find((p) => p.reviewId === review.id));
  const liked = useAppStore((s) =>
    s.likes.some((l) => l.reviewId === review.id && l.userId === s.currentUserId),
  );
  const likeCount = useAppStore((s) => s.likes.filter((l) => l.reviewId === review.id).length);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const addComment = useAppStore((s) => s.addComment);
  const deleteReview = useAppStore((s) => s.deleteReview);
  const getUser = useAppStore((s) => s.getUser);

  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const commentCount = useAppStore((s) => s.comments.filter((c) => c.reviewId === review.id).length);
  const previewComment = useAppStore((s) => s.comments.find((c) => c.reviewId === review.id));
  const comments = useAppStore(
    useCallback(
      (s) => (showComments ? s.comments.filter((c) => c.reviewId === review.id) : []),
      [review.id, showComments],
    ),
  );

  const colors = useThemedColors();
  const imageUrl = photo?.url ?? restaurant?.imageUrl;
  const isOwn = review.userId === currentUserId;

  if (!user) return null;

  const handleLike = () => {
    toggleLike(review.id);
    if (!liked) hapticSuccess();
    else hapticLight();
  };

  const handleDelete = () => {
    Alert.alert("Delete review?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await deleteReview(review.id);
          if ("error" in result) Alert.alert("Could not delete", result.error);
        },
      },
    ]);
  };

  return (
    <Card className="gap-3 p-0 overflow-hidden">
      {imageUrl && (
        <Pressable onPress={() => restaurant && router.push(`/restaurant/${restaurant.id}`)}>
          <Image source={{ uri: imageUrl }} style={{ width: "100%", height: 180 }} contentFit="cover" transition={200} />
        </Pressable>
      )}
      <View className="px-4 pb-4 gap-3">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.push(`/user/${user.id}`)}><Avatar name={user.displayName} src={user.avatarUrl} /></Pressable>
          <View className="flex-1">
            <Pressable onPress={() => router.push(`/user/${user.id}`)}><Text className="font-semibold text-savr-900 dark:text-savr-100">{user.displayName}</Text></Pressable>
            <Text className="text-xs text-savr-500 dark:text-savr-400">{formatRelative(review.createdAt)}</Text>
          </View>
          <Rating value={review.rating} size="sm" />
        </View>
        {showRestaurant && restaurant && (
          <Pressable onPress={() => router.push(`/restaurant/${restaurant.id}`)}>
            <Text className="font-semibold text-savr-900 dark:text-savr-100">{restaurant.name}</Text>
            <Text className="text-sm text-savr-500 dark:text-savr-400">{restaurant.cuisine} · {restaurant.city}</Text>
          </Pressable>
        )}
        <Text className="text-sm text-savr-700 dark:text-savr-300 leading-6">{review.text}</Text>
        {review.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-2">{review.tags.map((t) => <Tag key={t} label={t} size="sm" />)}</View>
        )}
        <Text className="text-xs text-savr-400 dark:text-savr-500 mt-1">Visited {formatDate(review.visitDate)}</Text>

        {previewComment && !showComments && (
          <Pressable onPress={() => setShowComments(true)} className="flex-row gap-2 items-start">
            <Avatar name={getUser(previewComment.userId)?.displayName ?? "?"} src={getUser(previewComment.userId)?.avatarUrl} size="sm" />
            <View className="flex-1">
              <Text className="text-xs text-savr-500 dark:text-savr-400" numberOfLines={2}>
                <Text className="font-semibold text-savr-700 dark:text-savr-300">{getUser(previewComment.userId)?.displayName}: </Text>
                {previewComment.text}
              </Text>
              {commentCount > 1 && (
                <Text className="text-xs text-savr-400 mt-0.5">View all {commentCount} comments</Text>
              )}
            </View>
          </Pressable>
        )}

        <View className={cn("flex-row gap-6 pt-3 mt-1 border-t", ui.border.divider)}>
          <Pressable onPress={handleLike} className="flex-row items-center gap-1.5 min-h-[44px]">
            <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? colors.heart : colors.icon} />
            <Text className={`text-sm ${ui.text.muted}`}>{likeCount}</Text>
          </Pressable>
          <Pressable onPress={() => { hapticLight(); setShowComments(!showComments); }} className="flex-row items-center gap-1.5 min-h-[44px]">
            <Ionicons name="chatbubble-outline" size={20} color={colors.icon} />
            <Text className={`text-sm ${ui.text.muted}`}>{commentCount}</Text>
          </Pressable>
          {restaurant && (
            <Pressable
              onPress={() => shareReview(user.displayName, restaurant.id, restaurant.name, review.rating, review.text)}
              className="flex-row items-center gap-1.5 min-h-[44px]"
            >
              <Ionicons name="share-outline" size={20} color={colors.icon} />
            </Pressable>
          )}
          {isOwn && (
            <>
              <Pressable
                onPress={() => router.push(`/add-review?reviewId=${review.id}`)}
                className="flex-row items-center gap-1.5 min-h-[44px]"
              >
                <Ionicons name="create-outline" size={20} color={colors.icon} />
              </Pressable>
              <Pressable onPress={handleDelete} className="flex-row items-center gap-1.5 min-h-[44px]">
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </>
          )}
        </View>
        {showComments && (
          <View className="gap-2">
            {comments.map((c) => {
              const cu = getUser(c.userId);
              return (
                <View key={c.id} className="flex-row gap-2">
                  <Avatar name={cu?.displayName ?? "?"} src={cu?.avatarUrl} size="sm" />
                  <View className={cn("flex-1 rounded-xl px-3 py-2", ui.surface.inset)}>
                    <Text className={`text-xs font-semibold ${ui.text.secondary}`}>{cu?.displayName}</Text>
                    <Text className={`text-sm ${ui.text.secondary}`}>{c.text}</Text>
                  </View>
                </View>
              );
            })}
            {currentUserId && (
              <View className="flex-row gap-2 items-center">
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Add a comment..."
                  className={cn("flex-1 border rounded-xl px-3 py-2 text-sm min-h-[44px]", ui.surface.card, ui.border.subtle, ui.text.primary)}
                  placeholderTextColor={colors.placeholder}
                />
                <Button label="Post" onPress={() => { addComment(review.id, comment); setComment(""); }} className="px-4 py-2 min-h-[44px]" />
              </View>
            )}
          </View>
        )}
      </View>
    </Card>
  );
}

export const ReviewCard = memo(ReviewCardInner);
