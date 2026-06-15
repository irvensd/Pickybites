import { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Card } from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";

export default function JournalScreen() {
  const { currentUserId, reviews, restaurants } = useAppStore();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    let items = reviews.filter((r) => r.userId === currentUserId);
    if (query) {
      const q = query.toLowerCase();
      items = items.filter((r) => {
        const rest = restaurants.find((x) => x.id === r.restaurantId);
        return r.text.toLowerCase().includes(q) || rest?.name.toLowerCase().includes(q) || rest?.city.toLowerCase().includes(q);
      });
    }
    return items.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }, [reviews, restaurants, currentUserId, query]);

  return (
    <ScrollView className="flex-1 bg-savr-50" contentContainerClassName="px-4 pb-6 gap-4">
      <View className="flex-row items-center bg-white border border-savr-200 rounded-xl px-3 min-h-[52px]">
        <Ionicons name="search" size={20} color="#D4C4B5" />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search visits..." className="flex-1 ml-2 text-base" placeholderTextColor="#D4C4B5" />
      </View>
      {filtered.length === 0 ? <Card><Text className="text-savr-500 text-center py-8">No journal entries.</Text></Card> : filtered.map((r) => <ReviewCard key={r.id} review={r} />)}
    </ScrollView>
  );
}
