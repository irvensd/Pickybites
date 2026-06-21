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
  className,
  ...props
}: CountUpTextProps) {
  return (
    <Text className={className} {...props}>
      {value.toFixed(decimals)}
      {suffix}
    </Text>
  );
}
