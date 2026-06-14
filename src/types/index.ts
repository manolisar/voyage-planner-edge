export type FuelType = 'HFO' | 'MGO' | 'LSFO';

/** Edge-class ships, keyed by the fleet two-letter codes used in the model exports. */
export type ShipId = 'EG' | 'AX' | 'BY' | 'AT' | 'XL';

/** PMS DG class (M40E4937 §1). */
export type DGClass = 'Large' | 'Medium' | 'Small';

/** Load-sharing mode (M40E4937 §4.2.3.1). */
export type ShareMode = 'equal' | 'optimal';

/** One point of a FAT "Fuel Oil Consumption (ISO 15550)" curve (verified spec §8). */
export interface SfocPoint {
  /** Load fraction of MCR (0–1) */
  load: number;
  /** Measured fuel flow at that load, kg/h (engine's own rating) */
  fuelKgh: number;
  /** Specific fuel consumption, g/kWh (display only) */
  sfoc: number;
}

export interface EngineConfig {
  id: number;
  label: string;
  /** Wärtsilä engine type, e.g. W12V46F */
  type: string;
  /** FAT test protocol no. (engine serial) */
  serial: string;
  /** PMS class — sets dispatch ladder behaviour */
  dgClass: DGClass;
  /** FAT mechanical rating, kW */
  mechKW: number;
  /** M40E4937 electrical (busbar) rating, kW — used for all PMS/load calcs */
  elecKW: number;
  rpm: number;
  /** Switchboard: HMS1 (FWD) or HMS2 (AFT) */
  switchboard: 'HMS1' | 'HMS2';
  /**
   * Fuel-system group (shared counter). FS1 = DG1+DG2, FS2 = DG3+DG4,
   * FS3 = DG5 (own). DGs on one system burn the same fuel.
   */
  fuelSystem: string;
  /** DG5: MGO/LSFO only (no HFO bunker connection) */
  mgoLocked: boolean;
  allowedFuels: FuelType[];
  /** Whether this DG joins automatic sea propulsion configs (DG5 does not). */
  seaDispatch: boolean;
  /** FAT SFOC curve (verified spec §8), per engine type */
  sfocCurve: SfocPoint[];
}

export interface EngineState {
  id: number;
  available: boolean;
  fuel: FuelType;
}

export interface EngineResult {
  id: number;
  status: 'RUNNING' | 'STANDBY' | 'OFFLINE';
  loadKW: number;
  /** Load as fraction of electrical rating */
  loadFraction: number;
  /** PMS start threshold (fraction) used for this run */
  pmsThreshold: number;
  elecKW: number;
  /** Over 100% of electrical rating */
  overloaded: boolean;
  fuelConsumption: number;
  fuel: FuelType;
}

export interface VesselSettings {
  /** Hotel/service electrical load, kW (nominal 6 MW) */
  hotelLoad: number;
  /** Condition factor, % applied to Static propulsion power (100 = clean hull) */
  conditionPct: number;
  /** SFOC deterioration, % */
  sfocDet: number;
  /** Sailing auxiliaries, kW — applied when underway (V>0); nominal 1.5 MW */
  sailingAux: number;
  /** PMS load-dependent start threshold, % (M40E4937 §4.2.7 = 85) */
  pmsStart: number;
  /** Load-sharing mode */
  shareMode: ShareMode;
}

export interface CalculationResult {
  /** Propulsion power demand after condition factor + pod clamp, kW */
  propPowerKW: number;
  /** Total busbar electrical demand (prop + hotel + aux), kW */
  totalPowerKW: number;
  avgLoadPercent: number;
  engineResults: EngineResult[];
  hfoRate: number;
  mgoRate: number;
  lsfoRate: number;
  totalRate: number;
  /** Demand exceeds available DG capacity */
  insufficient: boolean;
  /** Propulsion demand exceeds the 32 MW pod ceiling — speed unachievable */
  podLimited: boolean;
  /** DG config label, e.g. "2L+1M" */
  configLabel: string;
  numRunning: number;
  numAvailable: number;
  hfoRunning: number;
  mgoRunning: number;
  lsfoRunning: number;
}

/** Snapshot of the panel setup at the moment a leg was added. */
export interface LegAssumptions {
  conditionPct: number;
  sfocDet: number;
  hotelLoad: number;
  sailingAux: number;
  shareMode: ShareMode;
  hfoRunning: number;
  mgoRunning: number;
  lsfoRunning: number;
  numRunning: number;
}

export interface SeaLeg {
  id: string;
  speed: number;
  hours: number;
  distance: number;
  hfoMT: number;
  mgoMT: number;
  lsfoMT: number;
  totalMT: number;
  /** Captured setup at add-time. Optional for voyages saved before snapshots existed. */
  assumptions?: LegAssumptions;
}

export interface PortEntry {
  hours: number;
  engineCount: number;
  fuelType: FuelType;
}

export interface StandbyEntry {
  hours: number;
  engineCount: number;
  avgPowerMW: number;
  fuelType: FuelType;
}

export interface AnchorageEntry {
  hours: number;
  engineCount: number;
  avgPowerMW: number;
  fuelType: FuelType;
}

export interface Voyage {
  /** Ship the forecast was built for. */
  ship?: ShipId;
  /** Condition factor (%) the forecast was built with. */
  conditionPct?: number;
  cruiseName: string;
  from: string;
  to: string;
  date: string;
  seaLegs: SeaLeg[];
  portEntry: PortEntry;
  portFuel: { hfo: number; mgo: number; lsfo: number; total: number };
  standbyEntry: StandbyEntry;
  standbyFuel: { hfo: number; mgo: number; lsfo: number; total: number };
  anchorageEntry: AnchorageEntry;
  anchorageFuel: { hfo: number; mgo: number; lsfo: number; total: number };
  totals: VoyageTotals;
}

export interface VoyageTotals {
  totalHours: number;
  totalDistanceNM: number;
  hfoMT: number;
  mgoMT: number;
  lsfoMT: number;
  totalFuelMT: number;
}
