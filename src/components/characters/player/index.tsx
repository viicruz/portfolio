//*Libraries imports
import * as THREE from "three";
import React from "react";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";

//* Hooks imports
import { useFollowCamera } from "@/hooks/useFollowCamera"
import { usePlayerMovement } from "@/hooks/usePlayerMovement";


const SPEED = 2.5;

export function Player() {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const bodyRef = React.useRef<RapierRigidBody | null>(null);
  
  //@ts-expect-error
  useFollowCamera(meshRef, {
    offset: new THREE.Vector3(0, 4, 8),
    lerp: 0.1,
  })
  
  usePlayerMovement(bodyRef, { speed: SPEED });

  return (
    <RigidBody ref={bodyRef} colliders="cuboid" mass={1} type="dynamic">
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  </RigidBody>
  );
}