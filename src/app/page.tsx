"use client";
//* Libraries imports
import * as THREE from "three";
import { SpriteAnimator, useSpriteLoader } from "@react-three/drei";

//* Components imports
import { Scene } from "@/components/scene";
import { CharacterControls } from "@/contexts/controls";
import { Player } from "@/components/characters/player";

enum MAIN_CHAR_ANIMATIONS {
  IDLE_DOWN = "idle_down",
  IDLE_UP = "idle_up",
  IDLE_LEFT = "idle_left",
  IDLE_RIGHT = "idle_right",

  WALK_DOWN = "walk_down",
  WALK_UP = "walk_up",
  WALK_LEFT = "walk_left",
  WALK_RIGHT = "walk_right",

  RUN_DOWN = "run_down",
  RUN_UP = "run_up",
  RUN_LEFT = "run_left",
  RUN_RIGHT = "run_right",
}

const MAIN_CHAR_ANIMATION_NAMES = [
  MAIN_CHAR_ANIMATIONS.IDLE_DOWN,
  MAIN_CHAR_ANIMATIONS.IDLE_LEFT,
  MAIN_CHAR_ANIMATIONS.IDLE_RIGHT,
  MAIN_CHAR_ANIMATIONS.IDLE_UP,
  MAIN_CHAR_ANIMATIONS.WALK_DOWN,
  MAIN_CHAR_ANIMATIONS.WALK_LEFT,
  MAIN_CHAR_ANIMATIONS.WALK_UP,
  MAIN_CHAR_ANIMATIONS.WALK_RIGHT,
];

function MainCharSprite() {
  const { spriteObj } = useSpriteLoader(
    "/assets/main-char-transparent.png",
    "/assets/main-char.json",
    MAIN_CHAR_ANIMATION_NAMES,
    undefined,
    (texture) => {
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
    },
  );

  if (!spriteObj) return null;

  return (
    <SpriteAnimator
      scale={[4, 4, 4]}
      position={[-5, 0, 0]}
      frameName={MAIN_CHAR_ANIMATIONS.IDLE_UP}
      fps={6}
      animationNames={MAIN_CHAR_ANIMATION_NAMES}
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
