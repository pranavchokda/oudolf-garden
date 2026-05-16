import { useState } from 'react';
import type { PlantBloomInfo, SelectedItem } from '@/types';

const FEATURE_EMOJI: Record<string, string> = {
  bird_nest: '🪺',
  butterfly_waystation: '🦋',
  bee_hive: '🐝',
  water_feature: '💧',
  bench: '🪑',
  sign: '📋',
};

interface Props {
  item: SelectedItem | null;
  bloomInfo?: PlantBloomInfo | null;
  onClose: () => void;
}

export default function PlantPanel({ item, bloomInfo, onClose }: Props) {
  if (!item) return null;

  if (item.type === 'feature') {
    const { feature } = item;
    return (
      <PanelShell onClose={onClose}>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl leading-none">{FEATURE_EMOJI[feature.type] ?? '📍'}</span>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{feature.label}</h2>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{feature.description}</p>
      </PanelShell>
    );
  }

  const { plant, region } = item;

  return (
    <PanelShell onClose={onClose}>
      {/* Plant photo */}
      <PlantPhoto key={plant.id} plant={plant} />

      {/* Header */}
      <div className="flex items-start gap-3 mb-1 mt-3">
        <div
          className="w-4 h-4 rounded mt-1 flex-shrink-0"
          style={{ backgroundColor: plant.color }}
        />
        <div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{plant.commonName}</h2>
          <p className="text-xs italic text-gray-500">{plant.scientificName}</p>
          <p className="text-xs text-gray-400">{plant.family}</p>
        </div>
      </div>

      {/* Bloom now badge */}
      {bloomInfo?.isExpectedBloom && (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-1 mb-2"
          style={{ backgroundColor: `${plant.color}22`, color: plant.color, border: `1px solid ${plant.color}55` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          In bloom now
          {bloomInfo.latestStatus && bloomInfo.latestStatus !== 'not_blooming' && (
            <span className="opacity-70 font-normal">· {bloomInfo.latestStatus}</span>
          )}
        </div>
      )}

      {/* Color bar */}
      <div
        className="h-0.5 rounded-full mb-3 mt-2"
        style={{ backgroundColor: plant.color, opacity: 0.5 }}
      />

      {/* Description */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4">{plant.description}</p>

      {/* Distinguishing features */}
      {plant.distinguishingFeatures.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            How to identify
          </p>
          <ul className="space-y-1.5">
            {plant.distinguishingFeatures.map((feat, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: plant.color }}
                />
                {feat}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
        <Stat label="Bloom" value={`${plant.bloomSeason[0]}–${plant.bloomSeason[1]}`} />
        <Stat label="Height" value={plant.height} />
        <Stat label="Sun" value={plant.sunRequirement} />
        <Stat label="Water" value={plant.waterRequirement} />
        <Stat label="Native Range" value={plant.nativeRange} className="col-span-2" />
      </div>

      {/* Historical bloom context */}
      {bloomInfo && bloomInfo.yearsOfData > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs">
          <p className="font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Historical ({bloomInfo.yearsOfData}yr data)
          </p>
          {bloomInfo.historicalRate !== null ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.round(bloomInfo.historicalRate * 100)}%`, backgroundColor: plant.color }}
                />
              </div>
              <span className="text-gray-600 tabular-nums">
                {Math.round(bloomInfo.historicalRate * 100)}% of years recorded this month
              </span>
            </div>
          ) : (
            <p className="text-gray-400 italic">No observations recorded for this month yet</p>
          )}
        </div>
      )}

      {/* Pollinators */}
      {plant.pollinators.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Visitors</p>
          <div className="flex flex-wrap gap-1">
            {plant.pollinators.map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: `${plant.color}20`,
                  color: plant.color,
                  border: `1px solid ${plant.color}40`,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Garden notes */}
      {region.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
          <p className="text-xs font-semibold text-amber-700 mb-0.5">Garden Notes</p>
          <p className="text-xs text-amber-800 leading-relaxed">{region.notes}</p>
        </div>
      )}

      {/* Tags */}
      {plant.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {plant.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Learn more link */}
      {plant.wikiUrl && (
        <a
          href={plant.wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Learn more on Wikipedia
        </a>
      )}
    </PanelShell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PlantPhoto({ plant }: { plant: { id: string; commonName: string; imageUrl: string; color: string } }) {
  const [imgError, setImgError] = useState(false);

  // Try explicit imageUrl first, then /plants/<id>.jpg, fall back to SVG placeholder on load error.
  const src = plant.imageUrl || `/plants/${plant.id}.jpg`;

  if (imgError) {
    return (
      <div
        className="w-full h-28 rounded-xl flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: `${plant.color}18` }}
      >
        <PlantSilhouette color={plant.color} />
        <span className="sr-only">{plant.commonName} illustration placeholder</span>
      </div>
    );
  }

  return (
    <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100">
      <img
        src={src}
        alt={plant.commonName}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

/** Simple botanical-style SVG silhouette used when no photo is available. */
function PlantSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-20 h-20 opacity-30" fill={color}>
      {/* Stem */}
      <rect x="38" y="35" width="4" height="35" rx="2" />
      {/* Left leaf */}
      <ellipse cx="28" cy="40" rx="14" ry="7" transform="rotate(-30 28 40)" />
      {/* Right leaf */}
      <ellipse cx="52" cy="44" rx="14" ry="7" transform="rotate(30 52 44)" />
      {/* Flower center */}
      <circle cx="40" cy="22" r="9" />
      {/* Petals */}
      <ellipse cx="40" cy="8"  rx="5" ry="8" />
      <ellipse cx="40" cy="36" rx="5" ry="8" />
      <ellipse cx="26" cy="15" rx="5" ry="8" transform="rotate(-60 26 15)" />
      <ellipse cx="54" cy="15" rx="5" ry="8" transform="rotate(60 54 15)" />
      <ellipse cx="26" cy="29" rx="5" ry="8" transform="rotate(60 26 29)" />
      <ellipse cx="54" cy="29" rx="5" ry="8" transform="rotate(-60 54 29)" />
    </svg>
  );
}

function PanelShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 p-5 pb-8">
      <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
      <div className="flex justify-end -mt-5 mb-2">
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-gray-400 font-medium uppercase tracking-wide" style={{ fontSize: '0.65rem' }}>{label}</p>
      <p className="text-gray-700">{value}</p>
    </div>
  );
}
