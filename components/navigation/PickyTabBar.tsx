import { Platform, View, Text, StyleSheet } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlatformPressable } from "@react-navigation/elements";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useThemeStore, themeColors } from "@/store/useThemeStore";
import { hapticMedium, hapticSelection } from "@/lib/haptics";
import { brandColors } from "@/constants/branding";
import { getTabDefinition, VISIBLE_TAB_ORDER, type VisibleTabName } from "@/lib/tabs";
import {
  CENTER_PLUS_ICON_SIZE,
  CENTER_PLUS_OFFSET,
  CENTER_PLUS_SHADOW,
  CENTER_PLUS_SIZE,
  getTabBarHeight,
} from "@/lib/tab-bar";

/**
 * Equal-width custom tab bar so the center plus is geometrically centered
 * between Feed and Bites (default RN tabBarButton styles skew the circle).
 */
export function PickyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const resolved = useThemeStore((s) => s.resolved);
  const colors = themeColors[resolved];
  const height = getTabBarHeight(insets.bottom);
  const plusFill = resolved === "dark" ? brandColors.rose : brandColors.roseDark;

  const visibleRoutes = VISIBLE_TAB_ORDER.map((name) => {
    const route = state.routes.find((r) => r.name === name);
    return route ? { name, route } : null;
  }).filter(Boolean) as { name: VisibleTabName; route: (typeof state.routes)[number] }[];

  return (
    <View
      style={[
        styles.bar,
        {
          height,
          paddingBottom: insets.bottom + 6,
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: Platform.OS === "ios" ? 0.5 : 1,
          shadowOpacity: resolved === "dark" ? 0.25 : 0.06,
          shadowRadius: resolved === "dark" ? 8 : 6,
        },
      ]}
    >
      <View style={styles.row}>
        {visibleRoutes.map(({ name, route }) => {
          const def = getTabDefinition(name);
          if (!def) return null;

          const index = state.routes.findIndex((r) => r.key === route.key);
          const focused = state.index === index;
          const color = focused ? colors.tabActive : colors.tabInactive;
          const options = descriptors[route.key]?.options;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (event.defaultPrevented) return;

            if (def.isCenterAction) {
              hapticMedium();
            } else {
              hapticSelection();
            }

            if (!focused) {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          };

          if (def.isCenterAction) {
            return (
              <View key={route.key} style={styles.slot} pointerEvents="box-none">
                <PlatformPressable
                  accessibilityRole="button"
                  accessibilityLabel={options?.tabBarAccessibilityLabel ?? "Add"}
                  accessibilityState={focused ? { selected: true } : {}}
                  testID={options?.tabBarButtonTestID}
                  pressOpacity={0.85}
                  onPress={onPress}
                  style={styles.plusPressable}
                >
                  <View style={[styles.plusButton, { backgroundColor: plusFill }]}>
                    <Ionicons name="add" size={CENTER_PLUS_ICON_SIZE} color="#FFFFFF" />
                  </View>
                </PlatformPressable>
              </View>
            );
          }

          const iconName = focused ? def.icon.focused : def.icon.unfocused;

          return (
            <PlatformPressable
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? def.title}
              accessibilityState={focused ? { selected: true } : {}}
              testID={options?.tabBarButtonTestID}
              pressOpacity={0.85}
              onPress={onPress}
              style={styles.slot}
            >
              <Ionicons name={iconName} size={24} color={color} />
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {def.title}
              </Text>
            </PlatformPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  /** Exactly equal columns — five slots across the full bar width. */
  slot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  plusPressable: {
    marginTop: CENTER_PLUS_OFFSET,
    width: CENTER_PLUS_SIZE,
    height: CENTER_PLUS_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  plusButton: {
    width: CENTER_PLUS_SIZE,
    height: CENTER_PLUS_SIZE,
    borderRadius: CENTER_PLUS_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    ...CENTER_PLUS_SHADOW,
  },
});
