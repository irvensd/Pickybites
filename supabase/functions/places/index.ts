import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

const TYPE_MAP: Record<string, string> = {
  italian_restaurant: "Italian",
  japanese_restaurant: "Japanese",
  sushi_restaurant: "Japanese",
  ramen_restaurant: "Japanese",
  mexican_restaurant: "Mexican",
  thai_restaurant: "Thai",
  indian_restaurant: "Indian",
  french_restaurant: "French",
  american_restaurant: "American",
  hamburger_restaurant: "American",
  steak_house: "American",
  korean_restaurant: "Korean",
  chinese_restaurant: "Chinese",
  mediterranean_restaurant: "Mediterranean",
  greek_restaurant: "Greek",
  spanish_restaurant: "Spanish",
  vietnamese_restaurant: "Vietnamese",
  caribbean_restaurant: "Caribbean",
  seafood_restaurant: "American",
  pizza_restaurant: "Italian",
  cafe: "American",
  bar: "American",
  restaurant: "American",
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function cuisineFromTypes(types: string[] = [], primaryType?: string): string {
  if (primaryType && TYPE_MAP[primaryType]) return TYPE_MAP[primaryType];
  for (const t of types) {
    if (TYPE_MAP[t]) return TYPE_MAP[t];
  }
  return "American";
}

function priceLevelFromGoogle(level?: string | number | null): number {
  if (level == null || level === "") return 2;

  if (typeof level === "number" || /^\d+$/.test(String(level))) {
    const n = Number(level);
    switch (n) {
      case 0: return 2;
      case 1: return 1;
      case 2: return 1;
      case 3: return 2;
      case 4: return 3;
      case 5: return 4;
      default: return 2;
    }
  }

  switch (String(level)) {
    case "PRICE_LEVEL_FREE":
    case "PRICE_LEVEL_INEXPENSIVE":
      return 1;
    case "PRICE_LEVEL_MODERATE":
      return 2;
    case "PRICE_LEVEL_EXPENSIVE":
      return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return 4;
    default:
      return 2;
  }
}

function cityFromAddress(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) return parts[parts.length - 3] ?? parts[1] ?? "";
  if (parts.length >= 2) return parts[parts.length - 2] ?? "";
  return parts[0] ?? "";
}

function photoUrl(photoName: string | undefined, apiKey: string): string | null {
  if (!photoName) return null;
  return `${BASE}/${photoName}/media?maxWidthPx=600&key=${apiKey}`;
}

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

function mapPlace(p: GooglePlace, apiKey: string) {
  if (!p.id || !p.displayName?.text || !p.location) return null;
  const address = p.formattedAddress ?? p.shortFormattedAddress ?? "";
  const hasPrice = p.priceLevel != null && p.priceLevel !== "";
  return {
    googlePlaceId: p.id,
    name: p.displayName.text,
    address,
    city: cityFromAddress(address),
    cuisine: cuisineFromTypes(p.types, p.primaryType),
    priceLevel: priceLevelFromGoogle(p.priceLevel),
    priceLevelKnown: hasPrice,
    imageUrl: photoUrl(p.photos?.[0]?.name, apiKey),
    latitude: p.location.latitude,
    longitude: p.location.longitude,
    openNow: null,
  };
}

