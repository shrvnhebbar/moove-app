import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { useAuth } from "../context/AuthContext";

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !password) return Alert.alert("Missing info", "Fill in every field to continue.");
    if (password.length < 6) return Alert.alert("Weak password", "Use at least 6 characters.");
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
    } catch (e) {
      Alert.alert("Sign up failed", e.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={shared.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[shared.content, { paddingTop: 70, flex: 1 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 24 }}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={{ color: colors.text, fontSize: 26, marginBottom: 6, fontWeight: "700" }}>Create your account</Text>
        <Text style={[shared.label, { marginBottom: 28 }]}>Track meals, macros and workouts in one place</Text>

        <Text style={[shared.label, { marginBottom: 6 }]}>Name</Text>
        <TextInput style={[shared.input, { marginBottom: 12 }]} placeholder="Alex Morgan" placeholderTextColor={colors.dim2} value={name} onChangeText={setName} />

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
        <TextInput style={shared.input} placeholder="At least 6 characters" placeholderTextColor={colors.dim2} secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity style={[shared.btn, shared.btnPrimary, { marginTop: 24 }]} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.accentInk} /> : <Text style={shared.btnPrimaryText}>Sign Up</Text>}
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
        <View style={{ alignItems: "center", paddingBottom: 8 }}>
          <Text style={shared.label}>
            Already have an account?{" "}
            <Text style={{ color: colors.accent, fontWeight: "700" }} onPress={() => navigation.navigate("Login")}>
              Log in
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
