import React from "react";
import { View, Text } from "react-native";
import Svg, { Polyline, Circle } from "react-native-svg";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";

// data: [{ label: "Sep 10", value: 72.4 }, ...] — must be sorted chronologically ascending
export default function TrendChart({ data, color = colors.accent, unit = "" }) {
  if (!data || data.length < 2) {
    return (
      <View style={[shared.card, { alignItems: "center", paddingVertical: 32 }]}>
        <Text style={[shared.label, { textAlign: "center" }]}>
          Not enough data yet — log at least 2 entries to see a trend.
        </Text>
      </View>
    );
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 320, H = 140, PAD = 10;

  const points = data.map((d, i) => {
    const x = data.length === 1 ? W / 2 : (i / (data.length - 1)) * (W - PAD * 2) + PAD;
    const y = H - PAD - ((d.value - min) / range) * (H - PAD * 2);
    return { x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const latest = data[data.length - 1];
  const first = data[0];
  const delta = latest.value - first.value;

  return (
    <View style={shared.card}>
      <View style={[shared.row, { marginBottom: 8 }]}>
        <Text style={shared.num}>
          <Text style={{ fontSize: 22 }}>{latest.value}</Text>
          <Text style={{ fontSize: 13, fontWeight: "500", color: colors.dim }}> {unit}</Text>
        </Text>
        <View style={[shared.pill, delta <= 0 ? shared.pillOk : shared.pillWarn]}>
          <Text style={delta <= 0 ? shared.pillOkText : shared.pillWarnText}>
            {delta === 0 ? "No change" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} ${unit}`}
          </Text>
        </View>
      </View>

      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Polyline points={polylinePoints} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
        ))}
      </Svg>

      <View style={[shared.row, { marginTop: 4 }]}>
        <Text style={[shared.label, { fontSize: 10 }]}>{first.label}</Text>
        <Text style={[shared.label, { fontSize: 10 }]}>{latest.label}</Text>
      </View>
    </View>
  );
}