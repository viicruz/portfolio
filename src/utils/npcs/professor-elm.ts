//* Schemas imports
import type { NPCData } from "@/schemas/npc";
import { NPC_SPRITES } from "@/utils/npc-sprites";

export const PROFESSOR_ELM_DATA: NPCData = {
  id: "professor-elm",
  name: "Professor Elm",
  dialogId: "dialog1",
  position: [0, 0, 0],
  sprite: {
    sheet: NPC_SPRITES.ELM.SPRITE_SHEET,
    data: NPC_SPRITES.ELM.SPRITE_DATA,
  },
  behavior: {
    kind: "none",
  },
};