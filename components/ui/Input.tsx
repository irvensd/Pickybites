import { View, Text, TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";
import { useThemedColors } from "@/lib/useThemedColors";
import { ui } from "@/constants/ui";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  const colors = useThemedColors();
  return (
    <View className="gap-1.5">
      {label && <Text className={`text-sm font-medium ${ui.text.secondary}`}>{label}</Text>}
      <TextInput
        className={cn(
          "rounded-xl px-4 py-3.5 text-base min-h-[52px]",
          ui.surface.search,
          ui.text.primary,
          error && "border-red-400",
          className
        )}
        placeholderTextColor={colors.placeholder}
        {...props}
      />
      {error && <Text className="text-sm text-red-500">{error}</Text>}
    </View>
  );
}
