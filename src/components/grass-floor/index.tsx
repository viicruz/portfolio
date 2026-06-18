"use client";

//* Libraries imports
import { useTexture } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

const FLOOR_WIDTH = 200;
const FLOOR_DEPTH = 200;
const FLOOR_HEIGHT = 0.5;
const FLOOR_Y = -1;
const TEXTURE_PATH = "/assets/textures/grass-floor.png";

export function GrassFloor() {
  const texture = useTexture(TEXTURE_PATH, (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(FLOOR_WIDTH, FLOOR_DEPTH);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
  });

  return (
    <RigidBody type="fixed">
      <mesh position={[0, FLOOR_Y, 0]} receiveShadow>
        <boxGeometry args={[FLOOR_WIDTH, FLOOR_HEIGHT, FLOOR_DEPTH]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </RigidBody>
  );
}

useTexture.preload(TEXTURE_PATH);
