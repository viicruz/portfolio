"use client";

//*Components imports
import { Scene } from "@/components/scene";
import { CharacterControls } from "@/contexts/controls";
import { Player } from "@/components/characters/player";

export default function Home() {
  return (
    <main className="w-full h-svh">
      <Scene>
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="orange" />
          </mesh>
          <mesh position={[2, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="blue" />
          </mesh>

          <CharacterControls>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} />

            <Player />
          </CharacterControls>
        </group>
      </Scene>
    </main>
  );
}
