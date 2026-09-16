import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

const MEAL_NAMES = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const emptyDay = () => ({ Breakfast: [], Lunch: [], Dinner: [], Snacks: [] });

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Stores one document per user per day at: users/{uid}/nutritionLogs/{yyyy-mm-dd}
export function useMeals() {
  const { user } = useAuth();
  const [meals, setMeals] = useState(emptyDay());
  const [loading, setLoading] = useState(true);
  const dayId = todayKey();

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "nutritionLogs", dayId);
    const unsub = onSnapshot(ref, (snap) => {
      setMeals(snap.exists() ? { ...emptyDay(), ...snap.data() } : emptyDay());
      setLoading(false);
    });
    return unsub;
  }, [user, dayId]);

  const addFood = useCallback(
    async (mealName, food) => {
      if (!user || !MEAL_NAMES.includes(mealName)) return;
      const next = { ...meals, [mealName]: [...meals[mealName], { id: Date.now().toString(), ...food }] };
      await setDoc(doc(db, "users", user.uid, "nutritionLogs", dayId), next, { merge: true });
    },
    [user, meals, dayId]
  );

  const removeFood = useCallback(
    async (mealName, foodId) => {
      if (!user) return;
      const next = { ...meals, [mealName]: meals[mealName].filter((f) => f.id !== foodId) };
      await setDoc(doc(db, "users", user.uid, "nutritionLogs", dayId), next, { merge: true });
    },
    [user, meals, dayId]
  );

  const totals = Object.values(meals)
    .flat()
    .reduce((acc, f) => ({ kcal: acc.kcal + (f.kcal || 0), p: acc.p + (f.p || 0), c: acc.c + (f.c || 0), f: acc.f + (f.f || 0) }), { kcal: 0, p: 0, c: 0, f: 0 });

  return { meals, totals, addFood, removeFood, loading };
}
