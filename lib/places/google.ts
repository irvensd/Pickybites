import type { PlaceResult, Coordinates } from "./types";
import { cuisineFromGoogleTypes, priceLevelFromGoogle, cityFromAddress } from "./cuisine-map";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { buildNearbySearchPlan, mergePlacesWithinRadius, mergeLimitForRadius } from "./nearby-search";
import * as remote from "./remote";

/** @deprecated Local dev only — production uses Supabase Edge Function `places`. */
const LOCAL_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";
const BASE = "https://places.googleapis.com/v1";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.shortFormattedAddress",
  "places.location",
  "places.types",
  "places.primaryType",
  "places.photos",
].join(",");

type GooglePlace = {
  id?: string;
  displayName?: { text: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  primaryType?: string;
  priceLevel?: string | number;
  photos?: { name: string }[];
  currentOpeningHours?: { openNow?: boolean };
};

/** True when Supabase (server-side places) or a local dev API key is configured. */
export function isGooglePlacesConfigured(): boolean {
  if (isSupabaseConfigured()) return true;
  return Boolean(LOCAL_API_KEY && !LOCAL_API_KEY.includes("your-google") && !LOCAL_API_KEY.includes("paste"));
}

function photoUrl(photoName?: string): string | null {
  if (!photoName || !LOCAL_API_KEY) return null;
  return `${BASE}/${photoName}/media?maxWidthPx=600&key=${LOCAL_API_KEY}`;
}

function mapPlace(p: GooglePlace): PlaceResult | null {
  if (!p.id || !p.displayName?.text || !p.location) return null;
  const address = p.formattedAddress ?? p.shortFormattedAddress ?? "";
  const hasPrice = p.priceLevel != null && p.priceLevel !== "";
  return {
    googlePlaceId: p.id,
    name: p.displayName.text,
    address,
    city: cityFromAddress(address),
    cuisine: cuisineFromGoogleTypes(p.types, p.primaryType),
    priceLevel: priceLevelFromGoogle(p.priceLevel),
    priceLevelKnown: hasPrice,
    imageUrl: photoUrl(p.photos?.[0]?.name),
    latitude: p.location.latitude,
    longitude: p.location.longitude,
    openNow: null,
  };
}

async function localPlacesRequest(endpoint: string, body: object): Promise<PlaceResult[]> {
  if (!LOCAL_API_KEY) return [];

  const res = await fetch(`${BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": LOCAL_API_KEY,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Google Places error:", res.status, err);
    throw new Error("Could not fetch nearby restaurants.");
  }

  const data = await res.json();
  return (data.places ?? []).map(mapPlace).filter(Boolean) as PlaceResult[];
}

export async function searchNearbyRestaurants(coords: Coordinates, radiusMeters = 1500): Promise<PlaceResult[]> {
  if (isSupabaseConfigured()) {
    return remote.searchNearbyRemote(coords, radiusMeters);
  }

  const plan = buildNearbySearchPlan(coords, radiusMeters);
  const batches = await Promise.all(
    plan.map((req) =>
      localPlacesRequest("places:searchNearby", {
        includedTypes: ["restaurant"],
        maxResultCount: 20,
        rankPreference: req.rankPreference,
        locationRestriction: {
          circle: {
            center: { latitude: req.center.latitude, longitude: req.center.longitude },
            radius: req.radiusMeters,
          },
        },
      }),
    ),
  );
  return mergePlacesWithinRadius(batches, coords, radiusMeters, mergeLimitForRadius(radiusMeters));
}

export async function searchRestaurantsByText(
  query: string,
  coords?: Coordinates,
  radiusMeters = 25000,
): Promise<PlaceResult[]> {
  if (isSupabaseConfigured()) {
    return remote.searchTextRemote(query, coords, radiusMeters);
  }

  const body: Record<string, unknown> = {
    textQuery: query.includes("restaurant") ? query : `${query} restaurant`,
    maxResultCount: 20,
  };
  if (coords) {
    body.locationBias = {
      circle: {
        center: { latitude: coords.latitude, longitude: coords.longitude },
        radius: Math.min(Math.max(radiusMeters, 500), 50000),
      },
    };
  }
  return localPlacesRequest("places:searchText", body);
}

/** Nearby + text search merged for map "Search this area". */
export async function searchAreaRestaurants(
  center: Coordinates,
  radiusMeters: number,
): Promise<PlaceResult[]> {
  const [nearby, text] = await Promise.all([
    searchNearbyRestaurants(center, radiusMeters),
    searchRestaurantsByText("restaurants", center, radiusMeters),
  ]);
  return mergePlacesWithinRadius([nearby, text], center, radiusMeters, mergeLimitForRadius(radiusMeters));
}

export async function fetchPlaceDetails(googlePlaceId: string): Promise<{
  photos: string[];
  openNow: boolean | null;
}> {
  if (isSupabaseConfigured()) {
    return remote.fetchDetailsRemote(googlePlaceId);
  }

  if (!LOCAL_API_KEY) return { photos: [], openNow: null };

  const res = await fetch(`${BASE}/places/${googlePlaceId}`, {
    headers: {
      "X-Goog-Api-Key": LOCAL_API_KEY,
      "X-Goog-FieldMask": "photos,currentOpeningHours",
    },
  });
  if (!res.ok) return { photos: [], openNow: null };

  const data = await res.json();
  const photos = (data.photos ?? [])
    .slice(0, 8)
    .map((p: { name: string }) => photoUrl(p.name))
    .filter(Boolean) as string[];

  return { photos, openNow: data.currentOpeningHours?.openNow ?? null };
}

