import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Mail, KeyRound, TriangleAlert, Save, Trash } from "lucide-react-native";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { useAuth } from "../context/AuthContext";

export default function AccountModal({ visible, onClose }) {
  const { user, changeEmail, changePassword, deleteAccount } = useAuth();

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const friendlyError = (e) => e.message.replace("Firebase: ", "").replace(/\s*\(auth\/[^)]+\)\.?/, "");

  const submitEmailChange = async () => {
    if (!newEmail.trim() || !emailPassword) return;
    setEmailSaving(true);
    try {
      await changeEmail(emailPassword, newEmail.trim());
      setNewEmail("");
      setEmailPassword("");
      Alert.alert("Email updated", "Your email address has been changed.");
    } catch (e) {
      Alert.alert("Couldn't update email", friendlyError(e));
    } finally {
      setEmailSaving(false);
    }
  };

  const submitPasswordChange = async () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 6) return Alert.alert("Weak password", "Use at least 6 characters.");
    if (newPassword !== confirmPassword) return Alert.alert("Passwords don't match", "Re-type the new password.");
    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Password updated", "Your password has been changed.");
    } catch (e) {
      Alert.alert("Couldn't update password", friendlyError(e));
    } finally {
      setPasswordSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!deletePassword) return;
    Alert.alert(
      "Delete account?",
      "This permanently deletes your account and all of your data (meals, workouts, templates, custom foods, trends). This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete Everything", style: "destructive", onPress: runDelete },
      ]
    );
  };

  const runDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      // onAuthStateChanged in AuthContext picks this up and RootNavigator switches to AuthStack.
    } catch (e) {
      Alert.alert("Couldn't delete account", friendlyError(e));
      setDeleting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <ScrollView contentContainerStyle={shared.content}>
          <View style={[shared.row, { paddingTop: 12, marginBottom: 20 }]}>
            <Text style={shared.h2}>Account</Text>
            <TouchableOpacity style={shared.iconBtn} onPress={onClose}>
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Mail size={15} color={colors.dim} />
            <Text style={shared.h3}>Change Email</Text>
          </View>
          <Text style={[shared.label, { marginBottom: 12 }]}>Current: {user?.email}</Text>
          <TextInput
            style={[shared.input, { marginBottom: 10 }]}
            placeholder="New email address"
            placeholderTextColor={colors.dim2}
            autoCapitalize="none"
            keyboardType="email-address"
            value={newEmail}
            onChangeText={setNewEmail}
          />
          <TextInput
            style={[shared.input, { marginBottom: 14 }]}
            placeholder="Current password"
            placeholderTextColor={colors.dim2}
            secureTextEntry
            value={emailPassword}
            onChangeText={setEmailPassword}
          />
          <TouchableOpacity
            style={[shared.btn, shared.btnOutline, { marginBottom: 28 }, (!newEmail.trim() || !emailPassword) && { opacity: 0.5 }]}
            onPress={submitEmailChange}
            disabled={!newEmail.trim() || !emailPassword || emailSaving}
          >
            <Save size={15} color={colors.text} />
            <Text style={shared.btnOutlineText}>{emailSaving ? "Updating..." : "Update Email"}</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <KeyRound size={15} color={colors.dim} />
            <Text style={shared.h3}>Change Password</Text>
          </View>
          <TextInput
            style={[shared.input, { marginBottom: 10 }]}
            placeholder="Current password"
            placeholderTextColor={colors.dim2}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={[shared.input, { marginBottom: 10 }]}
            placeholder="New password (min. 6 characters)"
            placeholderTextColor={colors.dim2}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={[shared.input, { marginBottom: 14 }]}
            placeholder="Confirm new password"
            placeholderTextColor={colors.dim2}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={[shared.btn, shared.btnOutline, { marginBottom: 28 }, (!currentPassword || !newPassword) && { opacity: 0.5 }]}
            onPress={submitPasswordChange}
            disabled={!currentPassword || !newPassword || passwordSaving}
          >
            <Save size={15} color={colors.text} />
            <Text style={shared.btnOutlineText}>{passwordSaving ? "Updating..." : "Update Password"}</Text>
          </TouchableOpacity>

          <View
            style={{
              backgroundColor: "rgba(255,59,92,0.08)", borderWidth: 1, borderColor: colors.red,
              borderRadius: 20, padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <TriangleAlert size={16} color={colors.red} />
              <Text style={{ color: colors.red, fontWeight: "700", fontSize: 15 }}>Danger Zone</Text>
            </View>
            <Text style={[shared.label, { marginBottom: 14 }]}>
              Permanently deletes your account and every piece of data tied to it — meals, workouts, templates, custom foods, and trends. This cannot be undone.
            </Text>
            <TextInput
              style={[shared.input, { marginBottom: 14 }]}
              placeholder="Current password"
              placeholderTextColor={colors.dim2}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            <TouchableOpacity
              style={[shared.btn, { backgroundColor: colors.red }, !deletePassword && { opacity: 0.5 }]}
              onPress={confirmDelete}
              disabled={!deletePassword || deleting}
            >
              <Trash size={15} color={colors.text} />
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14.5 }}>
                {deleting ? "Deleting..." : "Delete Account & Data"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
