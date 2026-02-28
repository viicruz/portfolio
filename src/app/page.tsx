"use client";

//* Libraries imports
import { useRef } from "react";
import { useHelper } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

//* Context imports
import { CharacterControls } from "@/contexts/controls";

//* Components imports
import { Scene } from "@/components/scene";
import { Player } from "@/components/characters/player";
import { Npc } from "@/components/characters/npc";

function DirectionalLightWithHelper() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  useHelper(
    lightRef as React.RefObject<THREE.Object3D>,
    THREE.DirectionalLightHelper,
    5,
    "red",
  );
  return (
    <directionalLight
      ref={lightRef}
      castShadow
      position={[-2, 5, 5]}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
    />
  );
}

export default function Home() {
  return (
    <main className="w-full h-svh">
      <Scene>
        <RigidBody type="fixed">
          <mesh position={[0, -1, 0]} receiveShadow>
            <boxGeometry args={[200, 0.5, 200]} />
            <meshStandardMaterial color="gray" />
          </mesh>
        </RigidBody>

        <mesh position={[2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
        <mesh position={[4, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
        <mesh position={[6, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
        <CharacterControls>
          <Player />
        </CharacterControls>
        <Npc npcId="npc1" dialogId="dialog1" />

        <ambientLight intensity={0.4} />
        <DirectionalLightWithHelper />

        <EffectComposer>
          <DepthOfField
            focusDistance={10}
            focalLength={5}
            bokehScale={1}
            height={480}
          />
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.3}
            height={300}
          />
          <Vignette eskil={false} offset={0.1} darkness={0.6} />
        </EffectComposer>
      </Scene>
    </main>
  );
}
