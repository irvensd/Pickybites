import type { ExpoConfig } from "expo/config";
import appJson from "./app.json";

/** Maps SDK key for native Android/Google Maps builds (optional on iOS — Apple Maps is default). */
const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";

export default (): ExpoConfig => ({
  ...(appJson.expo as ExpoConfig),
  ios: {
    ...appJson.expo.ios,
    ...(googleMapsKey ? { config: { googleMapsApiKey: googleMapsKey } } : {}),
  },
  android: {
    ...appJson.expo.android,
    ...(googleMapsKey ? { config: { googleMaps: { apiKey: googleMapsKey } } } : {}),
  },
});

