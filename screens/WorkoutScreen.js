import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { useWorkouts } from "../hooks/useWorkouts";
import { useTemplates } from "../hooks/useTemplates";
import { useHiddenTemplates } from "../hooks/useHiddenTemplates";
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
  const { templates: customTemplates, saveTemplate, deleteTemplate } = useTemplates();
  const { hiddenIds: hiddenDefaultIds, hideTemplate: hideDefaultTemplate } = useHiddenTemplates();
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState("workout"); // "workout" | "template"
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [pendingSelectedIds, setPendingSelectedIds] = useState([]);

  const [builderVisible, setBuilderVisible] = useState(false);
  const [builderName, setBuilderName] = useState("");
  const [builderExercises, setBuilderExercises] = useState([]);

  const [selectedHistory, setSelectedHistory] = useState(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const startWorkout = (template) => {
    setElapsed(0);
    setTimerRunning(false);
    setActiveWorkout({
      name: template ? template.name : "New Workout",
      exercises: (template ? template.exercises : []).map((n) => ({ id: Math.random().toString(36).slice(2), name: n, sets: [emptySet()] })),
    });
  };

  const closeWorkout = () => {
    setTimerRunning(false);
    setElapsed(0);
    setActiveWorkout(null);
  };

  const openPicker = (mode = "workout") => {
    setPickerMode(mode);
    setSearch("");
    setActiveCategory("All");
    setPendingSelectedIds([]);
    setPickerVisible(true);
  };

  const togglePending = (exercise) => {
    setPendingSelectedIds((ids) =>
      ids.includes(exercise.id) ? ids.filter((id) => id !== exercise.id) : [...ids, exercise.id]
    );
  };

  const confirmAddSelected = () => {
    const selected = EXERCISES.filter((e) => pendingSelectedIds.includes(e.id));
    if (selected.length === 0) return;

    if (pickerMode === "template") {
      setBuilderExercises((list) => {
        const existingIds = list.map((e) => e.id);
        return [...list, ...selected.filter((e) => !existingIds.includes(e.id))];
      });
    } else {
      setActiveWorkout((w) => ({
        ...w,
        exercises: [
          ...w.exercises,
          ...selected.map((e) => ({ id: Math.random().toString(36).slice(2), name: e.name, sets: [emptySet()] })),
        ],
      }));
    }
    setPickerVisible(false);
  };

  const openBuilder = () => {
    setBuilderName("");
    setBuilderExercises([]);
    setBuilderVisible(true);
  };

  const removeBuilderExercise = (id) => setBuilderExercises((list) => list.filter((e) => e.id !== id));

  const saveNewTemplate = async () => {
    if (!builderName.trim() || builderExercises.length === 0) return;
    await saveTemplate({
      name: builderName.trim(),
      subtitle: builderExercises.map((e) => e.category).filter((v, i, a) => a.indexOf(v) === i).join(" · "),
      exercises: builderExercises.map((e) => e.name),
    });
    setBuilderVisible(false);
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
      exercises: activeWorkout.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps, done: s.done })),
      })),
      exercises: activeWorkout.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps, done: s.done })),
      })),
    });
    setTimerRunning(false);
    setElapsed(0);
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
          contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={shared.label}>No exercises match "{search}".</Text>}
          renderItem={({ item }) => {
            const isPending = pendingSelectedIds.includes(item.id);
            return (
              <TouchableOpacity
                style={[
                  shared.card,
                  { marginBottom: 10 },
                  isPending && { borderColor: colors.accent, backgroundColor: colors.surface2 },
                ]}
                onPress={() => togglePending(item)}
              >
                <View style={shared.row}>
                  <View>
                    <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14.5 }}>{item.name}</Text>
                    <Text style={[shared.label, { marginTop: 3 }]}>{item.category} · {item.equipment}</Text>
                  </View>
                  <Feather name={isPending ? "check-square" : "square"} size={20} color={isPending ? colors.accent : colors.dim} />
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {pendingSelectedIds.length > 0 && (
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 18, paddingBottom: 28, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border }}>
            <TouchableOpacity style={[shared.btn, shared.btnPrimary]} onPress={confirmAddSelected}>
              <Feather name="plus" size={16} color={colors.accentInk} />
              <Text style={shared.btnPrimaryText}>Add {pendingSelectedIds.length} Exercise{pendingSelectedIds.length > 1 ? "s" : ""}</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  const TemplateBuilderModal = (
    <Modal visible={builderVisible} animationType="slide" onRequestClose={() => setBuilderVisible(false)}>
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <ScrollView contentContainerStyle={shared.content}>
          <View style={[shared.row, { paddingTop: 12, marginBottom: 16 }]}>
            <Text style={shared.h2}>New Template</Text>
            <TouchableOpacity style={shared.iconBtn} onPress={() => setBuilderVisible(false)}>
              <Feather name="x" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[shared.label, { marginBottom: 6 }]}>Template name</Text>
          <TextInput
            style={[shared.input, { marginBottom: 20 }]}
            placeholder="e.g. Upper Body Blast"
            placeholderTextColor={colors.dim2}
            value={builderName}
            onChangeText={setBuilderName}
          />

          <Text style={[shared.h3, { marginBottom: 10 }]}>Exercises ({builderExercises.length})</Text>
          {builderExercises.length === 0 && <Text style={[shared.label, { marginBottom: 12 }]}>No exercises added yet.</Text>}
          {builderExercises.map((ex) => (
            <View style={[shared.card, shared.row, { marginBottom: 8 }]} key={ex.id}>
              <View>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{ex.name}</Text>
                <Text style={[shared.label, { marginTop: 2 }]}>{ex.category} · {ex.equipment}</Text>
              </View>
              <TouchableOpacity onPress={() => removeBuilderExercise(ex.id)}>
                <Feather name="trash-2" size={15} color={colors.dim} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={[shared.btn, shared.btnGhost, { marginTop: 8, marginBottom: 24 }]} onPress={() => openPicker("template")}>
            <Feather name="plus" size={14} color={colors.text} />
            <Text style={shared.btnGhostText}>Add Exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[shared.btn, shared.btnPrimary, (!builderName.trim() || builderExercises.length === 0) && { opacity: 0.5 }]}
            onPress={saveNewTemplate}
            disabled={!builderName.trim() || builderExercises.length === 0}
          >
            <Text style={shared.btnPrimaryText}>Save Template</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const HistoryDetailModal = (
    <Modal visible={!!selectedHistory} animationType="slide" onRequestClose={() => setSelectedHistory(null)}>
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <ScrollView contentContainerStyle={shared.content}>
          <View style={[shared.row, { paddingTop: 12, marginBottom: 4 }]}>
            <Text style={shared.h2}>{selectedHistory?.name}</Text>
            <TouchableOpacity style={shared.iconBtn} onPress={() => setSelectedHistory(null)}>
              <Feather name="x" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={[shared.label, { marginBottom: 20 }]}>{selectedHistory?.date} · {selectedHistory?.duration}</Text>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
              <Text style={{ ...shared.num, fontSize: 18 }}>{selectedHistory?.volume?.toLocaleString() ?? 0}</Text>
              <Text style={shared.label}>kg volume</Text>
            </View>
            <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
              <Text style={{ ...shared.num, fontSize: 18 }}>{selectedHistory?.sets ?? 0}</Text>
              <Text style={shared.label}>sets done</Text>
            </View>
            <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
              <Text style={{ ...shared.num, fontSize: 18 }}>{selectedHistory?.exercises?.length ?? 0}</Text>
              <Text style={shared.label}>exercises</Text>
            </View>
          </View>

          {!selectedHistory?.exercises || selectedHistory.exercises.length === 0 ? (
            <Text style={shared.label}>No detailed set data was saved for this workout.</Text>
          ) : (
            selectedHistory.exercises.map((ex, exIdx) => (
              <View style={[shared.card, { marginBottom: 12 }]} key={exIdx}>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14.5, marginBottom: 10 }}>{ex.name}</Text>
                <View style={[shared.row, { marginBottom: 6, paddingLeft: 4 }]}>
                  <Text style={[shared.label, { width: 28 }]}>Set</Text>
                  <Text style={[shared.label, { flex: 1, textAlign: "center" }]}>kg</Text>
                  <Text style={[shared.label, { flex: 1, textAlign: "center" }]}>reps</Text>
                  <View style={{ width: 24 }} />
                </View>
                {ex.sets.map((s, i) => (
                  <View key={i} style={[shared.row, { marginBottom: 6, gap: 6 }]}>
                    <Text style={{ width: 28, fontSize: 13, color: colors.dim, fontWeight: "700" }}>{i + 1}</Text>
                    <Text style={{ flex: 1, textAlign: "center", color: colors.text, fontSize: 13.5 }}>{s.weight || "-"}</Text>
                    <Text style={{ flex: 1, textAlign: "center", color: colors.text, fontSize: 13.5 }}>{s.reps || "-"}</Text>
                    <View style={{ width: 24, alignItems: "center" }}>
                      <Feather name={s.done ? "check-circle" : "circle"} size={15} color={s.done ? colors.accent : colors.dim2} />
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (activeWorkout) {
    return (
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <ScrollView contentContainerStyle={shared.content}>
          <View style={[shared.row, { marginBottom: 4 }]}>
            <TouchableOpacity style={shared.iconBtn} onPress={closeWorkout}>
              <Feather name="x" size={17} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[shared.pill, timerRunning ? shared.pillWarn : shared.pillOk, { flexDirection: "row", alignItems: "center", gap: 6 }]}
              onPress={() => setTimerRunning((r) => !r)}
            >
              <Feather name={timerRunning ? "pause" : "play"} size={12} color={timerRunning ? colors.orange : colors.ok} />
              <Text style={timerRunning ? shared.pillWarnText : shared.pillOkText}>
                {elapsed === 0 && !timerRunning ? "Start" : fmt(elapsed)}
              </Text>
            </TouchableOpacity>
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

          <TouchableOpacity style={[shared.btn, shared.btnPrimary]} onPress={() => openPicker("workout")}>
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
          {TEMPLATES.filter((t) => !hiddenDefaultIds.includes(t.id)).map((t) => (
            <TouchableOpacity key={t.id} style={[shared.card, { width: 160, marginRight: 10 }]} onPress={() => startWorkout(t)}>
              <View style={shared.row}>
                <Feather name="activity" size={18} color={colors.accent} style={{ marginBottom: 10 }} />
                <TouchableOpacity
                  onPress={() => hideDefaultTemplate(t.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="trash-2" size={13} color={colors.dim} />
                </TouchableOpacity>
              </View>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{t.name}</Text>
              <Text style={[shared.label, { marginTop: 3, fontSize: 11 }]}>{t.subtitle}</Text>
            </TouchableOpacity>
          ))}
          {customTemplates.map((t) => (
            <TouchableOpacity key={t.id} style={[shared.card, { width: 160, marginRight: 10 }]} onPress={() => startWorkout(t)}>
              <View style={shared.row}>
                <Feather name="star" size={18} color={colors.accent} style={{ marginBottom: 10 }} />
                <TouchableOpacity onPress={() => deleteTemplate(t.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="trash-2" size={13} color={colors.dim} />
                </TouchableOpacity>
              </View>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{t.name}</Text>
              <Text style={[shared.label, { marginTop: 3, fontSize: 11 }]} numberOfLines={1}>{t.subtitle || `${t.exercises.length} exercises`}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[shared.card, { width: 130, marginRight: 10, alignItems: "center", justifyContent: "center", borderStyle: "dashed" }]}
            onPress={openBuilder}
          >
            <Feather name="plus-circle" size={22} color={colors.accent} style={{ marginBottom: 8 }} />
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 12.5, textAlign: "center" }}>Create Template</Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={[shared.h3, { marginBottom: 10 }]}>History</Text>
        {history.length === 0 && <Text style={shared.label}>No workouts logged yet.</Text>}
        {history.map((h) => (
          <TouchableOpacity style={[shared.card, { marginBottom: 10 }]} key={h.id} onPress={() => setSelectedHistory(h)}>
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
          </TouchableOpacity>
        ))}
      </ScrollView>

      {ExercisePickerModal}
      {TemplateBuilderModal}
      {HistoryDetailModal}
    </SafeAreaView>
  );
}