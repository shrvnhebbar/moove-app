import { useEffect, useState, useCallback } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

// Reads/writes: users/{uid}/workouts/{autoId}
export function useWorkouts() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "workouts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const saveWorkout = useCallback(
    async (workout) => {
      if (!user) return;
      await addDoc(collection(db, "users", user.uid, "workouts"), {
        ...workout,
        createdAt: serverTimestamp(),
      });
    },
    [user]
  );

  return { history, saveWorkout, loading };
}
