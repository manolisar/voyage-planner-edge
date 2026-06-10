import type { FuelType, EngineConfig } from '../types';

/**
 * Edge-class diesel-electric plant — 5 Wärtsilä DGs, 54 720 kW installed.
 * Numbering per shipboard practice (differs from the public fleet reference):
 * DG1/DG3 = W12V46F (14.4 MW), DG2/DG4 = W8L46F (9.6 MW), DG5 = W12V32E
 * (harbour/partial-load set). All feed a common bus; 2× ABB Azipod XO take
 * propulsion power from the same bus (no mechanical drivetrain).
 *
 * SFOC curves are the ISO 15550 corrected values ("Biso", g/kWh) from each
 * engine's FAT "Fuel Oil Consumption According to ISO 15550" sheet
 * (Record Book of Engine Parameters incl. EIAPP, project STX FRANCE J34 —
 * Celebrity Edge). Where the FAT repeated a load point, values are averaged.
 * The W12V32E MCR is the FAT nominal (6 720 kW @ 720 rpm), not the 6.96 MW
 * catalogue rating quoted in fleet references.
 *
 * All five ships carry hybrid (open/closed-loop) EGCS scrubbers — RCG's
 * "Advanced Emissions Purification" — so HFO remains the economic at-sea
 * fuel (MARPOL Reg. 14 equivalent compliance), with MGO/LSFO for restricted
 * areas. The 46F engines were FAT-tested on HFO. The W12V32E was FAT-tested
 * on LFO and is modelled MGO/LSFO-only (no HFO bunker connection).
 */
export const engineConfigs: EngineConfig[] = [
  {
    id: 1, label: 'DG1', type: 'W12V46F', serial: 'PAAE299764',
    nominalKW: 14400, rpm: 600, fuelSystem: 'FS1', mgoLocked: false, allowedFuels: ['HFO', 'MGO', 'LSFO'],
    sfocCurve: [
      { load: 0.10, sfoc: 252.3 },
      { load: 0.25, sfoc: 226.3 },
      { load: 0.50, sfoc: 197.6 },
      { load: 0.75, sfoc: 189.2 },
      { load: 0.85, sfoc: 180.3 },
      { load: 0.90, sfoc: 182.7 },
      { load: 1.00, sfoc: 188.0 },
      { load: 1.10, sfoc: 190.8 },
    ],
  },
  {
    id: 2, label: 'DG2', type: 'W8L46F', serial: 'PAAE299766',
    nominalKW: 9600, rpm: 600, fuelSystem: 'FS1', mgoLocked: false, allowedFuels: ['HFO', 'MGO', 'LSFO'],
    sfocCurve: [
      { load: 0.10, sfoc: 315.4 },
      { load: 0.25, sfoc: 236.8 },
      { load: 0.50, sfoc: 202.2 },
      { load: 0.75, sfoc: 194.5 },
      { load: 0.85, sfoc: 183.7 },
      { load: 0.90, sfoc: 185.6 },
      { load: 1.00, sfoc: 190.1 },
      { load: 1.10, sfoc: 192.9 },
    ],
  },
  {
    id: 3, label: 'DG3', type: 'W12V46F', serial: 'PAAE299765',
    nominalKW: 14400, rpm: 600, fuelSystem: 'FS2', mgoLocked: false, allowedFuels: ['HFO', 'MGO', 'LSFO'],
    sfocCurve: [
      { load: 0.10, sfoc: 269.8 },
      { load: 0.25, sfoc: 227.7 },
      { load: 0.50, sfoc: 196.3 },
      { load: 0.75, sfoc: 190.1 },
      { load: 0.85, sfoc: 179.9 },
      { load: 0.90, sfoc: 181.7 },
      { load: 1.00, sfoc: 187.4 },
      { load: 1.10, sfoc: 189.7 },
    ],
  },
  {
    id: 4, label: 'DG4', type: 'W8L46F', serial: 'PAAE299767',
    nominalKW: 9600, rpm: 600, fuelSystem: 'FS2', mgoLocked: false, allowedFuels: ['HFO', 'MGO', 'LSFO'],
    sfocCurve: [
      { load: 0.10, sfoc: 314.5 },
      { load: 0.25, sfoc: 233.2 },
      { load: 0.50, sfoc: 201.3 },
      { load: 0.75, sfoc: 194.3 },
      { load: 0.85, sfoc: 183.7 },
      { load: 0.90, sfoc: 185.7 },
      { load: 1.00, sfoc: 190.3 },
      { load: 1.10, sfoc: 193.2 },
    ],
  },
  {
    id: 5, label: 'DG5', type: 'W12V32E', serial: 'PAAE319873',
    nominalKW: 6720, rpm: 720, fuelSystem: 'FS3', mgoLocked: true, allowedFuels: ['MGO', 'LSFO'],
    sfocCurve: [
      { load: 0.10, sfoc: 260.8 },
      { load: 0.25, sfoc: 206.0 },
      { load: 0.50, sfoc: 198.5 },
      { load: 0.75, sfoc: 187.0 },
      { load: 0.85, sfoc: 187.3 },
      { load: 0.90, sfoc: 188.3 },
      { load: 1.00, sfoc: 185.0 },
    ],
  },
];

/** Total installed MCR, kW */
export const PLANT_TOTAL_KW = engineConfigs.reduce((s, e) => s + e.nominalKW, 0);

/**
 * The FAT SFOC values are ISO 15550 corrected to LHV 42 700 kJ/kg; bunkered
 * residual fuel runs ~40 500 kJ/kg (the FAT test fuels measured 40 530–42 880),
 * so in-service grams-per-kWh are higher by the LHV ratio. Applied uniformly
 * to all fuels — the ship curves the model is calibrated against do not
 * distinguish fuel grade.
 */
export const LHV_ISO = 42700;
export const LHV_SERVICE = 40500;
export const SFOC_SERVICE_FACTOR = LHV_ISO / LHV_SERVICE;

/** Plant nominal max continuous DG load, % of MCR — same for any fuel. Adjustable in settings. */
export const DEFAULT_LOAD_LIMIT_PCT = 82;

/** HFO first (scrubber-equivalent compliance), then VLSFO, MGO last. */
export const FUEL_PRIORITY: Record<FuelType, number> = {
  HFO: 0,
  LSFO: 1,
  MGO: 2,
};

/**
 * hotelLoad is a placeholder — App seeds it per ship from the service-fuel
 * column of the selected speed curve (see engine/powerModel.shipHotelKW).
 * propAux defaults to 0 because the ship curves already include all
 * propulsion auxiliaries; the knob remains for what-if additions.
 */
export const DEFAULT_SETTINGS = {
  hotelLoad: 6000,
  seaMargin: 0,
  sfocDet: 0,
  propAux: 0,
  loadLimit: DEFAULT_LOAD_LIMIT_PCT,
};
