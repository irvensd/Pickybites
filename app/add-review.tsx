import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Image, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAppStore } from "@/store/useAppStore";
import { REVIEW_TAGS, type ReviewTag } from "@/lib/types";
import type { PlaceResult } from "@/lib/places/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { PlaceSearch } from "@/components/restaurants/PlaceSearch";
import { getCurrentCoordinates } from "@/lib/location";
import { Ionicons } from "@expo/vector-icons";

interface DishForm { name: string; rating: number; notes: string; isBestDish: boolean; }

export default function AddReviewScreen() {
  const { restaurantId: paramRestaurantId, reviewId: paramReviewId } = useLocalSearchParams<{
    restaurantId?: string;
    reviewId?: string;
  }>();
  const addReview = useAppStore((s) => s.addReview);
  const updateReview = useAppStore((s) => s.updateReview);
  const getRestaurant = useAppStore((s) => s.getRestaurant);
  const getReview = useAppStore((s) => s.getReview);
  const ensureRestaurantFromPlace = useAppStore((s) => s.ensureRestaurantFromPlace);

  const editingReview = paramReviewId ? getReview(paramReviewId) : undefined;
  const isEditMode = Boolean(editingReview);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
    editingReview?.restaurantId ?? paramRestaurantId ?? null,
  );
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [coords, setCoords] = useState<Awaited<ReturnType<typeof getCurrentCoordinates>>>(null);
  const [rating, setRating] = useState(editingReview?.rating ?? 8);
  const [text, setText] = useState(editingReview?.text ?? "");
  const [visitDate, setVisitDate] = useState(editingReview?.visitDate ?? new Date().toISOString().split("T")[0]);
  const [tags, setTags] = useState<ReviewTag[]>(editingReview?.tags ?? []);
  const [photos, setPhotos] = useState<string[]>([]);
  const [dishes, setDishes] = useState<DishForm[]>([{ name: "", rating: 8, notes: "", isBestDish: false }]);
  const [loading, setLoading] = useState(false);

  const selectedRestaurant = selectedRestaurantId ? getRestaurant(selectedRestaurantId) : null;
  const hasSelection = Boolean(selectedRestaurant || selectedPlace);

  useEffect(() => {
    getCurrentCoordinates().then(setCoords);
  }, []);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled) setPhotos((p) => [...p, result.assets[0].uri]);
  };

  const handleSelectPlace = async (place: PlaceResult) => {
    setSelectedPlace(place);
    setSelectedRestaurantId(null);
    const result = await ensureRestaurantFromPlace(place);
    if (!("error" in result)) setSelectedRestaurantId(result.id);
  };

  const submit = async () => {
    if (!hasSelection && !isEditMode) {
      Alert.alert("Pick a restaurant", "Search and select a restaurant before publishing.");
      return;
    }
    setLoading(true);

    if (isEditMode && editingReview) {
      const result = await updateReview(editingReview.id, { rating, text, visitDate, tags });
      setLoading(false);
      if ("error" in result) {
        Alert.alert("Could not save", result.error);
        return;
      }
      router.replace(`/restaurant/${editingReview.restaurantId}`);
      return;
    }

    const result = await addReview({
      restaurantId: selectedRestaurantId ?? undefined,
      place: selectedPlace ?? undefined,
      rating, text, visitDate, tags, photoUris: photos,
      dishes: dishes.filter((d) => d.name.trim()).map((d) => ({
        name: d.name, rating: d.rating, notes: d.notes, photoUrl: null, isBestDish: d.isBestDish,
      })),
    });
    setLoading(false);
    if ("error" in result) {
      Alert.alert("Could not publish", result.error);
      return;
    }
    router.replace(`/restaurant/${result.restaurantId}`);
  };

  return (
    <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="px-4 pb-8 gap-4" keyboardShouldPersistTaps="handled">
      <Text className="text-lg font-semibold text-savr-900 dark:text-savr-100">
        {isEditMode ? "Edit your review" : "Where did you eat?"}
      </Text>

      {!hasSelection && !isEditMode ? (
        <PlaceSearch coords={coords} onSelect={handleSelectPlace} placeholder="Search by name, neighborhood, or city..." autoFocus />
      ) : (
        <Card className="gap-2">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-semibold text-lg text-savr-900 dark:text-savr-100">
                {selectedRestaurant?.name ?? selectedPlace?.name}
              </Text>
              <Text className="text-sm text-savr-500 dark:text-savr-400">
                {selectedRestaurant?.cuisine ?? selectedPlace?.cuisine} · {selectedRestaurant?.city ?? selectedPlace?.city}
              </Text>
              <Text className="text-xs text-savr-400 mt-1" numberOfLines={2}>
                {selectedRestaurant?.address ?? selectedPlace?.address}
              </Text>
            </View>
            {!isEditMode && (
              <Pressable onPress={() => { setSelectedPlace(null); setSelectedRestaurantId(null); }} className="p-2">
                <Ionicons name="close-circle" size={24} color="#B8956F" />
              </Pressable>
            )}
          </View>
        </Card>
      )}

      {(hasSelection || isEditMode) && (
        <>
          <Text className="text-sm font-medium text-savr-800 dark:text-savr-200">Your rating: {rating.toFixed(1)}</Text>
          <View className="flex-row items-center gap-4">
            <Pressable onPress={() => setRating(Math.max(1, rating - 0.1))} className="bg-savr-100 dark:bg-savr-800 w-12 h-12 rounded-xl items-center justify-center"><Text className="text-xl text-savr-900 dark:text-savr-100">−</Text></Pressable>
            <Text className="text-2xl font-bold text-savr-700 dark:text-savr-200 flex-1 text-center">{rating.toFixed(1)}</Text>
            <Pressable onPress={() => setRating(Math.min(10, rating + 0.1))} className="bg-savr-100 dark:bg-savr-800 w-12 h-12 rounded-xl items-center justify-center"><Text className="text-xl text-savr-900 dark:text-savr-100">+</Text></Pressable>
          </View>
          <Input label="Review" value={text} onChangeText={setText} multiline numberOfLines={4} placeholder="What did you think?" />
          <Input label="Visit Date" value={visitDate} onChangeText={setVisitDate} placeholder="YYYY-MM-DD" />
          <Text className="text-sm font-medium text-savr-800 dark:text-savr-200">Tags</Text>
          <View className="flex-row flex-wrap gap-2">{REVIEW_TAGS.map((t) => <Tag key={t} label={t} active={tags.includes(t)} onPress={() => setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])} />)}</View>

          {!isEditMode && (
            <>
              <Pressable onPress={pickPhoto} className="border border-dashed border-savr-300 dark:border-savr-600 rounded-xl p-6 items-center">
                <Ionicons name="camera" size={28} color="#A85D3F" />
                <Text className="text-savr-600 dark:text-savr-400 mt-2">Add photos</Text>
              </Pressable>
              {photos.map((uri, i) => <Image key={i} source={{ uri }} className="w-full h-40 rounded-xl" resizeMode="cover" />)}
              <Text className="font-semibold text-savr-900 dark:text-savr-100">Dishes (optional)</Text>
              {dishes.map((d, i) => (
                <Card key={i} className="gap-2">
                  <Input value={d.name} onChangeText={(v) => setDishes((ds) => ds.map((x, j) => j === i ? { ...x, name: v } : x))} placeholder="Dish name" />
                  <Input value={d.notes} onChangeText={(v) => setDishes((ds) => ds.map((x, j) => j === i ? { ...x, notes: v } : x))} placeholder="Notes" />
                  <Pressable onPress={() => setDishes((ds) => ds.map((x, j) => ({ ...x, isBestDish: j === i ? !x.isBestDish : false })))} className="flex-row items-center gap-2">
                    <Ionicons name={d.isBestDish ? "trophy" : "trophy-outline"} size={20} color="#A85D3F" />
                    <Text className="text-sm text-savr-600 dark:text-savr-400">Best dish of the meal</Text>
                  </Pressable>
                </Card>
              ))}
              <Button label="Add Another Dish" variant="secondary" onPress={() => setDishes((d) => [...d, { name: "", rating: 8, notes: "", isBestDish: false }])} />
            </>
          )}

          <Button label={isEditMode ? "Save Changes" : "Publish Review"} onPress={submit} loading={loading} />
        </>
      )}
    </ScrollView>
  );
}
