//* Schemas imports
import type { NPCData } from "@/schemas/npc";

export const PROFESSOR_ELM_DATA: NPCData = {
  id: "professor-elm",
  name: "Professor Elm",
  dialogId: "dialog1",
  position: [0, 0, 0],
  sprite: {
    sheet: "/assets/sprites/npcs/professor-elm-background.png",
    data: "/assets/sprites/npcs/npc.json",
  },
  behavior: {
    kind: "patrol",
    route: {
      localSpace: true,
      loop: true,
      startIndex: 0,
      points: [
        { position: [0, 0, 0], waitMs: 500 },
        { position: [0, 0, 3], waitMs: 500 },
        { position: [2, 0, 3], waitMs: 500 },
        { position: [2, 0, 0], waitMs: 500 },
      ],
    },
  },
};