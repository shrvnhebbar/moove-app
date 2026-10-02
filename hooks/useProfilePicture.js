import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

// Reads/writes `photoURL` on: users/{uid}. The actual image bytes live in
// Firebase Storage at profilePictures/{uid}.jpg; this just tracks the URL.
export function useProfilePicture() {
  const { user } = useAuth();
  const [photoURL, setPhotoURL] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      setPhotoURL(snap.exists() ? snap.data().photoURL ?? null : null);
    });
    return unsub;
  }, [user]);

  const uploadProfilePicture = useCallback(
    async (localUri) => {
      if (!user) return;
      setUploading(true);
      try {
        const response = await fetch(localUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
      } finally {
        setUploading(false);
      }
    },
    [user]
  );

  return { photoURL, uploading, uploadProfilePicture };
}
