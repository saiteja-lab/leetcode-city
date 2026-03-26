import { isDevelopment } from "../config/env";
import api from "./api";
import {
  clearStoredDevelopmentSession,
  emitDevelopmentAuthChange,
  getStoredDevelopmentSession,
  setStoredDevelopmentSession,
  subscribeDevelopmentAuthChange,
} from "./devSession";
import { getSupabaseClient } from "./supabase";

export async function getActiveSession() {
  if (isDevelopment) {
    const storedSession = getStoredDevelopmentSession();
    if (!storedSession?.access_token) {
      return null;
    }

    try {
      const response = await api.get("/api/auth/session");
      const session = response.data.session;
      setStoredDevelopmentSession(session);
      return session;
    } catch {
      clearStoredDevelopmentSession();
      return null;
    }
  }

  const client = getSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export function onAuthStateChange(callback) {
  if (isDevelopment) {
    return subscribeDevelopmentAuthChange(callback);
  }

  const client = getSupabaseClient();
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return data.subscription;
}

export async function signUpWithEmail(email, password) {
  if (isDevelopment) {
    const response = await api.post("/api/auth/signup", { email, password });
    const session = response.data.session;
    setStoredDevelopmentSession(session);
    emitDevelopmentAuthChange(session);
    return { session };
  }

  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithEmail(email, password) {
  if (isDevelopment) {
    const response = await api.post("/api/auth/signin", { email, password });
    const session = response.data.session;
    setStoredDevelopmentSession(session);
    emitDevelopmentAuthChange(session);
    return { session };
  }

  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOutCurrentUser() {
  if (isDevelopment) {
    try {
      await api.post("/api/auth/signout");
    } finally {
      clearStoredDevelopmentSession();
      emitDevelopmentAuthChange(null);
    }
    return;
  }

  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}
