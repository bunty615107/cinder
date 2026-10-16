import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { BodyId } from "./solar-data";

export type ViewPreset = "system" | "inner";

type SimState = {
  paused: boolean;
  speed: number;
  direction: 1 | -1;
  selectedId: BodyId | null;
  hoveredId: BodyId | null;
  labels: boolean;
  trails: boolean;
  ready: boolean;
  touring: boolean;
  viewPreset: ViewPreset;
  togglePause: () => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;
  toggleDirection: () => void;
  select: (selectedId: BodyId | null) => void;
  tourFocus: (selectedId: BodyId) => void;
  setHovered: (hoveredId: BodyId | null) => void;
  setLabels: (labels: boolean) => void;
  setTrails: (trails: boolean) => void;
  setReady: (ready: boolean) => void;
  setTouring: (touring: boolean) => void;
  setViewPreset: (viewPreset: ViewPreset) => void;
  resetTime: () => void;
};

export const SPEED_MIN = 1;
export const SPEED_MAX = 480;
export const SPEED_DEFAULT = 28;

export const SPEED_PRESETS = [
  { label: "Day", value: 1 },
  { label: "Month", value: 30 },
  { label: "Year", value: 365 },
  { label: "Warp", value: 480 },
] as const;

type HeliosGlobal = typeof globalThis & {
  __heliosDays?: { v: number };
  __heliosSim?: UseBoundStore<StoreApi<SimState>>;
};

function daysBox(): { v: number } {
  const g = globalThis as HeliosGlobal;
  if (!g.__heliosDays) g.__heliosDays = { v: 0 };
  return g.__heliosDays;
}

function createSimStore(): UseBoundStore<StoreApi<SimState>> {
  return create<SimState>((set) => ({
    paused: false,
    speed: SPEED_DEFAULT,
    direction: 1,
    selectedId: null,
    hoveredId: null,
    labels: true,
    trails: true,
    ready: false,
    touring: false,
    viewPreset: "system",
    togglePause: () => set((s) => ({ paused: !s.paused })),
    setPaused: (paused) => set({ paused }),
    setSpeed: (speed) => set({ speed }),
    toggleDirection: () => set((s) => ({ direction: s.direction === 1 ? -1 : 1 })),
    select: (selectedId) => set({ selectedId, touring: false }),
    tourFocus: (selectedId) => set({ selectedId }),
    setHovered: (hoveredId) => set({ hoveredId }),
    setLabels: (labels) => set({ labels }),
    setTrails: (trails) => set({ trails }),
    setReady: (ready) => set({ ready }),
    setTouring: (touring) =>
      touring ? set({ touring: true, selectedId: "sun" }) : set({ touring: false }),
    setViewPreset: (viewPreset) => set({ viewPreset, selectedId: null, touring: false }),
    resetTime: () => {
      daysBox().v = 0;
      set((s) => ({ ...s }));
    },
  }));
}

function getStore(): UseBoundStore<StoreApi<SimState>> {
  const g = globalThis as HeliosGlobal;
  if (!g.__heliosSim) g.__heliosSim = createSimStore();
  return g.__heliosSim;
}

export const useSim = getStore();

export function getSimDays(): number {
  return daysBox().v;
}

export function stepSim(dt: number): void {
  const { paused, speed, direction } = useSim.getState();
  if (!paused) daysBox().v += dt * speed * direction;
}

export function resetSim(): void {
  daysBox().v = 0;
}
