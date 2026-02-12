"use client";
//* Components imports
import { Scene } from "@/components/scene";
import { CharacterControls } from "@/contexts/controls";
import { Player } from "@/components/characters/player";
import { RigidBody } from "@react-three/rapier";

import { useTranslations } from "next-intl"


export default function Home() {
  const t = useTranslations("hello")

  return (
    <main className="w-full h-svh">
      <div>{t("banana")}</div>
      <Scene>
        <RigidBody type="fixed">
          <mesh position={[0, -1, 0]}>
            <boxGeometry args={[10, 0.5, 10]} />
            <meshBasicMaterial color="gray" />
          </mesh>
        </RigidBody>
        <RigidBody onIntersectionEnter={()=>{console.log('aiauiaia')}} sensor colliders="cuboid" mass={1} type="fixed">
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="black" />
          </mesh>
        </RigidBody>
        <RigidBody colliders="cuboid" mass={1} type="fixed">
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
