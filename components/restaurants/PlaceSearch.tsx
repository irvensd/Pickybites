import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PlaceResult } from "@/lib/places/types";
import type { Coordinates } from "@/lib/places/types";
import { searchRestaurantsByText, isGooglePlacesConfigured } from "@/lib/places/google";
import { PlaceResultCard } from "./PlaceResultCard";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";
import { cn } from "@/lib/utils";

export function PlaceSearch({
  coords,
  onSelect,
  placeholder = "Search by name, neighborhood, or city...",
  autoFocus = false,
}: {
  coords: Coordinates | null;
  onSelect: (place: PlaceResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const colors = useThemedColors();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || !isGooglePlacesConfigured()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const places = await searchRestaurantsByText(q.trim(), coords ?? undefined);
      setResults(places);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, search]);

  if (!isGooglePlacesConfigured()) {
    return (
      <View className={cn("rounded-xl p-4", ui.surface.inset)}>
        <Text className={ui.text.secondary}>
          Add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to .env to search real restaurants near you.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <View className={cn("flex-row items-center rounded-xl px-3 min-h-[52px]", ui.surface.search)}>
        <Ionicons name="search" size={20} color={colors.iconMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn("flex-1 ml-2 text-base", ui.text.primary)}
          placeholderTextColor={colors.placeholder}
        />
        {loading && <ActivityIndicator size="small" color={colors.spinner} />}
      </View>
      {error && <Text className="text-sm text-red-500">{error}</Text>}
      {results.map((place, i) => (
        <PlaceResultCard
          key={place.googlePlaceId}
          place={place}
          index={i}
          onPress={() => onSelect(place)}
        />
      ))}
    </View>
  );
}

