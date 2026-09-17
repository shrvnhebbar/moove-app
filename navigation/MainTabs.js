import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import WorkoutScreen from "../screens/WorkoutScreen";
import NutritionScreen from "../screens/NutritionScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();

const ICONS = { Home: "home", Workout: "activity", Nutrition: "coffee", Profile: "user" };

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.dim2,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 82,
          paddingTop: 8,
          paddingBottom: 20,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "600" },
        tabBarIcon: ({ color, size }) => <Feather name={ICONS[route.name]} size={20} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
