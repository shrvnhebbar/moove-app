import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) return Alert.alert("Missing info", "Enter your email and password.");
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert("Login failed", e.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={shared.screen} edges={["top"]}>
      <KeyboardAvoidingView style={shared.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[shared.content, { paddingTop: 70, flex: 1 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 46 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
              <Feather name="activity" size={20} color={colors.accentInk} />
            </View>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>FORM</Text>
          </View>

          <Text style={{ color: colors.text, fontSize: 26, marginBottom: 6, fontWeight: "700" }}>Welcome back</Text>
          <Text style={[shared.label, { marginBottom: 28 }]}>Log in to see today's stats</Text>

          <Text style={[shared.label, { marginBottom: 6 }]}>Email</Text>
          <TextInput
            style={[shared.input, { marginBottom: 12 }]}
            placeholder="you@example.com"
            placeholderTextColor={colors.dim2}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[shared.label, { marginBottom: 6 }]}>Password</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={shared.input}
              placeholder="••••••••"
              placeholderTextColor={colors.dim2}
              secureTextEntry={!showPw}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={{ position: "absolute", right: 12, top: 13 }} onPress={() => setShowPw(!showPw)}>
              <Feather name={showPw ? "eye-off" : "eye"} size={18} color={colors.dim} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[shared.btn, shared.btnPrimary, { marginTop: 24 }]} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.accentInk} /> : <Text style={shared.btnPrimaryText}>Log In</Text>}
          </TouchableOpacity>

          <View style={{ flex: 1 }} />
          <View style={{ alignItems: "center", paddingBottom: 8 }}>
            <Text style={shared.label}>
              Don't have an account?{" "}
              <Text style={{ color: colors.accent, fontWeight: "700" }} onPress={() => navigation.navigate("Signup")}>
                Sign up
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
