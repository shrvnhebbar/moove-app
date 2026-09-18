import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Polyline } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import Ring from "../components/Ring";
import { useAuth } from "../context/AuthContext";
import { useMeals } from "../hooks/useMeals";
import { usePersonalInfo } from "../hooks/usePersonalInfo";
import { calcBMI, bmiCategory } from "../utils/bodyMetrics";

// Steps/calories-burned/active-minutes are mocked for now. Swap for Google Fit /
// Apple HealthKit (e.g. via react-native-health-connect) once device sensor
// access is wired up.
const DAY_STATS = [
  { day: "Mon", date: 8, steps: 3200, distance: 2.4, kcalBurn: 118, mins: 42 },
  { day: "Tue", date: 9, steps: 4100, distance: 3.1, kcalBurn: 156, mins: 55 },
  { day: "Wed", date: 10, steps: 2800, distance: 2.1, kcalBurn: 98, mins: 30 },
  { day: "Thu", date: 11, steps: 5200, distance: 3.9, kcalBurn: 201, mins: 68 },
  { day: "Fri", date: 12, steps: 6100, distance: 4.6, kcalBurn: 245, mins: 80 },
  { day: "Sat", date: 13, steps: 4700, distance: 3.5, kcalBurn: 178, mins: 60 },
  { day: "Sun", date: 14, steps: 3900, distance: 2.9, kcalBurn: 142, mins: 47 },
];
const CALORIE_GOAL = 2200;

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { info } = usePersonalInfo();
  const { totals } = useMeals();
  const [selectedDay, setSelectedDay] = useState(4);
  const today = DAY_STATS[selectedDay];
  const maxSteps = Math.max(...DAY_STATS.map((d) => d.steps));
  const calPct = totals.kcal / CALORIE_GOAL;
  const firstName = (info.name || user?.displayName || "there").split(" ")[0];
  const bmi = calcBMI(info.weightKg, info.heightCm);

  return (
    <SafeAreaView style={shared.screen} edges={["top"]}>
      <ScrollView style={shared.screen} contentContainerStyle={shared.content}>
        <View style={[shared.row, { marginTop: 6, marginBottom: 20 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }}>
              <Feather name="user" size={20} color={colors.dim} />
            </View>
            <View>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>Hi, {firstName}</Text>
              <Text style={shared.label}>Welcome back!</Text>
            </View>
          </View>
          <View style={shared.iconBtn}><Feather name="bell" size={17} color={colors.text} /></View>
        </View>

        <View style={[shared.row, { marginBottom: 22 }]}>
          {DAY_STATS.map((d, i) => {
            const active = i === selectedDay;
            return (
              <TouchableOpacity
                key={d.day}
                onPress={() => setSelectedDay(i)}
                style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 14, backgroundColor: active ? colors.accent : "transparent", marginHorizontal: 1 }}
              >
                <Text style={{ fontSize: 11, color: active ? colors.accentInk : colors.dim }}>{d.day}</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: active ? colors.accentInk : colors.dim, marginTop: 2 }}>{d.date}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[shared.h3, { marginBottom: 12 }]}>Recent Activity</Text>

        <View style={[shared.card, { marginBottom: 12 }]}>
          <View style={[shared.row, { marginBottom: 14 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Feather name="trending-up" size={16} color={colors.accent} />
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14.5 }}>Steps</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.dim} />
          </View>
          <View style={[shared.row, { alignItems: "flex-end" }]}>
            <View>
              <Text style={shared.num}>
                <Text style={{ fontSize: 22 }}>{today.steps.toLocaleString()}</Text>
                <Text style={{ fontSize: 13, fontWeight: "500", color: colors.dim }}> steps</Text>
              </Text>
              <Text style={shared.label}>{today.distance} km · {today.kcalBurn} kcal</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 44 }}>
              {DAY_STATS.map((d, i) => (
                <View key={d.day} style={{ width: 10, height: Math.max(8, (d.steps / maxSteps) * 44), borderRadius: 4, backgroundColor: i === selectedDay ? colors.accent : colors.surface3 }} />
              ))}
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
          <View style={[shared.card, { flex: 1 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Feather name="zap" size={14} color={colors.orange} />
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13 }}>Calories</Text>
            </View>
            <Ring pct={today.kcalBurn / 260} color={colors.orange} value={today.kcalBurn} sub="kcal" size={56} />
          </View>
          <View style={[shared.card, { flex: 1 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Feather name="clock" size={14} color={colors.blue} />
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13 }}>Duration</Text>
            </View>
            <Ring pct={today.mins / 90} color={colors.blue} value={today.mins} sub="mins" size={56} />
          </View>
        </View>

        <Text style={[shared.h3, { marginTop: 20, marginBottom: 12 }]}>Nutrition Today</Text>
        <TouchableOpacity style={[shared.card, { marginBottom: 12 }]} onPress={() => navigation.navigate("Nutrition")}>
          <View style={shared.row}>
            <View>
              <Text style={[shared.label, { marginBottom: 4 }]}>Calories intake</Text>
              <Text style={shared.num}>
                <Text style={{ fontSize: 22 }}>{totals.kcal}</Text>
                <Text style={{ fontSize: 13, fontWeight: "500", color: colors.dim }}> / {CALORIE_GOAL} kcal</Text>
              </Text>
            </View>
            <Ring pct={calPct} color={colors.accent} value={`${Math.round(calPct * 100)}%`} size={54} />
          </View>
          <View style={shared.divider} />
          <View style={shared.row}>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{ ...shared.num, fontSize: 14 }}>{totals.p}g</Text>
              <Text style={shared.label}>Protein</Text>
            </View>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{ ...shared.num, fontSize: 14 }}>{totals.c}g</Text>
              <Text style={shared.label}>Carbs</Text>
            </View>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{ ...shared.num, fontSize: 14 }}>{totals.f}g</Text>
              <Text style={shared.label}>Fat</Text>
            </View>
          </View>
        </TouchableOpacity>

              <Text style={[shared.h3, { marginTop: 20, marginBottom: 12 }]}>Current Weight</Text>
      <View style={shared.card}>
        {info.weightKg ? (
          <View style={shared.row}>
            <View>
              <Text style={shared.num}>
                <Text style={{ fontSize: 22 }}>{info.weightKg}</Text>
                <Text style={{ fontSize: 13, fontWeight: "500", color: colors.dim }}> kg</Text>
              </Text>
              {bmi && <Text style={[shared.label, { marginTop: 4 }]}>BMI {bmi.toFixed(1)} · {bmiCategory(bmi)}</Text>}
            </View>
            <TouchableOpacity style={[shared.pill, shared.pillOk]} onPress={() => navigation.navigate("Profile")}>
              <Text style={shared.pillOkText}>Update</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={shared.row} onPress={() => navigation.navigate("Profile")}>
            <Text style={shared.label}>Add your weight in Profile → Personal Information to see it here.</Text>
            <Feather name="chevron-right" size={16} color={colors.dim} />
          </TouchableOpacity>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
