import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBedById } from '@/data/beds';
import { getObservationsForBed } from '@/data/observations';
import plantsData from '@/data/plants.json';
import type { Plant, SelectedItem } from '@/types';
import GardenMap from '@/components/GardenMap';
import PlantPanel from '@/components/PlantPanel';
import Legend from '@/components/Legend';
import BloomCalendar from '@/components/BloomCalendar';
import { useBloomCalendar } from '@/hooks/useBloomCalendar';

const allPlants = plantsData as Plant[];

export default function BedPage() {
  const { bedId } = useParams<{ bedId: string }>();
  const bed = bedId ? getBedById(bedId) : undefined;
  const observationRecord = bedId ? getObservationsForBed(bedId) : undefined;

  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const plantMap = useMemo(
    () => new Map(allPlants.map((p) => [p.id, p])),
    []
  );

  const bloomCalendar = useBloomCalendar(
    bed ?? { id: '', name: '', description: '', viewBox: '', boundary: [], paths: [], regions: [], features: [] },
    plantMap,
    observationRecord
  );

  const bloomingPlantIds = useMemo(
    () => new Set(bloomCalendar.bloomingNow.map((b) => b.plant.id)),
    [bloomCalendar.bloomingNow]
  );

  const selectedId = useMemo(() => {
    if (!selected) return null;
    if (selected.type === 'region') return selected.region.id;
    if (selected.type === 'feature') return selected.feature.id;
    return null;
  }, [selected]);

  const selectedBloomInfo = useMemo(() => {
    if (selected?.type !== 'region') return null;
    return bloomCalendar.allPlantInfos.find((b) => b.plant.id === selected.plant.id) ?? null;
  }, [selected, bloomCalendar.allPlantInfos]);

  if (!bed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream px-4 text-center">
        <p className="text-6xl mb-4">🌿</p>
        <h1 className="text-2xl font-bold text-forest mb-2">Bed not found</h1>
        <p className="text-gray-500 mb-6">We couldn't find garden bed "{bedId}".</p>
        <Link to="/" className="px-4 py-2 bg-forest text-white rounded-lg text-sm hover:bg-sage transition-colors">
          Back to all beds
        </Link>
      </div>
    );
  }

  function handleLegendSelect(regionId: string) {
    const region = bed!.regions.find((r) => r.id === regionId);
    if (!region) return;
    const plant = plantMap.get(region.plantId);
    if (!plant) return;
    setSelected((prev) => {
      const prevId = prev?.type === 'region' ? prev.region.id : null;
      return prevId === regionId ? null : { type: 'region', region, plant };
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-forest text-white px-4 pt-4 pb-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Link to="/" className="text-white/60 hover:text-white transition-colors text-sm">
              ← All Beds
            </Link>
          </div>
          <h1 className="text-xl font-bold leading-tight">{bed.name}</h1>
          <p className="text-white/70 text-xs mt-0.5 leading-snug line-clamp-2">{bed.description}</p>
        </div>
      </header>

      {/* Currently in bloom banner */}
      {bloomCalendar.bloomingNow.length > 0 && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="max-w-5xl mx-auto flex items-start gap-2 flex-wrap">
            <span className="text-xs font-semibold text-green-800 whitespace-nowrap mt-0.5">
              🌸 In bloom — {bloomCalendar.currentMonthName}:
            </span>
            {bloomCalendar.bloomingNow.map(({ plant }) => (
              <button
                key={plant.id}
                onClick={() => {
                  const region = bed.regions.find((r) => r.plantId === plant.id);
                  if (!region) return;
                  setSelected({ type: 'region', region, plant });
                }}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: `${plant.color}18`,
                  borderColor: `${plant.color}55`,
                  color: plant.color,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
                />
                {plant.commonName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-5xl mx-auto w-full">
        {/* Map + legend area */}
        <div className="flex-1 p-3 lg:p-6">
          <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <GardenMap
              bed={bed}
              plantMap={plantMap}
              selectedId={selectedId}
              bloomingPlantIds={bloomingPlantIds}
              onSelect={(item) =>
                setSelected((prev) => {
                  const prevId =
                    prev?.type === 'region' ? prev.region.id :
                    prev?.type === 'feature' ? prev.feature.id : null;
                  const newId =
                    item.type === 'region' ? item.region.id : item.feature.id;
                  return prevId === newId ? null : item;
                })
              }
            />
            {!selected && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
                Tap a region to learn about the plant
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-3 px-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Plants in this bed</p>
            <Legend
              bed={bed}
              plantMap={plantMap}
              selectedId={selectedId}
              onSelect={handleLegendSelect}
            />
          </div>

          {/* Feature key */}
          <div className="mt-4 px-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Points of Interest</p>
            <div className="flex flex-wrap gap-2">
              {bed.features.map((f) => (
                <button
                  key={f.id}
                  onClick={() =>
                    setSelected((prev) => {
                      const prevId = prev?.type === 'feature' ? prev.feature.id : null;
                      return prevId === f.id ? null : { type: 'feature', feature: f };
                    })
                  }
                  className={`flex items-center gap-1.5 text-xs rounded-lg px-2 py-1.5 border transition-colors ${
                    selectedId === f.id
                      ? 'border-gray-400 bg-gray-100 font-semibold'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{f.type === 'bird_nest' ? '🪺' : f.type === 'butterfly_waystation' ? '🦋' : '🐝'}</span>
                  <span className="text-gray-600">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bloom calendar toggle */}
          <div className="mt-6 px-1">
            <button
              onClick={() => setShowCalendar((v) => !v)}
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-800 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showCalendar ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Bloom calendar — full season view
            </button>
            {showCalendar && (
              <div className="mt-3 bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
                <BloomCalendar
                  plants={bed.regions.map((r) => plantMap.get(r.plantId)!).filter(Boolean)}
                  plantMap={plantMap}
                  currentMonth={bloomCalendar.currentMonth}
                />
              </div>
            )}
          </div>
        </div>

        {/* Side panel on desktop */}
        <div className="hidden lg:flex lg:w-80 lg:flex-col p-6 pl-0">
          {selected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-h-[calc(100vh-12rem)] overflow-y-auto">
              <PlantPanel
                item={selected}
                bloomInfo={selectedBloomInfo}
                onClose={() => setSelected(null)}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 text-center text-gray-400">
              <p className="text-3xl mb-2">🌱</p>
              <p className="text-sm">Select a region on the map or a plant in the legend to see details.</p>
              {bloomCalendar.bloomingNow.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Currently blooming
                  </p>
                  <div className="space-y-1">
                    {bloomCalendar.bloomingNow.map(({ plant, latestStatus }) => (
                      <button
                        key={plant.id}
                        onClick={() => {
                          const region = bed.regions.find((r) => r.plantId === plant.id);
                          if (region) setSelected({ type: 'region', region, plant });
                        }}
                        className="w-full flex items-center gap-2 text-xs text-left px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: plant.color }} />
                        <span className="text-gray-700 flex-1">{plant.commonName}</span>
                        {latestStatus && latestStatus !== 'not_blooming' && (
                          <span className="text-gray-400 capitalize">{latestStatus}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom sheet on mobile */}
      <div
        className={`lg:hidden fixed bottom-0 inset-x-0 z-40 transform transition-transform duration-300 ease-out max-h-[80vh] overflow-y-auto ${
          selected ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <PlantPanel
          item={selected}
          bloomInfo={selectedBloomInfo}
          onClose={() => setSelected(null)}
        />
      </div>

      {/* Backdrop for mobile panel */}
      {selected && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/20"
          onClick={() => setSelected(null)}
        />
      )}
    </div>
  );
}
