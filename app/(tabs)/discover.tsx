import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { getRecommendations } from "@/lib/recommendations";
import { getDishDiscoveries } from "@/lib/dish-discovery";
import { APP_NAME } from "@/constants/branding";
import { ui } from "@/constants/ui";
import { CUISINES, type Cuisine } from "@/lib/types";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { PlaceResultCard } from "@/components/restaurants/PlaceResultCard";
import { PlaceSearch } from "@/components/restaurants/PlaceSearch";
import { Tag } from "@/components/ui/Tag";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { useThemedColors } from "@/lib/useThemedColors";
import { getCurrentCoordinates, distanceMeters } from "@/lib/location";
import { searchNearbyRestaurants, searchAreaRestaurants, isGooglePlacesConfigured } from "@/lib/places/google";
import type { PlaceResult, Coordinates } from "@/lib/places/types";
import { DiscoverMap } from "@/components/maps/DiscoverMap";
import { getTrendingRestaurants } from "@/lib/trending";
import { DISCOVER_TABS, filterRestaurantsForTab, type DiscoverTab } from "@/lib/discover-curated";
import { friendlyError } from "@/lib/errors";
import { hapticSuccess } from "@/lib/haptics";
import { formatDistance } from "@/lib/utils";
import { MAX_DISCOVER_RADIUS_METERS } from "@/lib/places/nearby-search";
import { AddToListSheet } from "@/components/lists/AddToListSheet";
import { DiscoverSectionHeader } from "@/components/discover/DiscoverSectionHeader";
import { DishPickCarousel } from "@/components/discover/DishPickCarousel";
import { FadeInView } from "@/components/ui/FadeInView";
import { getCommunityRating } from "@/lib/restaurant-tags";

const METERS_PER_MILE = 1609.34;

const DISTANCE_OPTIONS = [
  { label: "0.5 mi", meters: 800 },
  { label: "1 mi", meters: Math.round(METERS_PER_MILE) },
  { label: "3 mi", meters: Math.round(METERS_PER_MILE * 3) },
  { label: "5 mi", meters: Math.round(METERS_PER_MILE * 5) },
  { label: "10 mi", meters: MAX_DISCOVER_RADIUS_METERS },
] as const;

const DEFAULT_RADIUS = DISTANCE_OPTIONS[2].meters;

