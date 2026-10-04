import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, X } from "lucide-react-native";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import Ring from "../components/Ring";
import { useMeals, MEAL_NAMES } from "../hooks/useMeals";
import { useCalorieGoal } from "../hooks/useCalorieGoal";
import FoodPickerModal from "./FoodPickerModal";

const fmt1 = (v) => Number(v || 0).toFixed(1);

export default function NutritionScreen() {
  const { meals, totals, addFood, removeFood } = useMeals();
  const { calorieGoal, macroGoal } = useCalorieGoal();
  const [pickerMeal, setPickerMeal] = useState(null);

  const remaining = calorieGoal - totals.kcal;
  // A macro goal can be 0 (carbs when protein + fat use up the whole calorie target).
  const macroPct = (v, goal) => (goal > 0 ? Math.min(v / goal, 1) : v > 0 ? 1 : 0);

  return (
    <SafeAreaView style={shared.screen} edges={["top"]}>
      <ScrollView style={shared.screen} contentContainerStyle={shared.content}>
        <Text style={[shared.h1, { marginBottom: 16, marginTop: 8 }]}>Nutrition</Text>

        <View style={[shared.card, { marginBottom: 16 }]}>
          <View style={shared.row}>
            <Ring pct={totals.kcal / calorieGoal} color={colors.accent} size={78} stroke={8} value={remaining >= 0 ? remaining : 0} sub="left" />
            <View style={{ flex: 1, marginLeft: 18 }}>
              <View style={[shared.row, { marginBottom: 6 }]}>
                <Text style={shared.label}>Consumed</Text>
                <Text style={{ ...shared.num, fontSize: 13 }}>{totals.kcal} kcal</Text>
              </View>
              <View style={[shared.row, { marginBottom: 6 }]}>
                <Text style={shared.label}>Goal</Text>
                <Text style={{ ...shared.num, fontSize: 13 }}>{calorieGoal} kcal</Text>
              </View>
              <View style={shared.row}>
                <Text style={shared.label}>Status</Text>
                <View style={[shared.pill, shared.pillOk]}>
                  <Text style={[shared.pillOkText, { fontSize: 10 }]}>{remaining >= 0 ? "On track" : "Over goal"}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={shared.divider} />
          {[
            { key: "p", label: "Protein", color: colors.orange, goal: macroGoal.p },
            { key: "c", label: "Carbs", color: colors.blue, goal: macroGoal.c },
            { key: "f", label: "Fat", color: colors.accent, goal: macroGoal.f },
          ].map((m) => (
            <View key={m.key} style={{ marginBottom: 10 }}>
              <View style={[shared.row, { marginBottom: 4 }]}>
                <Text style={{ color: colors.text, fontSize: 12.5 }}>{m.label}</Text>
                <Text style={shared.label}>{fmt1(totals[m.key])}g / {m.goal}g</Text>
              </View>
              <View style={{ height: 6, backgroundColor: colors.surface3, borderRadius: 4, overflow: "hidden" }}>
                <View style={{ width: `${macroPct(totals[m.key], m.goal) * 100}%`, height: "100%", backgroundColor: m.color, borderRadius: 4 }} />
              </View>
            </View>
          ))}
        </View>

        {MEAL_NAMES.map((mealName) => (
          <View key={mealName} style={{ marginBottom: 18 }}>
            <View style={[shared.row, { marginBottom: 8 }]}>
              <Text style={shared.h3}>{mealName}</Text>
              <TouchableOpacity
                style={[shared.iconBtn, { width: 30, height: 30, borderRadius: 9 }]}
                onPress={() => setPickerMeal(mealName)}
              >
                <Plus size={15} color={colors.text} />
              </TouchableOpacity>
            </View>

            {meals[mealName].length === 0 && <Text style={shared.label}>No items logged.</Text>}

            {meals[mealName].map((f) => (
              <View style={[shared.card, { marginBottom: 8, paddingVertical: 12, paddingHorizontal: 14 }]} key={f.id}>
                <View style={shared.row}>
                  <View>
                    <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13.5 }}>{f.name}</Text>
                    <Text style={[shared.label, { marginTop: 2 }]}>P {fmt1(f.p)}g · C {fmt1(f.c)}g · F {fmt1(f.f)}g</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ ...shared.num, fontSize: 13.5 }}>{f.kcal} kcal</Text>
                    <TouchableOpacity onPress={() => removeFood(mealName, f.id)}>
                      <X size={14} color={colors.dim} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

          </View>
        ))}
      </ScrollView>

      <FoodPickerModal
        visible={!!pickerMeal}
        mealName={pickerMeal}
        onClose={() => setPickerMeal(null)}
        onAddFood={addFood}
      />
    </SafeAreaView>
  );
}
