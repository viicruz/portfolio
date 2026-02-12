import { useState, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import type { RapierRigidBody } from "@react-three/rapier";
import { Controls } from "@/contexts/controls";

export enum PlayerDirection {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

export enum PlayerMovementState {
  IDLE = "idle",
  WALK = "walk",
  RUN = "run",
}

export function usePlayerAnimation(
  bodyRef: RefObject<RapierRigidBody | null>,
) {
  const [, getKeys] = useKeyboardControls<Controls>();
  const [direction, setDirection] = useState<PlayerDirection>(
    PlayerDirection.DOWN,
  );
  const [movementState, setMovementState] = useState<PlayerMovementState>(
    PlayerMovementState.IDLE,
  );

  useFrame(() => {
    if (!bodyRef.current) return;

    const keys = getKeys();
    const isSprinting = keys[Controls.Sprint];
    const isMoving =
      keys[Controls.Up] ||
      keys[Controls.Down] ||
      keys[Controls.Left] ||
      keys[Controls.Right];

    // Determine movement state
    if (!isMoving) {
      setMovementState(PlayerMovementState.IDLE);
    } else if (isSprinting) {
      setMovementState(PlayerMovementState.RUN);
    } else {
      setMovementState(PlayerMovementState.WALK);
    }

    // Determine direction (prioritize vertical movement over horizontal)
    if (keys[Controls.Up]) {
      setDirection(PlayerDirection.UP);
    } else if (keys[Controls.Down]) {
      setDirection(PlayerDirection.DOWN);
    } else if (keys[Controls.Left]) {
      setDirection(PlayerDirection.LEFT);
    } else if (keys[Controls.Right]) {
      setDirection(PlayerDirection.RIGHT);
    }
  });

  return { direction, movementState };
}
