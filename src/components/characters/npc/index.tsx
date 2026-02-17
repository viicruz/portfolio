'use client';

//* Libraries imports
import { RigidBody } from "@react-three/rapier";

//* Components imports
// import { SpriteAnimator } from "@/components/sprite-animator";
import { InteractionSphere } from "@/components/interactionSphere";

//* Store imports
import { useDialogStore } from "@/store";

type NpcProps = {
  npcId: string;
  dialogId: string;
}

export function Npc(props: NpcProps) {
  const dialogStore = useDialogStore();
  const handleStartDialog = () => {
    dialogStore.setNpcDialogIntention({
      npcId: props.npcId,
      dialogId: props.dialogId,
    });
  }
  return (
    <InteractionSphere onPlayerEnter={handleStartDialog}>
      <RigidBody colliders="cuboid" mass={1} type="fixed">
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
    </InteractionSphere>
  )
}