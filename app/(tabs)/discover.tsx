import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useScrollToTop } from "@react-navigation/native";
import { useAppStore } from "@/store/useAppStore";
import { getRecommendations } from "@/lib/recommendations";
import { getDishDiscoveries } from "@/lib/dish-discovery";
import { ui } from "@/constants/ui";
import { CUISINES, type Cuisine } from "@/lib/types";
import { PlaceSearch } from "@/components/restaurants/PlaceSearch";
import { EmptyState } from "@/components/ui/EmptyState";
import { useThemedColors } from "@/lib/useThemedColors";
import { getCurrentCoordinates, distanceMeters } from "@/lib/location";
import { searchNearbyRestaurants, searchAreaRestaurants, isGooglePlacesConfigured } from "@/lib/places/google";
import type { PlaceResult, Coordinates } from "@/lib/places/types";
import { DiscoverMap } from "@/components/maps/DiscoverMap";
import { DISCOVER_TABS, filterRestaurantsForTab, type DiscoverTab } from "@/lib/discover-curated";
import { friendlyError } from "@/lib/errors";
import { hapticSuccess } from "@/lib/haptics";
import { formatDistance } from "@/lib/utils";
import { MAX_DISCOVER_RADIUS_METERS } from "@/lib/places/nearby-search";
import { AddToListSheet } from "@/components/lists/AddToListSheet";
import { DiscoverSectionHeader } from "@/components/discover/DiscoverSectionHeader";
import { DishPickCarousel } from "@/components/discover/DishPickCarousel";
import {
  DiscoverFilterPanel,
  DiscoverScreenHeader,
  DISTANCE_OPTIONS,
} from "@/components/discover/DiscoverFilterPanel";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { RestaurantListRow } from "@/components/restaurants/RestaurantListRow";
import { PlaceListRow } from "@/components/restaurants/PlaceListRow";
import { getCommunityRating } from "@/lib/restaurant-tags";

const DEFAULT_RADIUS = DISTANCE_OPTIONS[2].meters;

