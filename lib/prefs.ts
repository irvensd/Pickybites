import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ThemeMode } from "@/store/useThemeStore";

const ONBOARDING_KEY = "@forkloop/has_seen_onboarding";
const THEME_KEY = "@forkloop/theme_mode";

export async function loadHasSeenOnboarding(): Promise<boolean> {
  const v = await AsyncStorage.getItem(ONBOARDING_KEY);
  return v === "1";
}

export async function saveHasSeenOnboarding(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, "1");
}

const MAP_REGION_KEY = "@forkloop/map_region";

export type SavedMapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export async function loadMapRegion(): Promise<SavedMapRegion | null> {
  const raw = await AsyncStorage.getItem(MAP_REGION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedMapRegion;
  } catch {
    return null;
  }
}

export async function saveMapRegion(region: SavedMapRegion): Promise<void> {
  await AsyncStorage.setItem(MAP_REGION_KEY, JSON.stringify(region));
}

export async function loadThemeMode(): Promise<ThemeMode | null> {
  const v = await AsyncStorage.getItem(THEME_KEY);
  if (v === "light" || v === "dark" || v === "system") return v;
  return null;
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, mode);
}

const GETTING_STARTED_DISMISSED_KEY = "@forkloop/getting_started_dismissed";

export async function loadGettingStartedDismissed(): Promise<boolean> {
  return (await AsyncStorage.getItem(GETTING_STARTED_DISMISSED_KEY)) === "1";
}

export async function saveGettingStartedDismissed(): Promise<void> {
  await AsyncStorage.setItem(GETTING_STARTED_DISMISSED_KEY, "1");
}
