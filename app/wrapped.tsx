import { useRef } from "react";
import { View, Text, ScrollView, Share, Alert } from "react-native";
import { captureRef } from "react-native-view-shot";
import { useAppStore } from "@/store/useAppStore";
import { calculateFoodWrapped } from "@/lib/taste-dna";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import { WrappedShareCard } from "@/components/wrapped/WrappedShareCard";
import { Ionicons } from "@expo/vector-icons";
import { APP_NAME } from "@/constants/branding";
import { ui } from "@/constants/ui";

export default function WrappedScreen() {
  const { currentUserId, users, reviews, dishes, restaurants } = useAppStore();
  const shareRef = useRef<View>(null);
  const year = new Date().getFullYear();
  const user = users.find((u) => u.id === currentUserId);
  const w = currentUserId ? calculateFoodWrapped(currentUserId, year, reviews, dishes, restaurants) : null;

  if (!w || !user) return null;

  const yoy = w.priorYearRestaurants > 0 ? w.totalRestaurants - w.priorYearRestaurants : null;

  const shareText = () =>
    Share.share({
      message: `My ${year} ${APP_NAME} Food Wrapped: ${w.totalRestaurants} restaurants, ${w.totalDishes} dishes!${yoy != null && yoy !== 0 ? ` (${yoy > 0 ? "+" : ""}${yoy} vs last year)` : ""}`,
    });

  const shareImage = async () => {
    try {
      const uri = await captureRef(shareRef, { format: "png", quality: 1 });
      await Share.share({ url: uri, message: `My ${year} ${APP_NAME} Wrapped` });
    } catch {
      Alert.alert("Share", "Could not create share image. Sharing text instead.");
      shareText();
    }
  };

  return (
    <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="px-4 pb-8 gap-4">
      <View className="items-center py-4">
        <Ionicons name="gift" size={48} color="#A85D3F" />
        <Text className="text-3xl font-bold text-savr-900 dark:text-savr-100 mt-2">{year}</Text>
        <Text className="text-savr-600 dark:text-savr-400">Your year in food</Text>
        {yoy != null && yoy !== 0 && (
          <Text className="text-sm font-semibold text-savr-600 dark:text-savr-300 mt-2">
            {yoy > 0 ? `+${yoy}` : yoy} restaurants vs {year - 1}
          </Text>
        )}
      </View>

      <View className="items-center opacity-0 absolute -left-[9999]">
        <View ref={shareRef} collapsable={false}>
          <WrappedShareCard data={w} displayName={user.displayName} />
        </View>
      </View>

      <Card className="bg-savr-600 border-0">
        <View className="flex-row justify-around py-2">
          <View className="items-center"><Text className="text-4xl font-bold text-white">{w.totalRestaurants}</Text><Text className="text-sm text-savr-200">Restaurants</Text></View>
          <View className="items-center"><Text className="text-4xl font-bold text-white">{w.totalDishes}</Text><Text className="text-sm text-savr-200">Dishes</Text></View>
        </View>
      </Card>

      {w.favoriteCuisine && <Card><Text className={`text-xs uppercase ${ui.text.muted}`}>Favorite Cuisine</Text><Text className={`text-xl font-bold ${ui.text.primary}`}>{w.favoriteCuisine}</Text></Card>}
      {w.mostVisitedCity && <Card><Text className={`text-xs uppercase ${ui.text.muted}`}>Most Visited City</Text><Text className={`text-xl font-bold ${ui.text.primary}`}>{w.mostVisitedCity}</Text></Card>}
      {w.highestRatedRestaurant && (
        <Card>
          <Text className={`text-xs uppercase ${ui.text.muted}`}>Top Restaurant</Text>
          <Text className={`font-bold ${ui.text.primary}`}>{w.highestRatedRestaurant.restaurant.name}</Text>
          <Rating value={w.highestRatedRestaurant.rating} size="sm" />
        </Card>
      )}
      {w.highestRatedDish && (
        <Card>
          <Text className={`text-xs uppercase ${ui.text.muted}`}>Top Dish</Text>
          <Text className={`font-bold ${ui.text.primary}`}>{w.highestRatedDish.dish.name}</Text>
          <Text className={`text-sm ${ui.text.muted}`}>{w.highestRatedDish.restaurant.name}</Text>
          <Rating value={w.highestRatedDish.dish.rating} size="sm" />
        </Card>
      )}
      {w.biggestSurprise && (
        <Card>
          <Text className={`text-xs uppercase ${ui.text.muted}`}>Biggest Surprise</Text>
          <Text className={`font-bold ${ui.text.primary}`}>{w.biggestSurprise.restaurant.name}</Text>
          <Rating value={w.biggestSurprise.rating} size="sm" />
        </Card>
      )}
      {w.biggestDisappointment && (
        <Card>
          <Text className={`text-xs uppercase ${ui.text.muted}`}>Biggest Disappointment</Text>
          <Text className={`font-bold ${ui.text.primary}`}>{w.biggestDisappointment.restaurant.name}</Text>
          <Rating value={w.biggestDisappointment.rating} size="sm" />
        </Card>
      )}

      <Button label="Share Story Card" onPress={shareImage} />
      <Button label="Share as Text" variant="secondary" onPress={shareText} />
    </ScrollView>
  );
}
