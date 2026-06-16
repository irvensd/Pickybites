import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, type Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import type { Restaurant } from "@/lib/types";
import type { PlaceResult, Coordinates } from "@/lib/places/types";
import { APP_NAME } from "@/constants/branding";
import { regionToSearchRadius } from "@/lib/places/nearby-search";
import { loadMapRegion, saveMapRegion } from "@/lib/prefs";
import { MapPinSheet } from "./MapPinSheet";

export type MapPinType = "rated" | "nearby";

export type MapPin = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  subtitle?: string;
  type: MapPinType;
};

type ClusterPin = {
  kind: "cluster";
  id: string;
  count: number;
  latitude: number;
  longitude: number;
  pins: MapPin[];
};

type DisplayPin = MapPin | ClusterPin;

function buildRegion(coords: Coordinates, pins: MapPin[]): Region {
  if (pins.length === 0) {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  const lats = [coords.latitude, ...pins.map((p) => p.latitude)];
  const lngs = [coords.longitude, ...pins.map((p) => p.longitude)];
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const pad = 1.35;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * pad, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * pad, 0.02),
  };
}

function clusterPins(pins: MapPin[], region: Region): DisplayPin[] {
  if (pins.length < 12 || region.latitudeDelta < 0.02) return pins;

  const cellLat = region.latitudeDelta / 5;
  const cellLng = region.longitudeDelta / 5;
  const buckets = new Map<string, MapPin[]>();

  pins.forEach((pin) => {
    const latKey = Math.floor((pin.latitude - (region.latitude - region.latitudeDelta / 2)) / cellLat);
    const lngKey = Math.floor((pin.longitude - (region.longitude - region.longitudeDelta / 2)) / cellLng);
    const key = `${latKey}:${lngKey}`;
    const arr = buckets.get(key) ?? [];
    arr.push(pin);
    buckets.set(key, arr);
  });

  const result: DisplayPin[] = [];
  buckets.forEach((group, key) => {
    if (group.length < 3) {
      result.push(...group);
      return;
    }
    const latitude = group.reduce((s, p) => s + p.latitude, 0) / group.length;
    const longitude = group.reduce((s, p) => s + p.longitude, 0) / group.length;
    result.push({
      kind: "cluster",
      id: `cluster-${key}`,
      count: group.length,
      latitude,
      longitude,
      pins: group,
    });
  });
  return result;
}

