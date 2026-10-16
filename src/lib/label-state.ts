import type { BodyId } from "./solar-data";

export type LabelPos = {
  x: number;
  y: number;
  visible: boolean;
};

export const labelPositions: Record<BodyId, LabelPos> = {
  sun: { x: -9999, y: -9999, visible: false },
  mercury: { x: -9999, y: -9999, visible: false },
  venus: { x: -9999, y: -9999, visible: false },
  earth: { x: -9999, y: -9999, visible: false },
  mars: { x: -9999, y: -9999, visible: false },
  jupiter: { x: -9999, y: -9999, visible: false },
  saturn: { x: -9999, y: -9999, visible: false },
  uranus: { x: -9999, y: -9999, visible: false },
  neptune: { x: -9999, y: -9999, visible: false },
};
