import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import { useThemedColors } from "@/lib/useThemedColors";

interface ButtonProps extends PressableProps {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "demo";
  loading?: boolean;
  className?: string;
  haptic?: boolean;
}

export function Button({ label, variant = "primary", loading, className, disabled, haptic = true, onPress, ...props }: ButtonProps) {
  const colors = useThemedColors();
  const base = "rounded-2xl py-4 px-6 items-center justify-center min-h-[52px]";
  const variants = {
    primary: "bg-savr-600 dark:bg-savr-500 active:bg-savr-700 dark:active:bg-savr-600",
    secondary: "bg-white dark:bg-savr-875 active:bg-savr-50 dark:active:bg-savr-800",
    ghost: "bg-transparent active:bg-savr-100 dark:active:bg-savr-925",
    danger: "bg-red-500 active:bg-red-600",
    demo: "bg-savr-900 dark:bg-savr-600 active:opacity-90",
  };
  const textVariants = {
    primary: "text-white font-semibold text-base",
    secondary: "text-savr-900 dark:text-savr-100 font-semibold text-base",
    ghost: "text-savr-700 dark:text-savr-300 font-semibold text-base",
    danger: "text-white font-semibold text-base",
    demo: "text-white font-semibold text-base",
  };

  const handlePress = (e: Parameters<NonNullable<PressableProps["onPress"]>>[0]) => {
    if (haptic) hapticLight();
    onPress?.(e);
  };

  return (
    <Pressable
      className={cn(base, variants[variant], (disabled || loading) && "opacity-50", className)}
      disabled={disabled || loading}
      onPress={handlePress}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" || variant === "demo" ? "#fff" : colors.brand} />
      ) : (
        <Text className={textVariants[variant]}>{label}</Text>
      )}
    </Pressable>
  );
}
