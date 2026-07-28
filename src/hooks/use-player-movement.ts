"use client";

//* Libraries imports

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import type { RapierRigidBody } from "@react-three/rapier";

//* Context imports
import { Controls } from "@/contexts/controls";

//* Hooks imports
import { usePageVisibility } from "@/hooks/use-page-visibility";

//* Store imports
import { useDialogStore } from "@/store";
import { useGameMenuStore } from "@/store/game-menu";

export type PlayerMovementOptions = {
  speed?: number;
};

export function usePlayerMovement(
  ref: RefObject<RapierRigidBody | null>,
  options?: PlayerMovementOptions,
) {
  const speed = options?.speed ?? 2.5;
  const [, getKeys] = useKeyboardControls<Controls>();
  const isActiveRef = useRef(true);
  const setGlobalPlayerPosition = useDialogStore(
    (state) => state.setGlobalPlayerPosition,
  );
  const menuScreen = useGameMenuStore((state) => state.screen);
  const isOnDialog = useDialogStore((state) => state.isOnDialog);

  const zeroVelocity = () => {
    const body = ref.current;
    if (!body) return;
    const currentY = body.linvel().y;
    body.setLinvel({ x: 0, y: currentY, z: 0 }, true);

    const keys = getKeys();
    Object.keys(keys).forEach((key) => {
      keys[key as Controls] = false;
    });
  };

  usePageVisibility({
    onVisibilityChange: (isVisible) => {
      isActiveRef.current = !!isVisible;
      if (!isVisible) zeroVelocity();
    },
    onBlur: () => {
      isActiveRef.current = false;
      zeroVelocity();
    },
    onFocus: () => {
      isActiveRef.current = true;
      zeroVelocity();
    },
  });

  useFrame(() => {
    if (!ref.current) return;

    const body = ref.current;
    //log player position
    // const position = body.translation();
    // console.log("Player position:", position.x, position.y, position.z);

    if (!isActiveRef.current) {
      const currentY = body.linvel().y;
      body.setLinvel({ x: 0, y: currentY, z: 0 }, true);
      zeroVelocity();
      return;
    }

    if (menuScreen !== "closed" || isOnDialog) {
      const currentY = body.linvel().y;
      body.setLinvel({ x: 0, y: currentY, z: 0 }, true);
      zeroVelocity();
      return;
    }

    const key = getKeys();

    const sprint = key[Controls.Sprint] ? 2 : 1;
    const velocity = speed * sprint;

    let x = 0;
    let z = 0;
    if (key[Controls.Up] && isActiveRef.current) z -= velocity;
    if (key[Controls.Down] && isActiveRef.current) z += velocity;
    if (key[Controls.Left] && isActiveRef.current) x -= velocity;
    if (key[Controls.Right] && isActiveRef.current) x += velocity;

    //* Normalize diagonal movement
    const length = Math.sqrt(x * x + z * z);
    if (length > 0) {
      x = (x / length) * velocity;
      z = (z / length) * velocity;
    }

    const currentY = body.linvel().y;

    body.setLinvel({ x, y: currentY, z }, true);
    setGlobalPlayerPosition([
      body.translation().x,
      body.translation().y,
      body.translation().z,
    ]);
  });
}
