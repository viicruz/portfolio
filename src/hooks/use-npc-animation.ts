"use client";
//* Libraries imports
import { useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";

enum NPC_ANIMATIONS {
  IDLE_UP = "idle_up",
  IDLE_DOWN = "idle_down",
  IDLE_LEFT = "idle_left",
  IDLE_RIGHT = "idle_right",

  WALK_UP = "walk_up",
  WALK_DOWN = "walk_down",
  WALK_LEFT = "walk_left",
  WALK_RIGHT = "walk_right",
}

function getWalkAnimationNameFromDelta(delta: THREE.Vector3) {
  const absX = Math.abs(delta.x);
  const absZ = Math.abs(delta.z);

  if (absX >= absZ) {
    return delta.x >= 0 ? NPC_ANIMATIONS.WALK_RIGHT : NPC_ANIMATIONS.WALK_LEFT;
  }

  return delta.z >= 0 ? NPC_ANIMATIONS.WALK_DOWN : NPC_ANIMATIONS.WALK_UP;
}

function getIdleAnimationFromWalkAnimation(animationName: NPC_ANIMATIONS) {
  switch (animationName) {
    case NPC_ANIMATIONS.WALK_UP:
      return NPC_ANIMATIONS.IDLE_UP;
    case NPC_ANIMATIONS.WALK_DOWN:
      return NPC_ANIMATIONS.IDLE_DOWN;
    case NPC_ANIMATIONS.WALK_LEFT:
      return NPC_ANIMATIONS.IDLE_LEFT;
    case NPC_ANIMATIONS.WALK_RIGHT:
      return NPC_ANIMATIONS.IDLE_RIGHT;
    default:
      return animationName;
  }
}

type UseNpcAnimationResult = {
  animationName: NPC_ANIMATIONS;
  animationFps: number;
  lookAt: (direction: THREE.Vector3) => void;
  clearLookAt: () => void;
};

export function useNpcAnimation(
  bodyRef: RefObject<RapierRigidBody | null>,
): UseNpcAnimationResult {
  const previousPositionRef = useRef(new THREE.Vector3());
  const hasPreviousPositionRef = useRef(false);
  const [lookAtDirection, setLookAtDirection] = useState<NPC_ANIMATIONS | null>(
    null,
  );
  const lastWalkAnimationRef = useRef<NPC_ANIMATIONS>(NPC_ANIMATIONS.WALK_DOWN);
  const [animationName, setAnimationName] = useState<NPC_ANIMATIONS>(
    NPC_ANIMATIONS.IDLE_DOWN,
  );
  const [animationFps, setAnimationFps] = useState(1);

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;
    if (lookAtDirection !== null) {
      setAnimationName(lookAtDirection);
      return;
    }

    const position = body.translation();
    const currentPosition = new THREE.Vector3(
      position.x,
      position.y,
      position.z,
    );

    if (!hasPreviousPositionRef.current) {
      previousPositionRef.current.copy(currentPosition);
      hasPreviousPositionRef.current = true;
      return;
    }

    const movementDelta = currentPosition
      .clone()
      .sub(previousPositionRef.current);
    movementDelta.y = 0;

    const isMoving = movementDelta.lengthSq() > 0.000001;

    if (isMoving) {
      const nextWalkAnimation = getWalkAnimationNameFromDelta(movementDelta);

      lastWalkAnimationRef.current = nextWalkAnimation;
      setAnimationFps((current) => (current === 6 ? current : 6));
      setAnimationName((current) =>
        current === nextWalkAnimation ? current : nextWalkAnimation,
      );
    } else {
      const nextIdleAnimation = getIdleAnimationFromWalkAnimation(
        lastWalkAnimationRef.current,
      );

      setAnimationFps((current) => (current === 1 ? current : 1));
      setAnimationName((current) =>
        current === nextIdleAnimation ? current : nextIdleAnimation,
      );
    }

    previousPositionRef.current.copy(currentPosition);
  });

  const lookAt = (direction: THREE.Vector3) => {
    const absX = Math.abs(direction.x);
    const absZ = Math.abs(direction.z);

    let nextAnimation: NPC_ANIMATIONS;

    if (absX >= absZ) {
      nextAnimation =
        direction.x >= 0 ? NPC_ANIMATIONS.IDLE_RIGHT : NPC_ANIMATIONS.IDLE_LEFT;
    } else {
      nextAnimation =
        direction.z >= 0 ? NPC_ANIMATIONS.IDLE_DOWN : NPC_ANIMATIONS.IDLE_UP;
    }

    setLookAtDirection(nextAnimation);
    setAnimationName(nextAnimation);
  };

  const clearLookAt = () => {
    setLookAtDirection(null);
  };

  return { animationName, animationFps, lookAt, clearLookAt };
}
