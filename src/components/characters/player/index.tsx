//*Libraries imports
import * as THREE from "three";
import React from "react";
// removed unused imports after refactor

//* Hooks imports
import { useFollowCamera } from "@/hooks/useFollowCamera";
import { usePlayerMovement } from "@/hooks/usePlayerMovement";

export function Player() {
  const ref = React.useRef<THREE.Mesh>(null);
  const speed = 2.5;
  
  //@ts-expect-error
  useFollowCamera(ref, {
    offset: new THREE.Vector3(0, 4, 8),
    lerp: 0.1,
  })
  
  usePlayerMovement(ref, { speed });

  return (
    <mesh ref={ref} position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}