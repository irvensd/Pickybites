import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { getTasteMatchDetails } from "@/lib/taste-dna";
import { shareInvite } from "@/lib/share";
import { APP_NAME } from "@/constants/branding";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TasteMatchBadge } from "@/components/social/TasteMatchBadge";

export default function FriendsScreen() {
  const { users, currentUserId, reviews, restaurants, isFollowing, toggleFollow, follows } = useAppStore();
  const me = users.find((u) => u.id === currentUserId);
  const others = users.filter((u) => u.id !== currentUserId);
  const followingCount = follows.filter((f) => f.followerId === currentUserId).length;

  const sorted = [...others].sort((a, b) => {
    if (!currentUserId) return 0;
    const ma = getTasteMatchDetails(currentUserId, a.id, reviews, restaurants).percent;
    const mb = getTasteMatchDetails(currentUserId, b.id, reviews, restaurants).percent;
    return mb - ma;
  });

  return (
    <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="px-4 pb-6 gap-3">
      <Card className="gap-3">
        <View className="items-center py-2">
          <Text className="text-2xl font-bold text-savr-900 dark:text-savr-100">{followingCount}</Text>
          <Text className="text-xs text-savr-500 dark:text-savr-400">Following</Text>
        </View>
        <Button label={`Invite Friends to ${APP_NAME}`} variant="secondary" onPress={() => shareInvite(me?.displayName)} />
      </Card>

      {sorted.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No one here yet"
          description={`Invite friends to ${APP_NAME} to compare taste matches and see what they're eating.`}
          actionLabel={`Invite to ${APP_NAME}`}
          onAction={() => shareInvite(me?.displayName)}
        />
      ) : (
        <>
          <Text className="text-sm font-semibold text-savr-700 dark:text-savr-300">Sorted by taste match</Text>
          {sorted.map((user) => {
            const match = currentUserId
              ? getTasteMatchDetails(currentUserId, user.id, reviews, restaurants)
              : { percent: 0, detail: undefined };
            const count = reviews.filter((r) => r.userId === user.id).length;
            return (
              <Card key={user.id} className="flex-row items-center gap-3">
                <Pressable onPress={() => router.push(`/user/${user.id}`)}>
                  <Avatar name={user.displayName} src={user.avatarUrl} />
                </Pressable>
                <Pressable onPress={() => router.push(`/user/${user.id}`)} className="flex-1 gap-1">
                  <Text className="font-semibold text-savr-900 dark:text-savr-100">{user.displayName}</Text>
                  <Text className="text-xs text-savr-500 dark:text-savr-400">@{user.username} · {count} reviews</Text>
                  {match.percent > 0 ? (
                    <TasteMatchBadge percent={match.percent} detail={match.detail} size="sm" />
                  ) : (
                    <Text className="text-xs text-savr-400 dark:text-savr-500">Rate more spots to unlock taste match</Text>
                  )}
                </Pressable>
                <Button
                  label={isFollowing(user.id) ? "Following" : "Follow"}
                  variant={isFollowing(user.id) ? "secondary" : "primary"}
                  onPress={() => toggleFollow(user.id)}
                  className="px-4 py-2 min-h-[40px]"
                />
                <Button
                  label="Compare"
                  variant="ghost"
                  onPress={() => router.push({ pathname: "/compare/[id]", params: { id: user.id } })}
                  className="px-3 py-2 min-h-[40px]"
                />
              </Card>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}
