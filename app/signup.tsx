import { useState } from "react";
import { Text, ScrollView, KeyboardAvoidingView, Platform, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { hapticSuccess } from "@/lib/haptics";

export default function Signup() {
  const signup = useAppStore((s) => s.signup);
  const demoLogin = useAppStore((s) => s.demoLogin);
  const [form, setForm] = useState({ email: "", password: "", username: "", displayName: "", city: "" });
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignup = () => {
    if (!signup(form)) setError("Email or username already taken.");
    else {
      hapticSuccess();
      router.replace("/(tabs)");
    }
  };

  const handleDemo = () => {
    if (demoLogin()) {
      hapticSuccess();
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-savr-50 dark:bg-savr-950">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-6 py-8 gap-4" keyboardShouldPersistTaps="handled">
          <Text className="text-3xl font-bold text-savr-900 dark:text-savr-100 mt-4">Create account</Text>
          <Text className="text-savr-600 dark:text-savr-400">Start building your personal taste map.</Text>

          <Button label="Try Demo — Alex Rivera" variant="demo" onPress={handleDemo} />
          <View className="flex-row items-center gap-3 my-1">
            <View className="flex-1 h-px bg-savr-200 dark:bg-savr-700" />
            <Text className="text-xs text-savr-400 dark:text-savr-500">or sign up</Text>
            <View className="flex-1 h-px bg-savr-200 dark:bg-savr-700" />
          </View>

          <Input label="Display Name" value={form.displayName} onChangeText={(v) => set("displayName", v)} placeholder="Alex Rivera" />
          <Input label="Username" value={form.username} onChangeText={(v) => set("username", v)} autoCapitalize="none" placeholder="alextastes" />
          <Input label="Email" value={form.email} onChangeText={(v) => set("email", v)} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" value={form.password} onChangeText={(v) => set("password", v)} secureTextEntry />
          <Input label="City" value={form.city} onChangeText={(v) => set("city", v)} placeholder="Los Angeles" />
          {error ? <Text className="text-red-500 text-sm">{error}</Text> : null}
          <Button label="Create Account" onPress={handleSignup} />
          <Button label="Log in instead" variant="ghost" onPress={() => router.push("/login")} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
