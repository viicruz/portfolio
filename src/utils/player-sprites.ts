type PlayerSpriteData = {
    SPRITE_SHEET: string;
    SPRITE_DATA: string;
};

const PLAYER_GENDERS = ["boy", "girl"] as const;

export const PLAYER_SPRITES: Record<Uppercase<typeof PLAYER_GENDERS[number]>, PlayerSpriteData> = {
  BOY: {
    SPRITE_SHEET: "/assets/sprites/player/main-char-transparent.png",
    SPRITE_DATA: "/assets/sprites/player/main-char.json",
  },
  GIRL: {
    //Change in the future from the lyra sprite
    SPRITE_SHEET: "/assets/sprites/pkm/pokemon_gen_2_sprites.png",
    SPRITE_DATA: "/assets/sprites/pkm/cyndaquil.json",
  },
};