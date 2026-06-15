import { View, Text, Image } from "react-native";
import { getInitials } from "@/lib/utils";

const sizes = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-14 h-14", xl: "w-20 h-20" };
const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base", xl: "text-xl" };

export function Avatar({ name, src, size = "md" }: { name: string; src?: string | null; size?: keyof typeof sizes }) {
  if (src) return <Image source={{ uri: src }} className={`${sizes[size]} rounded-full`} />;
  return (
    <View className={`${sizes[size]} rounded-full bg-savr-500 items-center justify-center`}>
      <Text className={`${textSizes[size]} font-bold text-white`}>{getInitials(name)}</Text>
    </View>
  );
}
