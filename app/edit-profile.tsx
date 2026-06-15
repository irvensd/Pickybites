import { useState } from "react";
import { Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function EditProfileScreen() {
  const { users, currentUserId, updateProfile } = useAppStore();
  const user = users.find((u) => u.id === currentUserId);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  const save = () => {
    // TODO: Supabase profile update
    updateProfile({ displayName, username, city, bio });
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-savr-50" contentContainerClassName="px-4 pb-6 gap-4" keyboardShouldPersistTaps="handled">
        <Input label="Display Name" value={displayName} onChangeText={setDisplayName} />
        <Input label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Input label="City" value={city} onChangeText={setCity} />
        <Input label="Bio" value={bio} onChangeText={setBio} multiline numberOfLines={3} />
        <Button label="Save Changes" onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
