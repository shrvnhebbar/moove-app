import { useEffect, useState, useCallback } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

// Stores dated entries at: users/{uid}/metricLogs/{autoId}
// Each entry: { type: "weight" | "bodyFat", value: number, createdAt }
// Reads all entries once (ordered) and filters by type client-side, so no
// Firestore composite index is required.
export function useMetricLogs(type) {
  const { user } = useAuth();
  const [all, setAll] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "metricLogs"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setAll(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  return all.filter((e) => e.type === type);
}

export function useLogMetric() {
  const { user } = useAuth();
  return useCallback(
    async (type, value) => {
      if (!user || value === "" || value == null) return;
      await addDoc(collection(db, "users", user.uid, "metricLogs"), {
        type,
        value: Number(value),
        createdAt: serverTimestamp(),
      });
    },
    [user]
  );
}