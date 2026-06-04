//* Schemas imports
import type { NPCData } from "@/schemas/npc";

export const SILVER_DATA: NPCData = {
  id: "silver",
  name: "Silver",
  dialogId: "dialog1",
  position: [0, 0, 0],
  sprite: {
    sheet: "/assets/sprites/npcs/silver.png",
    data: "/assets/sprites/npcs/npc.json",
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
