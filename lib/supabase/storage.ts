import * as FileSystem from "expo-file-system";
import { getSupabase, getPublicStorageUrl } from "./client";

export async function uploadReviewPhoto(
  userId: string,
  reviewId: string,
  localUri: string,
  index: number
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const ext = localUri.split(".").pop()?.split("?")[0] ?? "jpg";
  const path = `${userId}/${reviewId}/${Date.now()}-${index}.${ext}`;

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: "base64",
  });
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const { error } = await supabase.storage
    .from("review-photos")
    .upload(path, bytes, { contentType: `image/${ext === "png" ? "png" : "jpeg"}`, upsert: false });

  if (error) {
    console.error("Photo upload failed:", error.message);
    return null;
  }

  return getPublicStorageUrl("review-photos", path);
}

export async function uploadAvatar(userId: string, localUri: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const ext = localUri.split(".").pop()?.split("?")[0] ?? "jpg";
  const path = `${userId}/avatar.${ext}`;

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: "base64",
  });
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, bytes, { contentType: `image/${ext === "png" ? "png" : "jpeg"}`, upsert: true });

  if (error) {
    console.error("Avatar upload failed:", error.message);
    return null;
  }

  return getPublicStorageUrl("avatars", path);
}
