import { useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { getTasteMatchDetails } from "@/lib/taste-match";
import { calculateTasteDNA } from "@/lib/taste-dna";
import { getLeaderboardRankings } from "@/lib/rankings";
import { averageOverallRating } from "@/lib/review-scores";
import { userProfileFallback } from "@/lib/navigation";
import { StackBackButton } from "@/components/navigation/StackBackButton";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TasteMatchBadge } from "@/components/social/TasteMatchBadge";
import { TastePersonalityCard } from "@/components/taste/TastePersonalityCard";
import { LeaderboardRow } from "@/components/rankings/Leaderboard";
import { formatPrice } from "@/lib/utils";
import { ui } from "@/constants/ui";

type FriendTab = "overview" | "reviews" | "rankings" | "taste-dna";

export default function UserScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { getUser, reviews, restaurants, dishes, currentUserId, isFollowing, toggleFollow } = useAppStore();
  const [tab, setTab] = useState<FriendTab>("overview");

  const user = getUser(id!);
  const userReviews = useMemo(
    () =>
      reviews
        .filter((r) => r.userId === id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviews, id],
  );

  const match =
    currentUserId && id !== currentUserId
      ? getTasteMatchDetails(currentUserId, id!, reviews, restaurants)
      : null;
  const myReviewCount = currentUserId ? reviews.filter((r) => r.userId === currentUserId).length : 0;

  const dna = useMemo(
    () => (id ? calculateTasteDNA(id!, reviews, dishes, restaurants) : null),
    [id, reviews, dishes, restaurants],
  );

  const rankings = useMemo(
    () => (id ? getLeaderboardRankings(id!, "all", reviews, restaurants, dishes).slice(0, 10) : []),
    [id, reviews, restaurants, dishes],
  );

  if (!user) {
    return (
      <>
        <Stack.Screen
          options={{
            headerLeft: (props) => (
              <StackBackButton {...props} fallback={userProfileFallback(from)} />
            ),
          }}
        />
        <View className={`flex-1 items-center justify-center ${ui.screen}`}>
          <Text className={ui.text.muted}>User not found.</Text>
        </View>
      </>
    );
  }

  const isSelf = currentUserId === id;

  return (
    <>
      <Stack.Screen
        options={{
          title: isSelf ? "Your Profile" : user.displayName,
          headerLeft: (props) => (
            <StackBackButton {...props} fallback={userProfileFallback(from)} />
          ),
        }}
      />
      <ScrollView className={`flex-1 ${ui.screen}`} contentContainerClassName="px-4 pb-8 gap-4">
      <View className="items-center pt-2 gap-2">
        <Avatar name={user.displayName} src={user.avatarUrl} size="xl" />
        <Text className={`text-xl font-bold ${ui.text.primary}`}>{user.displayName}</Text>
        <Text className={`text-sm ${ui.text.muted}`}>@{user.username}</Text>
        {user.bio ? (
          <Text className={`text-sm text-center px-4 ${ui.text.secondary}`}>{user.bio}</Text>
        ) : null}

        {match && !isSelf && (
          <View className="w-full mt-2">
            {match.percent > 0 ? (
              <TasteMatchBadge
                percent={match.percent}
                explanations={match.explanations}
                detail={match.detail}
                size="lg"
              />
            ) : (
              <Text className={`text-sm text-center px-4 ${ui.text.muted}`}>
                {myReviewCount === 0
                  ? "Rate a few restaurants to unlock taste match with this friend."
                  : "No overlap yet — rate more spots to see how your tastes compare."}
              </Text>
            )}
          </View>
        )}

        {!isSelf && (
          <View className="w-full gap-2 mt-2">
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
          <Text className={`text-2xl font-bold ${ui.text.primary}`}>{userReviews.length}</Text>
          <Text className={`text-xs ${ui.text.muted}`}>Reviews</Text>
        </Card>
        <Card className="flex-1 items-center py-3">
          <Text className={`text-2xl font-bold ${ui.text.primary}`}>
            {userReviews.length ? averageOverallRating(userReviews).toFixed(1) : "—"}
          </Text>
          <Text className={`text-xs ${ui.text.muted}`}>Avg Rating</Text>
        </Card>
        <Card className="flex-1 items-center py-3">
          <Text className={`text-2xl font-bold ${ui.text.primary}`}>{dna?.cuisinesTried ?? 0}</Text>
          <Text className={`text-xs ${ui.text.muted}`}>Cuisines</Text>
        </Card>
      </View>

      <SegmentedControl
        options={[
          { value: "overview" as const, label: "Overview" },
          { value: "reviews" as const, label: "Reviews" },
          { value: "rankings" as const, label: "Rankings" },
          { value: "taste-dna" as const, label: "Taste DNA" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "overview" && dna && (
        <View className="gap-3">
          <TastePersonalityCard personality={dna.personality} compact />
          <Card className="gap-3 p-4">
            <Text className={`text-sm font-semibold ${ui.text.primary}`}>Taste snapshot</Text>
            <SnapshotRow label="Top cuisine" value={dna.topCuisine ?? "—"} />
            <SnapshotRow
              label="Budget style"
              value={dna.preferredPriceLevel ? formatPrice(dna.preferredPriceLevel) : "—"}
            />
            <SnapshotRow label="Adventure score" value={String(dna.adventureScore)} />
            <SnapshotRow label="Hidden gem score" value={String(dna.hiddenGemScore)} />
            <SnapshotRow label="Favorite neighborhood" value={dna.mostVisitedCity ?? "—"} />
          </Card>
          {rankings.length > 0 && (
            <View className="gap-2">
              <Text className={`font-semibold ${ui.text.primary}`}>Top spots</Text>
              {rankings.slice(0, 3).map((entry) => (
                <LeaderboardRow
                  key={entry.restaurant_id}
                  entry={entry}
                  onPress={() => router.push(`/restaurant/${entry.restaurant_id}`)}
                />
              ))}
              <Button label="See all rankings" variant="ghost" onPress={() => setTab("rankings")} />
            </View>
          )}
        </View>
      )}

      {tab === "reviews" && (
        <View className="gap-3">
          {userReviews.length === 0 ? (
            <EmptyState
              icon="restaurant-outline"
              title="No reviews yet"
              description={`${user.displayName} hasn't rated any restaurants yet.`}
            />
          ) : (
            userReviews.map((r) => (
              <ReviewCard key={r.id} review={r} showAuthorLink={false} />
            ))
          )}
        </View>
      )}

      {tab === "rankings" && (
        <View className="gap-3">
          {rankings.length === 0 ? (
            <EmptyState icon="trophy-outline" title="No rankings yet" description="No reviewed restaurants to rank." />
          ) : (
            rankings.map((entry) => (
              <LeaderboardRow
                key={entry.restaurant_id}
                entry={entry}
                onPress={() => router.push(`/restaurant/${entry.restaurant_id}`)}
              />
            ))
          )}
        </View>
      )}

      {tab === "taste-dna" && dna && (
        <View className="gap-3">
          <TastePersonalityCard personality={dna.personality} />
          <Card className="gap-3 p-4">
            <Text className={`text-lg font-semibold ${ui.text.primary}`}>What they value</Text>
            <View className="flex-row flex-wrap gap-2">
              {(
                [
                  ["Food", dna.categoryAverages.foodQuality],
                  ["Service", dna.categoryAverages.service],
                  ["Atmosphere", dna.categoryAverages.atmosphere],
                  ["Value", dna.categoryAverages.value],
                ] as const
              ).map(([label, score]) => (
                <View key={label} className="rounded-lg px-3 py-2 bg-savr-100 dark:bg-savr-800">
                  <Text className={`text-[10px] uppercase ${ui.text.muted}`}>{label}</Text>
                  <Text className={`text-sm font-semibold ${ui.text.primary}`}>{score.toFixed(1)}</Text>
                </View>
              ))}
            </View>
          </Card>
          {dna.favoriteCuisines.length > 0 && (
            <Card className="gap-2 p-4">
              <Text className={`text-sm font-semibold ${ui.text.primary}`}>Favorite cuisines</Text>
              {dna.favoriteCuisines.slice(0, 5).map((c) => (
                <View key={c.cuisine} className="flex-row justify-between">
                  <Text className={ui.text.secondary}>{c.cuisine}</Text>
                  <Text className={ui.text.muted}>{c.count} visits · {c.avgRating.toFixed(1)}</Text>
                </View>
              ))}
            </Card>
          )}
        </View>
      )}
    </ScrollView>
    </>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className={`text-sm ${ui.text.muted}`}>{label}</Text>
      <Text className={`text-sm font-semibold ${ui.text.primary}`}>{value}</Text>
    </View>
  );
}
