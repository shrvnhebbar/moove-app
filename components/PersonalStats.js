import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { PenLine, Info, ChevronDown, ChevronUp, TriangleAlert } from "lucide-react-native";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { ACTIVITY_LEVELS, GOAL_OPTIONS } from "../utils/calorieCalculator";

const BMI_MIN = 15;
const BMI_MAX = 35;
const BMI_ZONES = [
  { label: "Underweight", from: 15, to: 18.5, color: colors.blue },
  { label: "Normal", from: 18.5, to: 25, color: colors.ok },
  { label: "Overweight", from: 25, to: 30, color: colors.warning },
  { label: "Obese", from: 30, to: 35, color: colors.red },
];
const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

const fmtN = (v) => v.toLocaleString();
const fmtSigned = (v) => (v > 0 ? `+${v.toLocaleString()}` : v < 0 ? `−${Math.abs(v).toLocaleString()}` : "0");

function Row({ label, value, strong }) {
  return (
    <View style={[shared.row, { paddingVertical: 6 }]}>
      <Text style={{ color: strong ? colors.text : colors.dim, fontSize: 13, fontWeight: strong ? "700" : "400" }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: strong ? 15 : 13, fontWeight: strong ? "700" : "600" }}>{value}</Text>
    </View>
  );
}

function StatTile({ label, value }) {
  return (
    <View style={[shared.card, { flex: 1, alignItems: "center", paddingHorizontal: 8 }]}>
      <Text style={{ ...shared.num, fontSize: 17 }}>{value}</Text>
      <Text style={[shared.label, { textAlign: "center" }]}>{label}</Text>
    </View>
  );
}

function WarningCard({ children }) {
  return (
    <View
      style={{
        flexDirection: "row", gap: 10, padding: 14, marginBottom: 14, borderRadius: 16,
        backgroundColor: "rgba(255,214,10,0.10)", borderWidth: 1, borderColor: colors.warning,
      }}
    >
      <TriangleAlert size={16} color={colors.warning} style={{ marginTop: 1 }} />
      <Text style={{ flex: 1, color: colors.text, fontSize: 12.5, lineHeight: 18 }}>{children}</Text>
    </View>
  );
}

// A round marker sitting on a thin bar, positioned by fraction (0-1) along it.
function BarMarker({ fraction }) {
  return (
    <View
      style={{
        position: "absolute", left: `${clamp01(fraction) * 100}%`, marginLeft: -7, width: 14, height: 14,
        borderRadius: 7, backgroundColor: colors.text, borderWidth: 3, borderColor: colors.surface,
      }}
    />
  );
}

