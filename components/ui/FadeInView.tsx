import type { ViewProps } from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

type FadeInViewProps = ViewProps & {
  delay?: number;
  direction?: "up" | "none";
  children: React.ReactNode;
};

export function FadeInView({ delay = 0, direction = "up", children, ...props }: FadeInViewProps) {
  const entering = direction === "up" ? FadeInDown.delay(delay).duration(420) : FadeIn.delay(delay).duration(420);

  return (
    <Animated.View entering={entering} {...props}>
      {children}
    </Animated.View>
  );
}
