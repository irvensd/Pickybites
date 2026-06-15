import { View, type ViewProps, Platform } from "react-native";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";

export function Card({ className, children, ...props }: ViewProps & { className?: string }) {
  const isDark = useThemeStore((s) => s.resolved) === "dark";
  return (
    <View
      className={cn("bg-white dark:bg-savr-800 rounded-2xl p-4 border border-savr-100/80 dark:border-savr-700", className)}
      style={{
        shadowColor: isDark ? "#000" : "#4A2819",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: Platform.OS === "ios" ? (isDark ? 0.2 : 0.06) : 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
      {...props}
    >
      {children}
    </View>
  );
}
