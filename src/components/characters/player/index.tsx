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

//* Utils imports
import { playBumpingSound } from "@/store";
import { PLAYER_SPRITES } from "@/utils/player-sprites";
import {
  COLLISION_GROUPS,
  RIGID_BODY_NAMES,
  shouldPlayBumpingSound,
  type CollisionEnterLike,
} from "@/lib/rapier-collision";

//* Hooks imports
import { useFollowCamera } from "@/hooks/use-follow-camera";
import { useDialogAdvance } from "@/hooks/use-dialog-advance";
import { useGameMenuControls } from "@/hooks/use-game-menu-controls";
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

const CAMERA_ANGLE = 45;
const CAMERA_DISTANCE = 14;
const CAMERA_PARAMS = computeCameraDistance(CAMERA_ANGLE, CAMERA_DISTANCE);

type PlayerProps = {
  playerBodyRef: React.RefObject<RapierRigidBody | null>;
};

export function Player(props: PlayerProps) {
  const handleCollisionEnter = React.useCallback(
    (payload: CollisionEnterLike) => {
      if (!shouldPlayBumpingSound(payload)) return;
      playBumpingSound();
    },
    [],
  );

  const setBodyRef = React.useCallback(
    (body: RapierRigidBody | null) => {
      props.playerBodyRef.current = body;
      if (!body) return;

      body.setEnabledRotations(false, false, false, false);
      body.setAngularDamping(5);
    },
    [props.playerBodyRef],
  );

  const { direction, movementState } = usePlayerAnimation(props.playerBodyRef);
  const animationName = getAnimationName(direction, movementState);

  useFollowCamera(props.playerBodyRef, {
    offset: new THREE.Vector3(0, CAMERA_PARAMS.height, CAMERA_PARAMS.distance),
    followSmooth: 6,
    lookSmooth: 10,
    lookAhead: 0,
  });

  useDialogAdvance();
  useGameMenuControls();
  usePlayerMovement(props.playerBodyRef, { speed: SPEED });

  return (
    <RigidBody
      ref={setBodyRef}
      name={RIGID_BODY_NAMES.player}
      args={[0.5, 1, 1]}
      mass={1}
      colliders={false}
      collisionGroups={COLLISION_GROUPS.player}
      type="dynamic"
      ccd={true}
      angularDamping={5}
      position={[0, 2, 30]}
      onCollisionEnter={handleCollisionEnter}
    >
      <CapsuleCollider
        args={[0.5, 0.5]}
        collisionGroups={COLLISION_GROUPS.player}
      />
      <Suspense fallback={null}>
        <SpritePlaneAnimator
          texturePath={PLAYER_SPRITES.BOY.SPRITE_SHEET}
          spriteDataUrl={PLAYER_SPRITES.BOY.SPRITE_DATA}
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
