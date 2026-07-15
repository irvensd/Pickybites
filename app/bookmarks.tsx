import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { BucketListProgress } from "@/components/bookmarks/BucketListProgress";
import { BucketListCard } from "@/components/bookmarks/BucketListCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentCoordinates } from "@/lib/location";
import type { Coordinates } from "@/lib/places/types";
import type { Bookmark } from "@/lib/types";
import { ui } from "@/constants/ui";

function Section({
  title,
  subtitle,
  items,
  coords,
  onOpen,
  onMarkPlanned,
  onMarkVisited,
  onRemove,
}: {
  title: string;
  subtitle?: string;
  items: Bookmark[];
  coords: Coordinates | null;
  onOpen: (bookmark: Bookmark) => void;
  onMarkPlanned: (bookmark: Bookmark) => void;
  onMarkVisited: (bookmark: Bookmark) => void;
  onRemove: (bookmarkId: string) => void;
}) {
  if (!items.length) return null;

  return (
    <View className="gap-3">
      <View>
        <Text className={`text-lg font-bold ${ui.text.primary}`}>{title}</Text>
        {subtitle ? (
          <Text className={`text-sm mt-0.5 ${ui.text.muted}`}>{subtitle}</Text>
        ) : null}
      </View>
      {items.map((bookmark) => (
        <BucketListCard
          key={bookmark.id}
          bookmark={bookmark}
          coords={coords}
          onPress={() => onOpen(bookmark)}
          onMarkPlanned={
            bookmark.status === "want_to_try"
              ? () => onMarkPlanned(bookmark)
              : undefined
          }
          onMarkVisited={
            bookmark.status !== "visited" ? () => onMarkVisited(bookmark) : undefined
          }
          onRemove={() => onRemove(bookmark.id)}
        />
      ))}
    </View>
  );
}

export default function BookmarksScreen() {
  const { ensureRestaurantFromPlace } = useAppStore();
  const { saved, stats, sections, updateStatus, remove, isEmpty } = useSavedRestaurants();
  const [coords, setCoords] = useState<Coordinates | null>(null);

  useEffect(() => {
    getCurrentCoordinates().then(setCoords);
  }, []);

  const activeNotInSections = useMemo(() => {
    const shown = new Set([
      ...sections.recentlySaved.map((b) => b.id),
      ...sections.plannedThisWeek.map((b) => b.id),
    ]);
    return sections.active.filter((b) => !shown.has(b.id));
  }, [sections]);

  const resolveRestaurantId = useCallback(
    async (bookmark: Bookmark): Promise<string | null> => {
      if (bookmark.restaurantId) return bookmark.restaurantId;
      if (!bookmark.googlePlaceId || bookmark.latitude == null || bookmark.longitude == null) {
        return null;
      }
      const result = await ensureRestaurantFromPlace({
        googlePlaceId: bookmark.googlePlaceId,
        name: bookmark.placeName,
        address: bookmark.placeAddress,
        city: bookmark.placeCity,
        cuisine: bookmark.placeCuisine ?? "American",
        priceLevel: bookmark.placePriceLevel ?? 2,
        imageUrl: bookmark.placeImageUrl,
        latitude: bookmark.latitude,
        longitude: bookmark.longitude,
      });
      if ("error" in result) return null;
      return result.id;
    },
    [ensureRestaurantFromPlace],
  );

  const openBookmark = useCallback(
    async (bookmark: Bookmark) => {
      const restaurantId = await resolveRestaurantId(bookmark);
      if (restaurantId) {
        router.push(`/restaurant/${restaurantId}`);
      }
    },
    [resolveRestaurantId],
  );

  const promptReview = useCallback((restaurantId: string | null, placeName: string) => {
    if (!restaurantId) {
      Alert.alert(
        "Marked as visited",
        `${placeName} is on your completed list. Add a review from the restaurant page when you're ready.`,
      );
      return;
    }
    Alert.alert(
      "You visited!",
      `Capture the experience at ${placeName}. Leave a review now?`,
      [
        { text: "Later", style: "cancel" },
        {
          text: "Leave Review",
          onPress: () => router.push(`/add-review?restaurantId=${restaurantId}`),
        },
      ],
    );
  }, []);

  const handleMarkPlanned = useCallback(
    async (bookmark: Bookmark) => {
      const result = await updateStatus(bookmark.id, "planned");
      if (!result.ok) Alert.alert("Error", result.error);
    },
    [updateStatus],
  );

  const handleMarkVisited = useCallback(
    async (bookmark: Bookmark) => {
      const restaurantId = await resolveRestaurantId(bookmark);
      const result = await updateStatus(bookmark.id, "visited");
      if (!result.ok) {
        Alert.alert("Error", result.error);
        return;
      }
      promptReview(restaurantId ?? result.restaurantId, bookmark.placeName);
    },
    [updateStatus, resolveRestaurantId, promptReview],
  );

  if (isEmpty) {
    return (
      <ScrollView className={`flex-1 ${ui.screen}`} contentContainerClassName="px-4 pb-6 flex-1">
        <EmptyState
          icon="bookmark-outline"
          title="Your Bites collection is empty."
          description="Save restaurants and dishes you want to remember."
          actionLabel="Explore Discover"
          onAction={() => router.push("/(tabs)/discover")}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView className={`flex-1 ${ui.screen}`} contentContainerClassName="px-4 pb-8 gap-6">
      <BucketListProgress stats={stats} />

      <Section
        title="Recently Saved"
        subtitle="Fresh picks on your list"
        items={sections.recentlySaved}
        coords={coords}
        onOpen={openBookmark}
        onMarkPlanned={handleMarkPlanned}
        onMarkVisited={handleMarkVisited}
        onRemove={remove}
      />

      <Section
        title="Planned This Week"
        subtitle="On the calendar — time to go"
        items={sections.plannedThisWeek}
        coords={coords}
        onOpen={openBookmark}
        onMarkPlanned={handleMarkPlanned}
        onMarkVisited={handleMarkVisited}
        onRemove={remove}
      />

      {activeNotInSections.length > 0 ? (
        <Section
          title="On Your List"
          subtitle="Still collecting this experience"
          items={activeNotInSections}
          coords={coords}
          onOpen={openBookmark}
          onMarkPlanned={handleMarkPlanned}
          onMarkVisited={handleMarkVisited}
          onRemove={remove}
        />
      ) : null}

      <Section
        title="Completed"
        subtitle="Experiences you've checked off"
        items={sections.completed}
        coords={coords}
        onOpen={openBookmark}
        onMarkPlanned={handleMarkPlanned}
        onMarkVisited={handleMarkVisited}
        onRemove={remove}
      />
    </ScrollView>
  );
}
