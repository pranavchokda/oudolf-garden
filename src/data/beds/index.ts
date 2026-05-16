import type { GardenBed } from '@/types';
import bed01 from './bed-01.json';
import bed02 from './bed-02.json';
import bed03 from './bed-03.json';
import bed04 from './bed-04.json';

export const allBeds: GardenBed[] = [
  bed01 as GardenBed,
  bed02 as GardenBed,
  bed03 as GardenBed,
  bed04 as GardenBed,
];

export function getBedById(id: string): GardenBed | undefined {
  return allBeds.find((b) => b.id === id);
}
