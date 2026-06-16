import { Share, Linking, Platform } from "react-native";
import { APP_NAME, APP_SCHEME } from "@/constants/branding";

const INVITE_TEXT = `Join me on ${APP_NAME} — rate restaurants, find your taste match, and discover spots your friends love.`;

export function restaurantDeepLink(restaurantId: string) {
  return `${APP_SCHEME}://restaurant/${restaurantId}`;
}

export function userDeepLink(userId: string) {
  return `${APP_SCHEME}://user/${userId}`;
}

export async function shareInvite(displayName?: string) {
  const message = displayName
    ? `${displayName} invited you to ${APP_NAME}!\n\n${INVITE_TEXT}`
    : INVITE_TEXT;
  await Share.share({ message, title: `Invite to ${APP_NAME}` });
}

export async function shareRestaurant(
  restaurantId: string,
  name: string,
  cuisine: string,
  city: string,
  rating?: number,
) {
  const link = restaurantDeepLink(restaurantId);
  const ratingLine = rating != null ? ` Rated ${rating.toFixed(1)}/10 on ${APP_NAME}.` : "";
  await Share.share({
    message: `Check out ${name} (${cuisine}) in ${city} on ${APP_NAME}!${ratingLine}\n\n${link}`,
    title: name,
    url: link,
  });
}

export async function shareReview(
  displayName: string,
  restaurantId: string,
  restaurantName: string,
  rating: number,
  text: string,
) {
  const link = restaurantDeepLink(restaurantId);
  const excerpt = text.trim() ? `"${text.trim().slice(0, 120)}${text.length > 120 ? "…" : ""}"` : "";
  await Share.share({
    message: `${displayName} rated ${restaurantName} ${rating.toFixed(1)}/10 on ${APP_NAME}.${excerpt ? ` ${excerpt}` : ""}\n\n${link}`,
    title: `${restaurantName} on ${APP_NAME}`,
    url: link,
  });
}

export async function openInMaps(latitude: number, longitude: number, label?: string) {
  const q = label ? encodeURIComponent(label) : `${latitude},${longitude}`;
  const url = Platform.select({
    ios: `maps:0,0?q=${q}@${latitude},${longitude}`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${q})`,
    default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  });
  if (url) await Linking.openURL(url);
}
