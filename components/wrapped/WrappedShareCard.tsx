import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { APP_NAME } from "@/constants/branding";
import type { calculateFoodWrapped } from "@/lib/taste-dna";

type WrappedData = ReturnType<typeof calculateFoodWrapped>;

export function WrappedShareCard({ data, displayName }: { data: WrappedData; displayName: string }) {
  const yoy =
    data.priorYearRestaurants > 0
      ? data.totalRestaurants - data.priorYearRestaurants
      : null;

  return (
    <View
      className="rounded-3xl overflow-hidden"
      style={{ width: 360, backgroundColor: "#4A2819" }}
    >
      <View className="p-6 gap-5">
        <View className="flex-row items-center gap-2">
          <Ionicons name="gift" size={28} color="#F5D0A8" />
          <Text style={{ color: "#F5D0A8", fontSize: 14, fontWeight: "600" }}>{APP_NAME} Wrapped</Text>
        </View>

        <View>
          <Text style={{ color: "#fff", fontSize: 48, fontWeight: "800" }}>{data.year}</Text>
          <Text style={{ color: "#E8D5C4", fontSize: 16 }}>{displayName}&apos;s year in food</Text>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: "#6B3D2A" }}>
            <Text style={{ color: "#fff", fontSize: 36, fontWeight: "800" }}>{data.totalRestaurants}</Text>
            <Text style={{ color: "#E8D5C4", fontSize: 13 }}>restaurants</Text>
          </View>
          <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: "#6B3D2A" }}>
            <Text style={{ color: "#fff", fontSize: 36, fontWeight: "800" }}>{data.totalDishes}</Text>
            <Text style={{ color: "#E8D5C4", fontSize: 13 }}>dishes</Text>
          </View>
        </View>

        {yoy != null && yoy !== 0 && (
          <Text style={{ color: "#F5D0A8", fontSize: 15, fontWeight: "600" }}>
            {yoy > 0 ? `+${yoy}` : yoy} restaurants vs {data.year - 1}
          </Text>
        )}

        {data.favoriteCuisine && (
          <View>
            <Text style={{ color: "#B8956F", fontSize: 11, letterSpacing: 1 }}>FAVORITE CUISINE</Text>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 4 }}>{data.favoriteCuisine}</Text>
          </View>
        )}

        {data.highestRatedRestaurant && (
          <View>
            <Text style={{ color: "#B8956F", fontSize: 11, letterSpacing: 1 }}>TOP SPOT</Text>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 4 }} numberOfLines={1}>
              {data.highestRatedRestaurant.restaurant.name}
            </Text>
            <Text style={{ color: "#F5D0A8", fontSize: 16, fontWeight: "600" }}>
              {data.highestRatedRestaurant.rating.toFixed(1)}/10
            </Text>
          </View>
        )}

        <Text style={{ color: "#B8956F", fontSize: 12, textAlign: "center" }}>forkloop.app</Text>
      </View>
    </View>
  );
}
