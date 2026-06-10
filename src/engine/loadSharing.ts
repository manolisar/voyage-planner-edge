import { engineConfigs, FUEL_PRIORITY, DEFAULT_LOAD_LIMIT_PCT } from '../data/engineDefaults';
import type { EngineState, EngineConfig } from '../types';

export interface EngineWithLimits extends EngineState {
  config: EngineConfig;
  loadLimit: number;
  maxKW: number;
}

/** `loadLimitPct` — max continuous load, % of MCR (same for any fuel). */
export function getEngineWithLimits(
  engines: EngineState[],
  loadLimitPct: number = DEFAULT_LOAD_LIMIT_PCT
): EngineWithLimits[] {
  const loadLimit = loadLimitPct / 100;
  return engines.map((e) => {
    const config = engineConfigs.find((c) => c.id === e.id);
    if (!config) throw new Error(`Unknown engine id: ${e.id}`);
    return { ...e, config, loadLimit, maxKW: config.nominalKW * loadLimit };
  });
}

/**
 * Pick the minimum set of available DGs covering demand. Order: fuel priority
 * (HFO → LSFO → MGO), then largest MCR first (fewer engines online), then id.
 * At sea at least two DGs stay online for redundancy.
 */
export function selectEngines(
  allEngines: EngineWithLimits[],
  totalKW: number,
  speed: number
): { selected: EngineWithLimits[]; allAvailable: EngineWithLimits[]; insufficient: boolean } {
  const sorted = allEngines
    .filter((e) => e.available)
    .sort((a, b) => {
      if (FUEL_PRIORITY[a.fuel] !== FUEL_PRIORITY[b.fuel])
        return FUEL_PRIORITY[a.fuel] - FUEL_PRIORITY[b.fuel];
      if (a.config.nominalKW !== b.config.nominalKW)
        return b.config.nominalKW - a.config.nominalKW;
      return a.id - b.id;
    });

  const selected: EngineWithLimits[] = [];
  let capacity = 0;
  const minEngines = speed > 0 ? 2 : 1;

  for (const eng of sorted) {
    selected.push(eng);
    capacity += eng.maxKW;
    if (capacity >= totalKW && selected.length >= minEngines) break;
  }

  return {
    selected,
    allAvailable: sorted,
    insufficient: capacity < totalKW && selected.length === sorted.length,
  };
}

/**
 * Distribute kW across running engines in proportion to each engine's usable
 * capacity (MCR × load limit), so heterogeneous DGs run at the same fraction
 * of their limit. Engines that hit their cap shed the excess onto the rest.
 */
export function distributeLoad(
  runningEngines: EngineWithLimits[],
  totalKW: number
): Map<number, number> {
  const engineLoads = new Map<number, number>();
  if (runningEngines.length === 0) return engineLoads;

  for (const eng of runningEngines) engineLoads.set(eng.id, 0);
  let remaining = totalKW;
  let uncapped = [...runningEngines];

  while (remaining > 1e-6 && uncapped.length > 0) {
    const capacitySum = uncapped.reduce((s, e) => s + e.maxKW, 0);
    const newUncapped: EngineWithLimits[] = [];
    let excess = 0;

    for (const eng of uncapped) {
      const current = engineLoads.get(eng.id)!;
      const wanted = current + remaining * (eng.maxKW / capacitySum);
      if (wanted > eng.maxKW) {
        engineLoads.set(eng.id, eng.maxKW);
        excess += wanted - eng.maxKW;
      } else {
        engineLoads.set(eng.id, wanted);
        newUncapped.push(eng);
      }
    }
    remaining = excess;
    if (newUncapped.length === uncapped.length) break;
    uncapped = newUncapped;
  }

  return engineLoads;
}
