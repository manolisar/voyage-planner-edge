import type { EngineConfig } from '../types';

/** Linear interpolation on a sorted {x,y} table, clamped at both ends. */
export function interpTable(points: { x: number; y: number }[], x: number): number {
  if (points.length === 0) return 0;
  if (x <= points[0].x) return points[0].y;
  const last = points[points.length - 1];
  if (x >= last.x) return last.y;
  for (let i = 0; i < points.length - 1; i++) {
    if (x >= points[i].x && x <= points[i + 1].x) {
      const span = points[i + 1].x - points[i].x;
      if (span === 0) return points[i].y;
      const t = (x - points[i].x) / span;
      return points[i].y + t * (points[i + 1].y - points[i].y);
    }
  }
  return points[0].y;
}

/**
 * FAT fuel flow (kg/h) for an engine at a load fraction of its rating.
 * Below the lowest tabulated load point, interpolate linearly to the origin
 * (idle ≈ 0 fuel at 0 load) rather than clamping flat.
 */
export function interpFuelKgh(engine: EngineConfig, loadFrac: number): number {
  if (loadFrac <= 0) return 0;
  const first = engine.sfocCurve[0];
  if (loadFrac < first.load) return first.fuelKgh * (loadFrac / first.load);
  return interpTable(engine.sfocCurve.map((p) => ({ x: p.load, y: p.fuelKgh })), loadFrac);
}

/** FAT SFOC (g/kWh) for display. */
export function interpSFOC(engine: EngineConfig, loadFrac: number): number {
  return interpTable(engine.sfocCurve.map((p) => ({ x: p.load, y: p.sfoc })), loadFrac);
}
