"use client";

//* Libraries imports
import { RigidBody } from "@react-three/rapier";

//* Context imports
import { CharacterControls } from "@/contexts/controls";

//* Components imports
import { Scene } from "@/components/scene";
import { Player } from "@/components/characters/player";
import { InteractionSphere } from "@/components/interactionSphere";

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
        <InteractionSphere>
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
        <CharacterControls>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />

          <Player />
        </CharacterControls>
      </Scene>
    </main>
  );
}
