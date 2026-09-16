import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { useWorkouts } from "../hooks/useWorkouts";
import { EXERCISES, CATEGORIES } from "../data/exercises";

const TEMPLATES = [
  { id: "t1", name: "Push Day", subtitle: "Chest · Shoulders · Triceps", exercises: ["Bench Press", "Overhead Press", "Tricep Pushdown"] },
  { id: "t2", name: "Pull Day", subtitle: "Back · Biceps", exercises: ["Deadlift", "Lat Pulldown", "Barbell Curl"] },
  { id: "t3", name: "Leg Day", subtitle: "Quads · Hams · Glutes", exercises: ["Back Squat", "Leg Press", "Romanian Deadlift"] },
];

const emptySet = () => ({ id: Math.random().toString(36).slice(2), weight: "", reps: "", done: false });
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function WorkoutScreen() {
  const { history, saveWorkout } = useWorkouts();
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (activeWorkout) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
    setElapsed(0);
  }, [activeWorkout]);

  const startWorkout = (template) => {
    setActiveWorkout({
      name: template ? template.name : "New Workout",
      exercises: (template ? template.exercises : []).map((n) => ({ id: Math.random().toString(36).slice(2), name: n, sets: [emptySet()] })),
    });
  };

  const openPicker = () => {
    setSearch("");
    setActiveCategory("All");
    setPickerVisible(true);
  };

  const selectExercise = (exercise) => {
    setActiveWorkout((w) => ({
      ...w,
      exercises: [...w.exercises, { id: Math.random().toString(36).slice(2), name: exercise.name, sets: [emptySet()] }],
    }));
    setPickerVisible(false);
  };

  const filteredExercises = EXERCISES.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addSet = (exId) => setActiveWorkout((w) => ({ ...w, exercises: w.exercises.map((ex) => (ex.id === exId ? { ...ex, sets: [...ex.sets, emptySet()] } : ex)) }));
  const updateSet = (exId, setId, field, value) =>
    setActiveWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((ex) => (ex.id !== exId ? ex : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)) })),
    }));
  const toggleDone = (exId, setId) =>
    setActiveWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((ex) => (ex.id !== exId ? ex : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, done: !s.done } : s)) })),
    }));
  const removeExercise = (exId) => setActiveWorkout((w) => ({ ...w, exercises: w.exercises.filter((ex) => ex.id !== exId) }));

  const finishWorkout = async () => {
    let volume = 0, setCount = 0;
    activeWorkout.exercises.forEach((ex) =>
      ex.sets.forEach((s) => {
        if (s.done) {
          volume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
          setCount++;
        }
      })
    );
    await saveWorkout({
      name: activeWorkout.name,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      duration: fmt(elapsed),
      volume,
      sets: setCount,
    });
    setActiveWorkout(null);
  };

  const ExercisePickerModal = (
    <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <View style={[shared.row, { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 }]}>
          <Text style={shared.h2}>Add Exercise</Text>
          <TouchableOpacity style={shared.iconBtn} onPress={() => setPickerVisible(false)}>
            <Feather name="x" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <TextInput
            style={shared.input}
            placeholder="Search exercises"
            placeholderTextColor={colors.dim2}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12, paddingLeft: 18, height: 44, flexGrow: 0, flexShrink: 0 }}
          contentContainerStyle={{ alignItems: "center" }}
        >
          {CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={{
                  paddingVertical: 9, paddingHorizontal: 14, borderRadius: 20, marginRight: 8,
                  backgroundColor: active ? colors.accent : colors.surface2,
                  borderWidth: 1, borderColor: active ? colors.accent : colors.border,
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12.5, fontWeight: "600", color: active ? colors.accentInk : colors.dim,
                    lineHeight: 16, includeFontPadding: false, textAlignVertical: "center",
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 40 }}
          ListEmptyComponent={<Text style={shared.label}>No exercises match "{search}".</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={[shared.card, { marginBottom: 10 }]} onPress={() => selectExercise(item)}>
              <View style={shared.row}>
                <View>
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14.5 }}>{item.name}</Text>
                  <Text style={[shared.label, { marginTop: 3 }]}>{item.category} · {item.equipment}</Text>
                </View>
                <Feather name="plus-circle" size={20} color={colors.accent} />
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  if (activeWorkout) {
    return (
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <ScrollView contentContainerStyle={shared.content}>
          <View style={[shared.row, { marginBottom: 4 }]}>
            <TouchableOpacity style={shared.iconBtn} onPress={() => setActiveWorkout(null)}>
              <Feather name="x" size={17} color={colors.text} />
            </TouchableOpacity>
            <View style={[shared.pill, shared.pillWarn]}>
              <Text style={shared.pillWarnText}>{fmt(elapsed)}</Text>
            </View>
            <TouchableOpacity style={[shared.btn, shared.btnPrimary, { paddingVertical: 9, paddingHorizontal: 16 }]} onPress={finishWorkout}>
              <Text style={shared.btnPrimaryText}>Finish</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={{ color: colors.text, fontWeight: "700", fontSize: 20, paddingVertical: 14 }}
            value={activeWorkout.name}
            onChangeText={(t) => setActiveWorkout({ ...activeWorkout, name: t })}
          />

          {activeWorkout.exercises.map((ex) => (
            <View style={[shared.card, { marginBottom: 12 }]} key={ex.id}>
              <View style={[shared.row, { marginBottom: 10 }]}>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14.5 }}>{ex.name}</Text>
                <TouchableOpacity onPress={() => removeExercise(ex.id)}>
                  <Feather name="trash-2" size={15} color={colors.dim} />
                </TouchableOpacity>
              </View>
              <View style={[shared.row, { marginBottom: 6, paddingLeft: 4 }]}>
                <Text style={[shared.label, { width: 28 }]}>Set</Text>
                <Text style={[shared.label, { flex: 1, textAlign: "center" }]}>kg</Text>
                <Text style={[shared.label, { flex: 1, textAlign: "center" }]}>reps</Text>
                <View style={{ width: 24 }} />
              </View>
              {ex.sets.map((s, i) => (
                <View key={s.id} style={[shared.row, { marginBottom: 8, gap: 6 }]}>
                  <Text style={{ width: 28, fontSize: 13, color: colors.dim, fontWeight: "700" }}>{i + 1}</Text>
                  <TextInput
                    style={[shared.input, { flex: 1, textAlign: "center", paddingVertical: 9 }]}
                    placeholder="0" placeholderTextColor={colors.dim2} keyboardType="numeric"
                    value={s.weight} onChangeText={(v) => updateSet(ex.id, s.id, "weight", v.replace(/[^0-9.]/g, ""))}
                  />
                  <TextInput
                    style={[shared.input, { flex: 1, textAlign: "center", paddingVertical: 9 }]}
                    placeholder="0" placeholderTextColor={colors.dim2} keyboardType="numeric"
                    value={s.reps} onChangeText={(v) => updateSet(ex.id, s.id, "reps", v.replace(/[^0-9]/g, ""))}
                  />
                  <TouchableOpacity
                    style={[shared.checkbox, s.done && shared.checkboxDone]}
                    onPress={() => toggleDone(ex.id, s.id)}
                  >
                    {s.done && <Feather name="check" size={14} color={colors.accentInk} />}
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={[shared.btn, shared.btnGhost, { paddingVertical: 9, marginTop: 4 }]} onPress={() => addSet(ex.id)}>
                <Feather name="plus" size={14} color={colors.text} />
                <Text style={shared.btnGhostText}>Add Set</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={[shared.btn, shared.btnPrimary]} onPress={openPicker}>
            <Feather name="plus" size={16} color={colors.accentInk} />
            <Text style={shared.btnPrimaryText}>Add Exercise</Text>
          </TouchableOpacity>
        </ScrollView>

        {ExercisePickerModal}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={shared.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={shared.content}>
        <Text style={[shared.h1, { marginBottom: 16, marginTop: 8 }]}>Workout</Text>
        <TouchableOpacity style={[shared.btn, shared.btnPrimary, { marginBottom: 22, paddingVertical: 16 }]} onPress={() => startWorkout(null)}>
          <Feather name="play" size={16} color={colors.accentInk} />
          <Text style={shared.btnPrimaryText}>Start Empty Workout</Text>
        </TouchableOpacity>

        <Text style={[shared.h3, { marginBottom: 10 }]}>Templates</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {TEMPLATES.map((t) => (
            <TouchableOpacity key={t.id} style={[shared.card, { width: 160, marginRight: 10 }]} onPress={() => startWorkout(t)}>
              <Feather name="activity" size={18} color={colors.accent} style={{ marginBottom: 10 }} />
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{t.name}</Text>
              <Text style={[shared.label, { marginTop: 3, fontSize: 11 }]}>{t.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[shared.h3, { marginBottom: 10 }]}>History</Text>
        {history.length === 0 && <Text style={shared.label}>No workouts logged yet.</Text>}
        {history.map((h) => (
          <View style={[shared.card, { marginBottom: 10 }]} key={h.id}>
            <View style={shared.row}>
              <View>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14.5 }}>{h.name}</Text>
                <Text style={[shared.label, { marginTop: 2 }]}>{h.date} · {h.duration}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ ...shared.num, fontSize: 14 }}>{h.volume.toLocaleString()} kg</Text>
                <Text style={shared.label}>{h.sets} sets</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}