//*Libraries imports
import * as THREE from "three";
import React from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";

//*Components imports
import { Controls } from "@/contexts/controls";

//* Hooks imports
import { useFollowCamera } from "@/hooks/useFollowCamera";

export function Player() {
  const ref = React.useRef<THREE.Mesh>(null);
  const keyboard = useKeyboardControls<Controls>();
  const getKeys = keyboard[1];

  const speed = 2.5;
  
  //@ts-expect-error
  useFollowCamera(ref, {
    offset: new THREE.Vector3(0, 4, 8),
    lerp: 0.1,
  })
  
  useFrame((_, delta) => {
    if (!ref.current) return;
    const key = getKeys();
    const sprintMultiplier = key[Controls.Sprint] ? 2 : 1;

    const adjustedSpeed = speed * sprintMultiplier;
    
    
    if (key[Controls.Up]) {
      ref.current.position.z -= adjustedSpeed * delta;
    }
    if (key[Controls.Down]) {
      ref.current.position.z += adjustedSpeed * delta;
    }
    if (key[Controls.Left]) {
      ref.current.position.x -= adjustedSpeed * delta;
    }
    if (key[Controls.Right]) {
      ref.current.position.x += adjustedSpeed * delta;
    }
    
  });

  return (
    <mesh ref={ref} position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}