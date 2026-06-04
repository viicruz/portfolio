//* Type imports
import type { PatrolRoute } from "@/hooks/use-npc-movement";

export type NPCBehavior =
  | { kind: "none" }
  | { kind: "patrol"; route: PatrolRoute };

export type NPCData = {
  id: string;
  name: string;
  dialogId: string;

  position?: [number, number, number];

  behavior: NPCBehavior;

  sprite: {
    sheet: `${string}.png` | string;
    data: `${string}.json` | string;
  };
};
