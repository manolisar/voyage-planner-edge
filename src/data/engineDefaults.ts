import type { FuelType, EngineConfig, VesselSettings } from '../types';

/**
 * Edge-class diesel-electric plant — 5 Wärtsilä DGs (M40E4937 / verified spec).
 * DG1/DG3 = W12V46F Large (14 400 kW mech / 14 109 kW elec),
 * DG2/DG4 = W8L46F Medium (9 600 / 9 381),
 * DG5     = W12V32E Small (6 720 / 6 543, harbour set, MGO/LSFO only).
 * Switchboards: HMS1 (FWD) = DG1+DG2; HMS2 (AFT) = DG3+DG4+DG5.
 * Fuel systems (shared counter): FS1 = DG1+DG2, FS2 = DG3+DG4, FS3 = DG5.
 *
 * Electrical ratings (M40E4937) are used for all busbar / PMS / load-sharing
 * calculations. SFOC curves are the measured FAT "Fuel Oil Consumption
 * (ISO 15550)" tables — verified spec §8 (load% → kg/h & g/kWh), HFO basis
 * 40.530 MJ/kg for the 46F engines, LFO 42.880 for the V32E.
 */
const V46F_CURVE = [
  { load: 0.10, fuelKgh: 388.9, sfoc: 266.9 },
  { load: 0.25, fuelKgh: 860.9, sfoc: 239.3 },
  { load: 0.50, fuelKgh: 1506.6, sfoc: 209.1 },
  { load: 0.75, fuelKgh: 2139.8, sfoc: 200.2 },
  { load: 0.85, fuelKgh: 2331.5, sfoc: 190.8 },
  { load: 0.90, fuelKgh: 2506.6, sfoc: 193.2 },
  { load: 1.00, fuelKgh: 2863.2, sfoc: 198.9 },
];
const L46F_CURVE = [
  { load: 0.10, fuelKgh: 324.2, sfoc: 333.5 },
  { load: 0.25, fuelKgh: 601.1, sfoc: 250.5 },
  { load: 0.50, fuelKgh: 1024.9, sfoc: 214.1 },
  { load: 0.75, fuelKgh: 1486.6, sfoc: 205.8 },
  { load: 0.85, fuelKgh: 1582.6, sfoc: 194.5 },
  { load: 0.90, fuelKgh: 1671.5, sfoc: 196.5 },
  { load: 1.00, fuelKgh: 1918.7, sfoc: 201.2 },
];
const V32E_CURVE = [
  { load: 0.10, fuelKgh: 194.3, sfoc: 287.9 },
  { load: 0.25, fuelKgh: 363.6, sfoc: 216.6 },
  { load: 0.50, fuelKgh: 680.5, sfoc: 201.8 },
  { load: 0.75, fuelKgh: 966.7, sfoc: 190.3 },
  { load: 0.85, fuelKgh: 1084.9, sfoc: 189.8 },
  { load: 0.90, fuelKgh: 1154.5, sfoc: 190.9 },
  { load: 1.00, fuelKgh: 1287.0, sfoc: 187.3 },
];

export const engineConfigs: EngineConfig[] = [
  {
    id: 1, label: 'DG1', type: 'W12V46F', serial: 'PAAE299764', dgClass: 'Large',
    mechKW: 14400, elecKW: 14109, rpm: 600, switchboard: 'HMS1', fuelSystem: 'FS1',
    mgoLocked: false, allowedFuels: ['HFO', 'MGO', 'LSFO'], seaDispatch: true, sfocCurve: V46F_CURVE,
  },
  {
    id: 2, label: 'DG2', type: 'W8L46F', serial: 'PAAE299766', dgClass: 'Medium',
    mechKW: 9600, elecKW: 9381, rpm: 600, switchboard: 'HMS1', fuelSystem: 'FS1',
    mgoLocked: false, allowedFuels: ['HFO', 'MGO', 'LSFO'], seaDispatch: true, sfocCurve: L46F_CURVE,
  },
  {
    id: 3, label: 'DG3', type: 'W12V46F', serial: 'PAAE299765', dgClass: 'Large',
    mechKW: 14400, elecKW: 14109, rpm: 600, switchboard: 'HMS2', fuelSystem: 'FS2',
    mgoLocked: false, allowedFuels: ['HFO', 'MGO', 'LSFO'], seaDispatch: true, sfocCurve: V46F_CURVE,
  },
  {
    id: 4, label: 'DG4', type: 'W8L46F', serial: 'PAAE299767', dgClass: 'Medium',
    mechKW: 9600, elecKW: 9381, rpm: 600, switchboard: 'HMS2', fuelSystem: 'FS2',
    mgoLocked: false, allowedFuels: ['HFO', 'MGO', 'LSFO'], seaDispatch: true, sfocCurve: L46F_CURVE,
  },
  {
    id: 5, label: 'DG5', type: 'W12V32E', serial: 'PAAE319873', dgClass: 'Small',
    mechKW: 6720, elecKW: 6543, rpm: 720, switchboard: 'HMS2', fuelSystem: 'FS3',
    mgoLocked: true, allowedFuels: ['MGO', 'LSFO'], seaDispatch: false, sfocCurve: V32E_CURVE,
  },
];

/** Total installed electrical capacity, kW */
export const PLANT_TOTAL_ELEC_KW = engineConfigs.reduce((s, e) => s + e.elecKW, 0);
/** Four main engines (2L+2M) electrical, kW */
export const MAIN_TOTAL_ELEC_KW = engineConfigs
  .filter((e) => e.seaDispatch)
  .reduce((s, e) => s + e.elecKW, 0);

/** Hard propulsion ceiling — 2 × 16 MW Azipod XO (verified spec §12). */
export const POD_CEILING_MW = 32;
export const PER_POD_MW = 16;

/** PMS load-dependent thresholds (M40E4937 §4.2.7). */
export const PMS_START_PCT = 85;
export const PMS_STOP_PCT = 75;
/** Minimum DGs online at sea (Open Sea / Manoeuvring). */
export const MIN_SEA_DGS = 2;

/**
 * Forward fuel correction by the fuel a DG actually burns. FAT 46F curves are
 * HFO-basis (40.530 MJ/kg); MGO/diesel carries more energy per kg, so fewer kg
 * for the same power. VLSFO ≈ HFO basis.
 */
export const FUEL_LCV_FACTOR: Record<FuelType, number> = {
  HFO: 1.0,
  LSFO: 1.0,
  MGO: 40.53 / 42.70, // 0.9492
};

/** Dispatch tie-break / blackout-restart priority hint (HFO first, MGO last). */
export const FUEL_PRIORITY: Record<FuelType, number> = {
  HFO: 0,
  LSFO: 1,
  MGO: 2,
};

export const DEFAULT_SETTINGS: VesselSettings = {
  hotelLoad: 6000,
  conditionPct: 100,
  sfocDet: 0,
  sailingAux: 1500,
  pmsStart: PMS_START_PCT,
  shareMode: 'equal',
};
