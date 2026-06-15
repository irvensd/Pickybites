import { View, Text, Pressable, TextInput } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
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

export function ReviewCard({ review, showRestaurant = true }: { review: Review; showRestaurant?: boolean }) {
  const { getUser, getRestaurant, getReviewPhoto, isLiked, toggleLike, likeCount, getComments, addComment, currentUserId } = useAppStore();
  const user = getUser(review.userId);
  const restaurant = getRestaurant(review.restaurantId);
  const photo = getReviewPhoto(review.id);
  const imageUrl = photo?.url ?? restaurant?.imageUrl;
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const comments = getComments(review.id);
  if (!user) return null;

  const handleLike = () => {
    const wasLiked = isLiked(review.id);
    toggleLike(review.id);
    if (!wasLiked) hapticSuccess();
    else hapticLight();
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
        <View className="flex-row gap-6 pt-3 mt-1 border-t border-savr-100 dark:border-savr-700">
          <Pressable onPress={handleLike} className="flex-row items-center gap-1.5 min-h-[44px]">
            <Ionicons name={isLiked(review.id) ? "heart" : "heart-outline"} size={20} color={isLiked(review.id) ? "#ef4444" : "#8B4A32"} />
            <Text className="text-sm text-savr-500 dark:text-savr-400">{likeCount(review.id)}</Text>
          </Pressable>
          <Pressable onPress={() => { hapticLight(); setShowComments(!showComments); }} className="flex-row items-center gap-1.5 min-h-[44px]">
            <Ionicons name="chatbubble-outline" size={20} color="#8B4A32" />
            <Text className="text-sm text-savr-500 dark:text-savr-400">{comments.length}</Text>
          </Pressable>
        </View>
        {showComments && (
          <View className="gap-2">
            {comments.map((c) => {
              const cu = getUser(c.userId);
              return (
                <View key={c.id} className="flex-row gap-2">
                  <Avatar name={cu?.displayName ?? "?"} src={cu?.avatarUrl} size="sm" />
                  <View className="flex-1 bg-savr-50 dark:bg-savr-900 rounded-xl px-3 py-2">
                    <Text className="text-xs font-semibold text-savr-800 dark:text-savr-200">{cu?.displayName}</Text>
                    <Text className="text-sm text-savr-600 dark:text-savr-300">{c.text}</Text>
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
                  className="flex-1 border border-savr-200 dark:border-savr-600 rounded-xl px-3 py-2 text-sm min-h-[44px] bg-white dark:bg-savr-900 text-savr-900 dark:text-savr-100"
                  placeholderTextColor="#D4C4B5"
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
