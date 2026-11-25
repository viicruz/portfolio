"use client";

//* Libraries imports
import type { CSSProperties } from "react";

type PixelSpriteProps = {
  src: string;
  className: string;
  style?: CSSProperties;
  decorative?: boolean;
};

export function PixelSprite(props: PixelSpriteProps) {
  return (
    // biome-ignore lint/performance/noImgElement: pixel-art sprite needs crisp nearest-neighbor scaling
    <img
      alt=""
      aria-hidden={props.decorative ? true : undefined}
      className={props.className}
      src={props.src}
      style={props.style}
    />
  );
}
