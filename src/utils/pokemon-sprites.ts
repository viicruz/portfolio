type PokemonSpriteData = {
    SPRITE_SHEET: string;
    SPRITE_DATA: string;
};

const POKEMONS = ["chikorita", "cyndaquil", "totodile"] as const;

export type PokemonKey = Uppercase<typeof POKEMONS[number]>;

export const POKEMON_KEYS: PokemonKey[] = ["CHIKORITA", "CYNDAQUIL", "TOTODILE"];

export const POKEMON_SPRITES: Record<PokemonKey, PokemonSpriteData> = {
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