import { View, Text, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { getTasteMatchDetails } from "@/lib/taste-dna";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TasteMatchBadge } from "@/components/social/TasteMatchBadge";
import { ui } from "@/constants/ui";

export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getUser, reviews, restaurants, currentUserId, isFollowing, toggleFollow } = useAppStore();
  const user = getUser(id!);
  const userReviews = reviews.filter((r) => r.userId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const match =
    currentUserId && id !== currentUserId
      ? getTasteMatchDetails(currentUserId, id!, reviews, restaurants)
      : null;
  const myReviewCount = currentUserId ? reviews.filter((r) => r.userId === currentUserId).length : 0;

  if (!user) return <View className={`flex-1 items-center justify-center ${ui.screen}`}><Text className={ui.text.muted}>User not found.</Text></View>;

  return (
    <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="px-4 pb-6 gap-4">
      <View className="items-center pt-2">
        <Avatar name={user.displayName} src={user.avatarUrl} size="xl" />
        <Text className="text-xl font-bold text-savr-900 dark:text-savr-100 mt-3">{user.displayName}</Text>
        <Text className="text-sm text-savr-500 dark:text-savr-400">@{user.username}</Text>
        {user.bio && <Text className="text-sm text-savr-600 dark:text-savr-400 mt-2 text-center">{user.bio}</Text>}
        {match && currentUserId !== id && (
          <View className="mt-3 items-center gap-1">
            {match.percent > 0 ? (
              <TasteMatchBadge percent={match.percent} detail={match.detail} size="lg" />
            ) : (
              <Text className="text-sm text-savr-500 dark:text-savr-400 text-center px-4">
                {myReviewCount === 0
                  ? "Rate a few restaurants to unlock taste match with this friend."
                  : "No overlap yet — rate more spots to see how your tastes compare."}
              </Text>
            )}
          </View>
        )}
        {currentUserId !== id && (
          <View className="mt-4 w-full gap-2">
            <Button
              label={isFollowing(id!) ? "Following" : "Follow"}
              variant={isFollowing(id!) ? "secondary" : "primary"}
              onPress={() => toggleFollow(id!)}
            />
            <Button
              label="Compare Rankings"
              variant="secondary"
              onPress={() => router.push({ pathname: "/compare/[id]", params: { id: id! } })}
            />
          </View>
        )}
      </View>
      <View className="flex-row gap-3">
        <Card className="flex-1 items-center py-3">
          <Text className="text-2xl font-bold text-savr-900 dark:text-savr-100">{userReviews.length}</Text>
          <Text className={`text-xs ${ui.text.muted}`}>Reviews</Text>
        </Card>
        <Card className="flex-1 items-center py-3">
          <Text className="text-2xl font-bold text-savr-900 dark:text-savr-100">
            {userReviews.length ? (userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length).toFixed(1) : "—"}
          </Text>
          <Text className={`text-xs ${ui.text.muted}`}>Avg</Text>
        </Card>
      </View>
      <Text className="font-semibold text-savr-900 dark:text-savr-100">Reviews</Text>
      {userReviews.length === 0 ? (
        <EmptyState
          icon="restaurant-outline"
          title="No reviews yet"
          description={`${user.displayName} hasn't rated any restaurants on ForkLoop yet.`}
        />
      ) : (
        userReviews.map((r) => <ReviewCard key={r.id} review={r} />)
      )}
    </ScrollView>
  );
}
