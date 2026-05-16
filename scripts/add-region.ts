#!/usr/bin/env tsx
/**
 * Add a plant region to a garden bed.
 * Regions can be polygons, circles, or ellipses.
 *
 * Polygon:
 *   npm run add-region -- --bed bed-01 --id n07 --plant wild-lupine \
 *     --shape polygon --points "600,0 720,0 710,95 690,230" \
 *     --label "Wild Lupine Drift" --notes "8 plants"
 *
 * Circle:
 *   npm run add-region -- --bed bed-01 --id n08 --plant prairie-smoke \
 *     --shape circle --cx 200 --cy 150 --r 60 \
 *     --label "Prairie Smoke Pocket"
 *
 * Ellipse:
 *   npm run add-region -- --bed bed-01 --id n09 --plant shooting-star \
 *     --shape ellipse --cx 400 --cy 100 --rx 90 --ry 45 --rotation 20 \
 *     --label "Shooting Star Drift"
 *
 * Tip: open the bed's SVG in a browser and use DevTools to find coordinates.
 * The viewBox dimensions are in the bed JSON.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const shape = (args.shape ?? 'polygon') as 'polygon' | 'circle' | 'ellipse';

const required = ['bed', 'id', 'plant'];
const missing = required.filter((k) => !args[k]);
if (missing.length) {
  console.error(`Missing required args: ${missing.map((k) => `--${k}`).join(', ')}`);
  process.exit(1);
}

if (shape === 'polygon' && !args.points) {
  console.error('--points is required for polygon regions.');
  console.error('Format: "x1,y1 x2,y2 x3,y3 ..."');
  process.exit(1);
}
if (shape === 'circle' && (!args.cx || !args.cy || !args.r)) {
  console.error('--cx --cy --r are required for circle regions.');
  process.exit(1);
}
if (shape === 'ellipse' && (!args.cx || !args.cy || !args.rx || !args.ry)) {
  console.error('--cx --cy --rx --ry are required for ellipse regions.');
  process.exit(1);
}

const bedFile = resolve(__dirname, `../src/data/beds/${args.bed}.json`);
let bed: {
  regions: { id: string; plantId: string; polygon?: [number, number][]; circle?: object; ellipse?: object; label: string; notes: string }[];
};

try {
  bed = JSON.parse(readFileSync(bedFile, 'utf-8'));
} catch {
  console.error(`Bed file not found: ${bedFile}`);
  console.error('Available beds are JSON files in src/data/beds/');
  process.exit(1);
}

if (bed.regions.find((r) => r.id === args.id)) {
  console.error(`Region "${args.id}" already exists in bed "${args.bed}". Edit the JSON directly to update.`);
  process.exit(1);
}

// Verify plant exists
const plantsFile = resolve(__dirname, '../src/data/plants.json');
const plants = JSON.parse(readFileSync(plantsFile, 'utf-8')) as { id: string; commonName: string }[];
const plant = plants.find((p) => p.id === args.plant);
if (!plant) {
  console.error(`Plant "${args.plant}" not found in plants.json`);
  console.error('Available IDs:', plants.map((p) => p.id).join(', '));
  process.exit(1);
}

// Build the shape-specific fields
let shapeFields: object;

if (shape === 'circle') {
  shapeFields = { circle: { cx: Number(args.cx), cy: Number(args.cy), r: Number(args.r) } };
} else if (shape === 'ellipse') {
  const ellipse: Record<string, number> = {
    cx: Number(args.cx), cy: Number(args.cy),
    rx: Number(args.rx), ry: Number(args.ry),
  };
  if (args.rotation) ellipse.rotation = Number(args.rotation);
  shapeFields = { ellipse };
} else {
  // polygon
  const polygon: [number, number][] = args.points
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number);
      if (isNaN(x) || isNaN(y)) {
        console.error(`Invalid point: "${pair}" — expected format x,y`);
        process.exit(1);
      }
      return [x, y] as [number, number];
    });
  if (polygon.length < 3) {
    console.error('A polygon needs at least 3 points.');
    process.exit(1);
  }
  shapeFields = { polygon };
}

const newRegion = {
  id: args.id,
  plantId: args.plant,
  ...shapeFields,
  label: args.label ?? `${plant.commonName} Region`,
  notes: args.notes ?? '',
};

bed.regions.push(newRegion);
writeFileSync(bedFile, JSON.stringify(bed, null, 2) + '\n');

console.log(`✅ Added ${shape} region "${args.id}" (${plant.commonName}) to bed "${args.bed}"`);
console.log(`   Label: ${newRegion.label}`);
