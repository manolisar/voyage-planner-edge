import { SFOC_SERVICE_FACTOR } from '../data/engineDefaults';
import type { EngineConfig } from '../types';

/** Linear interpolation on a sorted table of {x, y} points, clamped at both ends. */
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

/** ISO-corrected SFOC (g/kWh) for a specific engine at a load fraction of its MCR. */
export function interpSFOC(engine: EngineConfig, loadFrac: number): number {
  return interpTable(engine.sfocCurve.map((p) => ({ x: p.load, y: p.sfoc })), loadFrac);
}

/** In-service SFOC: FAT ISO value corrected to bunkered-fuel LHV. */
export function serviceSFOC(engine: EngineConfig, loadFrac: number): number {
  return interpSFOC(engine, loadFrac) * SFOC_SERVICE_FACTOR;
}
