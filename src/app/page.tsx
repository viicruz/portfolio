"use client";
//* Libraries imports
import * as THREE from "three";
import { SpriteAnimator, useSpriteLoader } from "@react-three/drei";

//* Components imports
import { Scene } from "@/components/scene";
import { CharacterControls } from "@/contexts/controls";
import { Player } from "@/components/characters/player";

function MainCharSprite() {
  const { spriteObj } = useSpriteLoader(
    "/assets/main-char-transparent.png",
    "/assets/main-char.json",
    ["idle"],
    undefined,
    (texture) => {
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
    }
  );

  if (!spriteObj) return null;

  return (
    <SpriteAnimator
      scale={[4, 4, 4]}
      position={[-5, 0, 0]}
      frameName="idle"
      fps={24}
      animationNames={["idle"]}
      autoPlay={true}
      loop={true}
      alphaTest={0.01}
      spriteDataset={spriteObj}
    />
  );
}

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

          <MainCharSprite />

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
