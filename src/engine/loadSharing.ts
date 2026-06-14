import { engineConfigs, FUEL_PRIORITY, MIN_SEA_DGS } from '../data/engineDefaults';
import { interpFuelKgh } from './interpolation';
import { fuelFactor } from './fuelBasis';
import type { EngineState, EngineConfig, ShareMode } from '../types';

export interface EngineWithCfg extends EngineState {
  config: EngineConfig;
}

export function withConfig(engines: EngineState[]): EngineWithCfg[] {
  return engines.map((e) => {
    const config = engineConfigs.find((c) => c.id === e.id);
    if (!config) throw new Error(`Unknown engine id: ${e.id}`);
    return { ...e, config };
  });
}

export interface DispatchResult {
  /** Engines selected to run */
  selected: EngineWithCfg[];
  allAvailable: EngineWithCfg[];
  /** Total electrical ceiling of the selected config, kW */
  ceilingKW: number;
  /** Demand exceeds the largest feasible config's full rating */
  insufficient: boolean;
  /** Short PMS-style label, e.g. "2L+1M" / "DG5" / "1M" */
  label: string;
}

function classCount(set: EngineWithCfg[]): { L: number; M: number; S: number } {
  return {
    L: set.filter((e) => e.config.dgClass === 'Large').length,
    M: set.filter((e) => e.config.dgClass === 'Medium').length,
    S: set.filter((e) => e.config.dgClass === 'Small').length,
  };
}

export function configLabel(set: EngineWithCfg[]): string {
  if (set.length === 0) return '—';
  const { L, M, S } = classCount(set);
  const parts: string[] = [];
  if (L) parts.push(L > 1 ? `${L}L` : '1L');
  if (M) parts.push(M > 1 ? `${M}M` : '1M');
  if (S) parts.push(S > 1 ? `${S}S` : 'DG5');
  return parts.join('+');
}

/** Sort available engines into PMS start order: Large first, then Medium, fuel as tie-break, then id. */
function pmsOrder(engines: EngineWithCfg[]): EngineWithCfg[] {
  const rank: Record<string, number> = { Large: 0, Medium: 1, Small: 2 };
  return [...engines].sort((a, b) => {
    if (rank[a.config.dgClass] !== rank[b.config.dgClass])
      return rank[a.config.dgClass] - rank[b.config.dgClass];
    if (FUEL_PRIORITY[a.fuel] !== FUEL_PRIORITY[b.fuel])
      return FUEL_PRIORITY[a.fuel] - FUEL_PRIORITY[b.fuel];
    return a.id - b.id;
  });
}

/**
 * PMS load-dependent dispatch (M40E4937 §4.2.7). Builds the ascending-ceiling
 * ladder from AVAILABLE engines and returns the smallest config whose busbar
 * load stays at/under the PMS start threshold. Hybrid: marking a DG unavailable
 * forces the next feasible config.
 *
 * Sea (speed>0): only `seaDispatch` mains (DG1–4), ≥1 Large, ≥MIN_SEA_DGS DGs.
 * Harbour (speed=0): any single DG or more, smallest first (DG5 eligible).
 */
