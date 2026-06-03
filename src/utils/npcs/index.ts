//* Utils imports
import { PROFESSOR_ELM_DATA } from "./professor-elm";
import { SILVER_DATA } from "./silver";

export const NPC = {
  PROFESSOR_ELM: PROFESSOR_ELM_DATA,
  SILVER: SILVER_DATA,
};

export type NPCType = typeof NPC;
export type NPCName = keyof NPCType;