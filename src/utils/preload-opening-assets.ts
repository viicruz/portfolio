//* Utils imports
import { OPENING_SPRITES } from "@/components/opening-intro/constants";

export const OPENING_SPRITE_PATHS = [
  OPENING_SPRITES.background,
  OPENING_SPRITES.professor,
  OPENING_SPRITES.marill,
  OPENING_SPRITES.marillIdle,
  OPENING_SPRITES.ethan,
  OPENING_SPRITES.lyra,
  OPENING_SPRITES.pokeball,
] as const;

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