function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return undefined;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export default function DiscoverScreen() {
  const colors = useThemedColors();
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
  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS);
  const [isAreaSearch, setIsAreaSearch] = useState(false);
  const [addToListTarget, setAddToListTarget] = useState<{ id: string; name: string } | null>(null);
  const [curatedTab, setCuratedTab] = useState<DiscoverTab>("for-you");
  const [mapMounted, setMapMounted] = useState(false);

  const recs = currentUserId ? getRecommendations(currentUserId, reviews, restaurants, follows, 3, user, bookmarks) : [];
  let curatedRestaurants = useMemo(() => {
    let items = filterRestaurantsForTab(curatedTab, restaurants, reviews, bookmarks, currentUserId, {
      userCoords: coords,
    });
    if (cuisine) items = items.filter((r) => r.cuisine === cuisine);
    return items.slice(0, 12);
  }, [curatedTab, restaurants, reviews, bookmarks, currentUserId, cuisine, coords]);
  const dishPicks = currentUserId
    ? getDishDiscoveries(currentUserId, reviews, dishes, restaurants, {
        cuisine: (cuisine as Cuisine) ?? user?.favoriteCuisines[0],
        coords: coords ?? undefined,
        radiusMeters,
        limit: 6,
      })
    : [];
  const trending = getTrendingRestaurants(userCity, reviews, restaurants, 3);

  const savrRestaurants = useMemo(
    () => restaurants.filter((r) => !cuisine || r.cuisine === cuisine),
    [restaurants, cuisine],
  );

  const loadNearby = useCallback(async (opts?: { center?: Coordinates; radius?: number; area?: boolean }) => {
    if (!isGooglePlacesConfigured()) return;
    setLoadingNearby(true);
    try {
      const c = opts?.center ?? coords ?? await getCurrentCoordinates();
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
  }, [coords, radiusMeters]);

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
    else if (!result.ok) Alert.alert("Bookmark", result.error);
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
    const name = type === "rated"
      ? restaurants.find((r) => r.id === id)?.name ?? "Restaurant"
      : nearby.find((p) => p.googlePlaceId === id)?.name ?? "Restaurant";
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
    const distances = nearbyFiltered.map((p) => distanceMeters(coords!, p));
    const min = Math.min(...distances);
    const max = Math.max(...distances);
    return `${nearbyFiltered.length} spot${nearbyFiltered.length === 1 ? "" : "s"} · ${formatDistance(min)}–${formatDistance(max)} away`;
  }, [loadingNearby, coords, nearbyFiltered]);

  const getPlaceRating = useCallback(
    (place: PlaceResult) => {
      const restaurant = restaurants.find((r) => r.googlePlaceId === place.googlePlaceId);
      if (!restaurant) return undefined;
      return avgRating(reviews.filter((r) => r.restaurantId === restaurant.id));
    },
    [restaurants, reviews],
  );

  const toggleMap = (map: boolean) => {
    setMapMode(map);
  };

  const cuisineFilters = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
      <Tag label="All" active={!cuisine} onPress={() => setCuisine(null)} />
      {CUISINES.slice(0, 10).map((c) => (
        <Tag key={c} label={c} active={cuisine === c} onPress={() => setCuisine(cuisine === c ? null : c)} />
      ))}
    </ScrollView>
  );

  const distanceFilters = isGooglePlacesConfigured() ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
      {DISTANCE_OPTIONS.map((opt) => (
        <Tag
          key={opt.meters}
          label={opt.label}
          active={radiusMeters === opt.meters}
          onPress={() => selectDistance(opt.meters)}
        />
      ))}
    </ScrollView>
  ) : null;

  const stickyHeader = (
    <View className={`px-4 pt-2 pb-3 gap-3 ${ui.screen}`}>
      <View>
        <Text className={`text-2xl font-bold ${ui.text.primary}`}>Discover</Text>
        <Text className={`text-sm mt-0.5 ${ui.text.muted}`}>
          {userCity ? `Explore ${userCity} and beyond` : "Find your next favorite spot"}
        </Text>
      </View>

      <SegmentedControl
        variant="brand"
        options={[
          { value: "list", label: "List" },
          { value: "map", label: "Map" },
        ]}
        value={mapMode ? "map" : "list"}
        onChange={(v) => toggleMap(v === "map")}
      />

      {!mapMode && (
        <PlaceSearch
          coords={coords}
          onSelect={ratePlace}
          placeholder="Search restaurants, neighborhoods, cities…"
        />
      )}

      {cuisineFilters}

      {!mapMode && isGooglePlacesConfigured() && distanceFilters}

      {!mapMode && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {DISCOVER_TABS.map((tab) => (
            <Tag
              key={tab.value}
              label={tab.label}
              active={curatedTab === tab.value}
              onPress={() => setCuratedTab(tab.value)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (mapMode) {
    return (
      <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
        <View className="px-4 pt-2 pb-2 gap-3">
          <View>
            <Text className={`text-2xl font-bold ${ui.text.primary}`}>Discover</Text>
            <Text className={`text-sm mt-0.5 ${ui.text.muted}`}>Map view · {selectedRadiusLabel}</Text>
          </View>
          <SegmentedControl
            variant="brand"
            options={[
              { value: "list", label: "List" },
              { value: "map", label: "Map" },
            ]}
            value="map"
            onChange={(v) => toggleMap(v === "map")}
          />
          {cuisineFilters}
          {distanceFilters}
          {isAreaSearch && (
            <Text className={`text-xs ${ui.text.muted}`}>
              Map area search — tap locate to return to you.
            </Text>
          )}
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
            <Text className={`mt-3 ${ui.text.muted}`}>Opening map…</Text>
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

  return (
    <SafeAreaView className={`flex-1 ${ui.screen}`} edges={["top"]}>
      <AddToListSheet
        visible={addToListTarget != null}
        restaurantId={addToListTarget?.id ?? ""}
        restaurantName={addToListTarget?.name ?? ""}
        onClose={() => setAddToListTarget(null)}
      />

      <ScrollView
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-28"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.spinner} />}
      >
        {stickyHeader}

        <View className="px-4 gap-6 pt-2">
          {curatedRestaurants.length > 0 && (
            <FadeInView key={curatedTab} className="gap-3">
              <DiscoverSectionHeader
                icon="sparkles"
                iconColor={colors.brand}
                title={DISCOVER_TABS.find((t) => t.value === curatedTab)?.label ?? "Curated"}
                subtitle="Picked from your taste profile and community activity"
              />
              <View className="gap-3">
                {curatedRestaurants.map((r, i) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    reviews={reviews}
                    bookmarks={bookmarks}
                    userCity={userCity}
                    index={i}
                    isBookmarked={isRestaurantBookmarked(r)}
                    onBookmark={async () => {
                      const result = await toggleRestaurantBookmark(r);
                      if (result.ok) hapticSuccess();
                      else if (!result.ok) Alert.alert("Save", result.error);
                    }}
                  />
                ))}
              </View>
            </FadeInView>
          )}

          {dishPicks.length > 0 && (
            <View className="gap-3">
              <DiscoverSectionHeader
                icon="restaurant"
                iconColor={colors.brand}
                title="Best dishes near you"
                subtitle="Based on your taste profile"
              />
              <DishPickCarousel picks={dishPicks} />
            </View>
          )}

          {isGooglePlacesConfigured() && (
            <View className="gap-3">
              <DiscoverSectionHeader
                icon={isAreaSearch ? "map" : "location"}
                iconColor={colors.brand}
                title={isAreaSearch ? "Map area" : "Near you"}
                subtitle={nearbyStatus}
                onAction={() => loadNearby()}
              />
              {loadingNearby ? (
                <ActivityIndicator color={colors.spinner} className="py-8" />
              ) : nearbyFiltered.length > 0 ? (
                <View className="gap-3">
                  {nearbyFiltered.map((place, i) => {
                    const linked = restaurants.find((r) => r.googlePlaceId === place.googlePlaceId);
                    const community = linked ? getCommunityRating(linked.id, reviews) : null;
                    return (
                      <PlaceResultCard
                        key={place.googlePlaceId}
                        place={place}
                        index={i}
                        savrRating={community?.avgRating ?? getPlaceRating(place)}
                        reviewCount={community?.reviewCount}
                        restaurantId={linked?.id}
                        reviews={reviews}
                        bookmarks={bookmarks}
                        restaurants={restaurants}
                        userCity={userCity}
                        onPress={() => openPlace(place)}
                        distanceMeters={coords ? distanceMeters(coords, place) : undefined}
                        isBookmarked={isBookmarked(place.googlePlaceId)}
                        onBookmark={() => handleBookmark(place)}
                        onAddToList={async () => {
                          const result = await ensureRestaurantFromPlace(place);
                          if (!("error" in result)) openAddToList(result.id, place.name);
                        }}
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

          {trending.length > 0 && (
            <View className="gap-3">
              <DiscoverSectionHeader
                icon="flame"
                iconColor={colors.brand}
                title={`Trending${userCity ? ` in ${userCity}` : ""}`}
                subtitle="Most reviewed this week"
              />
              <View className="gap-3">
                {trending.map(({ restaurant }, i) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    reviews={reviews}
                    bookmarks={bookmarks}
                    userCity={userCity}
                    index={i}
                    isBookmarked={isRestaurantBookmarked(restaurant)}
                    onBookmark={async () => {
                      const result = await toggleRestaurantBookmark(restaurant);
                      if (result.ok) hapticSuccess();
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {!cuisine && recs.length > 0 && (
            <View className="gap-3">
              <DiscoverSectionHeader
                icon="sparkles"
                iconColor={colors.brand}
                title="Picked for you"
                subtitle="From your ratings and follows"
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
                    />
                    <Text className={`text-xs px-1 mt-1 ${ui.text.muted}`}>{rec.reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {savrRestaurants.length > 0 && (
            <View className="gap-3">
              <DiscoverSectionHeader
                icon="star"
                iconColor={colors.brand}
                title={`Rated on ${APP_NAME}`}
                subtitle={`${savrRestaurants.length} in your taste map`}
              />
              <View className="gap-3">
                {savrRestaurants.slice(0, 8).map((r, i) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    reviews={reviews}
                    bookmarks={bookmarks}
                    userCity={userCity}
                    index={i}
                  />
                ))}
              </View>
            </View>
          )}

          {!isGooglePlacesConfigured() && savrRestaurants.length === 0 && (
            <EmptyState
              icon="key-outline"
              title="Places search not configured"
              description="Add your Google Places API key to discover real restaurants near you."
            />
          )}

          {savrRestaurants.length === 0 && !loadingNearby && isGooglePlacesConfigured() && nearbyFiltered.length === 0 && (
            <EmptyState
              icon="restaurant-outline"
              title="Start exploring"
              description="Search above or pick a spot from Near You to leave the first review."
              actionLabel="Write a Review"
              onAction={() => router.push("/add-review")}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
