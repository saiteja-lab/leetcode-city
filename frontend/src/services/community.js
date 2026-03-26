import { isDevelopment } from "../config/env";
import api from "./api";
import { mapCityRecord } from "../utils/city";
import { getSupabaseClient } from "./supabase";

const CITIES_TABLE = "city_buildings";

export async function fetchCommunityCities() {
  if (isDevelopment) {
    const response = await api.get("/api/community/cities");
    return (response.data || []).map(mapCityRecord);
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from(CITIES_TABLE)
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(mapCityRecord);
}

export async function saveUserCity(user, cityPayload) {
  const normalizedUsername = cityPayload.username.trim();

  if (isDevelopment) {
    const response = await api.post("/api/community/cities", {
      ...cityPayload,
      username: normalizedUsername,
    });
    return mapCityRecord(response.data);
  }

  const client = getSupabaseClient();
  const { data: existingCity, error: existingCityError } = await client
    .from(CITIES_TABLE)
    .select("id, user_id, email, created_at")
    .ilike("leetcode_username", normalizedUsername)
    .maybeSingle();

  if (existingCityError) {
    throw existingCityError;
  }

  const record = {
    user_id: existingCity?.user_id || user.id,
    email: existingCity?.email || user.email || "Unknown user",
    leetcode_username: normalizedUsername,
    easy: cityPayload.easy,
    medium: cityPayload.medium,
    hard: cityPayload.hard,
    houses: cityPayload.city.houses,
    buildings: cityPayload.city.buildings,
    skyscrapers: cityPayload.city.skyscrapers,
    city_level: cityPayload.city.level,
  };

  const query = existingCity
    ? client
        .from(CITIES_TABLE)
        .update(record)
        .eq("id", existingCity.id)
        .select()
        .single()
    : client.from(CITIES_TABLE).insert(record).select().single();

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return mapCityRecord(data);
}
