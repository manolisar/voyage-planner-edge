import { engineConfigs, PLANT_TOTAL_ELEC_KW } from '../data/engineDefaults';
import { interpFuelKgh, interpSFOC } from './interpolation';
import { fuelFactor } from './fuelBasis';
import { propPowerMW } from './powerModel';
import { withConfig, dispatch, distributeLoad, configLabel } from './loadSharing';
import type {
  EngineState, EngineResult, CalculationResult, FuelType, VesselSettings, ShipId,
} from '../types';

export interface StaticConsumptionResult {
  rate: number;
  perFuel: { hfo: number; mgo: number; lsfo: number };
  availablePowerKW: number;
  insufficient: boolean;
}

/** Port boiler burns MGO at a fixed rate for every hour the vessel is in port. */
export const BOILER_RATE_MT_PER_HR = 0.18;

export interface PortConsumption {
  dgRate: number;
  boilerRate: number;
  boilerMT: number;
  perFuelMT: { hfo: number; mgo: number; lsfo: number };
  totalMT: number;
  insufficient: boolean;
  availablePowerKW: number;
}

/**
 * Forward model: Static propulsion power × condition factor (pod-clamped) +
 * hotel + sailing aux → busbar demand → PMS dispatch → per-engine FAT fuel.
 */
export function computeConsumption(
  ship: ShipId,
  speed: number,
  engines: EngineState[],
  settings: VesselSettings
): CalculationResult {
  const all = withConfig(engines);
  const prop = propPowerMW(ship, speed, settings.conditionPct);
  const propKW = prop.deliveredMW * 1000;
  const auxKW = speed > 0 ? settings.sailingAux : 0;
  const totalKW = propKW + settings.hotelLoad + auxKW;

  const d = dispatch(all, totalKW, speed, settings.pmsStart);
  const runningIds = new Set(d.selected.map((e) => e.id));
  const loads = distributeLoad(d.selected, totalKW, settings.shareMode);

  let hfoRate = 0, mgoRate = 0, lsfoRate = 0;
  const detFactor = 1 + settings.sfocDet / 100;

  const engineFuel = (id: number, kw: number, fuel: FuelType): number => {
    const cfg = engineConfigs.find((c) => c.id === id)!;
    const lf = kw / cfg.elecKW;
    return (interpFuelKgh(cfg, lf) * fuelFactor(fuel) * detFactor) / 1000; // MT/h
  };

  d.selected.forEach((e) => {
    const kw = loads.get(e.id) || 0;
    const cons = engineFuel(e.id, kw, e.fuel);
    if (e.fuel === 'HFO') hfoRate += cons;
    else if (e.fuel === 'LSFO') lsfoRate += cons;
    else mgoRate += cons;
  });

  const engineResults: EngineResult[] = all.map((eng) => {
    const base = {
      id: eng.id, elecKW: eng.config.elecKW, fuel: eng.fuel,
      pmsThreshold: settings.pmsStart / 100,
    };
    if (!eng.available) {
      return { ...base, status: 'OFFLINE' as const, loadKW: 0, loadFraction: 0, overloaded: false, fuelConsumption: 0 };
    }
    if (runningIds.has(eng.id)) {
      const kw = loads.get(eng.id) || 0;
      const lf = kw / eng.config.elecKW;
      return {
        ...base, status: 'RUNNING' as const, loadKW: kw, loadFraction: lf,
        overloaded: lf > 1.0, fuelConsumption: engineFuel(eng.id, kw, eng.fuel),
      };
    }
    return { ...base, status: 'STANDBY' as const, loadKW: 0, loadFraction: 0, overloaded: false, fuelConsumption: 0 };
  });

  const avgLoadPercent = d.ceilingKW > 0 ? (totalKW / d.ceilingKW) * 100 : 0;

  return {
    propPowerKW: propKW,
    totalPowerKW: totalKW,
    avgLoadPercent,
    engineResults,
    hfoRate, mgoRate, lsfoRate,
    totalRate: hfoRate + mgoRate + lsfoRate,
    insufficient: d.insufficient,
    podLimited: prop.podLimited,
    configLabel: d.selected.length ? configLabel(d.selected) : '—',
    numRunning: d.selected.length,
    numAvailable: d.allAvailable.length,
    hfoRunning: d.selected.filter((e) => e.fuel === 'HFO').length,
    mgoRunning: d.selected.filter((e) => e.fuel === 'MGO').length,
    lsfoRunning: d.selected.filter((e) => e.fuel === 'LSFO').length,
  };
}

/**
 * Port/standby/anchorage boxes specify only an engine *count*, not which DGs,
 * so they use a plant-representative engine: average electrical MCR with the
 * capacity-weighted FAT fuel curve of all five DGs. PMS start threshold caps
 * the usable load per engine.
 */
const AVG_ELEC_KW = PLANT_TOTAL_ELEC_KW / engineConfigs.length;

/** Capacity-weighted plant SFOC (g/kWh) at a load fraction — representative average DG. */
function avgPlantSFOC(loadFrac: number): number {
  let weighted = 0;
  for (const e of engineConfigs) weighted += e.elecKW * interpSFOC(e, loadFrac);
  return weighted / PLANT_TOTAL_ELEC_KW;
}

export function computeStaticConsumption(
  totalPowerKW: number,
  engineCount: number,
  fuelType: FuelType,
  sfocDet: number,
  pmsStartPct = 85
): StaticConsumptionResult {
  if (engineCount <= 0 || totalPowerKW <= 0) {
    return { rate: 0, perFuel: { hfo: 0, mgo: 0, lsfo: 0 }, availablePowerKW: 0, insufficient: false };
  }
  const limit = pmsStartPct / 100;
  const maxKW = AVG_ELEC_KW * limit;
  const availablePowerKW = maxKW * engineCount;
  const perEngineKW = Math.min(totalPowerKW / engineCount, maxKW);
  const lf = perEngineKW / AVG_ELEC_KW;
  const sfoc = avgPlantSFOC(lf) * fuelFactor(fuelType) * (1 + sfocDet / 100);
  const totalRate = (sfoc * perEngineKW * engineCount) / 1e6; // MT/h

  const perFuel = { hfo: 0, mgo: 0, lsfo: 0 };
  if (fuelType === 'HFO') perFuel.hfo = totalRate;
  else if (fuelType === 'MGO') perFuel.mgo = totalRate;
  else perFuel.lsfo = totalRate;

  return { rate: totalRate, perFuel, availablePowerKW, insufficient: totalPowerKW > availablePowerKW };
}

export function computePortConsumption(
  hotelLoadKW: number,
  engineCount: number,
  fuelType: FuelType,
  sfocDet: number,
  hours: number,
  pmsStartPct = 85
): PortConsumption {
  const dg = computeStaticConsumption(hotelLoadKW, engineCount, fuelType, sfocDet, pmsStartPct);
  const boilerMT = BOILER_RATE_MT_PER_HR * hours;
  const perFuelMT = {
    hfo: dg.perFuel.hfo * hours,
    mgo: dg.perFuel.mgo * hours + boilerMT,
    lsfo: dg.perFuel.lsfo * hours,
  };
  return {
    dgRate: dg.rate,
    boilerRate: BOILER_RATE_MT_PER_HR,
    boilerMT,
    perFuelMT,
    totalMT: perFuelMT.hfo + perFuelMT.mgo + perFuelMT.lsfo,
    insufficient: dg.insufficient,
    availablePowerKW: dg.availablePowerKW,
  };
}
