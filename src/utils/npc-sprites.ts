type NpcSpriteData = {
  SPRITE_SHEET: string;
  SPRITE_DATA: string;
};

const NPCs = ["elm", "silver", "fatguy"] as const;
const SPRITE_DATA = "/assets/sprites/npcs/npc.json";

export const NPC_SPRITES: Record<Uppercase<typeof NPCs[number]>, NpcSpriteData> = {
  ELM: {
    SPRITE_SHEET: "/assets/sprites/npcs/professor-elm.png",
    SPRITE_DATA,
  },
  SILVER: {
    SPRITE_SHEET: "/assets/sprites/npcs/silver.png",
    SPRITE_DATA,
  },
  FATGUY: {
    SPRITE_SHEET: "/assets/sprites/npcs/fat-guy.png",
    SPRITE_DATA,
  },
};