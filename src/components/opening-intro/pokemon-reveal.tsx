"use client";

//* Components imports
import { PixelSprite } from "@/components/opening-intro/pixel-sprite";

//* Local imports
import {
  MARILL_ENTER_MS,
  MARILL_FADE_MS,
  MARILL_IDLE_MS,
  OPENING_SPRITES,
  POKEBALL_APPEAR_MS,
  POKEBALL_SHAKE_MS,
} from "@/components/opening-intro/constants";
import type { PokemonRevealPhase } from "@/components/opening-intro/types";

//* Utils imports
import { cn } from "@/lib/utils";

type PokemonRevealProps = {
  revealPhase: PokemonRevealPhase;
  showPokeball: boolean;
  showMarill: boolean;
  marillFadingOut: boolean;
  marillIdleActive: boolean;
  reducedMotion: boolean;
};

export function PokemonReveal(props: PokemonRevealProps) {
  if (props.revealPhase === "idle") {
    return null;
  }

  const marillEntering =
    props.revealPhase === "marillEnter" && !props.marillFadingOut;
  const pokeballDuration =
    props.revealPhase === "pokeball"
      ? `${POKEBALL_APPEAR_MS}ms`
      : `${POKEBALL_SHAKE_MS}ms`;

  return (
    <div className="absolute bottom-0 left-1/2 flex size-40 translate-x-4 items-end justify-center sm:h-48 sm:w-48 sm:translate-x-6">
      {props.showPokeball ? (
        <div
          className={cn(
            "flex size-16 items-end justify-center sm:h-20 sm:w-20",
            props.revealPhase === "pokeball"
              ? "animate-pokeball-drop"
              : undefined,
            props.revealPhase === "shake"
              ? "animate-pokeball-shake"
              : undefined,
          )}
          style={{ animationDuration: pokeballDuration }}
        >
          <PixelSprite
            className="h-full w-full object-contain [image-rendering:pixelated]"
            src={OPENING_SPRITES.pokeball}
          />
        </div>
      ) : null}

      {props.showMarill ? (
        <div
          className={cn(
            "relative h-36 w-36 origin-bottom pb-2 sm:h-44 sm:w-44",
            marillEntering ? "animate-marill-enter" : undefined,
            props.marillFadingOut ? "opacity-0" : "opacity-100",
          )}
          style={{
            animationDuration: marillEntering
              ? `${MARILL_ENTER_MS}ms`
              : undefined,
            transitionDuration: props.reducedMotion
              ? "0ms"
              : `${MARILL_FADE_MS}ms`,
            transitionProperty: "opacity",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <PixelSprite
            className={cn(
              "absolute inset-0 h-full w-full object-contain [image-rendering:pixelated]",
              props.marillIdleActive ? "animate-marill-idle-a" : undefined,
            )}
            src={OPENING_SPRITES.marill}
            style={
              props.marillIdleActive
                ? { animationDuration: `${MARILL_IDLE_MS * 2}ms` }
                : undefined
            }
          />
          <PixelSprite
            className={cn(
              "absolute inset-0 h-full w-full object-contain [image-rendering:pixelated]",
              props.marillIdleActive ? "animate-marill-idle-b" : "hidden",
            )}
            src={OPENING_SPRITES.marillIdle}
            style={
              props.marillIdleActive
                ? { animationDuration: `${MARILL_IDLE_MS * 2}ms` }
                : undefined
            }
          />
        </div>
      ) : null}
    </div>
  );
}
