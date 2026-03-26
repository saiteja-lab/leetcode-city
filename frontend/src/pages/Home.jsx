import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AuthForm from "../components/AuthForm";
import CityCanvas from "../components/CityCanvas";
import InputForm from "../components/InputForm";
import ProfileAvatar from "../components/ProfileAvatar";
import ProfilePanel from "../components/ProfilePanel";
import UserProfilePanel from "../components/UserProfilePanel";
import { isProduction } from "../config/env";
import { signOutCurrentUser } from "../services/auth";
import { fetchCommunityCities } from "../services/community";
import { fetchCurrentUserProfile, saveCurrentUserProfile } from "../services/profile";
import { isSupabaseConfigured } from "../services/supabase";
import {
  authRequestStart,
  authRequestSuccess,
  authSetError,
  clearCommunity,
  clearCurrentCity,
  communityLoadError,
  communityLoadStart,
  communityLoadSuccess,
  selectCity,
} from "../store/store";

function Home() {
  const dispatch = useDispatch();
  const [profileCity, setProfileCity] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [skylineFormOpen, setSkylineFormOpen] = useState(false);
  const [introDialogOpen, setIntroDialogOpen] = useState(true);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const [userProfileError, setUserProfileError] = useState("");
  const { user, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const { error: cityError, currentCity } = useSelector((state) => state.city);
  const { error: communityError, cities } = useSelector((state) => state.community);
  const myCities = user ? cities.filter((city) => city.userId === user.id) : [];
  const builderCount = new Set(cities.map((city) => city.userId).filter(Boolean)).size;

  useEffect(() => {
    if (!user || (isProduction && !isSupabaseConfigured)) {
      dispatch(clearCommunity());
      dispatch(clearCurrentCity());
      setProfileCity(null);
      setProfileOpen(false);
      setUserProfile(null);
      setUserProfileError("");
      setUserProfileOpen(false);
      setSkylineFormOpen(false);
      setHoveredCity(null);
      return;
    }

    let mounted = true;

    const loadCommunity = async () => {
      dispatch(communityLoadStart());

      try {
        const savedCities = await fetchCommunityCities();
        if (!mounted) {
          return;
        }

        dispatch(communityLoadSuccess(savedCities));

        const preferredCity =
          savedCities.find((city) => city.userId === user.id) || savedCities[0] || null;

        if (preferredCity) {
          dispatch(selectCity(preferredCity));
        }
      } catch (error) {
        if (mounted) {
          dispatch(
            communityLoadError(
              error.message || "Unable to load community cities from Supabase.",
            ),
          );
        }
      }
    };

    loadCommunity();

    return () => {
      mounted = false;
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (!user || (isProduction && !isSupabaseConfigured)) {
      setUserProfileLoading(false);
      return;
    }

    let mounted = true;
    setUserProfileLoading(true);
    setUserProfileError("");

    const loadProfile = async () => {
      try {
        const profile = await fetchCurrentUserProfile(user);
        if (mounted) {
          setUserProfile(profile);
        }
      } catch (error) {
        if (mounted) {
          setUserProfileError(error.message || "Unable to load your profile.");
        }
      } finally {
        if (mounted) {
          setUserProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!profileOpen) {
      return;
    }

    if (!currentCity) {
      setProfileOpen(false);
      setProfileCity(null);
      return;
    }

    setProfileCity(currentCity);
  }, [currentCity, profileOpen]);

  const handleBuildingSelect = useCallback((city) => {
    setProfileCity(city);
    setProfileOpen(true);
  }, []);

  const handleAvatarSave = async (avatarDataUrl) => {
    if (!user) {
      throw new Error("You need to be signed in to update your profile.");
    }

    const savedProfile = await saveCurrentUserProfile(user, { avatarDataUrl });
    setUserProfile(savedProfile);
    setUserProfileError("");
    return savedProfile;
  };

  const handleSignOut = async () => {
    dispatch(authRequestStart());

    try {
      await signOutCurrentUser();
      dispatch(clearCurrentCity());
      dispatch(clearCommunity());
      dispatch(authRequestSuccess("Signed out."));
      setUserProfileOpen(false);
      setUserProfile(null);
      setUserProfileError("");
    } catch (submitError) {
      dispatch(authSetError(submitError.message || "Unable to sign out right now."));
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-panel">
          <p className="text-sm text-slate-300">Checking your session...</p>
        </div>
      </main>
    );
  }

  if (isProduction && !isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <section className="max-w-3xl rounded-[2rem] border border-amber-400/25 bg-amber-400/10 p-8 shadow-panel">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Supabase Setup Required</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            Add your Supabase environment variables to continue.
          </h1>
          <p className="mt-4 text-sm text-slate-200">
            Create <span className="font-semibold text-white">frontend/.env</span> and set
            <span className="mx-1 font-semibold text-white">VITE_SUPABASE_URL</span>
            and
            <span className="mx-1 font-semibold text-white">VITE_SUPABASE_ANON_KEY</span>.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="relative h-screen overflow-hidden bg-slate-950 text-slate-100">
      <CityCanvas onBuildingSelect={handleBuildingSelect} onHoverCityChange={setHoveredCity} />

      <div className="pointer-events-none absolute inset-0 z-10">
        {introDialogOpen ? (
          <div className="pointer-events-auto absolute left-5 top-5 max-w-md rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-panel backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">LeetCode City Generator</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Shared Skyline Map</h1>
              </div>
              <button
                type="button"
                onClick={() => setIntroDialogOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300 transition hover:border-cyan-300 hover:text-cyan-100"
                aria-label="Close dialog"
              >
                X
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Each saved LeetCode username becomes one building. Hover to inspect it from the side
              panel, click to open the full profile card, and add more usernames to grow the city.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full bg-emerald-400/15 px-3 py-1">Easy = width</span>
              <span className="rounded-full bg-amber-400/15 px-3 py-1">Medium = floors</span>
              <span className="rounded-full bg-cyan-400/15 px-3 py-1">Hard = spire</span>
            </div>
          </div>
        ) : null}

        <div className="pointer-events-auto absolute right-5 top-5 flex w-[min(420px,calc(100vw-2.5rem))] flex-col gap-4">
          {user ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setUserProfileOpen(true)}
                className="rounded-full border border-white/10 bg-slate-950/75 p-1.5 backdrop-blur transition hover:border-cyan-300"
                aria-label="Open your profile"
              >
                <ProfileAvatar
                  imageUrl={userProfile?.avatarDataUrl}
                  label={user.email || "User profile"}
                  className="h-12 w-12"
                />
              </button>
            </div>
          ) : null}

          <div className="max-w-[280px] self-end rounded-[1.5rem] border border-white/10 bg-slate-950/75 p-3 shadow-panel backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">City Status</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-white/5 p-2.5">
                <p className="text-xs text-slate-400">Buildings</p>
                <p className="mt-1 text-xl font-semibold text-white">{cities.length}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5">
                <p className="text-xs text-slate-400">Builders</p>
                <p className="mt-1 text-xl font-semibold text-white">{builderCount}</p>
              </div>
            </div>
          </div>

          {user ? (
            <button
              type="button"
              onClick={() => setSkylineFormOpen((current) => !current)}
              className="self-end rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/15"
            >
              {skylineFormOpen ? "Hide Skyline Form" : "Expand Your Skyline"}
            </button>
          ) : null}

          {hoveredCity ? (
            <div className="w-full max-w-[344px] self-end rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-100 shadow-panel backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200">Hovered Building</p>
              <p className="mt-2 text-lg font-semibold text-white">@{hoveredCity.username}</p>
              <p className="mt-1 text-xs text-slate-400">
                {hoveredCity.archetype.name} / {hoveredCity.city.level}
              </p>

              <div className="mt-3.5 grid grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-xl bg-emerald-400/10 px-2.5 py-2 text-center">
                  <p className="text-emerald-200">Easy</p>
                  <p className="mt-1 font-semibold text-white">{hoveredCity.easy}</p>
                </div>
                <div className="rounded-xl bg-amber-400/10 px-2.5 py-2 text-center">
                  <p className="text-amber-200">Medium</p>
                  <p className="mt-1 font-semibold text-white">{hoveredCity.medium}</p>
                </div>
                <div className="rounded-xl bg-cyan-400/10 px-2.5 py-2 text-center">
                  <p className="text-cyan-200">Hard</p>
                  <p className="mt-1 font-semibold text-white">{hoveredCity.hard}</p>
                </div>
              </div>

              <p className="mt-3.5 text-xs text-slate-400">
                Click the building to open the full profile card.
              </p>
            </div>
          ) : null}

          {user ? (skylineFormOpen ? <InputForm /> : null) : <AuthForm />}

          {authError ? (
            <div className="rounded-3xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-100">
              {authError}
            </div>
          ) : null}

          {cityError ? (
            <div className="rounded-3xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-100">
              {cityError}
            </div>
          ) : null}

          {communityError ? (
            <div className="rounded-3xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-100">
              {communityError}
            </div>
          ) : null}

          {userProfileError && !userProfileOpen ? (
            <div className="rounded-3xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-100">
              {userProfileError}
            </div>
          ) : null}
        </div>
      </div>

      <UserProfilePanel
        user={user}
        profile={userProfile}
        myCities={myCities}
        open={userProfileOpen}
        loading={userProfileLoading}
        error={userProfileError}
        onClose={() => setUserProfileOpen(false)}
        onAvatarSave={handleAvatarSave}
        onSignOut={handleSignOut}
      />

      <ProfilePanel
        city={profileCity}
        open={profileOpen}
        onClose={() => {
          setProfileOpen(false);
          setProfileCity(null);
        }}
      />
    </main>
  );
}

export default Home;

