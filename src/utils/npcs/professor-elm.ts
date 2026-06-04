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
    kind: "none",
  },
};