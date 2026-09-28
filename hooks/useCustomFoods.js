import { useEffect, useState, useCallback } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

// Reads/writes: users/{uid}/customFoods/{autoId}
// A custom food is a saved combination of dataset ingredients with totalled macros.
export function useCustomFoods() {
  const { user } = useAuth();
  const [customFoods, setCustomFoods] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "customFoods"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCustomFoods(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  const saveCustomFood = useCallback(
    async (food) => {
      if (!user) return;
      await addDoc(collection(db, "users", user.uid, "customFoods"), { ...food, createdAt: serverTimestamp() });
    },
    [user]
  );

  const deleteCustomFood = useCallback(
    async (id) => {
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "customFoods", id));
    },
    [user]
  );

  return { customFoods, saveCustomFood, deleteCustomFood };
}
