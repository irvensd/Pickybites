import { View, Text, TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      {label && <Text className="text-sm font-medium text-savr-800 dark:text-savr-200">{label}</Text>}
      <TextInput
        className={cn(
          "bg-white dark:bg-savr-800 border border-savr-200 dark:border-savr-600 rounded-xl px-4 py-3.5 text-base text-savr-900 dark:text-savr-100 min-h-[52px]",
          error && "border-red-400",
          className
        )}
        placeholderTextColor="#D4C4B5"
        {...props}
      />
      {error && <Text className="text-sm text-red-500">{error}</Text>}
    </View>
  );
}
