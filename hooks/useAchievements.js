import { useEffect, useState, useCallback } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

const WORKOUT_COUNT_MILESTONES = [1, 10, 25, 50, 100];
// Fun comparisons for crossing a lifetime-volume milestone.
export const VOLUME_MILESTONES = [
  { kg: 1000, comparison: "a grand piano" },
  { kg: 10000, comparison: "an adult elephant" },
  { kg: 100000, comparison: "a blue whale" },
];
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// Consecutive calendar days (ending today, or yesterday if nothing logged yet
// today) that appear in `dates`. Dedupes multiple workouts on the same day.
function streakFromDates(dates) {
  const days = new Set(dates.filter(Boolean).map(dayKey));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// The user's current real workout streak, from their saved workout history.
export function getWorkoutStreak(history) {
  return streakFromDates(history.map((h) => h.createdAt?.toDate?.()));
}

// Reads/writes: users/{uid}/achievements/{autoId}
// Each doc is one unlocked achievement. `type` tells the Achievements screen
// how to render it: "weight_goal_progress", "workout_count", "volume_milestone",
// "personal_record", "workout_streak".
export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "achievements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAchievements(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addAchievement = useCallback(
    async (achievement) => {
      if (!user) return;
      await addDoc(collection(db, "users", user.uid, "achievements"), {
        ...achievement,
        createdAt: serverTimestamp(),
      });
    },
    [user]
  );

  // Compares weight before/after a Personal Info save against the user's goal,
  // and logs a "weight_goal_progress" achievement when it moves the right way.
  const checkWeightGoalProgress = useCallback(
    async (goal, fromWeight, toWeight) => {
      const from = Number(fromWeight);
      const to = Number(toWeight);
      if (!from || !to || from === to) return;
      const movedRight = (goal === "lose" && to < from) || (goal === "gain" && to > from);
      if (!movedRight) return;
      await addAchievement({
        type: "weight_goal_progress",
        goal,
        fromWeight: from,
        toWeight: to,
        deltaKg: Math.round(Math.abs(to - from) * 10) / 10,
      });
    },
    [addAchievement]
  );

  // Compares workout count, lifetime volume, per-exercise bests, and the
  // workout streak from before this workout to after it, and logs an
  // achievement for each threshold the new workout just crossed.
  const checkWorkoutAchievements = useCallback(
    async (history, newWorkout) => {
      const unlocked = [];

      const countBefore = history.length;
      const countAfter = countBefore + 1;
      for (const m of WORKOUT_COUNT_MILESTONES) {
        if (countBefore < m && countAfter >= m) unlocked.push({ type: "workout_count", count: m });
      }

      const volumeBefore = history.reduce((sum, h) => sum + (h.volume || 0), 0);
      const volumeAfter = volumeBefore + (newWorkout.volume || 0);
      for (const { kg, comparison } of VOLUME_MILESTONES) {
        if (volumeBefore < kg && volumeAfter >= kg) unlocked.push({ type: "volume_milestone", volume: kg, comparison });
      }

      const priorBest = {};
      history.forEach((h) =>
        (h.exercises || []).forEach((ex) =>
          (ex.sets || []).forEach((s) => {
            if (s.done && Number(s.weight) > 0) {
              priorBest[ex.name] = Math.max(priorBest[ex.name] || 0, Number(s.weight));
            }
          })
        )
      );
      (newWorkout.exercises || []).forEach((ex) => {
        let bestThisTime = 0;
        (ex.sets || []).forEach((s) => {
          if (s.done && Number(s.weight) > 0) bestThisTime = Math.max(bestThisTime, Number(s.weight));
        });
        const previousBest = priorBest[ex.name];
        if (bestThisTime > 0 && previousBest != null && bestThisTime > previousBest) {
          unlocked.push({ type: "personal_record", exercise: ex.name, weight: bestThisTime, previousWeight: previousBest });
        }
      });

      const streakBefore = streakFromDates(history.map((h) => h.createdAt?.toDate?.()));
      const streakAfter = streakFromDates([...history.map((h) => h.createdAt?.toDate?.()), new Date()]);
      for (const s of STREAK_MILESTONES) {
        if (streakBefore < s && streakAfter >= s) unlocked.push({ type: "workout_streak", days: s });
      }

      for (const achievement of unlocked) {
        await addAchievement(achievement);
      }
    },
    [addAchievement]
  );

  return { achievements, loading, addAchievement, checkWeightGoalProgress, checkWorkoutAchievements };
}
