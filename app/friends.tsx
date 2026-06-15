import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { calculateTasteMatch } from "@/lib/taste-dna";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function FriendsScreen() {
  const { users, currentUserId, reviews, restaurants, isFollowing, toggleFollow, follows } = useAppStore();
  const others = users.filter((u) => u.id !== currentUserId);
  const followingCount = follows.filter((f) => f.followerId === currentUserId).length;

  return (
    <ScrollView className="flex-1 bg-savr-50" contentContainerClassName="px-4 pb-6 gap-3">
      <Card className="items-center py-3"><Text className="text-2xl font-bold text-savr-900">{followingCount}</Text><Text className="text-xs text-savr-500">Following</Text></Card>
      {others.map((user) => {
        const match = currentUserId ? calculateTasteMatch(currentUserId, user.id, reviews, restaurants) : 0;
        const count = reviews.filter((r) => r.userId === user.id).length;
        return (
          <Card key={user.id} className="flex-row items-center gap-3">
            <Pressable onPress={() => router.push(`/user/${user.id}`)}><Avatar name={user.displayName} src={user.avatarUrl} /></Pressable>
            <Pressable onPress={() => router.push(`/user/${user.id}`)} className="flex-1">
              <Text className="font-semibold text-savr-900">{user.displayName}</Text>
              <Text className="text-xs text-savr-500">@{user.username} · {count} reviews</Text>
              {match > 0 && <Text className="text-xs text-savr-600 font-medium">{match}% taste match</Text>}
            </Pressable>
            <Button label={isFollowing(user.id) ? "Following" : "Follow"} variant={isFollowing(user.id) ? "secondary" : "primary"} onPress={() => toggleFollow(user.id)} className="px-4 py-2 min-h-[40px]" />
          </Card>
        );
      })}
    </ScrollView>
  );
}
