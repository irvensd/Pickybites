import { memo } from "react";
import { Platform } from "react-native";
import { Marker } from "react-native-maps";
import type { MapPin } from "@/lib/maps/pins";

/** iOS Apple Maps only supports named pin colors — hex values are unreliable. */
function pinColor(type: MapPin["type"]) {
  if (type === "rated") return Platform.OS === "ios" ? "red" : "#A85D3F";
  return Platform.OS === "ios" ? "orange" : "#B8956F";
}

export const MapMarker = memo(function MapMarker({
  pin,
  onPress,
}: {
  pin: MapPin;
  onPress: (pin: MapPin) => void;
}) {
  return (
    <Marker
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      pinColor={pinColor(pin.type)}
      title={pin.title}
      description={pin.subtitle}
      tracksViewChanges={false}
      onPress={() => onPress(pin)}
    />
  );
});

