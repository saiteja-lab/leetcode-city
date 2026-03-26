function numberToHex(value) {
  return `#${value.toString(16).padStart(6, "0")}`;
}

function buildCardSvg(city) {
  const base = numberToHex(city.archetype.palette.base);
  const accent = numberToHex(city.archetype.palette.accent);
  const glow = numberToHex(city.archetype.palette.glow);

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="55%" stop-color="${base}"/>
        <stop offset="100%" stop-color="${accent}"/>
      </linearGradient>
      <linearGradient id="panel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.16)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.04)"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1350" fill="url(#bg)"/>
    <circle cx="860" cy="190" r="170" fill="${glow}" opacity="0.18"/>
    <circle cx="210" cy="1180" r="220" fill="${accent}" opacity="0.12"/>
    <rect x="70" y="70" width="940" height="1210" rx="42" fill="rgba(2,6,23,0.62)" stroke="rgba(255,255,255,0.14)"/>
    <text x="110" y="150" font-size="28" fill="#bae6fd" font-family="Arial, sans-serif">LEETCODE CITY PROFILE</text>
    <text x="110" y="250" font-size="72" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">@${city.username}</text>
    <text x="110" y="305" font-size="30" fill="#e2e8f0" font-family="Arial, sans-serif">${city.email}</text>
    <text x="110" y="380" font-size="38" font-weight="700" fill="${glow}" font-family="Arial, sans-serif">${city.archetype.name}</text>
    <text x="110" y="430" font-size="26" fill="#cbd5e1" font-family="Arial, sans-serif">Level: ${city.city.level}</text>

    <rect x="110" y="500" width="260" height="140" rx="24" fill="rgba(16,185,129,0.16)" stroke="rgba(255,255,255,0.08)"/>
    <text x="145" y="555" font-size="26" fill="#a7f3d0" font-family="Arial, sans-serif">Easy</text>
    <text x="145" y="615" font-size="52" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">${city.easy}</text>

    <rect x="410" y="500" width="260" height="140" rx="24" fill="rgba(245,158,11,0.16)" stroke="rgba(255,255,255,0.08)"/>
    <text x="445" y="555" font-size="26" fill="#fde68a" font-family="Arial, sans-serif">Medium</text>
    <text x="445" y="615" font-size="52" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">${city.medium}</text>

    <rect x="710" y="500" width="260" height="140" rx="24" fill="rgba(56,189,248,0.16)" stroke="rgba(255,255,255,0.08)"/>
    <text x="745" y="555" font-size="26" fill="#bae6fd" font-family="Arial, sans-serif">Hard</text>
    <text x="745" y="615" font-size="52" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">${city.hard}</text>

    <rect x="110" y="710" width="860" height="240" rx="34" fill="rgba(15,23,42,0.56)" stroke="rgba(255,255,255,0.08)"/>
    <text x="145" y="780" font-size="28" fill="#cbd5e1" font-family="Arial, sans-serif">Building Metrics</text>
    <text x="145" y="845" font-size="32" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">Footprint Width: ${city.metrics.footprint.toFixed(1)}</text>
    <text x="145" y="895" font-size="32" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">Tower Floors: ${city.metrics.floorCount}</text>
    <text x="145" y="945" font-size="32" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">Spire Height: ${city.metrics.spireHeight.toFixed(1)}</text>

    <rect x="110" y="1010" width="860" height="190" rx="34" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)"/>
    <text x="145" y="1080" font-size="26" fill="#cbd5e1" font-family="Arial, sans-serif">Skyline Signature</text>
    <text x="145" y="1135" font-size="42" font-weight="700" fill="${glow}" font-family="Arial, sans-serif">${city.archetype.name}</text>
    <text x="145" y="1185" font-size="24" fill="#e2e8f0" font-family="Arial, sans-serif">Generated from LeetCode performance and stored in the shared city skyline.</text>
  </svg>
  `.trim();
}

function downloadProfileCard(city) {
  const svg = buildCardSvg(city);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${city.username}-city-profile-card.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function ProfilePanel({ city, open, onClose }) {
  if (!open || !city) {
    return null;
  }

  const base = numberToHex(city.archetype.palette.base);
  const accent = numberToHex(city.archetype.palette.accent);
  const glow = numberToHex(city.archetype.palette.glow);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex justify-end bg-slate-950/20 backdrop-blur-[1px]">
      <div className="pointer-events-auto h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-slate-950/95 p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Building Profile</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">@{city.username}</h2>
            <p className="mt-2 text-sm text-slate-400">{city.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
          >
            Close
          </button>
        </div>

        <div
          className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 p-6"
          style={{
            background: `radial-gradient(circle at top right, ${glow}33, transparent 34%), linear-gradient(135deg, #020617 0%, ${base} 55%, ${accent} 100%)`,
          }}
        >
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-100">Share Card</p>
            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold text-white">@{city.username}</p>
                <p className="mt-2 text-sm text-slate-200">{city.archetype.name}</p>
                <p className="mt-1 text-sm text-slate-300">{city.city.level}</p>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-cyan-100">
                Skyline ID
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Easy</p>
                <p className="mt-3 text-2xl font-semibold">{city.easy}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Medium</p>
                <p className="mt-3 text-2xl font-semibold">{city.medium}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Hard</p>
                <p className="mt-3 text-2xl font-semibold">{city.hard}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Archetype</p>
            <p className="mt-3 text-xl font-semibold text-white">{city.archetype.name}</p>
            <p className="mt-2 text-sm text-slate-300">
              The username hash keeps this silhouette stable every time.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">City Level</p>
            <p className="mt-3 text-xl font-semibold text-white">{city.city.level}</p>
            <p className="mt-2 text-sm text-slate-300">
              Derived from the building mix and overall challenge depth.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Footprint</p>
            <p className="mt-3 text-2xl font-semibold text-white">{city.metrics.footprint.toFixed(1)}</p>
          </div>
          <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-200">Floors</p>
            <p className="mt-3 text-2xl font-semibold text-white">{city.metrics.floorCount}</p>
          </div>
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Spire</p>
            <p className="mt-3 text-2xl font-semibold text-white">{city.metrics.spireHeight.toFixed(1)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadProfileCard(city)}
            className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Download Card
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
          >
            Back To Map
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePanel;
