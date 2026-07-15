import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useScrollToTop } from "@react-navigation/native";
import { useAppStore } from "@/store/useAppStore";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { BucketListCard } from "@/components/bookmarks/BucketListCard";
import { ListPreviewCard } from "@/components/lists/ListPreviewCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { getCurrentCoordinates } from "@/lib/location";
import {
  BITES_SEGMENTS,
  bitesCollectionIsEmpty,
  getBitesCollections,
  selectBitesItems,
  type BitesSegment,
} from "@/lib/bites";
import type { Coordinates } from "@/lib/places/types";
import type { Bookmark } from "@/lib/types";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";

export default function BitesScreen() {
  const colors = useThemedColors();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const { ensureRestaurantFromPlace, getMyLists, listItems, getRestaurant, refreshFeed, isRefreshing } =
    useAppStore();
  const { saved, updateStatus, remove } = useSavedRestaurants();
  const [segment, setSegment] = useState<BitesSegment>("want_to_try");
  const [coords, setCoords] = useState<Coordinates | null>(null);

  useEffect(() => {
    getCurrentCoordinates().then(setCoords);
  }, []);

  const collections = useMemo(() => getBitesCollections(saved), [saved]);
  const userLists = getMyLists();
  const isEmpty = bitesCollectionIsEmpty(collections, userLists.length);
  const segmentItems = selectBitesItems(collections, segment);

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

  const startReview = useCallback(
    async (bookmark: Bookmark) => {
      const restaurantId = await resolveRestaurantId(bookmark);
      if (restaurantId) {
        router.push(`/add-review?restaurantId=${restaurantId}`);
        return;
      }
      Alert.alert(
        "Open restaurant first",
        "Open this spot from Discover so we can attach a review.",
      );
    },
    [resolveRestaurantId],
  );

  const promptReview = useCallback((restaurantId: string | null, placeName: string) => {
    if (!restaurantId) {
      Alert.alert(
        "Marked as visited",
        `${placeName} is in your favorites. Add a review from the restaurant page when you're ready.`,
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

  const handleMoveToWantToTry = useCallback(
    async (bookmark: Bookmark) => {
      const result = await updateStatus(bookmark.id, "want_to_try");
      if (!result.ok) Alert.alert("Error", result.error);
    },
    [updateStatus],
  );

  const onRefresh = useCallback(() => {
    void refreshFeed();
  }, [refreshFeed]);

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-28 gap-5 pt-2"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.spinner} />
        }
      >
        <View className="gap-1">
          <Text className={`text-sm ${ui.text.muted}`}>Your food collection</Text>
          <Text className={`text-3xl font-bold ${ui.text.primary}`}>Bites</Text>
        </View>

        <SegmentedControl options={BITES_SEGMENTS} value={segment} onChange={setSegment} />

        {isEmpty ? (
          <EmptyState
            icon="bookmark-outline"
            title="Your Bites collection is empty."
            description="Save restaurants and dishes you want to remember."
            actionLabel="Explore Discover"
            onAction={() => router.push("/(tabs)/discover")}
          />
        ) : segment === "lists" ? (
          <View className="gap-3">
            <Button label="Create New List" onPress={() => router.push("/create-list")} />
            {userLists.length === 0 ? (
              <EmptyState
                icon="list-outline"
                title="No lists yet"
                description="Group date-night picks, must-try spots, or trip plans into shareable lists."
                actionLabel="Create a List"
                onAction={() => router.push("/create-list")}
              />
            ) : (
              userLists.map((list) => {
                const items = listItems
                  .filter((li) => li.listId === list.id)
                  .sort((a, b) => a.position - b.position);
                const previewNames = items
                  .map((item) => getRestaurant(item.restaurantId)?.name)
                  .filter(Boolean) as string[];

                return (
                  <ListPreviewCard
                    key={list.id}
                    name={list.name}
                    description={list.description}
                    spotCount={items.length}
                    previewNames={previewNames}
                    onPress={() => router.push({ pathname: "/list/[id]", params: { id: list.id } })}
                  />
                );
              })
            )}
          </View>
        ) : segmentItems.length === 0 ? (
          <EmptyState
            icon={segment === "favorites" ? "heart-outline" : "bookmark-outline"}
            title={segment === "favorites" ? "No favorites yet" : "Nothing saved to try"}
            description={
              segment === "favorites"
                ? "Mark a Want To Try spot as visited to move it into Favorites."
                : "Save restaurants from Discover to build your Want To Try list."
            }
            actionLabel="Explore Discover"
            onAction={() => router.push("/(tabs)/discover")}
          />
        ) : (
          <View className="gap-3">
            {segmentItems.map((bookmark) => (
              <BucketListCard
                key={bookmark.id}
                bookmark={bookmark}
                coords={coords}
                onPress={() => openBookmark(bookmark)}
                onMarkPlanned={
                  bookmark.status === "want_to_try" ? () => handleMarkPlanned(bookmark) : undefined
                }
                onMarkVisited={
                  bookmark.status !== "visited" ? () => handleMarkVisited(bookmark) : undefined
                }
                onLeaveReview={
                  bookmark.status === "visited" ? () => startReview(bookmark) : undefined
                }
                onMoveToWantToTry={
                  bookmark.status === "visited" ? () => handleMoveToWantToTry(bookmark) : undefined
                }
                onRemove={() => remove(bookmark.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
