import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";

// Presentational only — positioning, animation and timing live in ToastProvider.
// variant: "success" | "warning" | "error"
const VARIANTS = {
  success: { solid: colors.ok, tint: "rgba(57,255,122,0.10)", iconColor: colors.bg },
  warning: { solid: colors.warning, tint: "rgba(255,214,10,0.10)", iconColor: colors.bg },
  error: { solid: colors.red, tint: "rgba(255,59,92,0.10)", iconColor: colors.text },
};

export default function Toast({ variant = "success", icon: Icon, title, message, onPress }) {
  const v = VARIANTS[variant] || VARIANTS.success;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        backgroundColor: colors.surface2,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: v.tint }} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 14 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: v.solid, alignItems: "center", justifyContent: "center" }}>
          {Icon && <Icon size={14} color={v.iconColor} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13.5 }} numberOfLines={1}>{title}</Text>
          {!!message && (
            <Text style={{ color: colors.dim, fontSize: 11.5, lineHeight: 14, marginTop: 1 }} numberOfLines={1}>
              {message}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
