import { useSelector } from "react-redux";

const statItems = [
  { label: "Easy", key: "easy", color: "from-emerald-400/20 to-emerald-500/5" },
  { label: "Medium", key: "medium", color: "from-amber-400/20 to-amber-500/5" },
  { label: "Hard", key: "hard", color: "from-rose-400/20 to-rose-500/5" },
];

function StatsCard() {
  const { currentCity } = useSelector((state) => state.city);

  if (!currentCity) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-400">
        Select a building from the skyline or the community list to inspect its stats here.
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-6">
      {statItems.map((item) => (
        <div
          key={item.key}
          className={`rounded-3xl border border-white/10 bg-gradient-to-br ${item.color} p-5`}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{currentCity[item.key]}</p>
        </div>
      ))}
      <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">City Level</p>
        <p className="mt-3 text-2xl font-semibold text-white">{currentCity.city.level}</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Archetype</p>
        <p className="mt-3 text-lg font-semibold text-white">{currentCity.archetype.name}</p>
        <p className="mt-2 text-sm text-slate-400">
          Width {currentCity.metrics.footprint.toFixed(1)} / Floors {currentCity.metrics.floorCount}
        </p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Owner</p>
        <p className="mt-3 text-lg font-semibold text-white">{currentCity.email}</p>
        <p className="mt-2 text-sm text-slate-400">@{currentCity.username}</p>
      </div>
    </div>
  );
}

export default StatsCard;
