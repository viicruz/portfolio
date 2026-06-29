//* Schemas imports
import type { NPCData } from "@/schemas/npc";
import { NPC_SPRITES } from "@/utils/npc-sprites";

export const SILVER_DATA: NPCData = {
  id: "silver_devlog",
  name: "Silver",
  dialogId: "dialog1",
  position: [-12, 0, 0],
  sprite: {
    sheet: NPC_SPRITES.SILVER.SPRITE_SHEET,
    data: NPC_SPRITES.SILVER.SPRITE_DATA,
  },
  behavior: {
    kind: "patrol",
    route: {
      localSpace: true,
      loop: true,
      startIndex: 0,
      points: [
        { position: [0.1, 0, 0], waitMs: Infinity},
      ],
    },
  },
};
