import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Trophy, TrendingDown, TrendingUp, Dumbbell, Medal, Flame } from "lucide-react-native";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { useAchievements } from "../hooks/useAchievements";

function formatDate(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function describeAchievement(item) {
  switch (item.type) {
    case "weight_goal_progress": {
      const losing = item.goal === "lose";
      return {
        icon: losing ? TrendingDown : TrendingUp,
        title: `${losing ? "Lost" : "Gained"} ${item.deltaKg}kg toward your goal`,
        subtitle: `${item.fromWeight}kg → ${item.toWeight}kg`,
      };
    }
    case "workout_count":
      return {
        icon: Trophy,
        title: item.count === 1 ? "First Workout Logged!" : `${item.count} Workouts Logged!`,
        subtitle: "Workout milestone",
      };
    case "volume_milestone":
      return {
        icon: Dumbbell,
        title: `${item.volume.toLocaleString()}kg Lifted!`,
        subtitle: `That's about the weight of ${item.comparison}`,
      };
    case "personal_record":
      return {
        icon: Medal,
        title: `New PR: ${item.exercise} — ${item.weight}kg`,
        subtitle: `Up from ${item.previousWeight}kg`,
      };
    case "workout_streak":
      return {
        icon: Flame,
        title: `${item.days}-Day Workout Streak!`,
        subtitle: "Consistency",
      };
    default:
      return null;
  }
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
