import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

const DEFAULTS = { name: "", age: "", sex: "male", weightKg: "", heightCm: "", bodyFatPct: "" };

// Reads/writes personal info fields on: users/{uid}
export function usePersonalInfo() {
  const { user } = useAuth();
  const [info, setInfo] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      setInfo({
        name: data.name ?? user.displayName ?? "",
        age: data.age != null ? String(data.age) : "",
        sex: data.sex ?? "male",
        weightKg: data.weightKg != null ? String(data.weightKg) : "",
        heightCm: data.heightCm != null ? String(data.heightCm) : "",
        bodyFatPct: data.bodyFatPct != null ? String(data.bodyFatPct) : "",
      });
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const savePersonalInfo = useCallback(
    async (next) => {
      if (!user) return;
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: next.name,
          age: next.age === "" ? null : Number(next.age),
          sex: next.sex,
          weightKg: next.weightKg === "" ? null : Number(next.weightKg),
          heightCm: next.heightCm === "" ? null : Number(next.heightCm),
          bodyFatPct: next.bodyFatPct === "" ? null : Number(next.bodyFatPct),
        },
        { merge: true }
      );
    },
    [user]
  );

  return { info, savePersonalInfo, loading };
}