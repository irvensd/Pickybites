import { useEffect, useState } from "react";
import { Text, type TextProps } from "react-native";

type CountUpTextProps = TextProps & {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
};

export function CountUpText({
  value,
  decimals = 0,
  suffix = "",
  duration = 700,
  className,
  ...props
}: CountUpTextProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min(1, (Date.now() - start) / duration);
      setDisplay(value * progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <Text className={className} {...props}>
      {display.toFixed(decimals)}
      {suffix}
    </Text>
  );
}
