"use client";
//* Libraries imports
import React from "react";
import {
  RigidBody,
  type RapierRigidBody,
  CapsuleCollider,
} from "@react-three/rapier";

//* Components imports
import { InteractionSphere } from "@/components/interactionSphere";
import { SpritePlaneAnimator } from "@/components/sprite-plane-animator";

//* Store imports
import { useDialogStore } from "@/store";

//* Hooks imports
import { useNpcMovement } from "@/hooks/use-npc-movement";

//* Utils imports
import { NPC, type NPCName } from "@/utils/npcs";

type NpcProps = {
  name: NPCName;
};

export function Npc(props: NpcProps) {
  const dialogStore = useDialogStore();
  const bodyRef = React.useRef<RapierRigidBody | null>(null);
  const collisionCountRef = React.useRef(0);
  const npcData = React.useMemo(() => NPC[props.name], [props.name]);

  const setBodyRef = React.useCallback((b: RapierRigidBody | null) => {
    bodyRef.current = b;
  }, []);

  const movementControls = useNpcMovement(bodyRef, npcData.behavior);

  const handleCollisionEnter = React.useCallback(() => {
    collisionCountRef.current += 1;
    movementControls.pause();
  }, [movementControls]);

  const handleCollisionExit = React.useCallback(() => {
    collisionCountRef.current = Math.max(0, collisionCountRef.current - 1);

    if (collisionCountRef.current === 0) {
      movementControls.resume();
    }
  }, [movementControls]);

  const handleStartDialog = () => {
    dialogStore.setNpcDialogIntention({
      npcId: npcData.id,
      dialogId: npcData.dialogId,
    });
  };
  const handlePlayerExit = () => {
    dialogStore.setDialogNull();
  };
  return (
    <RigidBody
      ref={setBodyRef}
      colliders="cuboid"
      mass={1}
      type={npcData.behavior.kind === "patrol" ? "kinematicPosition" : "fixed"}
      position={npcData.position ?? [0, 0, 0]}
      onCollisionEnter={handleCollisionEnter}
      onCollisionExit={handleCollisionExit}
    >
      <InteractionSphere
        asChild
        onPlayerEnter={handleStartDialog}
        onPlayerExit={handlePlayerExit}
      />

      <mesh position={[0, 0, 0]}>
        <CapsuleCollider args={[0.5, 0.5]} />
      </mesh>

      <SpritePlaneAnimator
        texturePath={npcData.sprite.sheet}
        spriteDataUrl={npcData.sprite.data}
        animationName="walk_right"
        fps={1}
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
        alphaTest={0.01}
        brightness={1}
      />
    </RigidBody>
  );
}
