// Daily calorie estimate: Mifflin-St Jeor BMR -> x activity multiplier = TDEE
// (maintenance) -> +/- goal adjustment, never below a safety floor.
// Estimates only (typically within ~10% of measured metabolic rate).

export const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary (little or no exercise)", multiplier: 1.2 },
  { key: "light", label: "Lightly active (1–3 days/week)", multiplier: 1.375 },
  { key: "moderate", label: "Moderately active (3–5 days/week)", multiplier: 1.55 },
  { key: "active", label: "Very active (6–7 days/week)", multiplier: 1.725 },
  { key: "extra", label: "Extra active (hard daily training)", multiplier: 1.9 },
];

export const GOAL_OPTIONS = [
  { key: "lose", label: "Lose Weight" },
  { key: "maintain", label: "Maintain" },
  { key: "gain", label: "Gain Weight" },
];

export const GOAL_ADJUSTMENT = { lose: -500, maintain: 0, gain: 300 };
export const MIN_CALORIES = { male: 1500, female: 1200, other: 1350 };

export const PROTEIN_G_PER_KG = { lose: 2.0, maintain: 1.6, gain: 1.8 };
const FAT_SHARE = 0.25;
const MIN_FAT_G_PER_KG = 0.6;
const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 };

// Protein-first macro split of a calorie target: protein from body weight and
// goal, fat as 25% of calories (never under 0.6 g/kg), carbs fill the rest.
// Returns null for unusable input.
export function calcMacros(targetKcal, weightKg, goal = "maintain") {
  const weight = Number(weightKg);
  if (!targetKcal || !weight || !(goal in PROTEIN_G_PER_KG)) return null;

  const proteinG = weight * PROTEIN_G_PER_KG[goal];
  const fatG = Math.max((targetKcal * FAT_SHARE) / KCAL_PER_G.fat, weight * MIN_FAT_G_PER_KG);
  const remainingKcal = targetKcal - proteinG * KCAL_PER_G.protein - fatG * KCAL_PER_G.fat;
  const carbG = Math.max(remainingKcal / KCAL_PER_G.carbs, 0);

  return {
    proteinG: Math.round(proteinG),
    fatG: Math.round(fatG),
    carbG: Math.round(carbG),
    carbsAtZero: remainingKcal <= 0,
  };
}

// Returns null until every input is usable, so it's safe to call on every
// keystroke from a form.
export function calcCalorieStats({ weightKg, heightCm, age, sex, activity, goal = "maintain" }) {
  const weight = Number(weightKg), height = Number(heightCm), years = Number(age);
  const level = ACTIVITY_LEVELS.find((a) => a.key === activity);
  if (!weight || !height || !years || !level) return null;

  const sexConstant = sex === "male" ? 5 : sex === "female" ? -161 : -78;
  const bmr = 10 * weight + 6.25 * height - 5 * years + sexConstant;
  const tdee = bmr * level.multiplier;
  const adjustment = GOAL_ADJUSTMENT[goal] ?? 0;
  const target = tdee + adjustment;
  const floor = MIN_CALORIES[sex] ?? MIN_CALORIES.other;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(Math.max(target, floor)),
    adjustment,
    floor,
    flooredAtMinimum: target < floor,
  };
}
