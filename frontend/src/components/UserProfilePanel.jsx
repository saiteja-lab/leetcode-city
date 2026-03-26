import { useEffect, useRef, useState } from "react";

import { normalizeAvatarFile } from "../utils/profile";
import ProfileAvatar from "./ProfileAvatar";

function formatDateTime(value) {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleString();
}

function UserProfilePanel({
  user,
  profile,
  myCities,
  open,
  loading,
  error,
  onClose,
  onAvatarSave,
  onSignOut,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);

      const frame = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timeout = window.setTimeout(() => {
      setShouldRender(false);
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [open]);

  if (!shouldRender || !user) {
    return null;
  }

  const latestBuildingUpdate = myCities.reduce((latest, city) => {
    if (!latest) {
      return city.updatedAt;
    }

    return new Date(city.updatedAt) > new Date(latest) ? city.updatedAt : latest;
  }, "");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);
    setUploadMessage("");
    setUploadError("");

    try {
      const avatarDataUrl = await normalizeAvatarFile(file);
      await onAvatarSave(avatarDataUrl);
      setUploadMessage("Profile photo updated.");
    } catch (submitError) {
      setUploadError(submitError.message || "We couldn't update your profile photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-200 ${
        isVisible ? "bg-slate-950/35 backdrop-blur-sm" : "bg-slate-950/0 backdrop-blur-none"
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div className="flex h-full justify-end">
        <div
          className={`h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-slate-950/95 p-6 shadow-panel transition-transform duration-300 ease-out ${
            isVisible ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="User profile"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200">User Profile</p>
              <h2 className="mt-2 text-lg font-semibold text-white">{user.email}</h2>
              <p className="mt-1.5 text-xs text-slate-400">Manage your account details and photo.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 px-4 py-2 text-xs text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
            >
              Close
            </button>
          </div>

          <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <ProfileAvatar
                imageUrl={profile?.avatarDataUrl}
                label={user.email || "User profile"}
                className="h-24 w-24"
              />
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Profile Photo</p>
                <p className="mt-1.5 text-xs text-slate-300">
                  Upload a square image or any photo you want us to fit into the avatar.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || loading}
                    className="rounded-2xl bg-accent px-5 py-3 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700"
                  >
                    {uploading ? "Uploading..." : profile?.avatarDataUrl ? "Change Photo" : "Upload Photo"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-xs text-cyan-100">
                Loading your profile...
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 p-3 text-xs text-rose-100">
                {error}
              </div>
            ) : null}

            {uploadError ? (
              <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 p-3 text-xs text-rose-100">
                {uploadError}
              </div>
            ) : null}

            {uploadMessage ? (
              <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-xs text-emerald-100">
                {uploadMessage}
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Email</p>
              <p className="mt-2 break-all text-base font-semibold text-white">{user.email}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Joined</p>
              <p className="mt-2 text-base font-semibold text-white">{formatDateTime(user.created_at)}</p>
            </div>
          </div>

          <div className="mt-4 rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Skyline Activity</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Latest Update</p>
                <p className="mt-2 text-xs font-medium text-white">{formatDateTime(latestBuildingUpdate)}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  LeetCode User IDs Added To Skyline
                </p>
                {myCities.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {myCities.map((city) => (
                      <span
                        key={city.id}
                        className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] text-cyan-100"
                      >
                        @{city.username}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">No saved buildings yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-2xl border border-white/10 px-5 py-3 text-xs text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-white/10 px-5 py-3 text-xs text-white transition hover:bg-white/15"
            >
              Back To Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePanel;
