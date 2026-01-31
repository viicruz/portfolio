//*Libraries imports
import type * as THREE from "three";
import React from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";


//*Components imports
import { Controls } from "@/contexts/controls";


export function Player() {
  const ref = React.useRef<THREE.Mesh>(null);
  const keyboard = useKeyboardControls<Controls>();
  const getKeys = keyboard[1];

  const speed = 2.5;
  

  
  useFrame((_, delta) => {
    if (!ref.current) return;
    const key = getKeys();
    const sprintMultiplier = key[Controls.Sprint] ? 2 : 1;

    const adjustedSpeed = speed * sprintMultiplier;
    
    
    if (key[Controls.Up]) {
      ref.current.position.y += adjustedSpeed * delta;
    }
    if (key[Controls.Down]) {
      ref.current.position.y -= adjustedSpeed * delta;
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