import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

const ACTIVE = "#1B3A6B";
const INACTIVE = "#9CA3AF";
const BAR_BG = "#FFFFFF";
const BAR_BORDER = "#E5E7EB";

function TabIcon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="exchange"
        options={{
          title: "Обмен",
          tabBarIcon: ({ color }) => (
            <TabIcon name="swap-horizontal-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rates"
        options={{
          title: "Курсы",
          tabBarIcon: ({ color }) => (
            <TabIcon name="stats-chart-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Меню",
          tabBarIcon: ({ color }) => (
            <View style={styles.moreIcon}>
              <Ionicons name="grid-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "История",
          tabBarIcon: ({ color }) => (
            <TabIcon name="time-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color }) => (
            <TabIcon name="person-outline" color={color} />
          ),
        }}
      />

      {/* Hidden screens — accessible by route, no tab button */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="card-verify" options={{ href: null }} />
      <Tabs.Screen name="contacts" options={{ href: null }} />
      <Tabs.Screen name="faq" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: BAR_BG,
    borderTopColor: BAR_BORDER,
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 84 : 64,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 0,
  },
  tabItem: {
    paddingTop: 0,
  },
  moreIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
});
