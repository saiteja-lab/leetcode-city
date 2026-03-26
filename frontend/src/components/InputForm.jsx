import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchUserCity } from "../services/api";
import { saveUserCity } from "../services/community";
import {
  citySetError,
  requestStart,
  requestSuccess,
  syncCommunityCity,
} from "../store/store";
import { buildPreviewCity } from "../utils/city";

function InputForm() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.city);
  const { user } = useSelector((state) => state.auth);
  const { cities } = useSelector((state) => state.community);
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("mine");

  const myBuildings = useMemo(() => {
    if (!user) {
      return [];
    }

    return cities.filter((city) => city.userId === user.id);
  }, [cities, user]);

  const existingCity = useMemo(() => {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername) {
      return null;
    }

    return (
      cities.find((city) => city.username?.trim().toLowerCase() === normalizedUsername) || null
    );
  }, [cities, username]);

  const modeLabel = existingCity
    ? "Update Existing Building"
    : mode === "mine"
      ? "Add My Building"
      : "Add My Friend To City";

  const helperText =
    mode === "mine"
      ? myBuildings.length
        ? "Add a new LeetCode handle to your skyline, or re-enter one to refresh its building."
        : "Enter your LeetCode username to create your first building."
      : "Enter a friend's LeetCode username to add it to the city, or re-enter it to refresh that building.";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedUsername = username.trim();
    const normalizedUsername = trimmedUsername.toLowerCase();

    if (!trimmedUsername) {
      dispatch(citySetError("Please enter a LeetCode username."));
      return;
    }

    if (!user) {
      dispatch(citySetError("Please sign in before generating a city."));
      return;
    }

    dispatch(requestStart(trimmedUsername));

    try {
      const data = await fetchUserCity(trimmedUsername);
      const previewCity = buildPreviewCity(data, user.email || "Current user");
      dispatch(requestSuccess(previewCity));

      try {
        const savedCity = await saveUserCity(user, data);
        dispatch(requestSuccess(savedCity));
        dispatch(syncCommunityCity(savedCity));
        setUsername("");
      } catch (saveError) {
        dispatch(
          citySetError(
            saveError.message || "City generated, but saving it failed.",
          ),
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "We couldn't generate a city right now. Please try again.";
      dispatch(citySetError(message));
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-panel">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Add Buildings</p>
      <h2 className="mt-3 text-xl font-semibold text-white">
        {myBuildings.length ? "Expand your skyline" : "Add your LeetCode username"}
      </h2>
      <p className="mt-2 text-sm text-slate-300">{helperText}</p>
      {existingCity ? (
        <p className="mt-2 text-xs text-cyan-200">
          @{existingCity.username} already exists in the skyline. Submitting will update that
          building with the latest LeetCode stats.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("mine")}
          className={`rounded-2xl px-4 py-2 text-sm transition ${
            mode === "mine"
              ? "bg-cyan-400/15 text-cyan-100"
              : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          My Building
        </button>
        <button
          type="button"
          onClick={() => setMode("friend")}
          className={`rounded-2xl px-4 py-2 text-sm transition ${
            mode === "friend"
              ? "bg-cyan-400/15 text-cyan-100"
              : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          Add My Friend To City
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder={
            mode === "mine"
              ? "Enter your LeetCode username"
              : "Enter your friend's LeetCode username"
          }
          className="h-12 flex-1 rounded-2xl border border-white/10 bg-slate-950/80 px-4 text-sm text-slate-100 outline-none transition focus:border-glow"
        />
        <button
          type="submit"
          disabled={loading || !user}
          className="h-12 rounded-2xl bg-accent px-6 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700"
        >
          {loading ? "Updating..." : modeLabel}
        </button>
      </form>
    </div>
  );
}

export default InputForm;
