import { FUEL_LCV_FACTOR } from '../data/engineDefaults';
import type { FuelType } from '../types';

/**
 * Forward fuel correction for the fuel a DG actually burns. FAT 46F curves are
 * HFO-basis (40.530 MJ/kg); lighter distillate (MGO) yields fewer kg for the
 * same energy. VLSFO ≈ HFO basis.
 */
export function fuelFactor(fuel: FuelType): number {
  return FUEL_LCV_FACTOR[fuel];
}
