import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ui } from "@/constants/ui";

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    lists, listItems, getRestaurant, addListItem, removeListItem, deleteList,
    restaurants, reviews, currentUserId, follows, getUser, getListCollaborators,
    inviteListCollaborator, removeListCollaborator, canEditList,
  } = useAppStore();
  const list = lists.find((l) => l.id === id);
  const [adding, setAdding] = useState(false);
  const [inviting, setInviting] = useState(false);

  if (!list) {
    return (
      <View className={`flex-1 items-center justify-center ${ui.screen}`}>
        <Text className={ui.text.muted}>List not found</Text>
      </View>
    );
  }

  const isOwner = list.userId === currentUserId;
  const canEdit = canEditList(list.id);
  const collaborators = getListCollaborators(list.id);
  const items = listItems.filter((li) => li.listId === list.id).sort((a, b) => a.position - b.position);
  const inList = new Set(items.map((i) => i.restaurantId));
  const myRestaurantIds = [...new Set(reviews.filter((r) => r.userId === currentUserId).map((r) => r.restaurantId))];
  const addable = restaurants.filter((r) => myRestaurantIds.includes(r.id) && !inList.has(r.id));
  const inviteCandidates = follows
    .filter((f) => f.followerId === currentUserId)
    .map((f) => getUser(f.followingId))
    .filter(Boolean)
    .filter((u) => u!.id !== currentUserId && !collaborators.some((c) => c.userId === u!.id));

  const handleDelete = () => {
    if (!isOwner) return;
    Alert.alert("Delete list?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteList(list.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="px-4 pb-8 gap-4">
      <View className="flex-row justify-between items-start pt-2">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-savr-900 dark:text-savr-100">{list.name}</Text>
          {list.description ? <Text className="text-sm text-savr-500 dark:text-savr-400 mt-1">{list.description}</Text> : null}
          {!isOwner && <Text className="text-xs text-savr-400 mt-1">Shared with you</Text>}
        </View>
        {isOwner && (
          <Pressable onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={22} color="#B8956F" />
          </Pressable>
        )}
      </View>

      {isOwner && (
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-savr-900 dark:text-savr-100">Collaborators</Text>
            <Pressable onPress={() => setInviting(!inviting)}>
              <Text className="text-sm text-savr-600 dark:text-savr-300">{inviting ? "Done" : "Invite"}</Text>
            </Pressable>
          </View>
          {collaborators.length === 0 ? (
            <Text className={`text-sm ${ui.text.muted}`}>Invite friends to plan trips together.</Text>
          ) : (
            collaborators.map((c) => {
              const u = getUser(c.userId);
              return (
                <View key={c.id} className="flex-row items-center gap-3">
                  <Avatar name={u?.displayName ?? "?"} src={u?.avatarUrl} size="sm" />
                  <Text className="flex-1 text-savr-800 dark:text-savr-200">{u?.displayName}</Text>
                  <Pressable onPress={() => removeListCollaborator(c.id)}>
                    <Ionicons name="close-circle-outline" size={20} color="#B8956F" />
                  </Pressable>
                </View>
              );
            })
          )}
          {inviting && (
            <View className="gap-2 mt-1">
              {inviteCandidates.length === 0 ? (
                <Text className={`text-sm ${ui.text.muted}`}>Follow friends first to invite them.</Text>
              ) : (
                inviteCandidates.map((u) => (
                  <Pressable
                    key={u!.id}
                    onPress={async () => {
                      const result = await inviteListCollaborator(list.id, u!.id);
                      if (!result.ok) Alert.alert("Invite", result.error);
                    }}
                    className="flex-row items-center gap-3 py-2"
                  >
                    <Avatar name={u!.displayName} src={u!.avatarUrl} size="sm" />
                    <Text className="text-savr-800 dark:text-savr-200">{u!.displayName}</Text>
                    <Ionicons name="person-add-outline" size={18} color="#A85D3F" />
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>
      )}

      {canEdit && (
        <Button
          label={adding ? "Hide restaurants" : "Add restaurant"}
          variant="secondary"
          onPress={() => setAdding(!adding)}
        />
      )}

      {adding && canEdit && (
        <View className="gap-2">
          {addable.length === 0 ? (
            <Card><Text className={`text-center py-4 ${ui.text.muted}`}>Review more spots to add them here.</Text></Card>
          ) : (
            addable.map((r) => (
              <Pressable
                key={r.id}
                onPress={async () => {
                  const result = await addListItem(list.id, r.id);
                  if (!result.ok) Alert.alert("Error", result.error);
                }}
              >
                <RestaurantCard restaurant={r} />
              </Pressable>
            ))
          )}
        </View>
      )}

      <Text className="font-semibold text-savr-900 dark:text-savr-100">{items.length} spots</Text>
      {items.map((item) => {
        const r = getRestaurant(item.restaurantId);
        if (!r) return null;
        return (
          <View key={item.id}>
            <RestaurantCard restaurant={r} />
            {item.note ? <Text className={`text-xs px-1 mt-1 ${ui.text.muted}`}>{item.note}</Text> : null}
            {canEdit && (
              <Pressable onPress={() => removeListItem(item.id)} className="self-end mt-1 px-2 py-1">
                <Text className="text-xs text-red-500">Remove</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