type RequestBody = {
  action: "nearby" | "search" | "details";
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  query?: string;
  googlePlaceId?: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY")?.trim();
  if (!apiKey) {
    return json({ error: "GOOGLE_PLACES_API_KEY secret is not set on Supabase." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing authorization header." }, 401);
  }

  const token = authHeader.replace(/^Bearer\s+/i, "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return json({ error: "Sign in required to search restaurants." }, 401);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  try {
    if (body.action === "nearby") {
      if (body.latitude == null || body.longitude == null) {
        return json({ error: "latitude and longitude are required." }, 400);
      }
      const lat = Number(body.latitude);
      const lng = Number(body.longitude);
      const radius = Math.min(Math.max(Number(body.radiusMeters ?? 1500), 100), 16093);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return json({ error: "Invalid coordinates." }, 400);
      }
      const origin = { latitude: lat, longitude: lng };
      const plan = buildNearbySearchPlan(origin, radius);
      const batches = await Promise.all(
        plan.map((req) =>
          googlePost(apiKey, "places:searchNearby", {
            includedTypes: ["restaurant"],
            maxResultCount: 20,
            rankPreference: req.rankPreference,
            locationRestriction: {
              circle: {
                center: { latitude: req.center.latitude, longitude: req.center.longitude },
                radius: Math.min(Math.max(req.radiusMeters, 100), 50000),
              },
            },
          })
        ),
      );
      const mapped = batches.flatMap((batch) =>
        batch.map((p) => mapPlace(p, apiKey)).filter(Boolean)
      ) as NonNullable<ReturnType<typeof mapPlace>>[];
      const places = mergePlacesWithinRadius(mapped, origin, radius);
      return json({ places });
    }

    if (body.action === "search") {
      if (!body.query?.trim()) {
        return json({ error: "query is required." }, 400);
      }
      const payload: Record<string, unknown> = {
        textQuery: body.query.includes("restaurant") ? body.query : `${body.query} restaurant`,
        maxResultCount: 20,
      };
      if (body.latitude != null && body.longitude != null) {
        const searchRadius = Number(body.radiusMeters ?? 25000);
        payload.locationBias = {
          circle: {
            center: { latitude: body.latitude, longitude: body.longitude },
            radius: Math.min(Math.max(searchRadius, 500), 50000),
          },
        };
      }
      const places = await googlePost(apiKey, "places:searchText", payload);
      return json({ places: places.map((p) => mapPlace(p, apiKey)).filter(Boolean) });
    }

    if (body.action === "details") {
      if (!body.googlePlaceId) {
        return json({ error: "googlePlaceId is required." }, 400);
      }
      const res = await fetch(`${BASE}/places/${body.googlePlaceId}`, {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "photos,currentOpeningHours",
        },
      });
      if (!res.ok) {
        return json({ photos: [], openNow: null });
      }
      const data = await res.json();
      const photos = (data.photos ?? [])
        .slice(0, 8)
        .map((p: { name: string }) => photoUrl(p.name, apiKey))
        .filter(Boolean);
      return json({
        photos,
        openNow: data.currentOpeningHours?.openNow ?? null,
      });
    }

    return json({ error: "Unknown action." }, 400);
  } catch (e) {
    console.error("places function error:", e);
    return json({ error: e instanceof Error ? e.message : "Places request failed." }, 500);
  }
});

type Coords = { latitude: number; longitude: number };

type MappedPlace = NonNullable<ReturnType<typeof mapPlace>>;

function distanceMeters(a: Coords, b: Coords): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function offsetCoordinate(coords: Coords, bearingDeg: number, meters: number): Coords {
  const R = 6371000;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (coords.latitude * Math.PI) / 180;
  const lon1 = (coords.longitude * Math.PI) / 180;
  const d = meters / R;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    );
  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lon2 * 180) / Math.PI,
  };
}

const CARDINAL = [0, 90, 180, 270];
const OCTANT = [0, 45, 90, 135, 180, 225, 270, 315];

function pushSectorRing(
  plan: { center: Coords; radiusMeters: number; rankPreference: "DISTANCE" | "POPULARITY" }[],
  origin: Coords,
  totalRadius: number,
  ringFraction: number,
  bearings: number[],
) {
  const offsetDist = totalRadius * ringFraction;
  const sectorRadius = Math.round(
    Math.min(Math.max(totalRadius * 0.34, 2200), totalRadius * 0.48),
  );
  for (const bearing of bearings) {
    plan.push({
      center: offsetCoordinate(origin, bearing, offsetDist),
      radiusMeters: sectorRadius,
      rankPreference: "DISTANCE",
    });
  }
}

