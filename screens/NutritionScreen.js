import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import Ring from "../components/Ring";
import { useMeals } from "../hooks/useMeals";

const MEAL_NAMES = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const CALORIE_GOAL = 2200;
const MACRO_GOAL = { p: 150, c: 240, f: 70 };

export default function NutritionScreen() {
  const { meals, totals, addFood, removeFood } = useMeals();
  const [addingTo, setAddingTo] = useState(null);
  const [form, setForm] = useState({ name: "", kcal: "", p: "", c: "", f: "" });

  const submitFood = async () => {
    if (!form.name.trim() || !form.kcal) return;
    await addFood(addingTo, {
      name: form.name,
      kcal: Number(form.kcal) || 0,
      p: Number(form.p) || 0,
      c: Number(form.c) || 0,
      f: Number(form.f) || 0,
    });
    setForm({ name: "", kcal: "", p: "", c: "", f: "" });
    setAddingTo(null);
  };

  const remaining = CALORIE_GOAL - totals.kcal;
  const macroPct = (v, goal) => Math.min(v / goal, 1);

  return (
    <SafeAreaView style={shared.screen} edges={["top"]}>
      <ScrollView style={shared.screen} contentContainerStyle={shared.content}>
        <Text style={[shared.h1, { marginBottom: 16, marginTop: 8 }]}>Nutrition</Text>

        <View style={[shared.card, { marginBottom: 16 }]}>
          <View style={shared.row}>
            <Ring pct={totals.kcal / CALORIE_GOAL} color={colors.accent} size={78} stroke={8} value={remaining >= 0 ? remaining : 0} sub="left" />
            <View style={{ flex: 1, marginLeft: 18 }}>
              <View style={[shared.row, { marginBottom: 6 }]}>
                <Text style={shared.label}>Consumed</Text>
                <Text style={{ ...shared.num, fontSize: 13 }}>{totals.kcal} kcal</Text>
              </View>
              <View style={[shared.row, { marginBottom: 6 }]}>
                <Text style={shared.label}>Goal</Text>
                <Text style={{ ...shared.num, fontSize: 13 }}>{CALORIE_GOAL} kcal</Text>
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
            { key: "p", label: "Protein", color: colors.orange, goal: MACRO_GOAL.p },
            { key: "c", label: "Carbs", color: colors.blue, goal: MACRO_GOAL.c },
            { key: "f", label: "Fat", color: colors.accent, goal: MACRO_GOAL.f },
          ].map((m) => (
            <View key={m.key} style={{ marginBottom: 10 }}>
              <View style={[shared.row, { marginBottom: 4 }]}>
                <Text style={{ color: colors.text, fontSize: 12.5 }}>{m.label}</Text>
                <Text style={shared.label}>{totals[m.key]}g / {m.goal}g</Text>
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
                onPress={() => setAddingTo(addingTo === mealName ? null : mealName)}
              >
                <Feather name="plus" size={15} color={colors.text} />
              </TouchableOpacity>
            </View>

            {meals[mealName].length === 0 && addingTo !== mealName && <Text style={shared.label}>No items logged.</Text>}

            {meals[mealName].map((f) => (
              <View style={[shared.card, { marginBottom: 8, paddingVertical: 12, paddingHorizontal: 14 }]} key={f.id}>
                <View style={shared.row}>
                  <View>
                    <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13.5 }}>{f.name}</Text>
                    <Text style={[shared.label, { marginTop: 2 }]}>P {f.p}g · C {f.c}g · F {f.f}g</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ ...shared.num, fontSize: 13.5 }}>{f.kcal} kcal</Text>
                    <TouchableOpacity onPress={() => removeFood(mealName, f.id)}>
                      <Feather name="x" size={14} color={colors.dim} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {addingTo === mealName && (
              <View style={[shared.card, { gap: 8, marginTop: 4 }]}>
                <TextInput style={shared.input} placeholder="Food name" placeholderTextColor={colors.dim2} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TextInput style={[shared.input, { flex: 1 }]} placeholder="kcal" placeholderTextColor={colors.dim2} keyboardType="numeric" value={form.kcal} onChangeText={(v) => setForm({ ...form, kcal: v.replace(/\D/g, "") })} />
                  <TextInput style={[shared.input, { flex: 1 }]} placeholder="protein g" placeholderTextColor={colors.dim2} keyboardType="numeric" value={form.p} onChangeText={(v) => setForm({ ...form, p: v.replace(/\D/g, "") })} />
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TextInput style={[shared.input, { flex: 1 }]} placeholder="carbs g" placeholderTextColor={colors.dim2} keyboardType="numeric" value={form.c} onChangeText={(v) => setForm({ ...form, c: v.replace(/\D/g, "") })} />
                  <TextInput style={[shared.input, { flex: 1 }]} placeholder="fat g" placeholderTextColor={colors.dim2} keyboardType="numeric" value={form.f} onChangeText={(v) => setForm({ ...form, f: v.replace(/\D/g, "") })} />
                </View>
                <TouchableOpacity style={[shared.btn, shared.btnPrimary]} onPress={submitFood}>
                  <Text style={shared.btnPrimaryText}>Add to {mealName}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
