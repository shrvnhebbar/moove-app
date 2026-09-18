// All figures here are estimates from standard population formulas, not
// clinical measurements. Real body fat % / muscle mass require an actual
// measurement method (skinfold calipers, bioimpedance scale, DEXA scan, etc).

export function calcBMI(weightKg, heightCm) {
  const w = Number(weightKg), h = Number(heightCm);
  if (!w || !h) return null;
  const heightM = h / 100;
  return w / (heightM * heightM);
}

export function bmiCategory(bmi) {
  if (bmi == null) return null;
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// Deurenberg formula — a widely used estimate from BMI + age + sex.
// Typical error margin is several percentage points vs. a real DEXA scan.
export function calcBodyFatPct(weightKg, heightCm, age, sex) {
  const bmi = calcBMI(weightKg, heightCm);
  const a = Number(age);
  if (bmi == null || !a) return null;
  const sexVal = sex === "male" ? 1 : 0;
  const raw = 1.2 * bmi + 0.23 * a - 10.8 * sexVal - 5.4;
  return Math.min(60, Math.max(3, raw));
}

export function calcFatMass(weightKg, bodyFatPct) {
  const w = Number(weightKg);
  if (!w || bodyFatPct == null) return null;
  return w * (bodyFatPct / 100);
}

export function calcLeanMass(weightKg, fatMassKg) {
  const w = Number(weightKg);
  if (!w || fatMassKg == null) return null;
  return w - fatMassKg;
}

// Skeletal muscle is a subset of lean mass — this uses a common ~50% approximation.
export function calcMuscleMassEstimate(leanMassKg) {
  if (leanMassKg == null) return null;
  return leanMassKg * 0.5;
}