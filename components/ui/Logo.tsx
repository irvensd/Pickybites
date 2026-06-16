import { View, Text } from "react-native";
import { Image } from "expo-image";
import { APP_NAME, APP_TAGLINE } from "@/constants/branding";

const SIZES = { sm: 40, md: 56, lg: 72, xl: 96 } as const;

export function Logo({
  size = "md",
  showName = false,
  showTagline = false,
}: {
  size?: keyof typeof SIZES;
  showName?: boolean;
  showTagline?: boolean;
}) {
  const px = SIZES[size];

  return (
    <View className="items-center">
      <Image
        source={require("@/assets/images/logo.png")}
        style={{ width: px, height: px }}
        contentFit="contain"
        transition={200}
      />
      {showName && (
        <Text
          className={`font-bold text-savr-900 dark:text-savr-100 text-center ${size === "xl" ? "text-4xl mt-4" : size === "lg" ? "text-3xl mt-3" : "text-2xl mt-2"}`}
        >
          {APP_NAME}
        </Text>
      )}
      {showTagline && (
        <Text className="text-savr-600 dark:text-savr-400 text-center mt-1 text-base">
          {APP_TAGLINE}
        </Text>
      )}
    </View>
  );
}
