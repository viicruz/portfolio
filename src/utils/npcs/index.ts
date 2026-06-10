//* Utils imports
import { PROFESSOR_ELM_DATA } from "./professor-elm";
import { SILVER_DATA } from "./silver";
import { FAT_GUY_DATA } from "./fat-guy";

export const NPC = {
  PROFESSOR_ELM: PROFESSOR_ELM_DATA,
  SILVER: SILVER_DATA,
  FATGUY: FAT_GUY_DATA,
};

export type NPCType = typeof NPC;
export type NPCName = keyof NPCType;
