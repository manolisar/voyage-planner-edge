import type { ShipId, FuelType } from '../types';

export interface PowerPoint {
  /** knots */
  speed: number;
  /** Static (clean-hull) propulsion power, MW — apply condition % at runtime */
  propMW: number;
}

export interface ShipData {
  id: ShipId;
  name: string;
  /** Operating fuel basis of the main engines (verified spec §9). */
  defaultMainFuel: FuelType;
  /** Per-ship hotel load reference, MW (verified spec §11) — informational; app default is flat 6 MW. */
  hotelRefMW: number;
  /**
   * Static propulsion-power curve (clean-hull reference), MW vs knots, from
   * EG_Class_Power_from_Fuel.xlsx column E (Pprop STATIC). Dynamic is NOT
   * stored — it is reconstructed as Static × condition factor at runtime.
   * Ascent/Xcel end at 22 kn (source rows above are non-monotonic and dropped);
   * Edge ends at 24 kn, Apex/Beyond at 25 kn. Negative low-speed values clamped to 0.
   */
  staticPower: PowerPoint[];
}

const pts = (arr: number[]): PowerPoint[] =>
  arr.map((propMW, speed) => ({ speed, propMW: Math.max(propMW, 0) }));

export const ships: ShipData[] = [
  {
    id: 'EG', name: 'Celebrity Edge', defaultMainFuel: 'HFO', hotelRefMW: 6.58,
    staticPower: pts([
      0, 0.3, 0.8, 1.0, 1.3, 1.5, 1.8, 2.1, 2.5, 3.0, 3.6, 4.4, 5.5, 6.9, 8.7,
      10.5, 12.9, 15.3, 18.1, 22.1, 24.6, 28.9, 32.4, 38.4, 43.6,
    ]),
  },
  {
    id: 'AX', name: 'Celebrity Apex', defaultMainFuel: 'HFO', hotelRefMW: 5.94,
    staticPower: pts([
      0, 0.1, 0.3, 0.4, 0.6, 0.9, 1.2, 1.6, 2.1, 2.6, 3.3, 4.0, 4.9, 6.1, 7.9,
      9.4, 11.6, 13.3, 15.8, 18.8, 21.2, 23.6, 26.4, 29.3, 32.8, 40.6,
    ]),
  },
  {
    id: 'BY', name: 'Celebrity Beyond', defaultMainFuel: 'HFO', hotelRefMW: 8.15,
    staticPower: pts([
      0, 0, 0, 0, 0, 0, 0.2, 0.6, 1.2, 2.3, 3.1, 4.1, 5.7, 7.3, 9.1,
      11.2, 13.2, 15.5, 17.9, 21.0, 23.1, 25.9, 30.1, 32.5, 36.4, 43.1,
    ]),
  },
  {
    id: 'AT', name: 'Celebrity Ascent', defaultMainFuel: 'HFO', hotelRefMW: 7.47,
    staticPower: pts([
      0, 1.3, 1.3, 1.4, 1.4, 1.5, 1.6, 1.7, 1.6, 3.7, 3.7, 5.1, 7.3, 7.4, 8.9,
      11.3, 12.7, 15.0, 18.8, 20.4, 23.2, 25.4, 29.8,
    ]),
  },
  {
    id: 'XL', name: 'Celebrity Xcel', defaultMainFuel: 'MGO', hotelRefMW: 7.99,
    staticPower: pts([
      0, 1.2, 1.2, 1.3, 1.3, 1.4, 1.5, 1.6, 1.5, 3.5, 3.5, 4.9, 7.1, 7.2, 8.7,
      11.0, 12.4, 14.6, 18.3, 19.7, 22.6, 24.7, 29.0,
    ]),
  },
];

export function getShip(id: ShipId): ShipData {
  const ship = ships.find((s) => s.id === id);
  if (!ship) throw new Error(`Unknown ship: ${id}`);
  return ship;
}

export function maxSpeed(id: ShipId): number {
  const c = getShip(id).staticPower;
  return c[c.length - 1].speed;
}
