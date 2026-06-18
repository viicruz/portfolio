//* Schemas imports
import type { NPCData } from "@/schemas/npc";
import { NPC_SPRITES } from "@/utils/npc-sprites";

export const FAT_GUY_DATA: NPCData = {
  id: "fat-guy",
  name: "Fat Guy",
  dialogId: "dialog1",
  position: [2, 0, 0],
  sprite: {
    sheet: NPC_SPRITES.FATGUY.SPRITE_SHEET,
    data: NPC_SPRITES.FATGUY.SPRITE_DATA,
  },
  behavior: {
    kind: "patrol",
    route: {
      localSpace: true,
      loop: true,
      startIndex: 0,
      points: [
        { position: [0, 0, 0], waitMs: 500 },
        { position: [4, 0, 0], waitMs: 1000 },
        { position: [4, 0, 4], waitMs: 2000 },
        { position: [0, 0, 4], waitMs: 1000 },
        { position: [0, 0, 0], waitMs: 500 },
      ],
    },
  },
};
