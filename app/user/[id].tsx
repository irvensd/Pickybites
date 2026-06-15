import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { calculateTasteMatch } from "@/lib/taste-dna";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getUser, reviews, restaurants, currentUserId, isFollowing, toggleFollow } = useAppStore();
  const user = getUser(id!);
  const userReviews = reviews.filter((r) => r.userId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const match = currentUserId && id !== currentUserId ? calculateTasteMatch(currentUserId, id!, reviews, restaurants) : null;

  if (!user) return <View className="flex-1 items-center justify-center bg-savr-50"><Text className="text-savr-500">User not found.</Text></View>;

  return (
    <ScrollView className="flex-1 bg-savr-50" contentContainerClassName="px-4 pb-6 gap-4">
      <View className="items-center pt-2">
        <Avatar name={user.displayName} src={user.avatarUrl} size="xl" />
        <Text className="text-xl font-bold text-savr-900 mt-3">{user.displayName}</Text>
        <Text className="text-sm text-savr-500">@{user.username}</Text>
        {user.bio && <Text className="text-sm text-savr-600 mt-2 text-center">{user.bio}</Text>}
        {match !== null && <View className="mt-3 bg-savr-100 px-4 py-2 rounded-full flex-row gap-2"><Text className="text-sm text-savr-700">Taste Match</Text><Text className="text-sm font-bold text-savr-600">{match}%</Text></View>}
        {currentUserId !== id && <View className="mt-4 w-40"><Button label={isFollowing(id!) ? "Following" : "Follow"} variant={isFollowing(id!) ? "secondary" : "primary"} onPress={() => toggleFollow(id!)} /></View>}
      </View>
      <View className="flex-row gap-3">
        <Card className="flex-1 items-center py-3"><Text className="text-2xl font-bold">{userReviews.length}</Text><Text className="text-xs text-savr-500">Reviews</Text></Card>
        <Card className="flex-1 items-center py-3"><Text className="text-2xl font-bold">{userReviews.length ? (userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length).toFixed(1) : "—"}</Text><Text className="text-xs text-savr-500">Avg</Text></Card>
      </View>
      <Text className="font-semibold text-savr-900">Reviews</Text>
      {userReviews.map((r) => <ReviewCard key={r.id} review={r} />)}
    </ScrollView>
  );
}
