import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import TrendChart from "../components/TrendChart";
import { useMetricLogs } from "../hooks/useMetricLogs";
import { useWorkouts } from "../hooks/useWorkouts";

const TABS = [
  { key: "weight", label: "Body Weight" },
  { key: "bodyFat", label: "Body Fat %" },
  { key: "exercise", label: "Exercises" },
];

function tsToDate(ts) {
  if (!ts) return new Date();
  if (typeof ts.toDate === "function") return ts.toDate();
  return new Date(ts);
}
function formatLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TrendsScreen({ visible, onClose }) {
  const [tab, setTab] = useState("weight");
  const weightLogs = useMetricLogs("weight");
  const bodyFatLogs = useMetricLogs("bodyFat");
  const { history } = useWorkouts();

  const weightData = weightLogs.map((e) => ({ label: formatLabel(tsToDate(e.createdAt)), value: e.value }));
  const bodyFatData = bodyFatLogs.map((e) => ({ label: formatLabel(tsToDate(e.createdAt)), value: e.value }));

  const exerciseNames = useMemo(() => {
    const names = new Set();
    history.forEach((h) => (h.exercises || []).forEach((ex) => names.add(ex.name)));
    return Array.from(names).sort();
  }, [history]);

  const [selectedExercise, setSelectedExercise] = useState(null);
  const activeExercise = selectedExercise || exerciseNames[0] || null;

  const exerciseData = useMemo(() => {
    if (!activeExercise) return [];
    const chronological = [...history].reverse(); // history is newest-first; chart needs oldest-first
    const points = [];
    chronological.forEach((h) => {
      const ex = (h.exercises || []).find((e) => e.name === activeExercise);
      if (!ex) return;
      const topWeight = Math.max(0, ...ex.sets.map((s) => Number(s.weight) || 0));
      if (topWeight > 0) {
        points.push({ label: formatLabel(tsToDate(h.createdAt)), value: topWeight });
      }
    });
    return points;
  }, [history, activeExercise]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <ScrollView contentContainerStyle={shared.content}>
          <View style={[shared.row, { paddingTop: 12, marginBottom: 16 }]}>
            <Text style={shared.h2}>Trends</Text>
            <TouchableOpacity style={shared.iconBtn} onPress={onClose}>
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center",
                    backgroundColor: active ? colors.accent : colors.surface2,
                    borderWidth: 1, borderColor: active ? colors.accent : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12.5, fontWeight: "600", color: active ? colors.accentInk : colors.dim,
                      includeFontPadding: false, textAlignVertical: "center",
                    }}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {tab === "weight" && <TrendChart data={weightData} color={colors.accent} unit="kg" />}
          {tab === "bodyFat" && <TrendChart data={bodyFatData} color={colors.orange} unit="%" />}

          {tab === "exercise" && (
            <>
              {exerciseNames.length === 0 ? (
                <Text style={shared.label}>No exercises with saved sets yet — finish a workout with logged weights to see trends here.</Text>
              ) : (
                <>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 16, height: 44, flexGrow: 0, flexShrink: 0 }}
                    contentContainerStyle={{ alignItems: "center" }}
                  >
                    {exerciseNames.map((name) => {
                      const active = name === activeExercise;
                      return (
                        <TouchableOpacity
                          key={name}
                          onPress={() => setSelectedExercise(name)}
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
                              includeFontPadding: false, textAlignVertical: "center",
                            }}
                          >
                            {name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  <TrendChart data={exerciseData} color={colors.blue} unit="kg (top set)" />
                </>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}