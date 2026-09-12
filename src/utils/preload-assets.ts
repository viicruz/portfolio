//* Libraries imports
import { useLoader } from "@react-three/fiber";
import { useGLTF, useProgress, useTexture } from "@react-three/drei";
import * as THREE from "three";

//* Utils imports
import { NPC_SPRITES } from "@/utils/npc-sprites";
import { PLAYER_SPRITES } from "@/utils/player-sprites";
import { POKEMON_SPRITES } from "@/utils/pokemon-sprites";

// Ensure DefaultLoadingManager hooks are installed before any preload runs.
void useProgress.getState();

export const HOMEPAGE_MODEL_PATHS = [
  "/assets/models/terrain/terrain.gltf",
  "/assets/models/tree/tree.gltf",
  "/assets/models/nature/flower.gltf",
  "/assets/models/museum/museum.glb",
  "/assets/models/radio-city-station/radio-city-station.glb",
  "/assets/models/city-station/city-station.glb",
  "/assets/models/pkm-center/pkm-center.glb",
  "/assets/models/buildings/building1.glb",
  "/assets/models/buildings/building2.glb",
  "/assets/models/yacht/yacht.glb",
  "/assets/models/train-tracks/train-tracks.glb",
  "/assets/models/archway/archway.glb",
  "/assets/models/lamp/lamp.glb",
] as const;

export const HOMEPAGE_SPRITE_SHEETS = [
  PLAYER_SPRITES.BOY.SPRITE_SHEET,
  NPC_SPRITES.ELM.SPRITE_SHEET,
  NPC_SPRITES.SILVER.SPRITE_SHEET,
  NPC_SPRITES.FATGUY.SPRITE_SHEET,
  POKEMON_SPRITES.CHIKORITA.SPRITE_SHEET,
  POKEMON_SPRITES.CYNDAQUIL.SPRITE_SHEET,
  POKEMON_SPRITES.TOTODILE.SPRITE_SHEET,
] as const;

export const HOMEPAGE_SPRITE_DATA_URLS = [
  PLAYER_SPRITES.BOY.SPRITE_DATA,
  NPC_SPRITES.ELM.SPRITE_DATA,
  POKEMON_SPRITES.CHIKORITA.SPRITE_DATA,
] as const;

export const OPENING_SPRITE_PATHS = [
  "/assets/sprites/opening/professor.png",
  "/assets/sprites/opening/marill.png",
  "/assets/sprites/opening/marill-2.png",
  "/assets/sprites/opening/ethan.png",
  "/assets/sprites/opening/lyra.png",
  "/assets/sprites/opening/pokeball.png",
] as const;

let didPreload = false;
let openingPreloadPromise: Promise<void> | null = null;

function decodeOpeningImage(src: string): Promise<void> {
  const image = new Image();
  image.src = src;

  if (typeof image.decode === "function") {
    return image.decode().then(() => undefined);
  }

  return new Promise((resolve, reject) => {
    if (image.complete && image.naturalWidth > 0) {
      resolve();
      return;
    }

    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to preload ${src}`));
  });
}

export function preloadOpeningAssets(): Promise<void> {
  if (openingPreloadPromise) {
    return openingPreloadPromise;
  }

  openingPreloadPromise = Promise.all(
    OPENING_SPRITE_PATHS.map((src) =>
      decodeOpeningImage(src).catch(() => undefined),
    ),
  ).then(() => undefined);

  return openingPreloadPromise;
}

export function preloadHomepageAssets() {
  if (didPreload) {
    return;
  }
  didPreload = true;

  for (const path of HOMEPAGE_MODEL_PATHS) {
    useGLTF.preload(path);
  }

  useTexture.preload([...HOMEPAGE_SPRITE_SHEETS]);
  useLoader.preload(THREE.FileLoader, [...HOMEPAGE_SPRITE_DATA_URLS]);
}