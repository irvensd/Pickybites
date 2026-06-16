import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ListsScreen() {
  const { currentUserId, getMyLists, listItems, getRestaurant } = useAppStore();
  const userLists = getMyLists();

  return (
    <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="px-4 pb-6 gap-4">
      <Button label="Create New List" onPress={() => router.push("/create-list")} />

      {userLists.length === 0 ? (
        <EmptyState
          icon="list-outline"
          title="No lists yet"
          description="Curate your favorite spots, date-night picks, or must-try restaurants into shareable lists."
          actionLabel="Create a List"
          onAction={() => router.push("/create-list")}
        />
      ) : (
        userLists.map((list) => {
          const items = listItems.filter((li) => li.listId === list.id).sort((a, b) => a.position - b.position);
          return (
            <Pressable key={list.id} onPress={() => router.push({ pathname: "/list/[id]", params: { id: list.id } })}>
              <View className="gap-2">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-semibold text-savr-900 dark:text-savr-100">{list.name}</Text>
                    <Text className="text-xs text-savr-500 dark:text-savr-400">{list.description}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs text-savr-400 bg-savr-100 dark:bg-savr-800 px-2 py-1 rounded-full">{items.length} spots</Text>
                    <Ionicons name="chevron-forward" size={18} color="#B8956F" />
                  </View>
                </View>
                {items.slice(0, 2).map((item) => {
                  const r = getRestaurant(item.restaurantId);
                  return r ? <RestaurantCard key={item.id} restaurant={r} /> : null;
                })}
              </View>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}
