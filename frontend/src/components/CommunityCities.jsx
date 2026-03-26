import { useDispatch, useSelector } from "react-redux";

import { selectCity } from "../store/store";

function formatTimestamp(value) {
  if (!value) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CommunityCities() {
  const dispatch = useDispatch();
  const { cities, loading } = useSelector((state) => state.community);
  const { currentCity } = useSelector((state) => state.city);

  return (
    <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Community Cities</p>
          <p className="mt-2 text-sm text-slate-300">
            Every logged-in user can browse the saved city board.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 px-3 py-2 text-xs text-slate-400">
          {loading ? "Loading..." : `${cities.length} cities`}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {cities.length ? (
          cities.map((city) => {
            const isActive = currentCity?.id === city.id;

            return (
              <button
                key={city.id}
                type="button"
                onClick={() => dispatch(selectCity(city))}
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  isActive
                    ? "border-cyan-300/40 bg-cyan-400/10"
                    : "border-white/10 bg-slate-950/50 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">@{city.username}</p>
                    <p className="mt-1 text-xs text-slate-400">Added by {city.email}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-cyan-200">
                      {city.archetype.name}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-cyan-200">
                    {city.city.level}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-300">
                  <div className="rounded-2xl bg-white/5 px-3 py-2">
                    Width: {city.metrics.footprint.toFixed(1)}
                  </div>
                  <div className="rounded-2xl bg-white/5 px-3 py-2">
                    Floors: {city.metrics.floorCount}
                  </div>
                  <div className="rounded-2xl bg-white/5 px-3 py-2">
                    Spire: {city.metrics.spireHeight.toFixed(1)}
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">{formatTimestamp(city.updatedAt)}</p>
              </button>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 p-5 text-sm text-slate-400">
            No cities have been saved yet. Sign in and generate the first one.
          </div>
        )}
      </div>
    </aside>
  );
}

export default CommunityCities;