function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return undefined;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export default function DiscoverScreen() {
  const colors = useThemedColors();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const {
    currentUserId, users, reviews, restaurants, dishes, follows,
    refreshFeed, isRefreshing, ensureRestaurantFromPlace,
    toggleBookmark, isBookmarked, toggleRestaurantBookmark, isRestaurantBookmarked, bookmarks,
  } = useAppStore();
  const user = users.find((u) => u.id === currentUserId);
  const userCity = user?.city;

  const [cuisine, setCuisine] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [nearby, setNearby] = useState<PlaceResult[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [mapMode, setMapMode] = useState(false);
  const [radiusMeters, setRadiusMeters] = useState<number>(DEFAULT_RADIUS);
  const [isAreaSearch, setIsAreaSearch] = useState(false);
  const [addToListTarget, setAddToListTarget] = useState<{ id: string; name: string } | null>(null);
  const [curatedTab, setCuratedTab] = useState<DiscoverTab>("for-you");
  const [mapMounted, setMapMounted] = useState(false);

  const recs = currentUserId ? getRecommendations(currentUserId, reviews, restaurants, follows, 3, user, bookmarks) : [];

  const communityFeed = useMemo(() => {
    let items = filterRestaurantsForTab(curatedTab, restaurants, reviews, bookmarks, currentUserId, {
      userCoords: coords,
    });
    if (cuisine) items = items.filter((r) => r.cuisine === cuisine);
    return items.slice(0, 10);
  }, [curatedTab, restaurants, reviews, bookmarks, currentUserId, cuisine, coords]);

  const dishPicks =
    currentUserId && curatedTab === "for-you"
      ? getDishDiscoveries(currentUserId, reviews, dishes, restaurants, {
          cuisine: (cuisine as Cuisine) ?? user?.favoriteCuisines[0],
          coords: coords ?? undefined,
          radiusMeters,
          limit: 6,
        })
      : [];

  const loadNearby = useCallback(
    async (opts?: { center?: Coordinates; radius?: number; area?: boolean }) => {
      if (!isGooglePlacesConfigured()) return;
      setLoadingNearby(true);
      try {
        const c = opts?.center ?? coords ?? (await getCurrentCoordinates());
        const radius = Math.min(opts?.radius ?? radiusMeters, MAX_DISCOVER_RADIUS_METERS);
        if (c) {
          setCoords(c);
          if (opts?.radius != null) setRadiusMeters(radius);
          setIsAreaSearch(opts?.area ?? false);
          const places = opts?.area
            ? await searchAreaRestaurants(c, radius)
            : await searchNearbyRestaurants(c, radius);
          setNearby(places);
        }
      } catch (e) {
        Alert.alert("Location error", friendlyError(e, "Could not load nearby restaurants"));
      } finally {
        setLoadingNearby(false);
      }
    },
    [coords, radiusMeters],
  );

  const searchMapArea = useCallback(
    async (center: Coordinates, radius: number) => {
      await loadNearby({ center, radius, area: true });
    },
    [loadNearby],
  );

  const recenterToUser = useCallback(async () => {
    const c = await getCurrentCoordinates();
    if (!c) {
      Alert.alert("Location", "Enable location to find restaurants near you.");
      return;
    }
    await loadNearby({ center: c, radius: radiusMeters, area: false });
  }, [loadNearby, radiusMeters]);

  const selectDistance = useCallback(
    (meters: number) => {
      const radius = Math.min(meters, MAX_DISCOVER_RADIUS_METERS);
      setIsAreaSearch(false);
      setRadiusMeters(radius);
      loadNearby({ radius, area: false });
    },
    [loadNearby],
  );

  useEffect(() => {
    if (!isGooglePlacesConfigured()) return;
    loadNearby({ radius: DEFAULT_RADIUS, area: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapMode) {
      setMapMounted(false);
      return;
    }
    const id = requestAnimationFrame(() => setMapMounted(true));
    return () => cancelAnimationFrame(id);
  }, [mapMode]);

  useEffect(() => {
    if (mapMode) loadNearby({ radius: radiusMeters, area: isAreaSearch });
  }, [mapMode]);

  const onRefresh = useCallback(async () => {
    await refreshFeed();
    await loadNearby();
  }, [refreshFeed, loadNearby]);

  const openPlace = async (place: PlaceResult) => {
    const result = await ensureRestaurantFromPlace(place);
    if ("error" in result) {
      Alert.alert("Error", result.error);
      return;
    }
    router.push(`/restaurant/${result.id}`);
  };

  const ratePlace = async (place: PlaceResult) => {
    const result = await ensureRestaurantFromPlace(place);
    if ("error" in result) {
      Alert.alert("Error", result.error);
      return;
    }
    router.push(`/add-review?restaurantId=${result.id}`);
  };

  const handleBookmark = async (place: PlaceResult) => {
    const result = await toggleBookmark(place);
    if (result.ok) hapticSuccess();
    else if (!result.ok) Alert.alert("Save", result.error);
  };

  const openAddToList = (restaurantId: string, name: string) => {
    setAddToListTarget({ id: restaurantId, name });
  };

  const resolvePinRestaurant = async (id: string, type: "rated" | "nearby") => {
    if (type === "rated") return id;
    const place = nearby.find((p) => p.googlePlaceId === id);
    if (!place) return null;
    const result = await ensureRestaurantFromPlace(place);
    return "error" in result ? null : result.id;
  };

  const handleMapPin = async (id: string, type: "rated" | "nearby") => {
    if (type === "rated") {
      router.push(`/restaurant/${id}`);
      return;
    }
    const place = nearby.find((p) => p.googlePlaceId === id);
    if (place) await openPlace(place);
  };

  const handleMapBookmark = async (id: string, type: "rated" | "nearby") => {
    if (type === "nearby") {
      const place = nearby.find((p) => p.googlePlaceId === id);
      if (place) await handleBookmark(place);
      return;
    }
    const rest = restaurants.find((r) => r.id === id);
    if (rest?.googlePlaceId) {
      const place = nearby.find((p) => p.googlePlaceId === rest.googlePlaceId);
      if (place) await handleBookmark(place);
    }
  };

  const handleMapAddToList = async (id: string, type: "rated" | "nearby") => {
    const restaurantId = await resolvePinRestaurant(id, type);
    if (!restaurantId) return;
    const name =
      type === "rated"
        ? (restaurants.find((r) => r.id === id)?.name ?? "Restaurant")
        : (nearby.find((p) => p.googlePlaceId === id)?.name ?? "Restaurant");
    openAddToList(restaurantId, name);
  };

  const nearbyFiltered = useMemo(() => {
    let places = [...nearby];
    if (cuisine) places = places.filter((p) => p.cuisine === cuisine);
    if (coords) {
      places = places
        .filter((p) => distanceMeters(coords, p) <= radiusMeters * 1.02)
        .map((p) => ({ place: p, dist: distanceMeters(coords, p) }))
        .sort((a, b) => a.dist - b.dist)
        .map((x) => x.place);
    }
    return places;
  }, [nearby, cuisine, coords, radiusMeters]);

  const selectedRadiusLabel =
    DISTANCE_OPTIONS.find((o) => o.meters === radiusMeters)?.label ?? formatDistance(radiusMeters);

  const nearbyStatus = useMemo(() => {
    if (loadingNearby) return "Searching…";
    if (!coords) return "Turn on location to explore nearby.";
    if (nearbyFiltered.length === 0) return "No matches — try a wider radius or different cuisine.";
    return `${nearbyFiltered.length} spot${nearbyFiltered.length === 1 ? "" : "s"} within ${selectedRadiusLabel}`;
  }, [loadingNearby, coords, nearbyFiltered, selectedRadiusLabel]);

  const getPlaceRating = useCallback(
    (place: PlaceResult) => {
      const restaurant = restaurants.find((r) => r.googlePlaceId === place.googlePlaceId);
      if (!restaurant) return undefined;
      return avgRating(reviews.filter((r) => r.restaurantId === restaurant.id));
    },
    [restaurants, reviews],
  );

  const tabLabel = DISCOVER_TABS.find((t) => t.value === curatedTab)?.label ?? "Discover";
  const savrRestaurants = useMemo(
    () => restaurants.filter((r) => !cuisine || r.cuisine === cuisine),
    [restaurants, cuisine],
  );

  const filterPanel = (
    <DiscoverFilterPanel
      curatedTab={curatedTab}
      onTabChange={setCuratedTab}
      cuisine={cuisine}
      onCuisineChange={setCuisine}
      radiusMeters={radiusMeters}
      onRadiusChange={selectDistance}
      showDistance={isGooglePlacesConfigured()}
    />
  );

  if (mapMode) {
    return (
      <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
        <View className="px-4 pt-2 pb-3 gap-3">
          <DiscoverScreenHeader
            mapMode
            onMapModeChange={setMapMode}
            subtitle={`Map · ${selectedRadiusLabel}${isAreaSearch ? " · area search" : ""}`}
          />
          {filterPanel}
        </View>

        {loadingNearby && !coords ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.spinner} size="large" />
            <Text className={`mt-3 ${ui.text.muted}`}>Loading map…</Text>
          </View>
        ) : coords && mapMounted ? (
          <View className="flex-1 px-4 pb-4">
            <DiscoverMap
              fullScreen
              coords={coords}
              restaurants={savrRestaurants}
              nearbyPlaces={nearbyFiltered}
              searching={loadingNearby}
              onSearchArea={searchMapArea}
              onRecenterUser={recenterToUser}
              onPinPress={handleMapPin}
              onBookmarkPin={handleMapBookmark}
              onAddToListPin={handleMapAddToList}
              isPinBookmarked={(id, type) => type === "nearby" && isBookmarked(id)}
            />
          </View>
        ) : coords && !mapMounted ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.spinner} size="large" />
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <EmptyState
              icon="location-outline"
              title="Location needed"
              description="Enable location to see restaurants on the map."
              actionLabel="Try Again"
              onAction={() => loadNearby()}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  const showCommunity = curatedTab !== "for-you" && communityFeed.length > 0;
  const showForYouPicks = curatedTab === "for-you" && recs.length > 0;
  const showNearYou = isGooglePlacesConfigured();

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
      <AddToListSheet
        visible={addToListTarget != null}
        restaurantId={addToListTarget?.id ?? ""}
        restaurantName={addToListTarget?.name ?? ""}
        onClose={() => setAddToListTarget(null)}
      />

      <ScrollView
        ref={scrollRef}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-28"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.spinner} />
        }
      >
        <View className={`px-4 pt-2 pb-3 gap-3 ${ui.screen}`}>
          <DiscoverScreenHeader mapMode={false} onMapModeChange={setMapMode} />
          <PlaceSearch
            coords={coords}
            onSelect={ratePlace}
            placeholder="Search restaurants or neighborhoods…"
          />
          {filterPanel}
        </View>

        <View className="px-4 gap-8 pt-2">
          {curatedTab === "for-you" && dishPicks.length > 0 && (
            <View className="gap-3">
              <DiscoverSectionHeader
                icon="restaurant"
                iconColor={colors.brand}
                title="Best dishes near you"
                subtitle="From your taste profile"
              />
              <DishPickCarousel picks={dishPicks} />
            </View>
          )}

          {showForYouPicks && (
            <View className="gap-3">
              <DiscoverSectionHeader
                icon="sparkles"
                iconColor={colors.brand}
                title="Recommended for you"
                subtitle="Based on your ratings and follows"
              />
              <View className="gap-3">
                {recs.map((rec, i) => (
                  <View key={rec.restaurant.id}>
                    <RestaurantCard
                      restaurant={rec.restaurant}
                      reviews={reviews}
                      bookmarks={bookmarks}
                      userCity={userCity}
                      index={i}
                      isBookmarked={isRestaurantBookmarked(rec.restaurant)}
                      onBookmark={async () => {
                        const result = await toggleRestaurantBookmark(rec.restaurant);
                        if (result.ok) hapticSuccess();
                      }}
                    />
                    <Text className={`text-xs px-1 mt-1 ${ui.text.muted}`}>{rec.reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {showCommunity && (
            <View className="gap-3">
              <DiscoverSectionHeader
                icon="people"
                iconColor={colors.brand}
                title={tabLabel}
                subtitle={`Community picks${userCity ? ` · ${userCity}` : ""}`}
              />
              <View className="gap-2">
                {communityFeed.map((r) => (
                  <RestaurantListRow
                    key={r.id}
                    restaurant={r}
                    reviews={reviews}
                    onPress={() => router.push(`/restaurant/${r.id}`)}
                  />
                ))}
              </View>
            </View>
          )}

          {curatedTab === "for-you" && communityFeed.length > 0 && (
            <View className="gap-3">
              <DiscoverSectionHeader
                icon="bookmark"
                iconColor={colors.brand}
                title="On your radar"
                subtitle="Saved or not yet reviewed"
              />
              <View className="gap-2">
                {communityFeed.slice(0, 6).map((r) => (
                  <RestaurantListRow
                    key={r.id}
                    restaurant={r}
                    reviews={reviews}
                    onPress={() => router.push(`/restaurant/${r.id}`)}
                  />
                ))}
              </View>
            </View>
          )}

          {showNearYou && (
            <View className="gap-3">
              <DiscoverSectionHeader
                icon={isAreaSearch ? "map" : "location"}
                iconColor={colors.brand}
                title="Near you"
                subtitle={nearbyStatus}
                onAction={() => loadNearby()}
              />
              {loadingNearby ? (
                <ActivityIndicator color={colors.spinner} className="py-8" />
              ) : nearbyFiltered.length > 0 ? (
                <View className="gap-2">
                  {nearbyFiltered.map((place) => {
                    const linked = restaurants.find((r) => r.googlePlaceId === place.googlePlaceId);
                    const community = linked ? getCommunityRating(linked.id, reviews) : null;
                    return (
                      <PlaceListRow
                        key={place.googlePlaceId}
                        place={place}
                        distanceMeters={coords ? distanceMeters(coords, place) : undefined}
                        rating={community?.avgRating ?? getPlaceRating(place)}
                        reviewCount={community?.reviewCount}
                        onPress={() => openPlace(place)}
                        isBookmarked={isBookmarked(place.googlePlaceId)}
                        onBookmark={() => handleBookmark(place)}
                      />
                    );
                  })}
                </View>
              ) : (
                <EmptyState
                  icon="search-outline"
                  title="No spots found"
                  description="Widen the distance or clear the cuisine filter."
                  actionLabel="Reset filters"
                  onAction={() => {
                    setCuisine(null);
                    selectDistance(DEFAULT_RADIUS);
                  }}
                />
              )}
            </View>
          )}

          {!isGooglePlacesConfigured() && communityFeed.length === 0 && recs.length === 0 && (
            <EmptyState
              icon="key-outline"
              title="Places search not configured"
              description="Add your Google Places API key to discover real restaurants near you."
            />
          )}

          {curatedTab !== "for-you" && communityFeed.length === 0 && !loadingNearby && (
            <EmptyState
              icon="restaurant-outline"
              title={`No ${tabLabel.toLowerCase()} spots yet`}
              description="Try another category or add more reviews to grow the community feed."
              actionLabel="Browse For You"
              onAction={() => setCuratedTab("for-you")}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
