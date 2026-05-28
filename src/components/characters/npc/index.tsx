'use client';

//* Libraries imports
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { useNpcMovement, type NpcBehavior } from "@/hooks/use-npc-movement";

//* Components imports
// import { SpriteAnimator } from "@/components/sprite-animator";
import { InteractionSphere } from "@/components/interactionSphere";

//* Store imports
import { useDialogStore } from "@/store";

type NpcProps = {
  npcId: string;
  dialogId: string;
  behavior?: NpcBehavior;
  position?: [number, number, number];
}

export function Npc(props: NpcProps) {
  console.log("Rendering Npc", props.npcId, "with behavior", props.behavior);
  const dialogStore = useDialogStore();
  const bodyRef = useRef<RapierRigidBody | null>(null);

  const setBodyRef = (b: RapierRigidBody | null) => {
    bodyRef.current = b;
    // debug: log when body attached
    // eslint-disable-next-line no-console
    console.debug("Npc: body ref set", props.npcId, b != null);
  };

  // attach movement behavior if provided
  useNpcMovement(bodyRef, props.behavior);
  const handleStartDialog = () => {
    dialogStore.setNpcDialogIntention({
      npcId: props.npcId,
      dialogId: props.dialogId,
    });
  }
  const handlePlayerExit = () => {
    dialogStore.setDialogNull();
  }
  return (
    <RigidBody
      ref={bodyRef}
      colliders="cuboid"
      mass={1}
      type={props.behavior ? "kinematicPosition" : "fixed"}
      position={props.position ?? [0, 0, 0]}
    >
      <InteractionSphere asChild onPlayerEnter={handleStartDialog} onPlayerExit={handlePlayerExit} />

      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="blue" />
      </mesh>

      {/* <SpriteAnimator
          scale={[4, 4, 4]}
          position={[0, 0, 0]}
          frameName="idle"
          fps={24}
          animationNames={["idle", "celebration"]}
          autoPlay={true}
          loop={true}
          alphaTest={0.01}
          textureImageURL={"/assets/boy-hash.png"}
          textureDataURL={"/assets/boy-hash.json"}
        /> */}

    </RigidBody>
  );
}