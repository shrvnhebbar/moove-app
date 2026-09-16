import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { useAuth } from "../context/AuthContext";
import { useWorkouts } from "../hooks/useWorkouts";

const MENU = [
  { icon: "target", label: "Goals & Targets" },
  { icon: "award", label: "Achievements" },
  { icon: "settings", label: "Settings" },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { history } = useWorkouts();

  return (
    <ScrollView style={shared.screen} contentContainerStyle={[shared.content, { paddingTop: 24 }]}>
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
          <Feather name="user" size={32} color={colors.dim} />
        </View>
        <Text style={shared.h2}>{user?.displayName || "Athlete"}</Text>
        <Text style={[shared.label, { marginTop: 2 }]}>{user?.email}</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
          <Text style={{ ...shared.num, fontSize: 20 }}>{history.length}</Text>
          <Text style={shared.label}>Workouts</Text>
        </View>
        <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
          <Text style={{ ...shared.num, fontSize: 20 }}>12</Text>
          <Text style={shared.label}>Day streak</Text>
        </View>
        <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
          <Text style={{ ...shared.num, fontSize: 20 }}>72.4</Text>
          <Text style={shared.label}>kg</Text>
        </View>
      </View>

      {MENU.map((it) => (
        <TouchableOpacity key={it.label} style={[shared.card, shared.row, { marginBottom: 10 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Feather name={it.icon} size={17} color={colors.dim} />
            <Text style={{ color: colors.text, fontSize: 14 }}>{it.label}</Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.dim} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[shared.btn, shared.btnOutline, { marginTop: 12 }]} onPress={logout}>
        <Feather name="log-out" size={15} color={colors.text} />
        <Text style={shared.btnOutlineText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
