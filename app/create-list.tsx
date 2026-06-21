import { useState } from "react";
import { Text, ScrollView, KeyboardAvoidingView, Platform, View, Pressable } from "react-native";
import { router } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { LIST_TEMPLATES } from "@/constants/list-templates";
import { Card } from "@/components/ui/Card";

export default function CreateListScreen() {
  const createList = useAppStore((s) => s.createList);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const applyTemplate = (template: (typeof LIST_TEMPLATES)[number]) => {
    setName(template.name);
    setDescription(template.description);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    const result = await createList(name, description);
    setLoading(false);
    if ("error" in result) setError(result.error);
    else router.replace({ pathname: "/list/[id]", params: { id: result.listId } });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="px-4 py-6 gap-4" keyboardShouldPersistTaps="handled">
        <Text className="text-lg font-semibold text-savr-900 dark:text-savr-100">New list</Text>

        <View className="gap-2">
          <Text className="text-sm font-medium text-savr-700 dark:text-savr-300">Start from a template</Text>
          <View className="flex-row flex-wrap gap-2">
            {LIST_TEMPLATES.map((t) => (
              <Pressable key={t.id} onPress={() => applyTemplate(t)}>
                <Card className={`px-3 py-2 ${name === t.name ? "border-savr-500" : ""}`}>
                  <Text className="text-sm font-medium text-savr-900 dark:text-savr-100">{t.emoji} {t.name}</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>

        <Input label="Name" value={name} onChangeText={setName} placeholder="Date Night Spots" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Romantic favorites" />
        {error ? <Text className="text-red-500 text-sm">{error}</Text> : null}
        <Button label="Create List" onPress={handleCreate} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

