import { View } from "react-native";
import { cn } from "@/lib/utils";
import { ui } from "@/constants/ui";

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: { width?: number | `${number}%`; height?: number };
}) {
  return (
    <View
      className={cn("rounded-xl overflow-hidden", ui.surface.muted, className)}
      style={style}
    />
  );
}

export function ReviewCardSkeleton() {
  return (
    <View className="gap-3">
      <Skeleton style={{ width: "100%", height: 180 }} className="rounded-2xl" />
      <View className="px-1 gap-3">
        <View className="flex-row items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton style={{ width: "45%", height: 14 }} />
            <Skeleton style={{ width: "30%", height: 10 }} />
          </View>
        </View>
        <Skeleton style={{ width: "70%", height: 14 }} />
        <Skeleton style={{ width: "100%", height: 48 }} />
      </View>
    </View>
  );
}
