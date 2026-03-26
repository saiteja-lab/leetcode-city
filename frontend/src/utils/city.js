const BUILDING_ARCHETYPES = [
  { name: "Glass Tower", palette: { base: 0x67e8f9, accent: 0x22d3ee, glow: 0xa5f3fc } },
  { name: "Brutalist Block", palette: { base: 0x94a3b8, accent: 0x64748b, glow: 0xe2e8f0 } },
  { name: "Art Deco Spire", palette: { base: 0xf59e0b, accent: 0xfcd34d, glow: 0xfef3c7 } },
  { name: "Crystal Pyramid", palette: { base: 0x818cf8, accent: 0xc4b5fd, glow: 0xe0e7ff } },
  { name: "Neon Pagoda", palette: { base: 0x14b8a6, accent: 0x2dd4bf, glow: 0x99f6e4 } },
  { name: "Cyber Monolith", palette: { base: 0xec4899, accent: 0xf472b6, glow: 0xfbcfe8 } },
  { name: "Obsidian Fortress", palette: { base: 0x334155, accent: 0x0f172a, glow: 0x94a3b8 } },
  { name: "Copper Dome", palette: { base: 0xf97316, accent: 0xfdba74, glow: 0xffedd5 } },
];

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function hashUsername(username) {
  return Array.from(username || "").reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);
}

export function getArchetypeForUsername(username) {
  const hash = hashUsername(username);
  return BUILDING_ARCHETYPES[hash % BUILDING_ARCHETYPES.length];
}

export function getBuildingMetrics(cityRecord) {
  const easyScale = Math.sqrt(Math.max(cityRecord.easy || 0, 0));
  const mediumScale = Math.sqrt(Math.max(cityRecord.medium || 0, 0));
  const hardScale = Math.sqrt(Math.max(cityRecord.hard || 0, 0));

  const footprint = clamp(2.8 + easyScale * 0.28, 2.8, 11.8);
  const baseFootprint = clamp(4.4 + easyScale * 0.42, 4.4, 18);
  const lotFootprint = clamp(10.2 + easyScale * 0.52, 10.2, 24.5);
  const floorCount = clamp(4 + Math.round(mediumScale * 1.15), 4, 46);
  const midHeight = clamp(6 + mediumScale * 1.42, 6, 58);
  const spireHeight = clamp(1.8 + hardScale * 0.98, 1.8, 24);

  return {
    footprint,
    baseFootprint,
    lotFootprint,
    floorCount,
    midHeight,
    spireHeight,
    totalHeight: midHeight + spireHeight + 4,
  };
}

function enrichCity(record) {
  const archetype = getArchetypeForUsername(record.username);

  return {
    ...record,
    archetype,
    metrics: getBuildingMetrics(record),
  };
}

export function mapCityRecord(record) {
  return enrichCity({
    id: record.id,
    userId: record.user_id,
    email: record.email || "Unknown user",
    username: record.leetcode_username,
    easy: record.easy,
    medium: record.medium,
    hard: record.hard,
    city: {
      houses: record.houses,
      buildings: record.buildings,
      skyscrapers: record.skyscrapers,
      level: record.city_level,
    },
    updatedAt: record.updated_at,
  });
}

export function buildPreviewCity(payload, email = "Current user") {
  return enrichCity({
    id: `preview-${payload.username}`,
    userId: null,
    email,
    username: payload.username,
    easy: payload.easy,
    medium: payload.medium,
    hard: payload.hard,
    city: {
      houses: payload.city.houses,
      buildings: payload.city.buildings,
      skyscrapers: payload.city.skyscrapers,
      level: payload.city.level,
    },
    updatedAt: new Date().toISOString(),
  });
}
