import { DEFAULT_LOAD_LIMIT_PCT } from '../data/engineDefaults';
import { getShip } from '../data/shipData';
import { serviceSFOC } from './interpolation';
import { interpTable } from './interpolation';
import { getEngineWithLimits, selectEngines, distributeLoad } from './loadSharing';
import type { ShipId, CurveModel, EngineState } from '../types';

/**
 * The ship curves give speed → total fuel (MT/h) including the constant
 * per-ship Total Service Fuel. The **propulsion** fuel is the curve minus
 * that service column; this module inverts it into speed → propulsion-power
 * tables through the app's own dispatch pipeline (minimum-set selection +
 * capacity-proportional sharing + in-service SFOC) under a fixed reference
 * lineup: the default engine state (DG1–4 on HFO, DG5 on MGO, 82 % limit).
 *
 * Hotel load is NOT derived from the curves — it is a nominal 6 MW
 * (DEFAULT_SETTINGS.hotelLoad), adjustable in settings, added on top by
 * consumption.ts.
 */
const REF_ENGINES: EngineState[] = [
  { id: 1, available: true, fuel: 'HFO' },
  { id: 2, available: true, fuel: 'HFO' },
  { id: 3, available: true, fuel: 'HFO' },
  { id: 4, available: true, fuel: 'HFO' },
  { id: 5, available: true, fuel: 'MGO' },
];

/** Reference-lineup plant fuel (MT/h) at a given total demand. */
function refPlantFuel(totalKW: number, speed: number): number {
  if (totalKW <= 0) return 0;
  const all = getEngineWithLimits(REF_ENGINES, DEFAULT_LOAD_LIMIT_PCT);
  const { selected } = selectEngines(all, totalKW, speed);
  const loads = distributeLoad(selected, totalKW);
  let kgPerHr = 0;
  for (const eng of selected) {
    const kw = loads.get(eng.id) || 0;
    const lf = kw / eng.config.nominalKW;
    kgPerHr += (serviceSFOC(eng.config, lf) * kw) / 1000;
  }
  return kgPerHr / 1000;
}

const REF_CAPACITY_KW = getEngineWithLimits(REF_ENGINES, DEFAULT_LOAD_LIMIT_PCT)
  .reduce((s, e) => s + e.maxKW, 0);

/**
 * Invert refPlantFuel: power (kW) that burns `fuelMT` MT/h. Monotonic between
 * dispatch steps; bisection lands within the step. Targets beyond the
 * 82 %-limit capacity extrapolate proportionally — consumption will then flag
 * the leg insufficient, which is the honest answer.
 */
function solvePower(fuelMT: number, speed: number): number {
  if (fuelMT <= 0) return 0;
  const fuelAtCap = refPlantFuel(REF_CAPACITY_KW, speed);
  if (fuelMT >= fuelAtCap) return REF_CAPACITY_KW * (fuelMT / fuelAtCap);
  let lo = 0;
  let hi = REF_CAPACITY_KW;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (refPlantFuel(mid, speed) < fuelMT) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const powerTableCache = new Map<string, { x: number; y: number }[]>();

function propPowerTable(ship: ShipId, model: CurveModel): { x: number; y: number }[] {
  const key = `${ship}:${model}`;
  let table = powerTableCache.get(key);
  if (!table) {
    const shipData = getShip(ship);
    table = shipData.curves[model].map((p) => ({
      x: p.speed,
      y: solvePower(Math.max(p.fuel - shipData.serviceFuel, 0), p.speed),
    }));
    powerTableCache.set(key, table);
  }
  return table;
}

/** Propulsion power demand (kW, hotel excluded) at a given speed. */
export function interpPropPower(ship: ShipId, model: CurveModel, speed: number): number {
  if (speed <= 0) return 0;
  return interpTable(propPowerTable(ship, model), speed);
}
