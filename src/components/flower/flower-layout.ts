export type GrassPlacement = {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

export type FlowerMapConfig = {
  flowerChar: string;
  origin: { x: number; z: number };
  step: { x: number; z?: number };
  rowZ?: readonly number[];
};

// each "#" character becomes a flower. Use "." for empty space.
// "." indicates white spaces.
export const FLOWER_MAP = `
............
............
..#.......#.
.#.........#
.##.......##
.##.......##
###.......###
.##.......##
`.trim();

export const FLOWER_MAP_CONFIG = {
  flowerChar: "#",
  origin: { x: -6, z: 25 },
  step: { x: 1, z: 2 },
} as const satisfies FlowerMapConfig;

export const DEFAULT_GRASS_BASE_Y = -0.749;

// rotation angles for each flower are determined by a deterministic function based on row and column indices
const ROTATION_STEPS = [
  0,
  Math.PI / 8,
  Math.PI / 6,
  Math.PI / 4,
  Math.PI / 3,
  Math.PI / 2,
];

function pickRotation(row: number, col: number): [number, number, number] {
  const index = (row * 31 + col * 17) % ROTATION_STEPS.length;
  const sign = (row + col) % 2 === 0 ? 1 : -1;
  return [0, sign * ROTATION_STEPS[index], 0];
}

export function parseFlowerMap(
  map: string,
  config: FlowerMapConfig,
  baseY: number,
): GrassPlacement[] {
  const rows = map.split("\n").map((row) => row.trim());
  const placements: GrassPlacement[] = [];

  for (let row = 0; row < rows.length; row++) {
    const line = rows[row];
    const z =
      config.rowZ?.[row] ?? config.origin.z + row * (config.step.z ?? 2);

    for (let col = 0; col < line.length; col++) {
      if (line[col] !== config.flowerChar) continue;

      const x = config.origin.x + col * config.step.x;
      placements.push({
        position: [x, baseY, z],
        rotation: pickRotation(row, col),
      });
    }
  }

  return placements;
}

export const FLOWER_MANUAL_PLACEMENTS: GrassPlacement[] = [];

export function resolveFlowerPlacements(
  baseY: number,
  manualPlacements: GrassPlacement[] = FLOWER_MANUAL_PLACEMENTS,
): GrassPlacement[] {
  return [
    ...parseFlowerMap(FLOWER_MAP, FLOWER_MAP_CONFIG, baseY),
    ...manualPlacements,
  ];
}

export const SPAWN_AREA_GRASS_PLACEMENTS: GrassPlacement[] =
  resolveFlowerPlacements(DEFAULT_GRASS_BASE_Y);