function BmiCard({ stats }) {
  const { bmi, bmiCategory, healthyRange, weight } = stats;
  const zone = BMI_ZONES.find((z) => z.label === bmiCategory);

  let rangeBar = null;
  if (healthyRange) {
    const scaleMin = Math.min(healthyRange.min, weight || healthyRange.min) * 0.85;
    const scaleMax = Math.max(healthyRange.max, weight || healthyRange.max) * 1.15;
    const span = scaleMax - scaleMin;
    const at = (v) => (v - scaleMin) / span;
    const status = !weight
      ? null
      : weight < healthyRange.min
        ? `${(healthyRange.min - weight).toFixed(1)} kg below the healthy range`
        : weight > healthyRange.max
          ? `${(weight - healthyRange.max).toFixed(1)} kg above the healthy range`
          : "You're within the healthy range";
    rangeBar = (
      <View style={{ marginTop: 22 }}>
        <View style={shared.row}>
          <Text style={shared.label}>Healthy weight for your height</Text>
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
            {healthyRange.min.toFixed(1)}–{healthyRange.max.toFixed(1)} kg
          </Text>
        </View>
        <View style={{ height: 16, justifyContent: "center", marginTop: 10 }}>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surface3 }}>
            <View
              style={{
                position: "absolute", top: 0, bottom: 0, borderRadius: 4, backgroundColor: colors.ok,
                left: `${at(healthyRange.min) * 100}%`, width: `${((healthyRange.max - healthyRange.min) / span) * 100}%`,
              }}
            />
          </View>
          {weight ? <BarMarker fraction={at(weight)} /> : null}
        </View>
        {status && <Text style={[shared.label, { marginTop: 8 }]}>{status}</Text>}
      </View>
    );
  }

  return (
    <View style={[shared.card, { marginBottom: 14 }]}>
      <Text style={[shared.h3, { marginBottom: 12 }]}>BMI & Healthy Weight</Text>
      {bmi ? (
        <>
          <View style={shared.row}>
            <Text style={{ ...shared.num, fontSize: 28 }}>{bmi.toFixed(1)}</Text>
            {zone && (
              <View style={[shared.pill, { backgroundColor: colors.surface2 }]}>
                <Text style={{ color: zone.color, fontSize: 12, fontWeight: "700" }}>{zone.label}</Text>
              </View>
            )}
          </View>
          <View style={{ height: 16, justifyContent: "center", marginTop: 12 }}>
            <View style={{ flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden" }}>
              {BMI_ZONES.map((z) => (
                <View key={z.label} style={{ flex: z.to - z.from, backgroundColor: z.color }} />
              ))}
            </View>
            <BarMarker fraction={(bmi - BMI_MIN) / (BMI_MAX - BMI_MIN)} />
          </View>
          <View style={{ height: 14, marginTop: 4 }}>
            {[18.5, 25, 30].map((tick) => (
              <Text
                key={tick}
                style={{
                  position: "absolute", left: `${((tick - BMI_MIN) / (BMI_MAX - BMI_MIN)) * 100}%`,
                  marginLeft: -10, color: colors.dim2, fontSize: 10.5,
                }}
              >
                {tick}
              </Text>
            ))}
          </View>
        </>
      ) : (
        <Text style={shared.label}>Add your weight and height in Details to see your BMI.</Text>
      )}
      {rangeBar}
    </View>
  );
}

export default function PersonalStats({ form, stats, dirty, onEditDetails }) {
  const [showInfo, setShowInfo] = useState(false);
  const { calorieStats, macroStats } = stats;
  const goalLabel = GOAL_OPTIONS.find((g) => g.key === form.goal)?.label;
  const activity = ACTIVITY_LEVELS.find((a) => a.key === form.activityLevel);

  const macroKcal = macroStats
    ? { p: macroStats.proteinG * 4, c: macroStats.carbG * 4, f: macroStats.fatG * 9 }
    : null;
  const macroTotal = macroKcal ? macroKcal.p + macroKcal.c + macroKcal.f : 0;
  const macroRows = macroStats
    ? [
        { label: "Protein", grams: macroStats.proteinG, kcal: macroKcal.p, color: colors.orange },
        { label: "Carbs", grams: macroStats.carbG, kcal: macroKcal.c, color: colors.blue },
        { label: "Fat", grams: macroStats.fatG, kcal: macroKcal.f, color: colors.accent },
      ]
    : [];

  return (
    <>
      {dirty && (
        <View style={[shared.row, { justifyContent: "flex-start", gap: 8, marginBottom: 14, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.surface2 }]}>
          <Info size={14} color={colors.dim} />
          <Text style={[shared.label, { flex: 1 }]}>Previewing unsaved changes. Save to apply them.</Text>
        </View>
      )}

      {calorieStats ? (
        <>
          <View style={[shared.card, { marginBottom: 14 }]}>
            <Text style={shared.label}>Daily calorie target</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, marginTop: 4 }}>
              <Text style={{ color: colors.text, fontSize: 40, fontWeight: "700", lineHeight: 46 }}>{fmtN(calorieStats.target)}</Text>
              <Text style={{ color: colors.dim, fontSize: 14, marginBottom: 8 }}>kcal / day</Text>
            </View>
            <Text style={[shared.label, { marginTop: 2 }]}>Goal: {goalLabel}</Text>
            <View style={shared.divider} />
            <Row label="BMR (energy at rest)" value={fmtN(calorieStats.bmr)} />
            <Row label={`+ Activity (×${activity?.multiplier})`} value={fmtSigned(calorieStats.tdee - calorieStats.bmr)} />
            <Row label="= Maintenance" value={fmtN(calorieStats.tdee)} strong />
            <Row
              label={`${calorieStats.adjustment === 0 ? "±" : calorieStats.adjustment < 0 ? "−" : "+"} Goal (${goalLabel})`}
              value={fmtSigned(calorieStats.adjustment)}
            />
            {calorieStats.flooredAtMinimum && (
              <Row label="+ Raised to safe minimum" value={fmtSigned(calorieStats.target - (calorieStats.tdee + calorieStats.adjustment))} />
            )}
            <Row label="= Daily target" value={fmtN(calorieStats.target)} strong />
          </View>

          {calorieStats.flooredAtMinimum && (
            <WarningCard>
              Your calculated target was below the safe minimum, so it's been raised to {fmtN(calorieStats.floor)} kcal/day. Consider talking to a doctor or registered dietitian before pursuing a larger deficit.
            </WarningCard>
          )}

          {macroStats && (
            <View style={[shared.card, { marginBottom: 14 }]}>
              <Text style={[shared.h3, { marginBottom: 12 }]}>Daily Macros</Text>
              <View style={{ flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 14 }}>
                {macroRows.map((m) => (
                  <View key={m.label} style={{ flex: m.kcal, backgroundColor: m.color }} />
                ))}
              </View>
              {macroRows.map((m) => (
                <View key={m.label} style={[shared.row, { paddingVertical: 5 }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: m.color }} />
                    <Text style={{ color: colors.text, fontSize: 13 }}>{m.label}</Text>
                  </View>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700", width: 60, textAlign: "right" }}>{m.grams}g</Text>
                  <Text style={{ color: colors.dim, fontSize: 13, width: 44, textAlign: "right" }}>{Math.round((m.kcal / macroTotal) * 100)}%</Text>
                </View>
              ))}
            </View>
          )}

          {macroStats?.carbsAtZero && (
            <WarningCard>
              Your calorie target is too low for a balanced split. Protein and fat already use all of it, leaving no room for carbs.
            </WarningCard>
          )}
        </>
      ) : (
        <View style={[shared.card, { marginBottom: 14 }]}>
          <View style={shared.row}>
            <Text style={shared.h3}>Complete your profile</Text>
            <Text style={shared.label}>{4 - stats.missingForCalories.length}/4</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 4, marginVertical: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < 4 - stats.missingForCalories.length ? colors.accent : colors.surface3 }}
              />
            ))}
          </View>
          <Text style={[shared.label, { marginBottom: 14 }]}>
            Add your {stats.missingForCalories.join(", ")} to unlock your daily calorie and macro targets.
          </Text>
          <TouchableOpacity style={[shared.btn, shared.btnGhost]} onPress={onEditDetails}>
            <PenLine size={14} color={colors.text} />
            <Text style={shared.btnGhostText}>Go to Details</Text>
          </TouchableOpacity>
        </View>
      )}

      <BmiCard stats={stats} />

      {stats.hasBodyFat ? (
        <View style={{ marginBottom: 14 }}>
          <Text style={[shared.h3, { marginBottom: 10 }]}>Body Composition</Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <StatTile label="Body fat" value={`${stats.bodyFatPct.toFixed(1)}%`} />
            <StatTile label="Fat mass" value={`${stats.fatMass.toFixed(1)} kg`} />
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatTile label="Lean mass" value={`${stats.leanMass.toFixed(1)} kg`} />
            <StatTile label="Muscle mass (est.)" value={`${stats.muscleMass.toFixed(1)} kg`} />
          </View>
        </View>
      ) : (
        <View style={[shared.card, { marginBottom: 14 }]}>
          <Text style={[shared.label, { marginBottom: 12 }]}>
            Add your body fat % in Details to see fat mass, lean mass and muscle mass.
          </Text>
          <TouchableOpacity style={[shared.btn, shared.btnGhost]} onPress={onEditDetails}>
            <PenLine size={14} color={colors.text} />
            <Text style={shared.btnGhostText}>Add body fat %</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[shared.card, shared.row, { paddingVertical: 14, marginBottom: showInfo ? 0 : 8 }]}
        onPress={() => setShowInfo((v) => !v)}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Info size={15} color={colors.dim} />
          <Text style={{ color: colors.text, fontSize: 13.5, fontWeight: "600" }}>How these are calculated</Text>
        </View>
        {showInfo ? <ChevronUp size={16} color={colors.dim} /> : <ChevronDown size={16} color={colors.dim} />}
      </TouchableOpacity>
      {showInfo && (
        <View style={{ paddingHorizontal: 4, paddingTop: 12, gap: 10, marginBottom: 8 }}>
          <Text style={shared.label}>
            BMI is weight ÷ height². The healthy range is the weight that keeps BMI between 18.5 and 24.9 at your height.
          </Text>
          <Text style={shared.label}>
            Fat, lean and muscle mass come from the body fat % you entered. Muscle mass is a ~50%-of-lean-mass approximation, not a direct measurement.
          </Text>
          <Text style={shared.label}>
            Calories: Mifflin-St Jeor BMR × your activity multiplier gives maintenance, then −500 / 0 / +300 kcal for your goal, never below 1,500 (men) or 1,200 (women).
          </Text>
          <Text style={shared.label}>
            Macros: protein is body weight × 2.0 / 1.6 / 1.8 g (lose / maintain / gain), fat is 25% of calories (at least 0.6 g per kg), and carbs fill the rest.
          </Text>
          <Text style={shared.label}>
            These are estimates, typically within about ±10%. Not medical advice, and not suitable for children, pregnancy or breastfeeding, or conditions affecting metabolism.
          </Text>
        </View>
      )}
    </>
  );
}
