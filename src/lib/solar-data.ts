export type BodyId =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export type BodyKind = "star" | "terrestrial" | "gas-giant" | "ice-giant";

export type Body = {
  id: BodyId;
  name: string;
  kind: BodyKind;
  kindLabel: string;
  radius: number;
  distance: number;
  period: number;
  phase: number;
  inclination: number;
  tilt: number;
  rotationHours: number;
  au: number;
  diameterKm: number;
  moons: number;
  fact: string;
  color: string;
  atmosphere?: string;
  meanTemp: string;
  gravity: string;
  composition: string;
};

export type MoonDef = {
  name: string;
  period: number;
  distanceScale: number;
  radiusScale: number;
  color: string;
  phase: number;
  tilt: number;
};

export const SUN_ID: BodyId = "sun";

export const SUN: Body = {
  id: "sun",
  name: "Sun",
  kind: "star",
  kindLabel: "G-type star",
  radius: 2.55,
  distance: 0,
  period: 1,
  phase: 0,
  inclination: 0,
  tilt: 7.25,
  rotationHours: 609.12,
  au: 0,
  diameterKm: 1_392_700,
  moons: 0,
  fact: "A G-type main-sequence star that holds 99.8% of the solar system’s mass and every orbit in this scene.",
  color: "#f3c27a",
  meanTemp: "5,500 °C surface",
  gravity: "274 m/s²",
  composition: "Hydrogen, helium",
};

export const PLANETS: Body[] = [
  {
    id: "mercury",
    name: "Mercury",
    kind: "terrestrial",
    kindLabel: "Terrestrial planet",
    radius: 0.22,
    distance: 7.2,
    period: 87.97,
    phase: 0.7,
    inclination: 7.0,
    tilt: 0.03,
    rotationHours: 1407.6,
    au: 0.39,
    diameterKm: 4879,
    moons: 0,
    fact: "A year here lasts 88 Earth days, yet one solar day stretches across 176 — the smallest world, closest to the Sun.",
    color: "#9a9086",
    meanTemp: "167 °C mean",
    gravity: "3.7 m/s²",
    composition: "Silicate rock, iron core",
  },
  {
    id: "venus",
    name: "Venus",
    kind: "terrestrial",
    kindLabel: "Terrestrial planet",
    radius: 0.4,
    distance: 10.1,
    period: 224.7,
    phase: 2.4,
    inclination: 3.4,
    tilt: 177.4,
    rotationHours: -5832.5,
    au: 0.72,
    diameterKm: 12_104,
    moons: 0,
    fact: "Veiled in sulfuric clouds and spinning backwards, Venus has a day longer than its year.",
    color: "#d9c199",
    atmosphere: "#ead7a8",
    meanTemp: "464 °C",
    gravity: "8.9 m/s²",
    composition: "CO₂ atmosphere, basaltic crust",
  },
  {
    id: "earth",
    name: "Earth",
    kind: "terrestrial",
    kindLabel: "Terrestrial planet",
    radius: 0.42,
    distance: 13.6,
    period: 365.25,
    phase: 4.1,
    inclination: 0,
    tilt: 23.4,
    rotationHours: 23.93,
    au: 1,
    diameterKm: 12_756,
    moons: 1,
    fact: "The only world known to harbor life. Oceans cover 71% of the surface, with one large moon in tow.",
    color: "#6fa0c8",
    atmosphere: "#7eb6e0",
    meanTemp: "15 °C",
    gravity: "9.8 m/s²",
    composition: "Nitrogen, oxygen, water",
  },
  {
    id: "mars",
    name: "Mars",
    kind: "terrestrial",
    kindLabel: "Terrestrial planet",
    radius: 0.3,
    distance: 17.4,
    period: 686.98,
    phase: 5.6,
    inclination: 1.85,
    tilt: 25.2,
    rotationHours: 24.6,
    au: 1.52,
    diameterKm: 6792,
    moons: 2,
    fact: "Olympus Mons rises nearly three times the height of Everest on a rusted desert world with polar ice.",
    color: "#c4845a",
    atmosphere: "#c9a08a",
    meanTemp: "−63 °C",
    gravity: "3.7 m/s²",
    composition: "Iron oxide crust, thin CO₂ air",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "gas-giant",
    kindLabel: "Gas giant",
    radius: 1.28,
    distance: 26.2,
    period: 4332.59,
    phase: 1.2,
    inclination: 1.3,
    tilt: 3.1,
    rotationHours: 9.93,
    au: 5.2,
    diameterKm: 142_984,
    moons: 95,
    fact: "A storm larger than Earth — the Great Red Spot — has churned in this hydrogen atmosphere for centuries.",
    color: "#c4a07a",
    atmosphere: "#d4b48a",
    meanTemp: "−145 °C cloud tops",
    gravity: "24.8 m/s²",
    composition: "Hydrogen, helium",
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "gas-giant",
    kindLabel: "Gas giant",
    radius: 1.08,
    distance: 34.4,
    period: 10_759.22,
    phase: 3.3,
    inclination: 2.49,
    tilt: 26.7,
    rotationHours: 10.7,
    au: 9.58,
    diameterKm: 120_536,
    moons: 146,
    fact: "Its rings are ice and rock, from mountain-sized blocks down to grains of sand, spanning hundreds of thousands of kilometers.",
    color: "#ddc59a",
    atmosphere: "#e6d3ae",
    meanTemp: "−178 °C",
    gravity: "10.4 m/s²",
    composition: "Hydrogen, helium, icy rings",
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "ice-giant",
    kindLabel: "Ice giant",
    radius: 0.64,
    distance: 42.2,
    period: 30_688.5,
    phase: 0.4,
    inclination: 0.77,
    tilt: 97.8,
    rotationHours: -17.2,
    au: 19.22,
    diameterKm: 51_118,
    moons: 28,
    fact: "It rolls on its side — a 98-degree tilt — so seasons last for decades in this pale methane haze.",
    color: "#9fd0d4",
    atmosphere: "#b7e0e2",
    meanTemp: "−195 °C",
    gravity: "8.9 m/s²",
    composition: "Water, methane, ammonia ices",
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "ice-giant",
    kindLabel: "Ice giant",
    radius: 0.62,
    distance: 50.1,
    period: 60_182,
    phase: 2.9,
    inclination: 1.77,
    tilt: 28.3,
    rotationHours: 16.1,
    au: 30.05,
    diameterKm: 49_528,
    moons: 16,
    fact: "The farthest planet, with the fastest winds in the solar system — jets that can exceed 2,000 kilometers per hour.",
    color: "#5b7fd0",
    atmosphere: "#7f9ae0",
    meanTemp: "−201 °C",
    gravity: "11.2 m/s²",
    composition: "Hydrogen, helium, methane",
  },
];

