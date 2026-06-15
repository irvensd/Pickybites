import { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, Alert } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useAppStore } from "@/store/useAppStore";
import { CUISINES, REVIEW_TAGS, type ReviewTag } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";

interface DishForm { name: string; rating: number; notes: string; isBestDish: boolean; }

export default function AddReviewScreen() {
  const addReview = useAppStore((s) => s.addReview);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cuisine, setCuisine] = useState<(typeof CUISINES)[number]>("American");
  const [price, setPrice] = useState<1 | 2 | 3 | 4>(2);
  const [rating, setRating] = useState(8);
  const [text, setText] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [dishes, setDishes] = useState<DishForm[]>([{ name: "", rating: 8, notes: "", isBestDish: false }]);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    // TODO: Upload to Supabase Storage after picking
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled) setPhotos((p) => [...p, result.assets[0].uri]);
  };

  const useLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission needed", "Location access helps tag your city.");
    const loc = await Location.getCurrentPositionAsync({});
    // TODO: Reverse geocode with Supabase or external API
    setCity(`Near ${loc.coords.latitude.toFixed(2)}, ${loc.coords.longitude.toFixed(2)}`);
  };

  const submit = () => {
    if (!name.trim()) return;
    setLoading(true);
    const { restaurantId } = addReview({
      restaurantName: name.trim(), address, city, cuisine, priceLevel: price,
      rating, text, visitDate, tags,
      dishes: dishes.filter((d) => d.name.trim()).map((d) => ({ name: d.name, rating: d.rating, notes: d.notes, photoUrl: null, isBestDish: d.isBestDish })),
    });
    setLoading(false);
    router.replace(`/restaurant/${restaurantId}`);
  };

  return (
    <ScrollView className="flex-1 bg-savr-50" contentContainerClassName="px-4 pb-8 gap-4" keyboardShouldPersistTaps="handled">
      <Input label="Restaurant Name" value={name} onChangeText={setName} placeholder="Nori House" />
      <Input label="Address" value={address} onChangeText={setAddress} />
      <View className="flex-row gap-2 items-end">
        <View className="flex-1"><Input label="City" value={city} onChangeText={setCity} /></View>
        <Pressable onPress={useLocation} className="bg-savr-100 p-3 rounded-xl mb-0"><Ionicons name="location" size={24} color="#A85D3F" /></Pressable>
      </View>
      <Text className="text-sm font-medium text-savr-800">Cuisine</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
        {CUISINES.map((c) => <Tag key={c} label={c} active={cuisine === c} onPress={() => setCuisine(c)} />)}
      </ScrollView>
      <Text className="text-sm font-medium text-savr-800">Price Level</Text>
      <View className="flex-row gap-2">{([1, 2, 3, 4] as const).map((p) => (
        <Pressable key={p} onPress={() => setPrice(p)} className={`flex-1 py-3 rounded-xl items-center ${price === p ? "bg-savr-600" : "bg-savr-100"}`}>
          <Text className={price === p ? "text-white font-medium" : "text-savr-700"}>{"$".repeat(p)}</Text>
        </Pressable>
      ))}</View>
      <Text className="text-sm font-medium text-savr-800">Rating: {rating.toFixed(1)}</Text>
      <View className="flex-row items-center gap-4">
        <Pressable onPress={() => setRating(Math.max(1, rating - 0.1))} className="bg-savr-100 w-12 h-12 rounded-xl items-center justify-center"><Text className="text-xl">−</Text></Pressable>
        <Text className="text-2xl font-bold text-savr-700 flex-1 text-center">{rating.toFixed(1)}</Text>
        <Pressable onPress={() => setRating(Math.min(10, rating + 0.1))} className="bg-savr-100 w-12 h-12 rounded-xl items-center justify-center"><Text className="text-xl">+</Text></Pressable>
      </View>
      <Input label="Review" value={text} onChangeText={setText} multiline numberOfLines={4} placeholder="What did you think?" />
      <Input label="Visit Date" value={visitDate} onChangeText={setVisitDate} placeholder="YYYY-MM-DD" />
      <Text className="text-sm font-medium text-savr-800">Tags</Text>
      <View className="flex-row flex-wrap gap-2">{REVIEW_TAGS.map((t) => <Tag key={t} label={t} active={tags.includes(t)} onPress={() => setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])} />)}</View>
      <Pressable onPress={pickPhoto} className="border border-dashed border-savr-300 rounded-xl p-6 items-center">
        <Ionicons name="camera" size={28} color="#A85D3F" />
        <Text className="text-savr-600 mt-2">Add photos</Text>
      </Pressable>
      {photos.map((uri, i) => <Image key={i} source={{ uri }} className="w-full h-40 rounded-xl" resizeMode="cover" />)}
      <Text className="font-semibold text-savr-900">Dishes</Text>
      {dishes.map((d, i) => (
        <Card key={i} className="gap-2">
          <Input value={d.name} onChangeText={(v) => setDishes((ds) => ds.map((x, j) => j === i ? { ...x, name: v } : x))} placeholder="Dish name" />
          <Input value={d.notes} onChangeText={(v) => setDishes((ds) => ds.map((x, j) => j === i ? { ...x, notes: v } : x))} placeholder="Notes" />
          <Pressable onPress={() => setDishes((ds) => ds.map((x, j) => ({ ...x, isBestDish: j === i ? !x.isBestDish : false })))} className="flex-row items-center gap-2">
            <Ionicons name={d.isBestDish ? "trophy" : "trophy-outline"} size={20} color="#A85D3F" />
            <Text className="text-sm text-savr-600">Best dish of the meal</Text>
          </Pressable>
        </Card>
      ))}
      <Button label="Add Another Dish" variant="secondary" onPress={() => setDishes((d) => [...d, { name: "", rating: 8, notes: "", isBestDish: false }])} />
      <Button label="Publish Review" onPress={submit} loading={loading} />
    </ScrollView>
  );
}
