import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
  deleteUser,
} from "firebase/auth";
import { doc, setDoc, deleteDoc, serverTimestamp, collection, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// Subcollections to wipe when a user deletes their account.
const USER_SUBCOLLECTIONS = ["nutritionLogs", "workouts", "templates", "metricLogs", "customFoods"];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signup = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    // seed a user profile doc so Firestore has something to read from day one
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      calorieGoal: 2200,
      macroGoal: { p: 150, c: 240, f: 70 },
      createdAt: serverTimestamp(),
    });
    return cred;
  };

  const logout = () => signOut(auth);

  const reauthenticate = (currentPassword) => {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    return reauthenticateWithCredential(auth.currentUser, credential);
  };

  const changePassword = async (currentPassword, newPassword) => {
    await reauthenticate(currentPassword);
    await updatePassword(auth.currentUser, newPassword);
  };

  const changeEmail = async (currentPassword, newEmail) => {
    await reauthenticate(currentPassword);
    await updateEmail(auth.currentUser, newEmail);
    await setDoc(doc(db, "users", auth.currentUser.uid), { email: newEmail }, { merge: true });
  };

  const deleteAccount = async (currentPassword) => {
    await reauthenticate(currentPassword);
    const uid = auth.currentUser.uid;
    for (const name of USER_SUBCOLLECTIONS) {
      const snap = await getDocs(collection(db, "users", uid, name));
      for (let i = 0; i < snap.docs.length; i += 450) {
        const batch = writeBatch(db);
        snap.docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }
    await deleteDoc(doc(db, "users", uid));
    await deleteUser(auth.currentUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, initializing, login, signup, logout, changePassword, changeEmail, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
