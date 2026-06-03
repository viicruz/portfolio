"use client";

//* Libraries imports
import { useMemo, useRef } from "react";
import { useHelper } from "@react-three/drei";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
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
import { FollowerPkm } from "@/components/characters/follower-pkm";
import { Npc } from "@/components/characters/npc";
import { useHardwareThreeSupport } from "@/hooks/use-hardware-three-support";

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
  const hardwareInfo = useHardwareThreeSupport();
  const playerBodyRef = useRef<RapierRigidBody | null>(null);

  const effectToggles = useMemo(() => {
    const effectiveTier =
      hardwareInfo.tier === "unknown" ? "low" : hardwareInfo.tier;

    // set effectiveTier hardcoded to "low" for debug purposes
    // const effectiveTier = "medium";

    if (effectiveTier === "high") {
      return {
        postprocessing: true,
        depthOfField: true,
        bloom: true,
        vignette: true,
      };
    }

    if (effectiveTier === "medium") {
      return {
        postprocessing: true,
        depthOfField: false,
        bloom: true,
        vignette: true,
      };
    }

    return {
      postprocessing: false,
      depthOfField: false,
      bloom: false,
      vignette: false,
    };
  }, [hardwareInfo.tier]);

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
          <Player playerBodyRef={playerBodyRef} />
          <FollowerPkm scale={[1, 0.8, 1]} playerBodyRef={playerBodyRef} />
        </CharacterControls>
        <Npc npcId="npc1" dialogId="dialog1" />

        {/* Example NPC with patrol behavior (local square route) */}
        <Npc
          npcId="npc2"
          dialogId="dialog1"
          position={[8, 0, 0]}
          behavior={{
            kind: "patrol",
            route: {
              localSpace: true,
              loop: true,
              startIndex: 0,
              points: [
                { position: [0, 0, 0], waitMs: 500 },
                { position: [0, 0, 3], waitMs: 500 },
                { position: [2, 0, 3], waitMs: 500 },
                { position: [2, 0, 0], waitMs: 500 },
              ],
            },
          }}
        />

        <ambientLight intensity={0.4} />
        <DirectionalLightWithHelper />

        {effectToggles.postprocessing && (
          <EffectComposer>
            <>
              {effectToggles.depthOfField && (
                <DepthOfField
                  focusDistance={10}
                  focalLength={5}
                  bokehScale={1}
                  height={480}
                />
              )}
              {effectToggles.bloom && (
                <Bloom
                  luminanceThreshold={0.2}
                  luminanceSmoothing={0.3}
                  height={300}
                />
              )}
              {effectToggles.vignette && (
                <Vignette eskil={false} offset={0.1} darkness={0.6} />
              )}
            </>
          </EffectComposer>
        )}
      </Scene>
    </main>
  );
}
