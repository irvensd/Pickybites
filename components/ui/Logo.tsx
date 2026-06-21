import { View, Text } from "react-native";
import { Image } from "expo-image";
import { APP_NAME_PICKY, APP_NAME_BITES, APP_TAGLINE } from "@/constants/branding";

const SIZES = { sm: 40, md: 56, lg: 72, xl: 96 } as const;

const NAME_SIZES = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
} as const;

export function Logo({
  size = "md",
  showName = false,
  showTagline = false,
  showIcon = true,
}: {
  size?: keyof typeof SIZES;
  showName?: boolean;
  showTagline?: boolean;
  showIcon?: boolean;
}) {
  const px = SIZES[size];
  const nameSize = NAME_SIZES[size];

  return (
    <View className="items-center">
      {showIcon && (
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: px, height: px }}
          contentFit="contain"
          transition={200}
        />
      )}
      {showName && (
        <Text
          className={`font-bold text-center ${showIcon ? (size === "xl" ? "mt-4" : size === "lg" ? "mt-3" : "mt-2") : ""} ${nameSize}`}
        >
          <Text className="text-savr-900 dark:text-savr-50">{APP_NAME_PICKY}</Text>
          <Text className="text-savr-500 dark:text-savr-400">{APP_NAME_BITES}</Text>
        </Text>
      )}
      {showTagline && (
        <Text className="text-savr-400 dark:text-savr-500 text-center mt-2 text-xs font-semibold uppercase tracking-[0.2em]">
          {APP_TAGLINE}
        </Text>
      )}
    </View>
  );
}
