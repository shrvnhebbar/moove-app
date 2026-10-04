import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Save, PenLine, Activity } from "lucide-react-native";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import Dropdown from "../components/Dropdown";
import PersonalStats from "../components/PersonalStats";
import { usePersonalInfo } from "../hooks/usePersonalInfo";
import { useLogMetric } from "../hooks/useMetricLogs";
import { useAchievements } from "../hooks/useAchievements";
import { ACTIVITY_LEVELS, GOAL_OPTIONS } from "../utils/calorieCalculator";
import { computePersonalStats } from "../utils/personalStats";

const SEX_OPTIONS = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
];

const TABS = [
  { key: "details", label: "Details", icon: PenLine },
  { key: "stats", label: "Stats", icon: Activity },
];

function SectionLabel({ children }) {
  return (
    <Text style={{ color: colors.dim, fontSize: 11.5, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginTop: 6 }}>
      {children}
    </Text>
  );
}

// Text input with its unit shown inside the field (kg, cm, %, yrs).
function UnitInput({ value, onChangeText, placeholder, unit }) {
  return (
    <View style={[shared.input, { flexDirection: "row", alignItems: "center" }]}>
      <TextInput
        style={{
          flex: 1, alignSelf: "stretch", color: colors.text, fontSize: 14.5, paddingVertical: 0,
          includeFontPadding: false, textAlignVertical: "center",
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.dim2}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
      />
      <Text style={{ color: colors.dim, fontSize: 13, marginLeft: 8 }}>{unit}</Text>
    </View>
  );
}

export default function PersonalInfoModal({ visible, onClose }) {
  const { info, savePersonalInfo } = usePersonalInfo();
  const logMetric = useLogMetric();
  const { checkWeightGoalProgress } = useAchievements();
  const [form, setForm] = useState(info);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("details");

  // Sync local form with stored data whenever the modal opens or data loads
  useEffect(() => {
    if (visible) setForm(info);
  }, [visible, info]);

  useEffect(() => {
    if (visible) setTab("details");
  }, [visible]);

  const stats = computePersonalStats(form);
  const dirty = JSON.stringify(form) !== JSON.stringify(info);

  const handleSave = async () => {
    const previousWeight = info.weightKg;
    setSaving(true);
    try {
      await savePersonalInfo(form);
      await logMetric("weight", form.weightKg);
      await logMetric("bodyFat", form.bodyFatPct);
      await checkWeightGoalProgress(form.goal, previousWeight, form.weightKg);
      onClose();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally {
      setSaving(false);
    }
  };

  const requestClose = () => {
    if (!dirty) return onClose();
    Alert.alert("Discard changes?", "You have unsaved changes that will be lost.", [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: onClose },
    ]);
  };

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const numeric = (key, pattern) => (v) => set(key)(v.replace(pattern, ""));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={requestClose}>
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <View style={[shared.row, { paddingHorizontal: 18, paddingTop: 12, marginBottom: 14 }]}>
          <Text style={shared.h2}>Personal Information</Text>
          <TouchableOpacity style={shared.iconBtn} onPress={requestClose}>
            <X size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row", marginHorizontal: 18, padding: 4, borderRadius: 14,
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                style={{
                  flex: 1, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center",
                  paddingVertical: 10, borderRadius: 10, backgroundColor: active ? colors.surface3 : "transparent",
                }}
              >
                <t.icon size={15} color={active ? colors.text : colors.dim} />
                <Text style={{ fontSize: 13.5, fontWeight: "600", color: active ? colors.text : colors.dim }}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {tab === "details" ? (
            <>
              <SectionLabel>Profile</SectionLabel>
              <Text style={[shared.label, { marginBottom: 6 }]}>Name</Text>
              <TextInput
                style={[shared.input, { marginBottom: 14, includeFontPadding: false, textAlignVertical: "center" }]}
                placeholder="Your name"
                placeholderTextColor={colors.dim2}
                value={form.name}
                onChangeText={set("name")}
              />

              <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[shared.label, { marginBottom: 6 }]}>Age</Text>
                  <UnitInput value={form.age} onChangeText={numeric("age", /\D/g)} placeholder="25" unit="yrs" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[shared.label, { marginBottom: 6 }]}>Biological sex</Text>
                  <Dropdown value={form.sex} options={SEX_OPTIONS} onChange={set("sex")} placeholder="Select" />
                </View>
              </View>

              <SectionLabel>Body</SectionLabel>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[shared.label, { marginBottom: 6 }]}>Weight</Text>
                  <UnitInput value={form.weightKg} onChangeText={numeric("weightKg", /[^0-9.]/g)} placeholder="70" unit="kg" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[shared.label, { marginBottom: 6 }]}>Height</Text>
                  <UnitInput value={form.heightCm} onChangeText={numeric("heightCm", /[^0-9.]/g)} placeholder="175" unit="cm" />
                </View>
              </View>
              <Text style={[shared.label, { marginBottom: 6 }]}>Body fat</Text>
              <UnitInput value={form.bodyFatPct} onChangeText={numeric("bodyFatPct", /[^0-9.]/g)} placeholder="e.g. 18" unit="%" />
              <Text style={[shared.label, { fontSize: 11.5, marginTop: 6, marginBottom: 24 }]}>From a scale, calipers or a scan</Text>

              <SectionLabel>Plan</SectionLabel>
              <Text style={[shared.label, { marginBottom: 6 }]}>Goal</Text>
              <View style={{ marginBottom: 14 }}>
                <Dropdown value={form.goal} options={GOAL_OPTIONS} onChange={set("goal")} placeholder="Select a goal" />
              </View>
              <Text style={[shared.label, { marginBottom: 6 }]}>Activity level</Text>
              <Dropdown
                value={form.activityLevel}
                options={ACTIVITY_LEVELS}
                onChange={set("activityLevel")}
                placeholder="Select your activity level"
              />
            </>
          ) : (
            <PersonalStats form={form} stats={stats} dirty={dirty} onEditDetails={() => setTab("details")} />
          )}
        </ScrollView>

        <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 24, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg }}>
          {tab === "details" && (
            <Text style={{ color: colors.dim, fontSize: 12.5, textAlign: "center", marginBottom: 10 }} numberOfLines={1}>
              {stats.calorieStats && stats.macroStats ? (
                <>
                  Daily target{"  "}
                  <Text style={{ color: colors.text, fontWeight: "700" }}>{stats.calorieStats.target.toLocaleString()} kcal</Text>
                  {`  ·  P ${stats.macroStats.proteinG}g  ·  C ${stats.macroStats.carbG}g  ·  F ${stats.macroStats.fatG}g`}
                </>
              ) : (
                `Add your ${stats.missingForCalories.join(", ")} to see your daily target`
              )}
            </Text>
          )}
          <TouchableOpacity style={[shared.btn, shared.btnPrimary]} onPress={handleSave} disabled={saving}>
            <Save size={16} color={colors.accentInk} />
            <Text style={shared.btnPrimaryText}>{saving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
