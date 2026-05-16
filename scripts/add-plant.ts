#!/usr/bin/env tsx
/**
 * Add a new plant to the plant library.
 *
 * Usage:
 *   npm run add-plant -- \
 *     --id wild-lupine \
 *     --common "Wild Lupine" \
 *     --scientific "Lupinus perennis" \
 *     --family Fabaceae \
 *     --color "#6366F1" \
 *     --description "..." \
 *     --native "Eastern North America" \
 *     --bloom-start May --bloom-end July \
 *     --height "1-2 feet" \
 *     --sun "Full sun" \
 *     --water "Low to medium" \
 *     --pollinators "bumblebees,butterflies" \
 *     --tags "nitrogen-fixer,spring-bloomer"
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLANTS_FILE = resolve(__dirname, '../src/data/plants.json');

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

const required = ['id', 'common', 'scientific', 'family', 'color'];
const missing = required.filter((k) => !args[k]);
if (missing.length) {
  console.error(`Missing required args: ${missing.map((k) => `--${k}`).join(', ')}`);
  console.error('\nRequired flags: --id --common --scientific --family --color');
  console.error('Optional flags: --description --native --bloom-start --bloom-end --height --sun --water --pollinators (comma-sep) --tags (comma-sep)');
  process.exit(1);
}

const plants = JSON.parse(readFileSync(PLANTS_FILE, 'utf-8')) as { id: string }[];

if (plants.find((p) => p.id === args.id)) {
  console.error(`Plant with id "${args.id}" already exists. Edit plants.json directly to update it.`);
  process.exit(1);
}

const newPlant = {
  id: args.id,
  commonName: args.common,
  scientificName: args.scientific,
  family: args.family,
  description: args.description ?? '',
  nativeRange: args.native ?? '',
  bloomSeason: [args['bloom-start'] ?? '', args['bloom-end'] ?? ''],
  height: args.height ?? '',
  sunRequirement: args.sun ?? '',
  waterRequirement: args.water ?? '',
  pollinators: args.pollinators ? args.pollinators.split(',').map((s) => s.trim()) : [],
  color: args.color,
  tags: args.tags ? args.tags.split(',').map((s) => s.trim()) : [],
};

plants.push(newPlant);
writeFileSync(PLANTS_FILE, JSON.stringify(plants, null, 2) + '\n');
console.log(`✅ Added plant: ${newPlant.commonName} (${newPlant.scientificName}) [id: ${newPlant.id}]`);
console.log(`   Color: ${newPlant.color}`);
console.log(`\nNext: add regions for this plant using npm run add-region`);
