#!/usr/bin/env tsx
/**
 * Record a bloom observation for a plant in a garden bed.
 *
 * Usage:
 *   npm run add-observation -- \
 *     --bed bed-01 \
 *     --plant purple-coneflower \
 *     --year 2026 \
 *     --month 7 \
 *     --status peak \
 *     --notes "Dense bloom. Several goldfinches feeding." \
 *     --observer "MK"
 *
 * Status values: not_blooming | budding | peak | fading
 *
 * To record a full monthly garden walk, run once per plant observed.
 * To batch-import data, edit the JSON file directly — the format is a flat
 * array of BloomObservation objects inside the "observations" key.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

type BloomStatus = 'not_blooming' | 'budding' | 'peak' | 'fading';
const VALID_STATUSES: BloomStatus[] = ['not_blooming', 'budding', 'peak', 'fading'];

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : '';
      args[key] = value;
      if (value) i++;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

const required = ['bed', 'plant', 'year', 'month', 'status'];
const missing = required.filter((k) => !args[k]);
if (missing.length) {
  console.error(`Missing required args: ${missing.map((k) => `--${k}`).join(', ')}`);
  console.error('\nRequired: --bed --plant --year --month --status');
  console.error('Optional: --notes --observer');
  console.error('\nStatus values:', VALID_STATUSES.join(' | '));
  process.exit(1);
}

if (!VALID_STATUSES.includes(args.status as BloomStatus)) {
  console.error(`Invalid status "${args.status}". Must be one of: ${VALID_STATUSES.join(', ')}`);
  process.exit(1);
}

const year = parseInt(args.year, 10);
const month = parseInt(args.month, 10);
if (isNaN(year) || year < 2000 || year > 2100) {
  console.error('Invalid year. Expected 2000–2100.');
  process.exit(1);
}
if (isNaN(month) || month < 1 || month > 12) {
  console.error('Invalid month. Expected 1–12.');
  process.exit(1);
}

// Verify the plant exists
const plantsFile = resolve(__dirname, '../src/data/plants.json');
const plants = JSON.parse(readFileSync(plantsFile, 'utf-8')) as { id: string; commonName: string }[];
const plant = plants.find((p) => p.id === args.plant);
if (!plant) {
  console.error(`Plant "${args.plant}" not found in plants.json`);
  console.error('Available IDs:', plants.map((p) => p.id).join(', '));
  process.exit(1);
}

// Load or initialise the observation file for the bed
const obsFile = resolve(__dirname, `../src/data/observations/${args.bed}.json`);
let record: {
  bedId: string;
  description: string;
  observations: object[];
};

if (existsSync(obsFile)) {
  record = JSON.parse(readFileSync(obsFile, 'utf-8'));
} else {
  console.log(`No observation file found for "${args.bed}" — creating one.`);
  record = {
    bedId: args.bed,
    description: `Bloom observations for ${args.bed}.`,
    observations: [],
  };
}

// Check for a duplicate (same bed + plant + year + month)
const isDuplicate = record.observations.some(
  (o: object) => {
    const obs = o as { plantId?: string; year?: number; month?: number };
    return obs.plantId === args.plant && obs.year === year && obs.month === month;
  }
);

if (isDuplicate) {
  console.warn(`⚠️  An observation for ${plant.commonName} in ${year}-${String(month).padStart(2,'0')} already exists.`);
  console.warn('   Edit the JSON file directly to update it.');
  process.exit(0);
}

const newObs = {
  year,
  month,
  plantId: args.plant,
  bedId: args.bed,
  status: args.status as BloomStatus,
  ...(args.notes    ? { notes: args.notes }       : {}),
  ...(args.observer ? { observer: args.observer } : {}),
};

record.observations.push(newObs);

// Keep observations sorted by year then month for readability
(record.observations as { year: number; month: number }[]).sort(
  (a, b) => a.year - b.year || a.month - b.month
);

writeFileSync(obsFile, JSON.stringify(record, null, 2) + '\n');

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

console.log(`✅ Recorded: ${plant.commonName} — ${MONTH_NAMES[month - 1]} ${year} — ${args.status}`);
if (args.notes) console.log(`   Notes: ${args.notes}`);
