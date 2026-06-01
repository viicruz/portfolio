"use client";
//* Libraries imports
import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";

//* Components imports
import { SpritePlaneAnimator } from "@/components/sprite-plane-animator";

const STOP_APPROACH_SECONDS_PER_UNIT_DISTANCE = 0.3;

enum FOLLOWER_ANIMATIONS {
  WALK_UP = "walk_up",
  WALK_DOWN = "walk_down",
  WALK_LEFT = "walk_left",
  WALK_RIGHT = "walk_right",
}

function getAnimationNameFromDelta(delta: THREE.Vector3) {
  const absX = Math.abs(delta.x);
  const absZ = Math.abs(delta.z);

  if (absX >= absZ) {
    return delta.x >= 0
      ? FOLLOWER_ANIMATIONS.WALK_RIGHT
      : FOLLOWER_ANIMATIONS.WALK_LEFT;
  }

  return delta.z >= 0
    ? FOLLOWER_ANIMATIONS.WALK_DOWN
    : FOLLOWER_ANIMATIONS.WALK_UP;
}

type FollowerPkmProps = {
  playerBodyRef: React.RefObject<RapierRigidBody | null>;
  delayFrames?: number;
  followStrength?: number;
  minDistance?: number;
  size?: number;
  scale: [number, number, number];
};

