import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { useWorkouts } from "../hooks/useWorkouts";

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
  const [exInput, setExInput] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

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

  const addExercise = () => {
    if (!exInput.trim()) return;
    setActiveWorkout((w) => ({ ...w, exercises: [...w.exercises, { id: Math.random().toString(36).slice(2), name: exInput.trim(), sets: [emptySet()] }] }));
    setExInput("");
  };
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

  if (activeWorkout) {
    return (
      <ScrollView style={shared.screen} contentContainerStyle={shared.content}>
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

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            style={[shared.input, { flex: 1 }]} placeholder="Exercise name" placeholderTextColor={colors.dim2}
            value={exInput} onChangeText={setExInput} onSubmitEditing={addExercise}
          />
          <TouchableOpacity style={[shared.btn, shared.btnPrimary, { paddingHorizontal: 16 }]} onPress={addExercise}>
            <Feather name="plus" size={16} color={colors.accentInk} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={shared.screen} contentContainerStyle={shared.content}>
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
  );
}
