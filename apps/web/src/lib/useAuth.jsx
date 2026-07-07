import React, { createContext, useContext, useEffect, useState } from "react";
import pb from "@/lib/pocketbaseClient";

const DOMAIN = "mail-sphere.fr";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(pb.authStore.record);

  useEffect(() => {
    const unsub = pb.authStore.onChange((_t, record) => setUser(record));
    return unsub;
  }, []);

  const login = (identity, password) =>
    pb.collection("users").authWithPassword(identity, password);

  const signup = async ({ handle, displayName, password }) => {
    const email = `${handle}@${DOMAIN}`;
    await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      handle,
      displayName: displayName || handle,
      emailVisibility: true,
    });
    return pb.collection("users").authWithPassword(email, password);
  };

  const logout = () => pb.authStore.clear();

  return (
    <AuthContext.Provider
      value={{ user, isAuthed: pb.authStore.isValid, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const MAIL_DOMAIN = DOMAIN;
export const addressOf = (u) => (u ? `${u.handle}@${DOMAIN}` : "");
