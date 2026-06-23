"use client";

//* Libraries imports
import { useMemo, useRef, Fragment } from "react";
import { useHelper } from "@react-three/drei";
import type { RapierRigidBody } from "@react-three/rapier";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

//* Context imports
import { CharacterControls } from "@/contexts/controls";

//* Store imports
import { useGameMenuStore } from "@/store/game-menu";

//* Components imports
import { Scene } from "@/components/scene";
import { Player } from "@/components/characters/player";
import { FollowerPkm } from "@/components/characters/follower-pkm";
import { Npc } from "@/components/characters/npc";
import { PkmCenter } from "@/components/pkm-center";
import { Forest } from "@/components/forest";
import { GrassFloor } from "@/components/grass-floor";
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
      position={[-100, 200, 200]}
      shadow-mapSize-width={2048*5}
      shadow-mapSize-height={2048*5}
      shadow-camera-left={-100}
      shadow-camera-right={100}
      shadow-camera-top={100}
      shadow-camera-bottom={-100}
    />
  );
}

export default function Home() {
  const hardwareInfo = useHardwareThreeSupport();
  const playerBodyRef = useRef<RapierRigidBody | null>(null);
  const partyOrder = useGameMenuStore((state) => state.partyOrder);
  const leadPokemon = partyOrder[0];

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
        <GrassFloor />

        <PkmCenter position={[0, -1, -4]} scale={0.25} />
        {/* <Tree position={[2, -0.749, 0]} scale={1.25} /> */}
        {/* <Tree position={[-5, -0.749, -4]} scale={1.25} /> */}
        {/* <Tree position={[0, -0.749, -6]} scale={1.25} /> */}
        {/* <Tree position={[3, -0.749, -6]} scale={1.25} /> */}
        <Forest baseY={-0.749}/>
        <CharacterControls>
          <Player playerBodyRef={playerBodyRef} />
          <FollowerPkm
            scale={[1.5, 1.2, 1.5]}
            playerBodyRef={playerBodyRef}
            pokemonKey={leadPokemon}
          />
        </CharacterControls>
        {/* <Npc npcId="npc1" dialogId="dialog1" /> */}
        <Npc name="PROFESSOR_ELM" />
        {/* Example NPC with patrol behavior (local square route) */}
        <Npc name="FATGUY" />

        <ambientLight intensity={0.4} />
        <DirectionalLightWithHelper />

        {effectToggles.postprocessing && (
          <EffectComposer>
            {effectToggles.depthOfField ? (
              <DepthOfField
                focusDistance={16}
                focalLength={5}
                bokehScale={1}
                height={480}
              />
            ) : (
              <Fragment />
            )}
            {effectToggles.bloom ? (
              <Bloom
                luminanceThreshold={0.2}
                luminanceSmoothing={0.3}
                height={300}
              />
            ) : (
              <Fragment />
            )}
            {effectToggles.vignette ? (
              <Vignette eskil={false} offset={0.1} darkness={0.6} />
            ) : (
              <Fragment />
            )}
          </EffectComposer>
        )}
      </Scene>
    </main>
  );
}
