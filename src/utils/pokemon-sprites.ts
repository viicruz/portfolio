type PokemonSpriteData = {
    SPRITE_SHEET: string;
    SPRITE_DATA: string;
};

const POKEMONS = ["chikorita", "cyndaquil", "totodile"] as const;

export const POKEMON_SPRITES: Record<Uppercase<typeof POKEMONS[number]>, PokemonSpriteData> = {
  CHIKORITA: {
    SPRITE_SHEET: "/assets/pokemon_gen_2_sprites.png",
    SPRITE_DATA: "/assets/chikorita.json",
  },
  CYNDAQUIL: {
    SPRITE_SHEET: "/assets/pokemon_gen_2_sprites.png",
    SPRITE_DATA: "/assets/cyndaquil.json",
  },
  TOTODILE: {
    SPRITE_SHEET: "/assets/pokemon_gen_2_sprites.png",
    SPRITE_DATA: "/assets/totodile.json",
  },
};