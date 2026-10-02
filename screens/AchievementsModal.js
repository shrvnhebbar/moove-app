import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Trophy } from "lucide-react-native";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { useAchievements, describeAchievement } from "../hooks/useAchievements";

function formatDate(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function AchievementCard({ item }) {
  const info = describeAchievement(item);
  if (!info) return null;
  const Icon = info.icon;
  return (
    <View style={[shared.card, { marginBottom: 10 }]}>
      <View style={shared.row}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
            <Icon size={17} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13.5 }}>{info.title}</Text>
            <Text style={[shared.label, { marginTop: 2 }]}>
              {info.subtitle} · {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function AchievementsModal({ visible, onClose }) {
  const { achievements, loading } = useAchievements();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <ScrollView contentContainerStyle={shared.content}>
          <View style={[shared.row, { paddingTop: 12, marginBottom: 20 }]}>
            <Text style={shared.h2}>Achievements</Text>
            <TouchableOpacity style={shared.iconBtn} onPress={onClose}>
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {!loading && achievements.length === 0 && (
            <View style={[shared.card, { alignItems: "center", paddingVertical: 32 }]}>
              <Trophy size={28} color={colors.dim} style={{ marginBottom: 10 }} />
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14.5, marginBottom: 4 }}>No achievements yet</Text>
              <Text style={[shared.label, { textAlign: "center" }]}>
                Log workouts and track progress toward your weight goal to start unlocking these.
              </Text>
            </View>
          )}

          {achievements.map((a) => (
            <AchievementCard item={a} key={a.id} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
