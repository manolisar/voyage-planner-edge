export type FuelType = 'HFO' | 'MGO' | 'LSFO';

/** Edge-class ships, keyed by the fleet two-letter codes used in the model exports. */
export type ShipId = 'EG' | 'AX' | 'BY' | 'AT' | 'XL';

/** Which speed→fuel curve to use: as-built static model, or dynamic model at the selected month (hull fouling etc.). */
export type CurveModel = 'static' | 'dynamic';

export interface SfocPoint {
  /** Load fraction of engine MCR (0–1.1) */
  load: number;
  /** ISO 15550 corrected specific fuel consumption, g/kWh */
  sfoc: number;
}

export interface EngineConfig {
  id: number;
  label: string;
  /** Wärtsilä engine type, e.g. W12V46F */
  type: string;
  /** FAT test protocol no. (engine serial) */
  serial: string;
  /** MCR, kW */
  nominalKW: number;
  /** Rated speed, rpm */
  rpm: number;
  /**
   * Fuel-system group. DGs sharing a fuel system must burn the same fuel:
   * FS1 = DG1+DG2, FS2 = DG3+DG4, FS3 = DG5 (own system).
   */
  fuelSystem: string;
  mgoLocked: boolean;
  allowedFuels: FuelType[];
  /** FAT SFOC curve (ISO 15550 corrected), per engine */
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
  loadFraction: number;
  loadLimit: number;
  nominalKW: number;
  overloaded: boolean;
  fuelConsumption: number;
  fuel: FuelType;
}

export interface VesselSettings {
  hotelLoad: number;
  seaMargin: number;
  sfocDet: number;
  propAux: number;
  /** Max continuous DG load as % of MCR (plant nominal: 82%, any fuel). */
  loadLimit: number;
}

export interface CalculationResult {
  propPowerKW: number;
  totalPowerKW: number;
  avgLoadPercent: number;
  engineResults: EngineResult[];
  hfoRate: number;
  mgoRate: number;
  lsfoRate: number;
  totalRate: number;
  insufficient: boolean;
  numRunning: number;
  numAvailable: number;
  hfoRunning: number;
  mgoRunning: number;
  lsfoRunning: number;
}

/** Snapshot of the panel setup at the moment a leg was added. */
export interface LegAssumptions {
  seaMargin: number;
  sfocDet: number;
  hotelLoad: number;
  propAux: number;
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
  /** Ship the forecast was built for. Optional for voyages saved before ship selection existed. */
  ship?: ShipId;
  /** Curve model the forecast was built with. */
  model?: CurveModel;
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
