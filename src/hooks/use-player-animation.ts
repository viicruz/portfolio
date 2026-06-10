import { useState, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import type { RapierRigidBody } from "@react-three/rapier";
import { Controls } from "@/contexts/controls";
import { useGameMenuStore } from "@/store/game-menu";
import { useDialogStore } from "@/store";

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

export function usePlayerAnimation(bodyRef: RefObject<RapierRigidBody | null>) {
  const [, getKeys] = useKeyboardControls<Controls>();
  const [direction, setDirection] = useState<PlayerDirection>(
    PlayerDirection.DOWN,
  );
  const [movementState, setMovementState] = useState<PlayerMovementState>(
    PlayerMovementState.IDLE,
  );
  const menuScreen = useGameMenuStore((state) => state.screen);
  const isOnDialog = useDialogStore((state) => state.isOnDialog);
  
  useFrame(() => {
    if (!bodyRef.current) return;

    const keys = getKeys();
    const isSprinting = keys[Controls.Sprint];
    const isMoving =
      keys[Controls.Up] ||
      keys[Controls.Down] ||
      keys[Controls.Left] ||
      keys[Controls.Right];

    const nextMovementState = !isMoving
      ? PlayerMovementState.IDLE
      : isSprinting
        ? PlayerMovementState.RUN
        : PlayerMovementState.WALK;

    let nextDirection: PlayerDirection;
    if (keys[Controls.Up]) {
      nextDirection = PlayerDirection.UP;
    } else if (keys[Controls.Down]) {
      nextDirection = PlayerDirection.DOWN;
    } else if (keys[Controls.Left]) {
      nextDirection = PlayerDirection.LEFT;
    } else if (keys[Controls.Right]) {
      nextDirection = PlayerDirection.RIGHT;
    } else {
      nextDirection = direction;
    }

    if (menuScreen !== "closed" || isOnDialog) {
      if (movementState !== PlayerMovementState.IDLE) {
        setMovementState(PlayerMovementState.IDLE);
      }
      return;
    }

    setMovementState((prev) =>
      prev !== nextMovementState ? nextMovementState : prev,
    );
    setDirection((prev) => (prev !== nextDirection ? nextDirection : prev));
  });

  return { direction, movementState };
}
