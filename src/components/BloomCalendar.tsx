import type { Plant } from '@/types';
import { MONTH_NAMES, isInStatedBloomSeason } from '@/hooks/useBloomCalendar';

interface Props {
  plants: Plant[];           // all plants in this bed
  plantMap: Map<string, Plant>;
  currentMonth: number;      // 1–12
  onSelectPlant?: (plant: Plant) => void;
}

/** 12-column grid showing which plants bloom in each month. */
export default function BloomCalendar({ plants, currentMonth, onSelectPlant }: Props) {
  const uniquePlants = [...new Map(plants.map((p) => [p.id, p])).values()];

  return (
    <div className="overflow-x-auto">
      <table className="text-xs w-full border-collapse" style={{ minWidth: 500 }}>
        <thead>
          <tr>
            <th className="text-left pr-3 pb-1 text-gray-400 font-medium w-28 whitespace-nowrap">Plant</th>
            {MONTH_NAMES.map((m, i) => (
              <th
                key={m}
                className={`pb-1 text-center font-medium w-8 ${
                  i + 1 === currentMonth ? 'text-green-700' : 'text-gray-400'
                }`}
              >
                {m.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uniquePlants.map((plant) => (
            <tr
              key={plant.id}
              className={`border-t border-gray-100 ${onSelectPlant ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              onClick={() => onSelectPlant?.(plant)}
            >
              <td className="py-1 pr-3 text-gray-700 whitespace-nowrap truncate max-w-[7rem]">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: plant.color }}
                  />
                  {plant.commonName}
                </span>
              </td>
              {MONTH_NAMES.map((_, i) => {
                const m = i + 1;
                const inBloom = isInStatedBloomSeason(plant, m);
                const isCurrent = m === currentMonth;
                return (
                  <td key={m} className="py-1 text-center">
                    {inBloom ? (
                      <span
                        className="inline-block w-4 h-3 rounded-sm"
                        style={{
                          backgroundColor: plant.color,
                          opacity: isCurrent ? 1 : 0.45,
                          outline: isCurrent ? `2px solid ${plant.color}` : 'none',
                          outlineOffset: 1,
                        }}
                      />
                    ) : (
                      <span className="inline-block w-4 h-3" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">
        Bold outline = current month. Shaded = stated bloom season.
      </p>
    </div>
  );
}
