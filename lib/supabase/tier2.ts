import { getSupabase } from "./client";
import { mapBookmark } from "./mappers";
import type { Bookmark } from "@/lib/types";
import type { PlaceResult } from "@/lib/places/types";

export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapBookmark);
}

export async function addBookmarkDb(userId: string, place: PlaceResult): Promise<Bookmark> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: userId,
      google_place_id: place.googlePlaceId,
      place_name: place.name,
      place_address: place.address,
      place_city: place.city,
      place_cuisine: place.cuisine,
      place_image_url: place.imageUrl,
      latitude: place.latitude,
      longitude: place.longitude,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapBookmark(data);
}

export async function removeBookmarkDb(bookmarkId: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("bookmarks").delete().eq("id", bookmarkId);
  if (error) throw new Error(error.message);
}

export async function addBookmarkFromRestaurantDb(
  userId: string,
  restaurant: { id: string; googlePlaceId?: string | null; name: string; address: string; city: string; cuisine: string; imageUrl: string | null; latitude?: number | null; longitude?: number | null },
): Promise<Bookmark> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const googlePlaceId = restaurant.googlePlaceId ?? `restaurant:${restaurant.id}`;

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: userId,
      restaurant_id: restaurant.id,
      google_place_id: googlePlaceId,
      place_name: restaurant.name,
      place_address: restaurant.address,
      place_city: restaurant.city,
      place_cuisine: restaurant.cuisine,
      place_image_url: restaurant.imageUrl,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapBookmark(data);
}

export async function removeBookmarkByPlaceIdDb(userId: string, googlePlaceId: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("google_place_id", googlePlaceId);
  if (error) throw new Error(error.message);
}
