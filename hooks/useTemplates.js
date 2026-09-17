import { useEffect, useState, useCallback } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

// Reads/writes: users/{uid}/templates/{autoId}
export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "templates"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  const saveTemplate = useCallback(
    async (template) => {
      if (!user) return;
      await addDoc(collection(db, "users", user.uid, "templates"), { ...template, createdAt: serverTimestamp() });
    },
    [user]
  );

  const deleteTemplate = useCallback(
    async (id) => {
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "templates", id));
    },
    [user]
  );

  return { templates, saveTemplate, deleteTemplate };
}