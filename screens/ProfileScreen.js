import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { User, UserCog, Award, Settings, ChevronRight, LogOut, Camera } from "lucide-react-native";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { useAuth } from "../context/AuthContext";
import { useWorkouts } from "../hooks/useWorkouts";
import { usePersonalInfo } from "../hooks/usePersonalInfo";
import { useProfilePicture } from "../hooks/useProfilePicture";
import { getWorkoutStreak } from "../hooks/useAchievements";
import PersonalInfoModal from "./PersonalInfoModal";
import AccountModal from "./AccountModal";
import AchievementsModal from "./AchievementsModal";

const MENU = [
  { icon: User, label: "Personal Information", key: "personal" },
  { icon: UserCog, label: "Account", key: "account" },
  { icon: Award, label: "Achievements", key: "achievements" },
  { icon: Settings, label: "Settings", key: "settings" },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { history } = useWorkouts();
  const { info } = usePersonalInfo();
  const { photoURL, uploading, uploadProfilePicture } = useProfilePicture();
  const [personalInfoVisible, setPersonalInfoVisible] = useState(false);
  const [accountVisible, setAccountVisible] = useState(false);
  const [achievementsVisible, setAchievementsVisible] = useState(false);

  const handleMenuPress = (key) => {
    if (key === "personal") setPersonalInfoVisible(true);
    if (key === "account") setAccountVisible(true);
    if (key === "achievements") setAchievementsVisible(true);
    // "settings" not wired up yet
  };

  const handleUpload = async (uri) => {
    try {
      await uploadProfilePicture(uri);
    } catch (e) {
      Alert.alert("Couldn't update profile picture", `${e.code ?? "error"}: ${e.message}`);
    }
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Allow photo library access to set a profile picture.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) await handleUpload(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Allow camera access to take a profile picture.");
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) await handleUpload(result.assets[0].uri);
  };

  const handleAvatarPress = () => {
    Alert.alert("Profile Picture", "Choose a source", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={shared.screen} edges={["top"]}>
      <ScrollView style={shared.screen} contentContainerStyle={[shared.content, { paddingTop: 24 }]}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity
            onPress={handleAvatarPress}
            disabled={uploading}
            style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginBottom: 12, overflow: "hidden" }}
          >
            {uploading ? (
              <ActivityIndicator color={colors.accent} />
            ) : photoURL ? (
              <Image source={{ uri: photoURL }} style={{ width: 76, height: 76 }} />
            ) : (
              <User size={32} color={colors.dim} />
            )}
            <View
              style={{
                position: "absolute", right: -1, bottom: -1, width: 24, height: 24, borderRadius: 12,
                backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.bg,
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Camera size={12} color={colors.accentInk} />
            </View>
          </TouchableOpacity>
          <Text style={shared.h2}>{info.name || user?.displayName || "Athlete"}</Text>
          <Text style={[shared.label, { marginTop: 2 }]}>{user?.email}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
            <Text style={{ ...shared.num, fontSize: 20 }}>{history.length}</Text>
            <Text style={shared.label}>Workouts</Text>
          </View>
          <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
            <Text style={{ ...shared.num, fontSize: 20 }}>{getWorkoutStreak(history)}</Text>
            <Text style={shared.label}>Day streak</Text>
          </View>
          <View style={[shared.card, { flex: 1, alignItems: "center" }]}>
            <Text style={{ ...shared.num, fontSize: 20 }}>{info.weightKg || "--"}</Text>
            <Text style={shared.label}>kg</Text>
          </View>
        </View>

        {MENU.map((it) => (
          <TouchableOpacity key={it.key} style={[shared.card, shared.row, { marginBottom: 10 }]} onPress={() => handleMenuPress(it.key)}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <it.icon size={17} color={colors.dim} />
              <Text style={{ color: colors.text, fontSize: 14 }}>{it.label}</Text>
            </View>
            <ChevronRight size={16} color={colors.dim} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[shared.btn, shared.btnOutline, { marginTop: 12 }]} onPress={logout}>
          <LogOut size={15} color={colors.text} />
          <Text style={shared.btnOutlineText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <PersonalInfoModal visible={personalInfoVisible} onClose={() => setPersonalInfoVisible(false)} />
      <AccountModal visible={accountVisible} onClose={() => setAccountVisible(false)} />
      <AchievementsModal visible={achievementsVisible} onClose={() => setAchievementsVisible(false)} />
    </SafeAreaView>
  );
}