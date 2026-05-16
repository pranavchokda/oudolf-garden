import type { GardenBed, Plant } from '@/types';

interface Props {
  bed: GardenBed;
  plantMap: Map<string, Plant>;
  selectedId: string | null;
  onSelect: (regionId: string) => void;
}

export default function Legend({ bed, plantMap, selectedId, onSelect }: Props) {
  // Deduplicate: one entry per unique plant in this bed
  const seenPlants = new Set<string>();
  const entries: { plantId: string; regionId: string; plant: Plant }[] = [];

  for (const region of bed.regions) {
    if (!seenPlants.has(region.plantId)) {
      const plant = plantMap.get(region.plantId);
      if (plant) {
        seenPlants.add(region.plantId);
        entries.push({ plantId: region.plantId, regionId: region.id, plant });
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {entries.map(({ plant, regionId }) => {
        const isActive = selectedId === regionId;
        return (
          <button
            key={plant.id}
            onClick={() => onSelect(regionId)}
            className={`flex items-center gap-1.5 text-xs rounded px-1.5 py-1 transition-colors ${
              isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: plant.color }}
            />
            <span className={isActive ? 'font-semibold text-gray-800' : 'text-gray-600'}>
              {plant.commonName}
            </span>
          </button>
        );
      })}
    </div>
  );
}
