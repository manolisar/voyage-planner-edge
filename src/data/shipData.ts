import type { ShipId, CurveModel } from '../types';

export interface SpeedFuelPoint {
  /** knots */
  speed: number;
  /** total fuel rate, MT/h — includes hotel/service load */
  fuel: number;
}

export interface ShipData {
  id: ShipId;
  name: string;
  /** Constant service (hotel) fuel rate, MT/h — the curve value at 0 kn */
  serviceFuel: number;
  curves: Record<CurveModel, SpeedFuelPoint[]>;
}

/**
 * Speed → total-fuel curves per ship, MT/h, from the fleet performance model
 * export "Speed Fuel Curves in MTh EG Class.xlsx" (modelVersion 2026_V2,
 * dtm 2028-01-01). `static` = as-built static model; `dynamic` = dynamic
 * model at the selected month (includes hull/propeller fouling).
 *
 * Ascent and Xcel: the 23/24 kn rows in the source are non-monotonic
 * (lower fuel than 22 kn) and are excluded — those curves end at 22 kn.
 * Edge has no 25 kn row; its curve ends at 24 kn.
 */
export const ships: ShipData[] = [
  {
    id: 'EG', name: 'Celebrity Edge', serviceFuel: 1.3643,
    curves: {
      static: [
        { speed: 0, fuel: 1.3643 }, { speed: 1, fuel: 1.8933 }, { speed: 2, fuel: 2.0348 },
        { speed: 3, fuel: 2.0955 }, { speed: 4, fuel: 2.1461 }, { speed: 5, fuel: 2.1966 },
        { speed: 6, fuel: 2.2573 }, { speed: 7, fuel: 2.3281 }, { speed: 8, fuel: 2.4090 },
        { speed: 9, fuel: 2.5202 }, { speed: 10, fuel: 2.6415 }, { speed: 11, fuel: 2.8033 },
        { speed: 12, fuel: 3.0055 }, { speed: 13, fuel: 3.2583 }, { speed: 14, fuel: 3.5818 },
        { speed: 15, fuel: 3.9054 }, { speed: 16, fuel: 4.3402 }, { speed: 17, fuel: 4.7851 },
        { speed: 18, fuel: 5.3209 }, { speed: 19, fuel: 5.9276 }, { speed: 20, fuel: 6.6758 },
        { speed: 21, fuel: 7.3533 }, { speed: 22, fuel: 8.2532 }, { speed: 23, fuel: 9.1025 },
        { speed: 24, fuel: 10.2552 },
      ],
      dynamic: [
        { speed: 0, fuel: 1.3643 }, { speed: 1, fuel: 1.9316 }, { speed: 2, fuel: 2.0834 },
        { speed: 3, fuel: 2.1485 }, { speed: 4, fuel: 2.2027 }, { speed: 5, fuel: 2.2569 },
        { speed: 6, fuel: 2.3220 }, { speed: 7, fuel: 2.3979 }, { speed: 8, fuel: 2.4846 },
        { speed: 9, fuel: 2.6039 }, { speed: 10, fuel: 2.7340 }, { speed: 11, fuel: 2.9075 },
        { speed: 12, fuel: 3.1244 }, { speed: 13, fuel: 3.3954 }, { speed: 14, fuel: 3.7424 },
        { speed: 15, fuel: 4.0894 }, { speed: 16, fuel: 4.5557 }, { speed: 17, fuel: 5.0328 },
        { speed: 18, fuel: 5.6075 }, { speed: 19, fuel: 6.2581 }, { speed: 20, fuel: 7.0605 },
        { speed: 21, fuel: 7.7870 }, { speed: 22, fuel: 8.7520 }, { speed: 23, fuel: 9.6629 },
        { speed: 24, fuel: 10.8990 },
      ],
    },
  },
  {
    id: 'AX', name: 'Celebrity Apex', serviceFuel: 1.2439,
    curves: {
      static: [
        { speed: 0, fuel: 1.2439 }, { speed: 1, fuel: 1.7193 }, { speed: 2, fuel: 1.7665 },
        { speed: 3, fuel: 1.8137 }, { speed: 4, fuel: 1.8703 }, { speed: 5, fuel: 1.9363 },
        { speed: 6, fuel: 2.0118 }, { speed: 7, fuel: 2.0968 }, { speed: 8, fuel: 2.2006 },
        { speed: 9, fuel: 2.3138 }, { speed: 10, fuel: 2.4554 }, { speed: 11, fuel: 2.6064 },
        { speed: 12, fuel: 2.7762 }, { speed: 13, fuel: 2.9933 }, { speed: 14, fuel: 3.3141 },
        { speed: 15, fuel: 3.5784 }, { speed: 16, fuel: 3.9747 }, { speed: 17, fuel: 4.2956 },
        { speed: 18, fuel: 4.7486 }, { speed: 19, fuel: 5.1543 }, { speed: 20, fuel: 5.6828 },
        { speed: 21, fuel: 6.3717 }, { speed: 22, fuel: 6.8813 }, { speed: 23, fuel: 7.5702 },
        { speed: 24, fuel: 8.2214 }, { speed: 25, fuel: 9.4010 },
      ],
      dynamic: [
        { speed: 0, fuel: 1.2439 }, { speed: 1, fuel: 1.7507 }, { speed: 2, fuel: 1.8010 },
        { speed: 3, fuel: 1.8513 }, { speed: 4, fuel: 1.9116 }, { speed: 5, fuel: 1.9821 },
        { speed: 6, fuel: 2.0625 }, { speed: 7, fuel: 2.1531 }, { speed: 8, fuel: 2.2637 },
        { speed: 9, fuel: 2.3845 }, { speed: 10, fuel: 2.5354 }, { speed: 11, fuel: 2.6963 },
        { speed: 12, fuel: 2.8774 }, { speed: 13, fuel: 3.1088 }, { speed: 14, fuel: 3.4508 },
        { speed: 15, fuel: 3.7325 }, { speed: 16, fuel: 4.1550 }, { speed: 17, fuel: 4.4971 },
        { speed: 18, fuel: 4.9800 }, { speed: 19, fuel: 5.4125 }, { speed: 20, fuel: 5.9759 },
        { speed: 21, fuel: 6.7103 }, { speed: 22, fuel: 7.2535 }, { speed: 23, fuel: 7.9879 },
        { speed: 24, fuel: 8.6821 }, { speed: 25, fuel: 9.9396 },
      ],
    },
  },
  {
    id: 'BY', name: 'Celebrity Beyond', serviceFuel: 1.5854,
    curves: {
      static: [
        { speed: 0, fuel: 1.5854 }, { speed: 1, fuel: 1.8448 }, { speed: 2, fuel: 1.8550 },
        { speed: 3, fuel: 1.8755 }, { speed: 4, fuel: 1.9267 }, { speed: 5, fuel: 1.9882 },
        { speed: 6, fuel: 2.0804 }, { speed: 7, fuel: 2.1931 }, { speed: 8, fuel: 2.3468 },
        { speed: 9, fuel: 2.5824 }, { speed: 10, fuel: 2.7566 }, { speed: 11, fuel: 2.9718 },
        { speed: 12, fuel: 3.2586 }, { speed: 13, fuel: 3.5455 }, { speed: 14, fuel: 3.8734 },
        { speed: 15, fuel: 4.2422 }, { speed: 16, fuel: 4.6213 }, { speed: 17, fuel: 5.0516 },
        { speed: 18, fuel: 5.5126 }, { speed: 19, fuel: 6.0044 }, { speed: 20, fuel: 6.6191 },
        { speed: 21, fuel: 7.1211 }, { speed: 22, fuel: 7.7153 }, { speed: 23, fuel: 8.4940 },
        { speed: 24, fuel: 9.0780 }, { speed: 25, fuel: 10.3381 },
      ],
      dynamic: [
        { speed: 0, fuel: 1.5854 }, { speed: 1, fuel: 1.8312 }, { speed: 2, fuel: 1.8410 },
        { speed: 3, fuel: 1.8604 }, { speed: 4, fuel: 1.9089 }, { speed: 5, fuel: 1.9672 },
        { speed: 6, fuel: 2.0546 }, { speed: 7, fuel: 2.1614 }, { speed: 8, fuel: 2.3071 },
        { speed: 9, fuel: 2.5304 }, { speed: 10, fuel: 2.6955 }, { speed: 11, fuel: 2.8994 },
        { speed: 12, fuel: 3.1713 }, { speed: 13, fuel: 3.4432 }, { speed: 14, fuel: 3.7539 },
        { speed: 15, fuel: 4.1035 }, { speed: 16, fuel: 4.4628 }, { speed: 17, fuel: 4.8706 },
        { speed: 18, fuel: 5.3076 }, { speed: 19, fuel: 5.7737 }, { speed: 20, fuel: 6.3563 },
        { speed: 21, fuel: 6.8322 }, { speed: 22, fuel: 7.3954 }, { speed: 23, fuel: 8.1334 },
        { speed: 24, fuel: 8.6869 }, { speed: 25, fuel: 9.8812 },
      ],
    },
  },
  {
    id: 'AT', name: 'Celebrity Ascent', serviceFuel: 1.5123,
    curves: {
      static: [
        { speed: 0, fuel: 1.5123 }, { speed: 1, fuel: 2.3104 }, { speed: 2, fuel: 2.3104 },
        { speed: 3, fuel: 2.3199 }, { speed: 4, fuel: 2.3294 }, { speed: 5, fuel: 2.3483 },
        { speed: 6, fuel: 2.3672 }, { speed: 7, fuel: 2.3767 }, { speed: 8, fuel: 2.3672 },
        { speed: 9, fuel: 2.8027 }, { speed: 10, fuel: 2.8027 }, { speed: 11, fuel: 3.0772 },
        { speed: 12, fuel: 3.4748 }, { speed: 13, fuel: 3.4938 }, { speed: 14, fuel: 3.7683 },
        { speed: 15, fuel: 4.1943 }, { speed: 16, fuel: 4.4594 }, { speed: 17, fuel: 4.8759 },
        { speed: 18, fuel: 5.5954 }, { speed: 19, fuel: 5.8510 }, { speed: 20, fuel: 6.5610 },
        { speed: 21, fuel: 6.9680 }, { speed: 22, fuel: 7.9336 },
      ],
      dynamic: [
        { speed: 0, fuel: 1.5123 }, { speed: 1, fuel: 2.3674 }, { speed: 2, fuel: 2.3674 },
        { speed: 3, fuel: 2.3775 }, { speed: 4, fuel: 2.3876 }, { speed: 5, fuel: 2.4079 },
        { speed: 6, fuel: 2.4282 }, { speed: 7, fuel: 2.4384 }, { speed: 8, fuel: 2.4282 },
        { speed: 9, fuel: 2.8947 }, { speed: 10, fuel: 2.8947 }, { speed: 11, fuel: 3.1888 },
        { speed: 12, fuel: 3.6148 }, { speed: 13, fuel: 3.6351 }, { speed: 14, fuel: 3.9292 },
        { speed: 15, fuel: 4.3856 }, { speed: 16, fuel: 4.6695 }, { speed: 17, fuel: 5.1158 },
        { speed: 18, fuel: 5.8865 }, { speed: 19, fuel: 6.1603 }, { speed: 20, fuel: 6.9210 },
        { speed: 21, fuel: 7.3571 }, { speed: 22, fuel: 8.3915 },
      ],
    },
  },
  {
    id: 'XL', name: 'Celebrity Xcel', serviceFuel: 1.4881,
    curves: {
      static: [
        { speed: 0, fuel: 1.4881 }, { speed: 1, fuel: 2.2286 }, { speed: 2, fuel: 2.2286 },
        { speed: 3, fuel: 2.2373 }, { speed: 4, fuel: 2.2461 }, { speed: 5, fuel: 2.2637 },
        { speed: 6, fuel: 2.2813 }, { speed: 7, fuel: 2.2900 }, { speed: 8, fuel: 2.2813 },
        { speed: 9, fuel: 2.6853 }, { speed: 10, fuel: 2.6853 }, { speed: 11, fuel: 2.9399 },
        { speed: 12, fuel: 3.3088 }, { speed: 13, fuel: 3.3264 }, { speed: 14, fuel: 3.5811 },
        { speed: 15, fuel: 3.9763 }, { speed: 16, fuel: 4.2222 }, { speed: 17, fuel: 4.6086 },
        { speed: 18, fuel: 5.2761 }, { speed: 19, fuel: 5.5132 }, { speed: 20, fuel: 6.1719 },
        { speed: 21, fuel: 6.5496 }, { speed: 22, fuel: 7.4454 },
      ],
      dynamic: [
        { speed: 0, fuel: 1.4881 }, { speed: 1, fuel: 2.2824 }, { speed: 2, fuel: 2.2824 },
        { speed: 3, fuel: 2.2919 }, { speed: 4, fuel: 2.3013 }, { speed: 5, fuel: 2.3201 },
        { speed: 6, fuel: 2.3390 }, { speed: 7, fuel: 2.3484 }, { speed: 8, fuel: 2.3390 },
        { speed: 9, fuel: 2.7724 }, { speed: 10, fuel: 2.7724 }, { speed: 11, fuel: 3.0456 },
        { speed: 12, fuel: 3.4413 }, { speed: 13, fuel: 3.4601 }, { speed: 14, fuel: 3.7334 },
        { speed: 15, fuel: 4.1573 }, { speed: 16, fuel: 4.4211 }, { speed: 17, fuel: 4.8357 },
        { speed: 18, fuel: 5.5517 }, { speed: 19, fuel: 5.8061 }, { speed: 20, fuel: 6.5127 },
        { speed: 21, fuel: 6.9178 }, { speed: 22, fuel: 7.8788 },
      ],
    },
  },
];

export function getShip(id: ShipId): ShipData {
  const ship = ships.find((s) => s.id === id);
  if (!ship) throw new Error(`Unknown ship: ${id}`);
  return ship;
}

export function maxSpeed(id: ShipId): number {
  const curve = getShip(id).curves.static;
  return curve[curve.length - 1].speed;
}
