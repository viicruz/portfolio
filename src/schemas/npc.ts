export type NPCBehavior = {
  kind: "patrol";
  route: {
    localSpace: boolean;
    loop: boolean;
    startIndex: number;
    points: { position: [number, number, number]; waitMs?: number }[];
  }
}

export type NPCData = {
  id: string;
  name: string;
  dialogId: string;

  position?: [number, number, number];

  behavior: NPCBehavior;

  sprite: {
    sheet: `${string}.png`;
    data: `${string}.json`;
  }
};