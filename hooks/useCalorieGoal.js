import { usePersonalInfo } from "./usePersonalInfo";
import { calcCalorieStats, calcMacros } from "../utils/calorieCalculator";

// Used until the user has filled in everything the calculator needs
// (age, weight, height, activity level).
export const DEFAULT_CALORIE_GOAL = 2200;
export const DEFAULT_MACRO_GOAL = { p: 150, c: 240, f: 70 };

// The daily calorie + macro targets shown on Nutrition and Home: computed live
// from the Personal Information fields, so they follow weight/goal/activity
// changes. macroGoal is in grams: { p, c, f }.
export function useCalorieGoal() {
  const { info } = usePersonalInfo();
  const stats = calcCalorieStats({
    weightKg: info.weightKg,
    heightCm: info.heightCm,
    age: info.age,
    sex: info.sex,
    activity: info.activityLevel,
    goal: info.goal,
  });
  const macros = stats ? calcMacros(stats.target, info.weightKg, info.goal) : null;
  return {
    calorieGoal: stats ? stats.target : DEFAULT_CALORIE_GOAL,
    macroGoal: macros ? { p: macros.proteinG, c: macros.carbG, f: macros.fatG } : DEFAULT_MACRO_GOAL,
    personalized: !!stats,
  };
}
