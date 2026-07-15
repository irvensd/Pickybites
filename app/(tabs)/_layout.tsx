import { Tabs } from "expo-router";
import { TAB_DEFINITIONS } from "@/lib/tabs";
import { PickyTabBar } from "@/components/navigation/PickyTabBar";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="discover"
      tabBar={(props) => <PickyTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {TAB_DEFINITIONS.map((tab) => {
        if (tab.hidden) {
          return (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                href: null,
                title: tab.title,
              }}
            />
          );
        }

        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              ...(tab.isCenterAction
                ? {
                    tabBarShowLabel: false,
                    tabBarLabel: () => null,
                  }
                : {}),
            }}
          />
        );
      })}
    </Tabs>
  );
}
