import type { BedObservationRecord } from '@/types';
import bed01Obs from './bed-01.json';

// Add new bed observation imports here as more data is collected.
// Each JSON file must conform to the BedObservationRecord type.
export const allObservations: BedObservationRecord[] = [
  bed01Obs as BedObservationRecord,
];

export function getObservationsForBed(bedId: string): BedObservationRecord | undefined {
  return allObservations.find((r) => r.bedId === bedId);
}
