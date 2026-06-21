import { Text, ScrollView } from "react-native";
import { TERMS_SECTIONS } from "@/constants/legal";
import { APP_NAME } from "@/constants/branding";
import { ui } from "@/constants/ui";

export default function TermsScreen() {
  return (
    <ScrollView className="flex-1 bg-savr-50 dark:bg-savr-950" contentContainerClassName="px-4 py-6 gap-5">
      <Text className="text-2xl font-bold text-savr-900 dark:text-savr-100">Terms of Service</Text>
      <Text className={`text-sm ${ui.text.muted}`}>Last updated: June 2026</Text>
      {TERMS_SECTIONS.map((section) => (
        <Text key={section.title} className="text-savr-800 dark:text-savr-200 leading-6">
          <Text className="font-semibold">{section.title}{"\n"}</Text>
          {section.body}
        </Text>
      ))}
    </ScrollView>
  );
}

