import { isDevelopment } from "../config/env";
import api from "./api";
import { getSupabaseClient } from "./supabase";

const PROFILES_TABLE = "user_profiles";

function mapProfileRecord(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    userId: record.user_id,
    avatarDataUrl: record.avatar_data_url || "",
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export async function fetchCurrentUserProfile(user) {
  if (!user?.id) {
    return null;
  }

  if (isDevelopment) {
    const response = await api.get("/api/profile");
    return mapProfileRecord(response.data?.profile || null);
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from(PROFILES_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return mapProfileRecord(data);
}

export async function saveCurrentUserProfile(user, profilePayload) {
  if (!user?.id) {
    throw new Error("You need to be signed in to update your profile.");
  }

  const payload = {
    avatar_data_url: profilePayload.avatarDataUrl || null,
  };

  if (isDevelopment) {
    const response = await api.put("/api/profile", payload);
    return mapProfileRecord(response.data?.profile);
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from(PROFILES_TABLE)
    .upsert(
      {
        user_id: user.id,
        ...payload,
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapProfileRecord(data);
}
