import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { usePersonalInfo } from "../hooks/usePersonalInfo";
import { calcBMI, bmiCategory, calcFatMass, calcLeanMass, calcMuscleMassEstimate } from "../utils/bodyMetrics";

export default function PersonalInfoModal({ visible, onClose }) {
  const { info, savePersonalInfo } = usePersonalInfo();
  const [form, setForm] = useState(info);
  const [saving, setSaving] = useState(false);

  // Sync local form with stored data whenever the modal opens or data loads
  useEffect(() => {
    if (visible) setForm(info);
  }, [visible, info]);

  const bmi = calcBMI(form.weightKg, form.heightCm);
  const category = bmiCategory(bmi);
  const bodyFatPct = form.bodyFatPct === "" ? null : Number(form.bodyFatPct);
  const fatMass = calcFatMass(form.weightKg, bodyFatPct);
  const leanMass = calcLeanMass(form.weightKg, fatMass);
  const muscleMass = calcMuscleMassEstimate(leanMass);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePersonalInfo(form);
      onClose();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <ScrollView contentContainerStyle={shared.content}>
          <View style={[shared.row, { paddingTop: 12, marginBottom: 20 }]}>
            <Text style={shared.h2}>Personal Information</Text>
            <TouchableOpacity style={shared.iconBtn} onPress={onClose}>
              <Feather name="x" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[shared.label, { marginBottom: 6 }]}>Name</Text>
          <TextInput style={[shared.input, { marginBottom: 14 }]} placeholder="Your name" placeholderTextColor={colors.dim2} value={form.name} onChangeText={set("name")} />

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={[shared.label, { marginBottom: 6 }]}>Age</Text>
              <TextInput style={shared.input} placeholder="25" placeholderTextColor={colors.dim2} keyboardType="numeric" value={form.age} onChangeText={(v) => set("age")(v.replace(/\D/g, ""))} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[shared.label, { marginBottom: 6 }]}>Biological sex</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["male", "female"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => set("sex")(s)}
                    style={{
                      flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: "center",
                      backgroundColor: form.sex === s ? colors.accent : colors.surface2,
                      borderWidth: 1, borderColor: form.sex === s ? colors.accent : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "600", color: form.sex === s ? colors.accentInk : colors.dim }}>
                      {s === "male" ? "Male" : "Female"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={[shared.label, { marginBottom: 6 }]}>Weight (kg)</Text>
              <TextInput style={shared.input} placeholder="70" placeholderTextColor={colors.dim2} keyboardType="numeric" value={form.weightKg} onChangeText={(v) => set("weightKg")(v.replace(/[^0-9.]/g, ""))} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[shared.label, { marginBottom: 6 }]}>Height (cm)</Text>
              <TextInput style={shared.input} placeholder="175" placeholderTextColor={colors.dim2} keyboardType="numeric" value={form.heightCm} onChangeText={(v) => set("heightCm")(v.replace(/[^0-9.]/g, ""))} />
            </View>
          </View>

          <Text style={[shared.label, { marginBottom: 6 }]}>Body fat % (from a scale, calipers, or scan)</Text>
          <TextInput
            style={[shared.input, { marginBottom: 20 }]}
            placeholder="e.g. 18"
            placeholderTextColor={colors.dim2}
            keyboardType="numeric"
            value={form.bodyFatPct}
            onChangeText={(v) => set("bodyFatPct")(v.replace(/[^0-9.]/g, ""))}
          />

          <Text style={[shared.h3, { marginBottom: 4 }]}>Body Composition</Text>
          <Text style={[shared.label, { marginBottom: 12 }]}>
            BMI is calculated from weight and height. Fat mass and muscle mass below are derived from the body fat % you entered — muscle mass specifically is a ~50%-of-lean-mass approximation, not a direct measurement.
          </Text>

          <View style={[shared.card, { marginBottom: 12 }]}>
            <View style={shared.row}>
              <Text style={shared.label}>BMI</Text>
              <Text style={{ ...shared.num, fontSize: 15 }}>{bmi ? bmi.toFixed(1) : "--"}</Text>
            </View>
            {category && (
              <View style={[shared.row, { marginTop: 8 }]}>
                <Text style={shared.label}>Category</Text>
                <View style={[shared.pill, shared.pillOk]}>
                  <Text style={shared.pillOkText}>{category}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
              <Text style={{ ...shared.num, fontSize: 17 }}>{bodyFatPct ? `${bodyFatPct.toFixed(1)}%` : "--"}</Text>
              <Text style={[shared.label, { textAlign: "center" }]}>Body Fat</Text>
            </View>
            <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
              <Text style={{ ...shared.num, fontSize: 17 }}>{fatMass ? `${fatMass.toFixed(1)}kg` : "--"}</Text>
              <Text style={[shared.label, { textAlign: "center" }]}>Fat Mass</Text>
            </View>
            <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
              <Text style={{ ...shared.num, fontSize: 17 }}>{muscleMass ? `${muscleMass.toFixed(1)}kg` : "--"}</Text>
              <Text style={[shared.label, { textAlign: "center" }]}>Muscle Mass</Text>
            </View>
          </View>

          <TouchableOpacity style={[shared.btn, shared.btnPrimary]} onPress={handleSave} disabled={saving}>
            <Text style={shared.btnPrimaryText}>{saving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}