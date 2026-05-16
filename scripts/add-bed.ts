#!/usr/bin/env tsx
/**
 * Scaffold a new garden bed JSON file and print instructions for wiring it up.
 *
 * Usage:
 *   npm run add-bed -- \
 *     --id bed-02 \
 *     --name "Woodland Edge Bed" \
 *     --description "Shade-tolerant natives along the treeline" \
 *     --width 700 --height 450
 */

import { writeFileSync, existsSync } from 'fs';
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

const required = ['id', 'name'];
const missing = required.filter((k) => !args[k]);
if (missing.length) {
  console.error(`Missing required args: ${missing.map((k) => `--${k}`).join(', ')}`);
  console.error('\nRequired: --id --name');
  console.error('Optional: --description --width (default 800) --height (default 520)');
  process.exit(1);
}

const bedFile = resolve(__dirname, `../src/data/beds/${args.id}.json`);
if (existsSync(bedFile)) {
  console.error(`Bed file already exists: ${bedFile}`);
  process.exit(1);
}

const width = parseInt(args.width ?? '800', 10);
const height = parseInt(args.height ?? '520', 10);
const pathY1 = Math.round(height * 0.44);
const pathY2 = Math.round(height * 0.52);

const template = {
  id: args.id,
  name: args.name,
  description: args.description ?? '',
  viewBox: `0 0 ${width} ${height}`,
  boundary: [
    [0, 0], [width, 0], [width, height], [0, height]
  ] as [number, number][],
  paths: [
    {
      id: 'main-walkway',
      label: 'Main Walkway',
      polygon: [
        [0, pathY1], [width, pathY1], [width, pathY2], [0, pathY2]
      ] as [number, number][],
    }
  ],
  regions: [] as unknown[],
  features: [] as unknown[],
};

writeFileSync(bedFile, JSON.stringify(template, null, 2) + '\n');
console.log(`✅ Created bed file: src/data/beds/${args.id}.json`);
console.log(`   ViewBox: 0 0 ${width} ${height}`);
console.log(`   Walkway at y=${pathY1}–${pathY2}\n`);
console.log('Next steps:');
console.log(`  1. Add regions:  npm run add-region -- --bed ${args.id} --id r01 --plant <plant-id> --points "..."`);
console.log(`  2. Wire it up in src/data/beds/index.ts:`);
console.log(`     import ${args.id.replace(/-/g, '')} from './${args.id}.json';`);
console.log(`     export const allBeds = [..., ${args.id.replace(/-/g, '')} as GardenBed];`);
console.log(`  3. Generate QR code for: https://<username>.github.io/oudolf-garden/#/bed/${args.id}`);
