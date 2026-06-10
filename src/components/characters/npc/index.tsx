"use client";
//* Libraries imports
import React from "react";
import {
  RigidBody,
  type RapierRigidBody,
  CapsuleCollider,
} from "@react-three/rapier";
import * as THREE from "three";

//* Components imports
import { InteractionSphere } from "@/components/interactionSphere";
import { SpritePlaneAnimator } from "@/components/sprite-plane-animator";

//* Store imports
import { useDialogStore } from "@/store";

//* Hooks imports
import { useNpcMovement } from "@/hooks/use-npc-movement";
import { useNpcAnimation } from "@/hooks/use-npc-animation";

//* Utils imports
import { NPC, type NPCName } from "@/utils/npcs";

type NpcProps = {
  name: NPCName;
};

export function Npc(props: NpcProps) {
  const dialogStore = useDialogStore();
  const playerPosition = useDialogStore((state) => state.globalPlayerPosition);
  const bodyRef = React.useRef<RapierRigidBody | null>(null);
  const collisionCountRef = React.useRef(0);
  const npcData = React.useMemo(() => NPC[props.name], [props.name]);

  const setBodyRef = React.useCallback((b: RapierRigidBody | null) => {
    bodyRef.current = b;
  }, []);

  const movementControls = useNpcMovement(bodyRef, npcData.behavior);
  const npcAnimation = useNpcAnimation(bodyRef);

  const handleCollisionEnter = React.useCallback(() => {
    collisionCountRef.current += 1;
    movementControls.pause();
  }, [movementControls]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <this useEffect does not need to re-run when npcAnimation or bodyRef changes>
  React.useEffect(() => {
    // compute the vector from the NPC to the player and make the NPC look in that direction
    const isTalkingToThisNpc = dialogStore.npcId === npcData.id;
    if (!playerPosition || !isTalkingToThisNpc) return;

    const npcPosition = bodyRef.current?.translation();
    if (!npcPosition) return;

    const directionToPlayer = new THREE.Vector3(
      playerPosition[0] - npcPosition.x,
      0,
      playerPosition[2] - npcPosition.z,
    );

    npcAnimation.lookAt(directionToPlayer);

    // if player starts a dialog with the npc, pause the npc movement so it doesn't interfere with the dialog
    movementControls.pause();
  }, [dialogStore.isOnDialog]);

  const handleCollisionExit = React.useCallback(() => {
    collisionCountRef.current = Math.max(0, collisionCountRef.current - 1);

    if (collisionCountRef.current === 0) {
      movementControls.resume();
      npcAnimation.clearLookAt();
    }
  }, [movementControls, npcAnimation]);

  const handleSetIntentionDialog = () => {
    dialogStore.setNpcDialogIntention({
      npcId: npcData.id,
      dialogId: npcData.dialogId,
    });
  };
  const handlePlayerExit = () => {
    dialogStore.setDialogNull();
    npcAnimation.clearLookAt();
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
        onPlayerEnter={handleSetIntentionDialog}
        onPlayerExit={handlePlayerExit}
      />

      <mesh position={[0, 0, 0]}>
        <CapsuleCollider args={[0.5, 0.5]} />
      </mesh>

      <SpritePlaneAnimator
        texturePath={npcData.sprite.sheet}
        spriteDataUrl={npcData.sprite.data}
        animationName={npcAnimation.animationName}
        fps={6}
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
        alphaTest={0.01}
        brightness={1}
      />
    </RigidBody>
  );
}
