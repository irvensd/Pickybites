import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, LayoutChangeEvent } from "react-native";
import MapView, { PROVIDER_DEFAULT, type Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import type { Restaurant } from "@/lib/types";
import type { PlaceResult, Coordinates } from "@/lib/places/types";
import { regionToSearchRadius } from "@/lib/places/nearby-search";
import { loadMapRegion, saveMapRegion } from "@/lib/prefs";
import {
  buildMapPins,
  isValidCoord,
  MAX_MAP_MARKERS,
  type MapPin,
  type MapPinType,
} from "@/lib/maps/pins";
import { MapPinSheet } from "./MapPinSheet";
import { MapMarker } from "./MapMarker";

export type { MapPin, MapPinType };

const PIN_UPDATE_MS = 350;
const MARKER_MOUNT_MS = 500;

function isValidRegion(r: Region) {
  return (
    isValidCoord(r.latitude, r.longitude) &&
    Number.isFinite(r.latitudeDelta) &&
    Number.isFinite(r.longitudeDelta) &&
    r.latitudeDelta > 0.002 &&
    r.latitudeDelta < 40 &&
    r.longitudeDelta > 0.002 &&
    r.longitudeDelta < 40
  );
}

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
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const [layoutReady, setLayoutReady] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [savedRegion, setSavedRegion] = useState<Region | null>(null);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [markersReady, setMarkersReady] = useState(false);
  const [renderPins, setRenderPins] = useState<MapPin[]>([]);

  useEffect(() => {
    mounted.current = true;
    loadMapRegion().then((r) => {
      if (mounted.current && r && isValidRegion(r)) setSavedRegion(r);
    });
    return () => {
      mounted.current = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (pinTimer.current) clearTimeout(pinTimer.current);
      if (markerTimer.current) clearTimeout(markerTimer.current);
    };
  }, []);

  const pins = useMemo(
    () => buildMapPins(restaurants, nearbyPlaces).slice(0, MAX_MAP_MARKERS),
    [restaurants, nearbyPlaces],
  );
  const totalPinCount = useMemo(
    () => buildMapPins(restaurants, nearbyPlaces).length,
    [restaurants, nearbyPlaces],
  );
  const truncated = totalPinCount > pins.length;

  const safeCoords = isValidCoord(coords.latitude, coords.longitude)
    ? coords
    : { latitude: 34.0522, longitude: -118.2437 };

  const region = useMemo(() => buildRegion(safeCoords, pins), [safeCoords, pins]);
  const initialRegion = savedRegion ?? region;

  // Debounce pin updates so rapid nearby-search refreshes don't thrash native markers.
  useEffect(() => {
    if (!markersReady) return;
    if (pinTimer.current) clearTimeout(pinTimer.current);
    pinTimer.current = setTimeout(() => {
      if (mounted.current) setRenderPins(pins);
    }, PIN_UPDATE_MS);
    return () => {
      if (pinTimer.current) clearTimeout(pinTimer.current);
    };
  }, [pins, markersReady]);

  const persistRegion = useCallback((r: Region) => {
    if (!isValidRegion(r)) return;
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
    const active = mapRegion ?? initialRegion;
    onSearchArea?.(
      { latitude: active.latitude, longitude: active.longitude },
      regionToSearchRadius(active),
    );
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setLayoutReady(true);
  };

  const handleMapReady = useCallback(() => {
    if (markerTimer.current) clearTimeout(markerTimer.current);
    markerTimer.current = setTimeout(() => {
      if (mounted.current) {
        setMarkersReady(true);
        setRenderPins(pins);
      }
    }, MARKER_MOUNT_MS);
  }, [pins]);

  const handleMarkerPress = useCallback((pin: MapPin) => {
    setSelectedPin(pin);
  }, []);

  const height = fullScreen ? undefined : 320;

  return (
    <View
      className={fullScreen ? "flex-1" : "rounded-2xl overflow-hidden border border-savr-200 dark:border-savr-700"}
      style={fullScreen ? { flex: 1 } : { height }}
      onLayout={handleLayout}
    >
      {layoutReady ? (
        <MapView
          ref={mapRef}
          style={fullScreen ? styles.mapFlex : styles.mapFixed}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          moveOnMarkerPress={false}
          loadingEnabled
          onMapReady={handleMapReady}
          onRegionChangeComplete={(r) => {
            setMapRegion(r);
            persistRegion(r);
          }}
        >
          {markersReady &&
            renderPins.map((pin) => (
              <MapMarker key={`${pin.type}-${pin.id}`} pin={pin} onPress={handleMarkerPress} />
            ))}
        </MapView>
      ) : (
        <View className="flex-1 items-center justify-center bg-savr-100 dark:bg-savr-900">
          <ActivityIndicator color="#A85D3F" />
        </View>
      )}

      {pins.length === 0 && !searching && layoutReady && markersReady && (
        <View className="absolute inset-0 items-center justify-center bg-black/20 px-6 pointer-events-none">
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
            style={styles.shadow}
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

      <View
        className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between"
        style={{ marginBottom: selectedPin ? 160 : 0 }}
      >
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
          <Text className="text-xs font-semibold text-savr-700 dark:text-savr-200">
            {truncated ? `${pins.length}+ spots` : `${pins.length} spots`}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => {
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

const styles = StyleSheet.create({
  mapFlex: { flex: 1, width: "100%" },
  mapFixed: { ...StyleSheet.absoluteFillObject },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});

