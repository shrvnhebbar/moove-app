import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";

// Generic single-select dropdown. `options`: [{ key, label }]. Value/onChange
// work off `key`. Tapping the field opens a popup list; tapping an option
// selects it and closes.
export default function Dropdown({ value, options, onChange, placeholder = "Select" }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.key === value);

  return (
    <>
      <TouchableOpacity style={[shared.input, shared.row]} onPress={() => setOpen(true)}>
        <Text style={{ color: selected ? colors.text : colors.dim2, fontSize: 14.5 }}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={18} color={colors.dim} />
      </TouchableOpacity>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", paddingHorizontal: 24 }}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={[shared.card, { padding: 8 }]}>
            {options.map((o) => {
              const isSelected = o.key === value;
              return (
                <TouchableOpacity
                  key={o.key}
                  style={[
                    shared.row,
                    { paddingVertical: 13, paddingHorizontal: 10, borderRadius: 12 },
                    isSelected && { backgroundColor: colors.surface2 },
                  ]}
                  onPress={() => {
                    onChange(o.key);
                    setOpen(false);
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 14.5, fontWeight: isSelected ? "600" : "400" }}>{o.label}</Text>
                  {isSelected && <Check size={17} color={colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
