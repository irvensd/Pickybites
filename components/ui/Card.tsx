import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { ui } from "@/constants/ui";
import { cardShadow } from "@/lib/card-shadow";

export function Card({ className, children, ...props }: ViewProps & { className?: string }) {
  const isDark = useThemeStore((s) => s.resolved) === "dark";
  return (
    <View
      className={cn(
        ui.surface.card,
        "rounded-2xl p-4",
        isDark && "border border-savr-800",
        className
      )}
      style={cardShadow(isDark)}
      {...props}
    >
      {children}
    </View>
  );
}