function buildNearbySearchPlan(coords: Coords, radiusMeters: number) {
  const radius = Math.min(Math.max(radiusMeters, 100), 16093);
  const plan: { center: Coords; radiusMeters: number; rankPreference: "DISTANCE" | "POPULARITY" }[] = [
    { center: coords, radiusMeters: radius, rankPreference: "DISTANCE" },
    { center: coords, radiusMeters: radius, rankPreference: "POPULARITY" },
  ];
  if (radius >= 2500) {
    pushSectorRing(plan, coords, radius, 0.35, CARDINAL);
  }
  if (radius >= 4500) {
    pushSectorRing(plan, coords, radius, 0.55, OCTANT);
    pushSectorRing(plan, coords, radius, 0.75, CARDINAL);
  }
  if (radius >= 9000) {
    pushSectorRing(plan, coords, radius, 0.85, OCTANT);
  }
  return plan;
}

function mergeLimitForRadius(radiusMeters: number): number {
  if (radiusMeters >= 14000) return 150;
  if (radiusMeters >= 8000) return 120;
  if (radiusMeters >= 4500) return 100;
  return 80;
}

function pickAcrossDistanceRings(
  places: MappedPlace[],
  origin: Coords,
  radiusMeters: number,
  maxCount: number,
): MappedPlace[] {
  const numRings = Math.min(8, Math.max(4, Math.ceil(radiusMeters / 2000)));
  const ringWidth = radiusMeters / numRings;
  const buckets: MappedPlace[][] = Array.from({ length: numRings }, () => []);

  for (const place of places) {
    const d = distanceMeters(origin, place);
    const idx = Math.min(numRings - 1, Math.floor(d / ringWidth));
    buckets[idx].push(place);
  }

  buckets.forEach((bucket) =>
    bucket.sort((a, b) => distanceMeters(origin, a) - distanceMeters(origin, b)),
  );

  const perRing = Math.max(6, Math.ceil(maxCount / numRings));
  const picked: MappedPlace[] = [];
  const seen = new Set<string>();

  for (let r = 0; r < numRings; r++) {
    let taken = 0;
    for (const place of buckets[r]) {
      if (seen.has(place.googlePlaceId)) continue;
      seen.add(place.googlePlaceId);
      picked.push(place);
      taken++;
      if (taken >= perRing) break;
    }
  }

  if (picked.length < maxCount) {
    const sorted = [...places].sort(
      (a, b) => distanceMeters(origin, a) - distanceMeters(origin, b),
    );
    for (const place of sorted) {
      if (seen.has(place.googlePlaceId)) continue;
      seen.add(place.googlePlaceId);
      picked.push(place);
      if (picked.length >= maxCount) break;
    }
  }

  return picked.sort((a, b) => distanceMeters(origin, a) - distanceMeters(origin, b));
}

function mergePlacesWithinRadius(
  places: MappedPlace[],
  origin: Coords,
  radiusMeters: number,
  limit = mergeLimitForRadius(radiusMeters),
): MappedPlace[] {
  const seen = new Set<string>();
  const merged: MappedPlace[] = [];
  for (const place of places) {
    if (seen.has(place.googlePlaceId)) continue;
    if (distanceMeters(origin, place) > radiusMeters) continue;
    seen.add(place.googlePlaceId);
    merged.push(place);
  }
  if (merged.length <= limit) {
    return merged.sort((a, b) => distanceMeters(origin, a) - distanceMeters(origin, b));
  }
  return pickAcrossDistanceRings(merged, origin, radiusMeters, limit);
}

async function googlePost(apiKey: string, endpoint: string, payload: object): Promise<GooglePlace[]> {
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    let detail = err;
    try {
      const parsed = JSON.parse(err);
      detail = parsed?.error?.message ?? err;
    } catch { /* raw text */ }
    throw new Error(`Google Places error ${res.status}: ${detail}`);
  }
  const data = await res.json();
  return data.places ?? [];
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
