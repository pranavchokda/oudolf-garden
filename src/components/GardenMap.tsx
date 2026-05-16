import { useRef, useState } from 'react';
import type { GardenBed, GardenFeature, Plant, PlantRegion, SelectedItem } from '@/types';

const FEATURE_EMOJI: Record<string, string> = {
  bird_nest: '🪺',
  butterfly_waystation: '🦋',
  bee_hive: '🐝',
  water_feature: '💧',
  bench: '🪑',
  sign: '📋',
};

function toPoints(polygon: [number, number][]): string {
  return polygon.map(([x, y]) => `${x},${y}`).join(' ');
}

/** Returns the visual center of any region shape. */
function centroid(region: PlantRegion): [number, number] {
  if (region.circle)  return [region.circle.cx,  region.circle.cy];
  if (region.ellipse) return [region.ellipse.cx, region.ellipse.cy];
  if (region.polygon && region.polygon.length > 0) {
    const cx = region.polygon.reduce((s, [x]) => s + x, 0) / region.polygon.length;
    const cy = region.polygon.reduce((s, [, y]) => s + y, 0) / region.polygon.length;
    return [cx, cy];
  }
  return [0, 0];
}

interface ShapeProps {
  region: PlantRegion;
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  style?: React.CSSProperties;
  pointerEvents?: 'none';
}

/** Renders the correct SVG primitive for any region shape. */
function RegionShape({ region, pointerEvents, ...rest }: ShapeProps & { pointerEvents?: 'none' }) {
  const style = { ...rest.style, ...(pointerEvents ? { pointerEvents } : {}) };

  if (region.circle) {
    const { cx, cy, r } = region.circle;
    return <circle cx={cx} cy={cy} r={r} {...rest} style={style} />;
  }

  if (region.ellipse) {
    const { cx, cy, rx, ry, rotation = 0 } = region.ellipse;
    return (
      <ellipse
        cx={cx} cy={cy} rx={rx} ry={ry}
        transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined}
        {...rest}
        style={style}
      />
    );
  }

  if (region.polygon) {
    return <polygon points={toPoints(region.polygon)} {...rest} style={style} />;
  }

  return null;
}

interface Props {
  bed: GardenBed;
  plantMap: Map<string, Plant>;
  selectedId: string | null;
  bloomingPlantIds?: Set<string>;
  onSelect: (item: SelectedItem) => void;
}

interface Tooltip {
  text: string;
  x: number;
  y: number;
}

export default function GardenMap({ bed, plantMap, selectedId, bloomingPlantIds, onSelect }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function showTooltip(e: React.MouseEvent, text: string) {
    setTooltip({ text, x: e.clientX, y: e.clientY });
  }

  function handleRegionClick(region: PlantRegion) {
    const plant = plantMap.get(region.plantId);
    if (!plant) return;
    onSelect({ type: 'region', region, plant });
  }

  function handleFeatureClick(feature: GardenFeature) {
    onSelect({ type: 'feature', feature });
  }

  return (
    <div ref={containerRef} className="relative w-full select-none">
      <svg
        viewBox={bed.viewBox}
        className="w-full h-auto block"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Bloom glow filter */}
        <defs>
          <filter id="bloom-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Bed background */}
        <polygon
          points={toPoints(bed.boundary)}
          fill="#e8f0d8"
          stroke="#5a7a35"
          strokeWidth="4"
        />

        {/* Walkways */}
        {bed.paths.map((path) => (
          <polygon
            key={path.id}
            points={toPoints(path.polygon)}
            fill="#c8b592"
          />
        ))}

        {/* Plant regions */}
        {bed.regions.map((region) => {
          const plant = plantMap.get(region.plantId);
          const isSelected = selectedId === region.id;
          const isBlooming = bloomingPlantIds?.has(region.plantId) ?? false;
          const color = plant?.color ?? '#aaa';

          return (
            <g
              key={region.id}
              className="cursor-pointer"
              onClick={() => handleRegionClick(region)}
              onMouseEnter={(e) => showTooltip(e, plant?.commonName ?? region.label)}
              onMouseLeave={() => setTooltip(null)}
              onMouseMove={(e) => showTooltip(e, plant?.commonName ?? region.label)}
            >
              {/* Bloom glow halo */}
              {isBlooming && !isSelected && (
                <RegionShape
                  region={region}
                  fill={color}
                  fillOpacity={0.3}
                  stroke="none"
                  strokeWidth={0}
                  style={{ filter: 'url(#bloom-glow)' }}
                  pointerEvents="none"
                />
              )}

              {/* Main shape */}
              <RegionShape
                region={region}
                fill={color}
                fillOpacity={isSelected ? 0.92 : isBlooming ? 0.78 : 0.62}
                stroke={isSelected ? '#1a1a1a' : isBlooming ? color : 'rgba(0,0,0,0.2)'}
                strokeWidth={isSelected ? 3 : isBlooming ? 1.5 : 1}
                style={{ transition: 'fill-opacity 0.15s, stroke-width 0.15s' }}
              />

              {/* Selected dash ring */}
              {isSelected && (
                <RegionShape
                  region={region}
                  fill="none"
                  fillOpacity={1}
                  stroke="white"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  style={{ opacity: 0.5 }}
                  pointerEvents="none"
                />
              )}

              {/* Bloom dot at centroid */}
              {isBlooming && !isSelected && (
                <BloomDot cx={centroid(region)[0]} cy={centroid(region)[1]} color={color} />
              )}
            </g>
          );
        })}

        {/* Feature markers */}
        {bed.features.map((feature) => {
          const [cx, cy] = feature.position;
          const isSelected = selectedId === feature.id;
          return (
            <g
              key={feature.id}
              className="cursor-pointer"
              onClick={() => handleFeatureClick(feature)}
              onMouseEnter={(e) => showTooltip(e, feature.label)}
              onMouseLeave={() => setTooltip(null)}
              onMouseMove={(e) => showTooltip(e, feature.label)}
            >
              <circle
                cx={cx} cy={cy}
                r={isSelected ? 20 : 17}
                fill="white"
                fillOpacity="0.92"
                stroke={isSelected ? '#1a1a1a' : '#555'}
                strokeWidth={isSelected ? 2.5 : 1.5}
                style={{ transition: 'r 0.15s' }}
              />
              <text
                x={cx} y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isSelected ? 15 : 13}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {FEATURE_EMOJI[feature.type] ?? '📍'}
              </text>
            </g>
          );
        })}

        {/* Compass rose */}
        <g transform="translate(762, 18)" opacity="0.5">
          <text fontSize="9" fill="#4a5e30" textAnchor="middle" x="0" y="0">N</text>
          <line x1="0" y1="2" x2="0" y2="10" stroke="#4a5e30" strokeWidth="1.5" />
        </g>
      </svg>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 rounded text-xs font-medium bg-gray-900/85 text-white shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y - 32 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

function BloomDot({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={cx} cy={cy} r="7" fill="white" fillOpacity="0.85" />
      <circle cx={cx} cy={cy} r="4" fill={color} />
    </g>
  );
}
