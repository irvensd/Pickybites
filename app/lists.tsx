import { View, Text, ScrollView } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { Card } from "@/components/ui/Card";

export default function ListsScreen() {
  const { currentUserId, lists, listItems, getRestaurant } = useAppStore();
  const userLists = lists.filter((l) => l.userId === currentUserId);

  return (
    <ScrollView className="flex-1 bg-savr-50" contentContainerClassName="px-4 pb-6 gap-4">
      {userLists.length === 0 ? <Card><Text className="text-savr-500 text-center py-8">No lists yet.</Text></Card> : userLists.map((list) => {
        const items = listItems.filter((li) => li.listId === list.id).sort((a, b) => a.position - b.position);
        return (
          <View key={list.id} className="gap-2">
            <View className="flex-row justify-between items-center">
              <View><Text className="font-semibold text-savr-900">{list.name}</Text><Text className="text-xs text-savr-500">{list.description}</Text></View>
              <Text className="text-xs text-savr-400 bg-savr-100 px-2 py-1 rounded-full">{items.length} spots</Text>
            </View>
            {items.map((item) => { const r = getRestaurant(item.restaurantId); return r ? <View key={item.id}><RestaurantCard restaurant={r} />{item.note && <Text className="text-xs text-savr-500 px-1 mt-1">{item.note}</Text>}</View> : null; })}
          </View>
        );
      })}
    </ScrollView>
  );
}
