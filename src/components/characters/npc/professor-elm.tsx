'use client';

//* Components imports
import { Npc } from "@/components/characters/npc";
import { SpritePlaneAnimator } from "@/components/sprite-plane-animator";
import { Suspense } from "react";
import { PLAYER_SPRITES } from "@/utils/player-sprites";


export function ProfessorElm() {
  return (
    <>
      <Npc npcId="npc1" dialogId="dialog1" />
      <Suspense fallback={null}>
        <SpritePlaneAnimator
          texturePath={PLAYER_SPRITES.BOY.SPRITE_SHEET}
          spriteDataUrl={PLAYER_SPRITES.BOY.SPRITE_DATA}
          animationName="idle_down"
          fps={8}
          scale={[1, 1, 1]}
          alphaTest={0.01}
          brightness={1}
        />
      </Suspense>
    </>
  )
}