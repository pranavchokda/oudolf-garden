import { useMemo } from 'react';
import type { Plant, GardenBed, BedObservationRecord, PlantBloomInfo, BloomObservation } from '@/types';

const MONTH_NAME_TO_NUM: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Returns true if the plant's stated bloomSeason includes the given month (1–12). */
export function isInStatedBloomSeason(plant: Plant, month: number): boolean {
  const start = MONTH_NAME_TO_NUM[plant.bloomSeason[0]];
  const end = MONTH_NAME_TO_NUM[plant.bloomSeason[1]];
  if (!start || !end) return false;
  if (start <= end) return month >= start && month <= end;
  // Wraps across year boundary (e.g., November – February)
  return month >= start || month <= end;
}

/**
 * From the observation record, returns the fraction of years that have a
 * non-"not_blooming" entry for the given plant and month.
 * Returns null if there are no observations for that plant+month at all.
 */
function historicalBloomRate(
  plantId: string,
  month: number,
  observations: BloomObservation[]
): { rate: number; yearsOfData: number; latestStatus: BloomObservation['status'] | null } {
  const relevant = observations.filter(
    (o) => o.plantId === plantId && o.month === month
  );
  if (relevant.length === 0) return { rate: 0, yearsOfData: 0, latestStatus: null };

  const blooming = relevant.filter((o) => o.status !== 'not_blooming');
  const rate = blooming.length / relevant.length;

  // Most recent year's observation
  const sorted = [...relevant].sort((a, b) => b.year - a.year);
  const latestStatus = sorted[0]?.status ?? null;

  return { rate, yearsOfData: relevant.length, latestStatus };
}

interface UseBloomCalendarResult {
  currentMonth: number;
  currentMonthName: string;
  bloomingNow: PlantBloomInfo[];       // plants in bloom this month
  notBloomingNow: PlantBloomInfo[];    // plants not in bloom this month (but in this bed)
  allPlantInfos: PlantBloomInfo[];
  /** For each month 1–12, list the plant IDs expected to be in bloom */
  yearRoundCalendar: { month: number; monthName: string; plantIds: string[] }[];
}

/**
 * Computes bloom status for every plant in a bed for the current month,
 * enriched with historical observation data.
 */
export function useBloomCalendar(
  bed: GardenBed,
  plantMap: Map<string, Plant>,
  observationRecord: BedObservationRecord | undefined,
  overrideMonth?: number   // for testing — defaults to current real month
): UseBloomCalendarResult {
  const currentMonth = overrideMonth ?? new Date().getMonth() + 1; // 1-based
  const currentMonthName = MONTH_NAMES[currentMonth - 1];

  return useMemo(() => {
    const observations = observationRecord?.observations ?? [];

    // Unique plant IDs in this bed
    const plantIds = [...new Set(bed.regions.map((r) => r.plantId))];

    const allPlantInfos: PlantBloomInfo[] = plantIds.flatMap((pid) => {
      const plant = plantMap.get(pid);
      if (!plant) return [];
      const { rate, yearsOfData, latestStatus } = historicalBloomRate(pid, currentMonth, observations);
      return [{
        plant,
        isExpectedBloom: isInStatedBloomSeason(plant, currentMonth),
        historicalRate: yearsOfData > 0 ? rate : null,
        latestStatus,
        yearsOfData,
      }];
    });

    const bloomingNow = allPlantInfos.filter(
      (p) => p.isExpectedBloom || (p.historicalRate !== null && p.historicalRate >= 0.5)
    );
    const notBloomingNow = allPlantInfos.filter(
      (p) => !p.isExpectedBloom && (p.historicalRate === null || p.historicalRate < 0.5)
    );

    // Year-round calendar for the "full season" view
    const yearRoundCalendar = MONTH_NAMES.map((monthName, idx) => {
      const m = idx + 1;
      return {
        month: m,
        monthName,
        plantIds: plantIds.filter((pid) => {
          const plant = plantMap.get(pid);
          return plant ? isInStatedBloomSeason(plant, m) : false;
        }),
      };
    });

    return { currentMonth, currentMonthName, bloomingNow, notBloomingNow, allPlantInfos, yearRoundCalendar };
  }, [bed, plantMap, observationRecord, currentMonth]);
}
