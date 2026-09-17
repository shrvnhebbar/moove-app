import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

// Tracks which built-in (hardcoded) templates a user has deleted.
// Stored on the user's own profile doc: users/{uid}.hiddenDefaultTemplates
export function useHiddenTemplates() {
  const { user } = useAuth();
  const [hiddenIds, setHiddenIds] = useState([]);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      setHiddenIds(snap.exists() ? snap.data().hiddenDefaultTemplates || [] : []);
    });
    return unsub;
  }, [user]);

  const hideTemplate = useCallback(
    async (id) => {
      if (!user) return;
      await setDoc(doc(db, "users", user.uid), { hiddenDefaultTemplates: arrayUnion(id) }, { merge: true });
    },
    [user]
  );

  return { hiddenIds, hideTemplate };
}