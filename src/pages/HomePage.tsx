import { Link } from 'react-router-dom';
import { allBeds } from '@/data/beds';
import plantsData from '@/data/plants.json';
import type { Plant } from '@/types';

const allPlants = plantsData as Plant[];
const plantMap = new Map(allPlants.map((p) => [p.id, p]));

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Hero header */}
      <header className="bg-forest text-white px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">🌿</span>
            <div>
              <h1 className="text-2xl font-bold">Oudolf Garden Detroit</h1>
              <p className="text-white/70 text-sm">Self-Guided Tour · Belle Isle, Detroit</p>
            </div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed max-w-xl">
            Welcome to Oudolf Garden Detroit — a 1.5-acre public garden on Belle Isle designed by
            renowned Dutch landscape designer Piet Oudolf. The main garden opened in August 2021
            and features 15 beds with 79,833 plants across 146 varieties, showcasing three distinct
            perennial planting styles. Admission is free; open year-round, dawn to dusk.
          </p>
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-white/60">
            <span>📍 Belle Isle Park, Detroit, MI</span>
            <span>🕐 Dawn to dusk · Free admission</span>
            <span>♿ ADA accessible · Parking on west side</span>
            <span>📞 313-474-4700</span>
          </div>
        </div>
      </header>

      {/* Beds grid */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Main Garden Beds
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {allBeds.map((bed) => {
              // Count unique plants in this bed
              const uniquePlants = [...new Set(bed.regions.map((r) => r.plantId))];
              return (
                <Link
                  key={bed.id}
                  to={`/bed/${bed.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-sage transition-all group"
                >
                  {/* Mini SVG preview */}
                  <div className="bg-gray-50 border-b border-gray-100 p-3">
                    <svg viewBox={bed.viewBox} className="w-full h-auto max-h-32">
                      <polygon
                        points={bed.boundary.map(([x, y]) => `${x},${y}`).join(' ')}
                        fill="#e8f0d8"
                        stroke="#5a7a35"
                        strokeWidth="4"
                      />
                      {bed.paths.map((path) => (
                        <polygon
                          key={path.id}
                          points={path.polygon.map(([x, y]) => `${x},${y}`).join(' ')}
                          fill="#c8b592"
                        />
                      ))}
                      {bed.regions.map((region) => {
                        const plant = plantMap.get(region.plantId);
                        const color = plant?.color ?? '#aaa';
                        const fill = { fill: color, fillOpacity: 0.65, stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1 };
                        if (region.circle) {
                          const { cx, cy, r } = region.circle;
                          return <circle key={region.id} cx={cx} cy={cy} r={r} {...fill} />;
                        }
                        if (region.ellipse) {
                          const { cx, cy, rx, ry, rotation = 0 } = region.ellipse;
                          return <ellipse key={region.id} cx={cx} cy={cy} rx={rx} ry={ry}
                            transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined} {...fill} />;
                        }
                        if (region.polygon) {
                          return <polygon key={region.id}
                            points={region.polygon.map(([x, y]) => `${x},${y}`).join(' ')} {...fill} />;
                        }
                        return null;
                      })}
                    </svg>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-forest transition-colors">
                      {bed.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {bed.description}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>🌱 {uniquePlants.length} species</span>
                      <span>📍 {bed.features.length} points of interest</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Placeholder cards for future beds */}
            {Array.from({ length: Math.max(0, 5 - allBeds.length) }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center text-gray-300 min-h-40"
              >
                <span className="text-3xl mb-2">🪴</span>
                <p className="text-xs">Coming soon</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Visitor info strip */}
      <section className="bg-gray-50 border-t border-gray-100 px-4 py-5">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Visitor Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600">
            <div>
              <p className="font-medium text-gray-800">Hours</p>
              <p>Dawn to dusk, year-round</p>
            </div>
            <div>
              <p className="font-medium text-gray-800">Admission</p>
              <p>Free</p>
            </div>
            <div>
              <p className="font-medium text-gray-800">Location</p>
              <p>Belle Isle Park, Detroit, MI</p>
            </div>
            <div>
              <p className="font-medium text-gray-800">Contact</p>
              <p>313-474-4700</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 space-y-0.5">
            <p>Parking on the west side of the garden · ADA accessible · Bike racks available</p>
            <p>Stay on paths · No flower picking · Walk bikes · Leave no trace · No events permitted</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        <p>
          Oudolf Garden Detroit · Belle Isle Park, Detroit, MI ·{' '}
          <a href="https://oudolfgardendetroit.org" className="underline hover:text-gray-600">
            oudolfgardendetroit.org
          </a>
        </p>
        <p className="mt-1">
          <a
            href="https://github.com/pranavchokda/oudolf-garden"
            className="underline hover:text-gray-600"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
