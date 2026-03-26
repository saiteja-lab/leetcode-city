function ProfileAvatar({ imageUrl = "", label = "User profile", className = "h-12 w-12" }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={label}
        className={`${className} rounded-full border border-white/10 object-cover shadow-panel`}
      />
    );
  }

  return (
    <div
      aria-label={label}
      className={`${className} flex items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-100 shadow-panel`}
    >
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" aria-hidden="true">
        <path
          d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.314 0-6 1.79-6 4v1h12v-1c0-2.21-2.686-4-6-4Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default ProfileAvatar;
