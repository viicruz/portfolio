"use client";

//* Utils imports
import { POKEMON_PORTRAITS, type PokemonKey } from "@/utils/pokemon-sprites";

type PokemonPortraitProps = {
  pokemonKey: PokemonKey;
  className?: string;
};

export function PokemonPortrait(props: PokemonPortraitProps) {
  const portraitSrc = POKEMON_PORTRAITS[props.pokemonKey];
  const className = props.className ?? "size-10";

  return (
    // biome-ignore lint/performance/noImgElement: Image is used for performance reasons
    <img
      src={portraitSrc}
      alt={props.pokemonKey}
      className={`${className} object-contain [image-rendering:pixelated]`}
      draggable={false}
    />
  );
}
