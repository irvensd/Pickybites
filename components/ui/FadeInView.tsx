import type { ViewProps } from "react-native";
import { View } from "react-native";

type FadeInViewProps = ViewProps & {
  delay?: number;
  direction?: "up" | "none";
  children: React.ReactNode;
};

/** Plain wrapper — Reanimated entering animations were causing update loops on some devices. */
export function FadeInView({ children, ...props }: FadeInViewProps) {
  return <View {...props}>{children}</View>;
}
