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

export const POKEMON_PORTRAITS: Record<PokemonKey, string> = {
  CHIKORITA: "/assets/sprites/pkm/chikorita.gif",
  CYNDAQUIL: "/assets/sprites/pkm/cyndaquil.gif",
  TOTODILE: "/assets/sprites/pkm/totodile.gif",
};

export const POKEMON_PARTY_STATS: Record<PokemonKey, { hp: number }> = {
  CHIKORITA: { hp: 100 },
  CYNDAQUIL: { hp: 100 },
  TOTODILE: { hp: 100 },
};

export const POKEMON_LABEL_KEYS: Record<
  PokemonKey,
  "chikorita" | "cyndaquil" | "totodile"
> = {
  CHIKORITA: "chikorita",
  CYNDAQUIL: "cyndaquil",
  TOTODILE: "totodile",
};

export const PARTY_GRID_COLS = 2;
export const PARTY_DISPLAY_SLOTS = 6;