export function FollowerPkm({
  playerBodyRef,
  delayFrames = 36,
  followStrength = 6,
  minDistance = 1.25,
  size = 0.5,
  scale,
}: FollowerPkmProps) {
  const meshRef = React.useRef<THREE.Group>(null);
  const trailRef = React.useRef<THREE.Vector3[]>([]);
  const playerPositionRef = React.useRef(new THREE.Vector3());
  const followDirectionRef = React.useRef(new THREE.Vector3());
  const desiredDirectionRef = React.useRef(new THREE.Vector3());

  const targetPositionRef = React.useRef(new THREE.Vector3());
  const previousPositionRef = React.useRef(new THREE.Vector3());
  const [animationFps, setAnimationFps] = React.useState(2);
  const animationNameRef = React.useRef<FOLLOWER_ANIMATIONS>(
    FOLLOWER_ANIMATIONS.WALK_DOWN,
  );
  const [, forceRender] = React.useState(0);

  const stopTargetRef = React.useRef(new THREE.Vector3());
  const stopStartPositionRef = React.useRef(new THREE.Vector3());

  const stopElapsedRef = React.useRef(0);
  const stopDurationRef = React.useRef(0);

  const wasMovingRef = React.useRef(false);

  const groundTopY = -0.75;
  const groundY = groundTopY + scale[1] / 2;

  useFrame((_, delta) => {
    const playerBody = playerBodyRef.current;
    const mesh = meshRef.current;

    if (!playerBody || !mesh) return;

    previousPositionRef.current.copy(mesh.position);

    const playerPos = playerBody.translation();

    playerPositionRef.current.set(
      playerPos.x,
      playerPos.y,
      playerPos.z,
    );

    //Player Movement   

    const playerVelocity = playerBody.linvel();

    const horizontalSpeed = Math.hypot(
      playerVelocity.x,
      playerVelocity.z,
    );

    const nextAnimationFps = horizontalSpeed > 3.5 ? 4 : 2;
    if (animationFps !== nextAnimationFps) {
      setAnimationFps(nextAnimationFps);
    }
    const isMoving = horizontalSpeed > 0.01;

    //when the player stops, we want the pkm to smoothly come to a stop at the last position, rather than snapping to the player or continuing to follow the trail
    if (wasMovingRef.current && !isMoving) {
      trailRef.current = [];

      followDirectionRef.current
        .copy(mesh.position)
        .sub(playerPositionRef.current);

      followDirectionRef.current.y = 0;

      // fallback direction
      if (followDirectionRef.current.lengthSq() < 0.0001) {
        followDirectionRef.current.set(0, 0, 1);
      }

      followDirectionRef.current.normalize();

      stopTargetRef.current
        .copy(playerPositionRef.current)
        .addScaledVector(
          followDirectionRef.current,
          minDistance,
        );

      stopTargetRef.current.y = groundY;

      stopStartPositionRef.current.copy(mesh.position);
      stopStartPositionRef.current.y = groundY;

      const stopDistance =
        stopStartPositionRef.current.distanceTo(
          stopTargetRef.current,
        );

      stopElapsedRef.current = 0;

      stopDurationRef.current = Math.max(
        stopDistance * STOP_APPROACH_SECONDS_PER_UNIT_DISTANCE,
        0.001,
      );
    }

    wasMovingRef.current = isMoving;

    //if the player is not moving, we want to smoothly come to a stop at the last position
    if (!isMoving) {
      stopElapsedRef.current += delta;

      const progress = Math.min(
        stopElapsedRef.current / stopDurationRef.current,
        1,
      );

      mesh.position.lerpVectors(
        stopStartPositionRef.current,
        stopTargetRef.current,
        progress,
      );

      mesh.position.y = groundY;

      const movementDelta = mesh.position
        .clone()
        .sub(previousPositionRef.current);

      if (movementDelta.lengthSq() > 0.000001) {
        const nextAnimationName = getAnimationNameFromDelta(movementDelta);

        if (animationNameRef.current !== nextAnimationName) {
          animationNameRef.current = nextAnimationName;
          forceRender((value) => value + 1);
        }
      }

      return;
    }


    //trail logic: we push the current player position to the trail, and if the trail is longer than the delay, we remove the oldest position. The pkm will then follow the oldest position in the trail, creating a delayed following effect
    const nextTrailPoint =
      trailRef.current.length >= delayFrames
        ? trailRef.current.shift() ?? new THREE.Vector3()
        : new THREE.Vector3();

    nextTrailPoint.copy(playerPositionRef.current);
    trailRef.current.push(nextTrailPoint);

    const delayedPos = trailRef.current[0];

    if (!delayedPos) return;

    //desired direction is the direction from the current player position to the delayed player position (i.e., backwards along the player trail). We ignore the y component to keep the pkm on the ground plane
    desiredDirectionRef.current
      .copy(delayedPos)
      .sub(playerPositionRef.current);

    desiredDirectionRef.current.y = 0;

    const rawDistance =
      desiredDirectionRef.current.length();

    if (rawDistance < 0.0001) return;

    desiredDirectionRef.current.normalize();

    // smooth direction changes
    followDirectionRef.current.lerp(
      desiredDirectionRef.current,
      1 - Math.exp(-10 * delta),
    );

    followDirectionRef.current.normalize();

    const desiredDistance = Math.max(
      rawDistance,
      minDistance,
    );


    // target position is the position the pkm should move towards, which is behind the player in the direction of followDirectionRef, at a distance of desiredDistance
    targetPositionRef.current
      .copy(playerPositionRef.current)
      .addScaledVector(
        followDirectionRef.current,
        desiredDistance,
      );

    targetPositionRef.current.y = groundY;


    //logic to smoothly move the pkm towards the target position. We use an exponential smoothing function to create a smooth following effect, where followStrength controls how quickly the pkm moves towards the target position. The pkm's position is then updated by linearly interpolating between its current position and the target position based on the calculated smoothing factor
    const smoothing =
      1 - Math.exp(-followStrength * delta);

    mesh.position.lerp(
      targetPositionRef.current,
      smoothing,
    );

    mesh.position.y = groundY;

    const movementDelta = mesh.position
      .clone()
      .sub(previousPositionRef.current);

    if (movementDelta.lengthSq() > 0.000001) {
      const nextAnimationName = getAnimationNameFromDelta(movementDelta);

      if (animationNameRef.current !== nextAnimationName) {
        animationNameRef.current = nextAnimationName;
        forceRender((value) => value + 1);
      }
    }
  });

  return (
    <group
      ref={meshRef}
      castShadow
      receiveShadow
      position={[0, groundY, 0]}
    >
      <React.Suspense fallback={null}>
        <SpritePlaneAnimator
          texturePath="/assets/pokemon_gen_2_sprites.png"
          spriteDataUrl="/assets/cyndaquil.json"
          animationName={animationNameRef.current}
          // animationName="walk_right"
          fps={animationFps}
          // fps={1}
          scale={scale}
          position={[0, 0, 0]}
          alphaTest={0.01}
          brightness={1}
        />
      </React.Suspense>
    </group>
  );
}