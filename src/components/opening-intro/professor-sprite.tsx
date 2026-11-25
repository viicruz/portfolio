"use client";

//* Components imports
import { PixelSprite } from "@/components/opening-intro/pixel-sprite";

//* Local imports
import {
  APPEAR_MS,
  OPENING_SPRITES,
  PROFESSOR_SHIFT_MS,
} from "@/components/opening-intro/constants";

//* Utils imports
import { cn } from "@/lib/utils";

type ProfessorSpriteProps = {
  visible: boolean;
  translateClass: string;
  reducedMotion: boolean;
};

export function ProfessorSprite(props: ProfessorSpriteProps) {
  const transitionDuration = props.reducedMotion
    ? "0ms"
    : `${APPEAR_MS}ms, ${PROFESSOR_SHIFT_MS}ms`;

  return (
    <PixelSprite
      className={cn(
        "absolute bottom-0 left-1/2 h-96 w-56 object-contain [image-rendering:pixelated] ease-out sm:h-[28rem] sm:w-72",
        props.visible ? "opacity-100" : "opacity-0",
        props.translateClass,
      )}
      src={OPENING_SPRITES.professor}
      style={{
        transitionDuration,
        transitionProperty: "opacity, translate",
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    />
  );
}
