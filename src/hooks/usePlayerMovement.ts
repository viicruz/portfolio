//* Libraries imports 
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { Controls } from "@/contexts/controls";
import type { RapierRigidBody } from "@react-three/rapier";

export type PlayerMovementOptions = {
  speed?: number;
};

export function usePlayerMovement(
  ref: RefObject<RapierRigidBody | null>,
  options?: PlayerMovementOptions,
) {
  const speed = options?.speed ?? 2.5;

  const keyboard = useKeyboardControls<Controls>();
  const getKeys = keyboard[1];

  useFrame((_, delta) => {
    if (!ref.current) return;

    const key = getKeys();
    const sprintMultiplier = key[Controls.Sprint] ? 2 : 1;
    const adjustedSpeed = speed * sprintMultiplier;

    // Determine if the ref is a Rapier RigidBody API or a plain Object3D
    const current = ref.current as RapierRigidBody;

    // Move the physics body; children meshes will follow automatically
    const pos = (current as RapierRigidBody).translation();
    let x = pos.x;
    const y = pos.y;
    let z = pos.z;

    if (key[Controls.Up]) {
      z -= adjustedSpeed * delta;
    }
    if (key[Controls.Down]) {
      z += adjustedSpeed * delta;
    }
    if (key[Controls.Left]) {
      x -= adjustedSpeed * delta;
    }
    if (key[Controls.Right]) {
      x += adjustedSpeed * delta;
    }

    (current as RapierRigidBody).setTranslation({ x, y, z }, true);
  });
}
