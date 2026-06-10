//* Schemas imports
import type { NPCData } from "@/schemas/npc";
import { NPC_SPRITES } from "@/utils/npc-sprites";

export const FAT_GUY_DATA: NPCData = {
  id: "fat-guy",
  name: "Fat Guy",
  dialogId: "dialog1",
  position: [10, 0, 0],
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
        { position: [10, 0, 0], waitMs: 500 },
        { position: [10, 0, 20], waitMs: 500 },
        { position: [10, 0, 20], waitMs: 500 },
        { position: [10, 0, 0], waitMs: 500 },
      ],
    },
  },
};
