export type TreePlacement = {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

export type ForestMapConfig = {
  treeChar: string;
  origin: { x: number; z: number };
  step: { x: number; z?: number };
  rowZ?: readonly number[];
};

export const FOREST_MAP = `

.....................
.###..................
.####.......#########
.####...############
.#####....##########
.######.........#######
.########......########
.############...##########
.############.########
.########################
.########################
`.trim();

export const FOREST_MAP_CONFIG = {
  treeChar: "#",
  origin: { x: -10, z: 45 },
  step: { x: 4, z: 4 },
} as const satisfies ForestMapConfig;

export const FOREST_MANUAL_PLACEMENTS: TreePlacement[] = [];

export function parseForestMap(
  map: string,
  config: ForestMapConfig,
  baseY: number,
): TreePlacement[] {
  const rows = map.split("\n").map((row) => row.trim());
  const placements: TreePlacement[] = [];

  for (let row = 0; row < rows.length; row++) {
    const line = rows[row];
    const z =
      config.rowZ?.[row] ?? config.origin.z + row * (config.step.z ?? 4);

    for (let col = 0; col < line.length; col++) {
      if (line[col] !== config.treeChar) continue;

      const x = config.origin.x + col * config.step.x;
      placements.push({ position: [x, baseY, z] });
    }
  }

  return placements;
}

export function resolveForestPlacements(
  baseY: number,
  manualPlacements: TreePlacement[] = FOREST_MANUAL_PLACEMENTS,
): TreePlacement[] {
  return [
    ...parseForestMap(FOREST_MAP, FOREST_MAP_CONFIG, baseY),
    ...manualPlacements,
  ];
}

export const DEFAULT_FOREST_BASE_Y = -0.749;

export const TREE_PLACEMENTS = resolveForestPlacements(DEFAULT_FOREST_BASE_Y);
