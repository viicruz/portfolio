"use client";

//*Components imports
import { Scene } from "@/components/scene";
import { CharacterControls } from "@/contexts/controls";
import { Player } from "@/components/characters/player";
import { RigidBody } from "@react-three/rapier";


export default function Home() {
  return (
    <main className="w-full h-svh">
      <Scene>
        <RigidBody type="fixed">
          <mesh position={[0, -1, 0]}>
            <boxGeometry args={[10, 0.5, 10]} />
            <meshBasicMaterial color="gray" />
          </mesh>
        </RigidBody>
        <RigidBody colliders="cuboid" mass={1} type="fixed">
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="orange" />
          </mesh>
        </RigidBody>
        <RigidBody colliders="cuboid" mass={1} type="fixed">
          <mesh position={[2, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="blue" />
          </mesh>
        </RigidBody>
        <CharacterControls>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />

          <Player />
        </CharacterControls>

      </Scene>
    </main>
  );
}
