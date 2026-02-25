"use client";

//* Libraries imports
import { RigidBody } from "@react-three/rapier";

//* Context imports
import { CharacterControls } from "@/contexts/controls";

//* Components imports
import { Scene } from "@/components/scene";
import { Player } from "@/components/characters/player";
import { Npc } from "@/components/characters/npc";

export default function Home() {

  return (
    <main className="w-full h-svh">
      <Scene>
        <RigidBody type="fixed">
          <mesh position={[0, -1, 0]}>
            <boxGeometry args={[200, 0.5, 200]} />
            <meshBasicMaterial color="gray" />
          </mesh>
        </RigidBody>
        <CharacterControls>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />

          <Player />
        </CharacterControls>
        <Npc npcId="npc1" dialogId="dialog1" />
      </Scene>
    </main>
  );
}