export function dispatch(
  allEngines: EngineWithCfg[],
  demandKW: number,
  speed: number,
  pmsStartPct: number
): DispatchResult {
  const startFrac = pmsStartPct / 100;
  const atSea = speed > 0;
  const pool = pmsOrder(
    allEngines.filter((e) => e.available && (!atSea || e.config.seaDispatch))
  );

  // Candidate configs. Evaluated in order; first one holding ≤ threshold wins.
  const candidates: EngineWithCfg[][] = [];
  if (atSea) {
    const larges = pool.filter((e) => e.config.dgClass === 'Large');
    const mediums = pool.filter((e) => e.config.dgClass === 'Medium');
    // Canonical PMS ladder (M40E4937) — keeps both Larges before adding Mediums.
    const ladder: [number, number][] = [[1, 1], [2, 0], [2, 1], [2, 2]];
    for (const [nL, nM] of ladder) {
      if (larges.length >= nL && mediums.length >= nM && nL + nM >= MIN_SEA_DGS) {
        candidates.push([...larges.slice(0, nL), ...mediums.slice(0, nM)]);
      }
    }
    // Availability fallback: if engine-out breaks the ladder, use the whole pool.
    if (pool.length >= 1) candidates.push(pool);
  } else {
    // Harbour: 1 DG, then 2, ... smallest first.
    const harbourOrder = [...pool].sort((a, b) => a.config.elecKW - b.config.elecKW);
    for (let n = 1; n <= harbourOrder.length; n++) candidates.push(harbourOrder.slice(0, n));
  }

  const ceiling = (set: EngineWithCfg[]) => set.reduce((s, e) => s + e.config.elecKW, 0);

  for (const set of candidates) {
    const c = ceiling(set);
    if (c > 0 && demandKW <= startFrac * c) {
      return { selected: set, allAvailable: pool, ceilingKW: c, insufficient: false, label: configLabel(set) };
    }
  }
  // Nothing holds ≤ threshold — use the largest candidate; flag if over full rating.
  const largest = candidates.reduce<EngineWithCfg[] | null>(
    (best, set) => (best && ceiling(best) >= ceiling(set) ? best : set), null
  );
  if (!largest || largest.length === 0) {
    return { selected: [], allAvailable: pool, ceilingKW: 0, insufficient: demandKW > 0, label: '—' };
  }
  return {
    selected: largest, allAvailable: pool, ceilingKW: ceiling(largest),
    insufficient: demandKW > ceiling(largest), label: configLabel(largest),
  };
}

/**
 * Distribute total electrical demand (kW) across the running engines.
 *  - 'equal'   : every DG at the same % of its rating (default droop, §4.2.3.1).
 *  - 'optimal' : Sea Optimal — minimise combined FAT fuel. With ≤2 distinct
 *                engine types online, a 1-D scan over the Large-group share
 *                finds the minimum; identical engines share equally within a type.
 */
export function distributeLoad(
  running: EngineWithCfg[],
  demandKW: number,
  mode: ShareMode
): Map<number, number> {
  const loads = new Map<number, number>();
  if (running.length === 0) return loads;
  const totalCeiling = running.reduce((s, e) => s + e.config.elecKW, 0);

  if (mode === 'equal' || totalCeiling <= 0) {
    const frac = totalCeiling > 0 ? demandKW / totalCeiling : 0;
    for (const e of running) loads.set(e.id, frac * e.config.elecKW);
    return loads;
  }

  // Sea Optimal — group by engine type (same rating + curve share equally).
  const groups = new Map<string, EngineWithCfg[]>();
  for (const e of running) {
    const key = e.config.type;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(e);
  }
  const groupArr = [...groups.values()];

  const groupFuel = (set: EngineWithCfg[], powerKW: number): number => {
    const per = powerKW / set.length;
    const lf = per / set[0].config.elecKW;
    return set.reduce((s, e) => s + interpFuelKgh(e.config, lf) * fuelFactor(e.fuel), 0);
  };

  if (groupArr.length === 1) {
    const frac = demandKW / totalCeiling;
    for (const e of running) loads.set(e.id, frac * e.config.elecKW);
    return loads;
  }

  // Two groups: scan power on group A; group B takes the remainder.
  const A = groupArr[0];
  const B = groupArr[1];
  const capA = A.reduce((s, e) => s + e.config.elecKW, 0);
  const capB = B.reduce((s, e) => s + e.config.elecKW, 0);
  const loA = Math.max(0, demandKW - capB);
  const hiA = Math.min(capA, demandKW);
  let best = { pA: capA * (demandKW / totalCeiling), fuel: Infinity };
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const pA = loA + ((hiA - loA) * i) / steps;
    const pB = demandKW - pA;
    if (pB < -1e-6 || pB > capB + 1e-6) continue;
    const f = groupFuel(A, pA) + groupFuel(B, pB);
    if (f < best.fuel) best = { pA, fuel: f };
  }
  const fracA = capA > 0 ? best.pA / capA : 0;
  const fracB = capB > 0 ? (demandKW - best.pA) / capB : 0;
  for (const e of A) loads.set(e.id, fracA * e.config.elecKW);
  for (const e of B) loads.set(e.id, fracB * e.config.elecKW);
  return loads;
}
