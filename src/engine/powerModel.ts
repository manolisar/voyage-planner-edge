import { getShip } from '../data/shipData';
import { POD_CEILING_MW } from '../data/engineDefaults';
import { interpTable } from './interpolation';
import type { ShipId } from '../types';

/**
 * Static propulsion power (MW) at a given speed — the clean-hull reference
 * curve (verified spec §13). Dynamic is reconstructed at runtime as
 * Static × condition factor (see propPowerMW).
 */
export function staticPropMW(ship: ShipId, speed: number): number {
  if (speed <= 0) return 0;
  const table = getShip(ship).staticPower.map((p) => ({ x: p.speed, y: p.propMW }));
  return interpTable(table, speed);
}

export interface PropPower {
  /** Propulsion power after condition factor, before the pod clamp, MW */
  demandMW: number;
  /** Propulsion power actually delivered (clamped to the 32 MW pod ceiling), MW */
  deliveredMW: number;
  /** demand exceeds the pod ceiling → speed unachievable at this condition */
  podLimited: boolean;
}

/**
 * Propulsion power for the app: Static × condition% then clamped to the hard
 * 2 × 16 MW pod ceiling. Above the ceiling the speed is flagged unachievable.
 */
export function propPowerMW(ship: ShipId, speed: number, conditionPct: number): PropPower {
  const demandMW = staticPropMW(ship, speed) * (conditionPct / 100);
  const podLimited = demandMW > POD_CEILING_MW + 1e-9;
  return { demandMW, deliveredMW: Math.min(demandMW, POD_CEILING_MW), podLimited };
}
