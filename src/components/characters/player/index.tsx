//* Libraries imports
import * as THREE from "three";
import React, { Suspense } from "react";
import {
  RigidBody,
  type RapierRigidBody,
  CapsuleCollider,
} from "@react-three/rapier";

//* Components imports
import { SpritePlaneAnimator } from "@/components/sprite-plane-animator";

//* Hooks imports
import { useFollowCamera } from "@/hooks/use-follow-camera";
import { useDialogAdvance } from "@/hooks/use-dialog-advance";
import { usePlayerMovement } from "@/hooks/use-player-movement";
import {
  usePlayerAnimation,
  PlayerDirection,
  PlayerMovementState,
} from "@/hooks/use-player-animation";

const SPEED = 2.5;

enum MAIN_CHAR_ANIMATIONS {
  IDLE_DOWN = "idle_down",
  IDLE_UP = "idle_up",
  IDLE_LEFT = "idle_left",
  IDLE_RIGHT = "idle_right",

  WALK_DOWN = "walk_down",
  WALK_UP = "walk_up",
  WALK_LEFT = "walk_left",
  WALK_RIGHT = "walk_right",

  RUN_DOWN = "run_down",
  RUN_UP = "run_up",
  RUN_LEFT = "run_left",
  RUN_RIGHT = "run_right",
}

function getAnimationName(
  direction: PlayerDirection,
  movementState: PlayerMovementState,
): MAIN_CHAR_ANIMATIONS {
  const directionMap = {
    [PlayerDirection.UP]: "UP",
    [PlayerDirection.DOWN]: "DOWN",
    [PlayerDirection.LEFT]: "LEFT",
    [PlayerDirection.RIGHT]: "RIGHT",
  };

  const stateMap = {
    [PlayerMovementState.IDLE]: "IDLE",
    [PlayerMovementState.WALK]: "WALK",
    [PlayerMovementState.RUN]: "RUN",
  };

  const animationKey =
    `${stateMap[movementState]}_${directionMap[direction]}` as keyof typeof MAIN_CHAR_ANIMATIONS;
  return MAIN_CHAR_ANIMATIONS[animationKey] || MAIN_CHAR_ANIMATIONS.IDLE_DOWN;
}

/**
 * Compute the distance of the camera from the player based on the cosine of the angle of the camera and distance from the player
 *
 * Example:
 * computeCameraDistance(45, 10) => {height: 10, distance: 10}
 * computeCameraDistance(30, 10) => {height: 5, distance: 10}
 * computeCameraDistance(60, 10) => {height: 8.66, distance: 10}
 */
function computeCameraDistance(
  cosAngle: number,
  distance: number,
): { height: number; distance: number } {
  const height = distance * Math.cos((cosAngle * Math.PI) / 180);
  const newDistance = distance * Math.sin((cosAngle * Math.PI) / 180);
  return { height, distance: newDistance };
}

const CAMERA_ANGLE = 60;
const CAMERA_DISTANCE = 7;
const CAMERA_PARAMS = computeCameraDistance(CAMERA_ANGLE, CAMERA_DISTANCE);

export function Player() {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const bodyRef = React.useRef<RapierRigidBody | null>(null);

  const { direction, movementState } = usePlayerAnimation(bodyRef);
  const animationName = getAnimationName(direction, movementState);

  React.useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.setEnabledRotations(false, false, false, false);
    body.setAngularDamping(5);
  }, []);

  //@ts-expect-error
  useFollowCamera(meshRef, {
    offset: new THREE.Vector3(0, CAMERA_PARAMS.height, CAMERA_PARAMS.distance),
    lerp: 0.1,
  });

  useDialogAdvance();
  usePlayerMovement(bodyRef, { speed: SPEED });

  return (
    <RigidBody
      ref={bodyRef}
      args={[0.5, 1, 1]}
      mass={1}
      colliders={false}
      type="dynamic"
      ccd={true}
      angularDamping={5}
      position={[-3, 0.5, -90]}
    >
      <mesh ref={meshRef} position={[0, 0, 0]} />
      <CapsuleCollider args={[0.5, 0.5]} />
      <Suspense fallback={null}>
        <SpritePlaneAnimator
          texturePath="/assets/main-char-transparent.png"
          spriteDataUrl="/assets/main-char.json"
          animationName={animationName}
          fps={8}
          scale={[1, 1, 1]}
          position={[0, -0.25, 0]}
          alphaTest={0.01}
          brightness={1}
        />
      </Suspense>
    </RigidBody>
  );
}