export const BODIES: Body[] = [SUN, ...PLANETS];

export const BODY_BY_ID: Record<BodyId, Body> = Object.fromEntries(
  BODIES.map((body) => [body.id, body]),
) as Record<BodyId, Body>;

export const MOONS: Partial<Record<BodyId, MoonDef[]>> = {
  earth: [
    {
      name: "Moon",
      period: 27.32,
      distanceScale: 2.85,
      radiusScale: 0.27,
      color: "#b9b4ae",
      phase: 0.4,
      tilt: 0.14,
    },
  ],
  mars: [
    {
      name: "Phobos",
      period: 0.32,
      distanceScale: 1.7,
      radiusScale: 0.08,
      color: "#8a7a70",
      phase: 1.1,
      tilt: 0.04,
    },
    {
      name: "Deimos",
      period: 1.26,
      distanceScale: 2.45,
      radiusScale: 0.055,
      color: "#9a8c80",
      phase: 2.4,
      tilt: 0.08,
    },
  ],
  jupiter: [
    {
      name: "Io",
      period: 1.77,
      distanceScale: 1.85,
      radiusScale: 0.13,
      color: "#d4b45a",
      phase: 0.2,
      tilt: 0.05,
    },
    {
      name: "Europa",
      period: 3.55,
      distanceScale: 2.35,
      radiusScale: 0.11,
      color: "#d8d2c6",
      phase: 1.6,
      tilt: 0.07,
    },
    {
      name: "Ganymede",
      period: 7.15,
      distanceScale: 3.05,
      radiusScale: 0.16,
      color: "#9a8b78",
      phase: 3.1,
      tilt: 0.06,
    },
    {
      name: "Callisto",
      period: 16.69,
      distanceScale: 3.85,
      radiusScale: 0.14,
      color: "#6e675e",
      phase: 4.8,
      tilt: 0.1,
    },
  ],
  saturn: [
    {
      name: "Titan",
      period: 15.95,
      distanceScale: 3.35,
      radiusScale: 0.18,
      color: "#c4a06a",
      phase: 2.2,
      tilt: 0.12,
    },
  ],
};

export function formatAu(au: number): string {
  if (au === 0) return "—";
  return `${au.toFixed(2)} AU`;
}

export function formatPeriod(days: number, id: BodyId): string {
  if (id === "sun") return "—";
  if (days >= 365.25) {
    const years = days / 365.25;
    return `${years.toFixed(years >= 10 ? 0 : 1)} years`;
  }
  return `${Math.round(days)} days`;
}

export function formatDiameter(km: number): string {
  return `${km.toLocaleString("en-US")} km`;
}

export function formatDayLength(hours: number): string {
  const abs = Math.abs(hours);
  const retrograde = hours < 0 ? " · retrograde" : "";
  if (abs >= 48) {
    const days = abs / 24;
    return `${days.toFixed(days >= 10 ? 0 : 1)} Earth days${retrograde}`;
  }
  return `${abs.toFixed(abs >= 20 ? 0 : 1)} hours${retrograde}`;
}

export function formatSpeed(daysPerSec: number): string {
  if (daysPerSec >= 365) {
    const years = daysPerSec / 365.25;
    return `${years >= 10 ? years.toFixed(0) : years.toFixed(1)} yr/s`;
  }
  return `${Math.round(daysPerSec)} d/s`;
}

const EPOCH_MS = Date.UTC(2000, 0, 1);

export function formatSimClock(days: number): string {
  const total = Math.floor(days);
  const years = Math.floor(total / 365.25);
  const dayOfYear = Math.floor(total - years * 365.25);
  if (years === 0 && total >= 0) return `Day ${Math.max(0, dayOfYear)}`;
  if (total < 0) return `T${total}d`;
  return `Year ${years} · Day ${dayOfYear}`;
}

export function formatSimDate(days: number): string {
  const date = new Date(EPOCH_MS + days * 86_400_000);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const OVERVIEW_CAMERA = {
  position: [0, 20, 46] as [number, number, number],
  fov: 42,
};

export const INNER_CAMERA = {
  position: [0, 10, 24] as [number, number, number],
};

export function framingDistance(body: Body): number {
  const ringExtra = body.id === "saturn" ? 2.4 : 0;
  const moonExtra = body.id === "jupiter" ? 1.6 : 0;
  return body.radius * (body.id === "sun" ? 5.4 : 6.2) + 1.6 + ringExtra + moonExtra;
}