export function DiscoverMap({
  coords,
  restaurants,
  nearbyPlaces,
  onPinPress,
  onSearchArea,
  onRecenterUser,
  onBookmarkPin,
  onAddToListPin,
  isPinBookmarked,
  searching = false,
  fullScreen = false,
}: {
  coords: Coordinates;
  restaurants: Restaurant[];
  nearbyPlaces: PlaceResult[];
  onPinPress: (id: string, type: MapPinType) => void;
  onSearchArea?: (center: Coordinates, radiusMeters: number) => void;
  onRecenterUser?: () => void;
  onBookmarkPin?: (id: string, type: MapPinType) => void;
  onAddToListPin?: (id: string, type: MapPinType) => void;
  isPinBookmarked?: (id: string, type: MapPinType) => boolean;
  searching?: boolean;
  fullScreen?: boolean;
}) {
  const mapRef = useRef<MapView>(null);
  const userMovedMap = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [savedRegion, setSavedRegion] = useState<Region | null>(null);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);

  useEffect(() => {
    loadMapRegion().then((r) => {
      if (r) setSavedRegion(r);
    });
  }, []);

  const pins = useMemo<MapPin[]>(() => {
    const ratedIds = new Set<string>();

    const rated = restaurants
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => {
        ratedIds.add(r.googlePlaceId ?? r.id);
        return {
          id: r.id,
          title: r.name,
          latitude: r.latitude!,
          longitude: r.longitude!,
          subtitle: `Rated on ${APP_NAME}`,
          type: "rated" as const,
        };
      });

    const nearby = nearbyPlaces
      .filter((p) => !ratedIds.has(p.googlePlaceId))
      .map((p) => ({
        id: p.googlePlaceId,
        title: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        subtitle: p.cuisine,
        type: "nearby" as const,
      }));

    return [...rated, ...nearby];
  }, [restaurants, nearbyPlaces]);

  const region = useMemo(() => buildRegion(coords, pins), [coords, pins]);
  const initialRegion = savedRegion ?? region;

  const displayPins = useMemo(
    () => clusterPins(pins, mapRegion ?? initialRegion),
    [pins, mapRegion, initialRegion],
  );

  useEffect(() => {
    if (!mapRef.current || pins.length === 0 || userMovedMap.current) return;
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        pins.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
        {
          edgePadding: { top: 60, right: 40, bottom: selectedPin ? 220 : 120, left: 40 },
          animated: true,
        },
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [pins, selectedPin]);

  const persistRegion = useCallback((r: Region) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveMapRegion({
        latitude: r.latitude,
        longitude: r.longitude,
        latitudeDelta: r.latitudeDelta,
        longitudeDelta: r.longitudeDelta,
      });
    }, 800);
  }, []);

  const handleSearchArea = () => {
    const active = mapRegion ?? region;
    onSearchArea?.(
      { latitude: active.latitude, longitude: active.longitude },
      regionToSearchRadius(active),
    );
  };

  const zoomToCluster = (cluster: ClusterPin) => {
    userMovedMap.current = true;
    mapRef.current?.animateToRegion(
      {
        latitude: cluster.latitude,
        longitude: cluster.longitude,
        latitudeDelta: Math.max((mapRegion ?? region).latitudeDelta / 3, 0.008),
        longitudeDelta: Math.max((mapRegion ?? region).longitudeDelta / 3, 0.008),
      },
      400,
    );
  };

  const height = fullScreen ? undefined : 320;

  return (
    <View
      className={fullScreen ? "flex-1" : "rounded-2xl overflow-hidden border border-savr-200 dark:border-savr-700"}
      style={fullScreen ? { flex: 1 } : { height }}
    >
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={Platform.OS === "android"}
        mapPadding={{ top: 8, right: 8, bottom: selectedPin ? 200 : 88, left: 8 }}
        onRegionChangeComplete={(r) => {
          userMovedMap.current = true;
          setMapRegion(r);
          persistRegion(r);
        }}
      >
        {displayPins.map((item) => {
          if ("kind" in item && item.kind === "cluster") {
            return (
              <Marker
                key={item.id}
                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                onPress={() => zoomToCluster(item)}
              >
                <View className="bg-savr-600 rounded-full min-w-[36px] h-9 px-2 items-center justify-center border-2 border-white">
                  <Text className="text-white font-bold text-sm">{item.count}</Text>
                </View>
              </Marker>
            );
          }
          const pin = item as MapPin;
          return (
            <Marker
              key={`${pin.type}-${pin.id}`}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
              pinColor={pin.type === "rated" ? "#A85D3F" : "#B8956F"}
              onPress={() => setSelectedPin(pin)}
            />
          );
        })}
      </MapView>

      {pins.length === 0 && !searching && (
        <View className="absolute inset-0 items-center justify-center bg-black/20 px-6">
          <View className="bg-white dark:bg-savr-800 rounded-2xl p-4 items-center gap-2 max-w-xs">
            <Ionicons name="map-outline" size={32} color="#A85D3F" />
            <Text className="font-semibold text-savr-900 dark:text-savr-100 text-center">No pins yet</Text>
            <Text className="text-sm text-savr-500 dark:text-savr-400 text-center">
              Pan the map, then tap Search this area.
            </Text>
          </View>
        </View>
      )}

      {onSearchArea && (
        <View className="absolute top-3 left-0 right-0 items-center px-4">
          <Pressable
            onPress={handleSearchArea}
            disabled={searching}
            className="flex-row items-center gap-2 bg-savr-600 rounded-full px-4 py-2.5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            {searching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={18} color="#fff" />
            )}
            <Text className="text-white font-semibold text-sm">
              {searching ? "Searching..." : "Search this area"}
            </Text>
          </Pressable>
        </View>
      )}

      <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between" style={{ marginBottom: selectedPin ? 160 : 0 }}>
        <View className="flex-row gap-2">
          <View className="flex-row items-center gap-1.5 bg-white/95 dark:bg-savr-900/95 px-2.5 py-1.5 rounded-full">
            <View className="w-2.5 h-2.5 rounded-full bg-savr-600" />
            <Text className="text-xs text-savr-700 dark:text-savr-200">Rated</Text>
          </View>
          <View className="flex-row items-center gap-1.5 bg-white/95 dark:bg-savr-900/95 px-2.5 py-1.5 rounded-full">
            <View className="w-2.5 h-2.5 rounded-full bg-savr-400" />
            <Text className="text-xs text-savr-700 dark:text-savr-200">Nearby</Text>
          </View>
        </View>
        <View className="bg-white/95 dark:bg-savr-900/95 px-2.5 py-1.5 rounded-full">
          <Text className="text-xs font-semibold text-savr-700 dark:text-savr-200">{pins.length} spots</Text>
        </View>
      </View>

      <Pressable
        onPress={() => {
          userMovedMap.current = false;
          setSelectedPin(null);
          if (onRecenterUser) {
            onRecenterUser();
            return;
          }
          mapRef.current?.animateToRegion(region, 500);
        }}
        className="absolute top-3 right-3 bg-white dark:bg-savr-800 rounded-full p-2"
        style={{ marginTop: onSearchArea ? 48 : 0 }}
      >
        <Ionicons name="locate" size={20} color="#A85D3F" />
      </Pressable>

      {selectedPin && (
        <MapPinSheet
          title={selectedPin.title}
          subtitle={selectedPin.subtitle}
          type={selectedPin.type}
          isBookmarked={isPinBookmarked?.(selectedPin.id, selectedPin.type)}
          onClose={() => setSelectedPin(null)}
          onView={() => {
            setSelectedPin(null);
            onPinPress(selectedPin.id, selectedPin.type);
          }}
          onRate={() => {
            setSelectedPin(null);
            onPinPress(selectedPin.id, selectedPin.type);
          }}
          onBookmark={
            onBookmarkPin
              ? () => onBookmarkPin(selectedPin.id, selectedPin.type)
              : undefined
          }
          onAddToList={
            onAddToListPin
              ? () => onAddToListPin(selectedPin.id, selectedPin.type)
              : undefined
          }
        />
      )}
    </View>
  );
}
