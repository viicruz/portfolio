import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import type { RapierRigidBody } from "@react-three/rapier";
import { Controls } from "@/contexts/controls";

export type PlayerMovementOptions = {
  speed?: number;
};

export function usePlayerMovement(
  ref: RefObject<RapierRigidBody | null>,
  options?: PlayerMovementOptions,
) {
  const speed = options?.speed ?? 2.5;
  const [, getKeys] = useKeyboardControls<Controls>();

  useFrame(() => {
    if (!ref.current) return;

    const body = ref.current;
    const key = getKeys();

    const sprint = key[Controls.Sprint] ? 2 : 1;
    const velocity = speed * sprint;

    let x = 0;
    let z = 0;

    if (key[Controls.Up]) z -= velocity;
    if (key[Controls.Down]) z += velocity;
    if (key[Controls.Left]) x -= velocity;
    if (key[Controls.Right]) x += velocity;

    const currentY = body.linvel().y;

    body.setLinvel({ x, y: currentY, z }, true);
  });
}
