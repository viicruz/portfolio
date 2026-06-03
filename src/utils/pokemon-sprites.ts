type PokemonSpriteData = {
    SPRITE_SHEET: string;
    SPRITE_DATA: string;
};

const POKEMONS = ["chikorita", "cyndaquil", "totodile"] as const;

export const POKEMON_SPRITES: Record<Uppercase<typeof POKEMONS[number]>, PokemonSpriteData> = {
  CHIKORITA: {
    SPRITE_SHEET: "/assets/sprites/pkm/pokemon_gen_2_sprites.png",
    SPRITE_DATA: "/assets/sprites/pkm/chikorita.json",
  },
  CYNDAQUIL: {
    SPRITE_SHEET: "/assets/sprites/pkm/pokemon_gen_2_sprites.png",
    SPRITE_DATA: "/assets/sprites/pkm/cyndaquil.json",
  },
  TOTODILE: {
    SPRITE_SHEET: "/assets/sprites/pkm/pokemon_gen_2_sprites.png",
    SPRITE_DATA: "/assets/sprites/pkm/totodile.json",
  },
};