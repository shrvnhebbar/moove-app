import {
  calcBMI,
  bmiCategory,
  calcFatMass,
  calcLeanMass,
  calcMuscleMassEstimate,
  calcHealthyWeightRange,
} from "./bodyMetrics";
import { calcCalorieStats, calcMacros } from "./calorieCalculator";

// Every derived number on the Personal Information screen, computed from the
// form values (so it reflects unsaved edits too). Anything that can't be
// computed yet comes back null.
export function computePersonalStats(form) {
  const weight = Number(form.weightKg) || null;
  const bmi = calcBMI(form.weightKg, form.heightCm);
  const bodyFatPct = form.bodyFatPct === "" ? null : Number(form.bodyFatPct);
  const hasBodyFat = bodyFatPct != null && bodyFatPct > 0;
  const fatMass = hasBodyFat ? calcFatMass(form.weightKg, bodyFatPct) : null;
  const leanMass = calcLeanMass(form.weightKg, fatMass);

  const calorieStats = calcCalorieStats({
    weightKg: form.weightKg,
    heightCm: form.heightCm,
    age: form.age,
    sex: form.sex,
    activity: form.activityLevel,
    goal: form.goal,
  });
  const macroStats = calorieStats ? calcMacros(calorieStats.target, form.weightKg, form.goal) : null;

  const missingForCalories = [
    !Number(form.age) && "age",
    !Number(form.weightKg) && "weight",
    !Number(form.heightCm) && "height",
    !form.activityLevel && "activity level",
  ].filter(Boolean);

  return {
    weight,
    bmi,
    bmiCategory: bmiCategory(bmi),
    healthyRange: calcHealthyWeightRange(form.heightCm),
    hasBodyFat,
    bodyFatPct,
    fatMass,
    leanMass,
    muscleMass: calcMuscleMassEstimate(leanMass),
    calorieStats,
    macroStats,
    missingForCalories,
  };
}
