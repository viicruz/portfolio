"use client";
//* Libraries imports
import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";

//* Components imports
import { SpritePlaneAnimator } from "@/components/sprite-plane-animator";

//* Utils imports
import { POKEMON_SPRITES, type PokemonKey } from "@/utils/pokemon-sprites";
import { COLLISION_GROUPS, RIGID_BODY_NAMES } from "@/lib/rapier-collision";

const STOP_APPROACH_SECONDS_PER_UNIT_DISTANCE = 0.3;
const HOP_ANIMATION_SPEED = 16;
const HOP_ANIMATION_HEIGHT = 0.03;

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
  pokemonKey: PokemonKey;
  delayFrames?: number;
  followStrength?: number;
  minDistance?: number;
  scale: [number, number, number];
};

export function FollowerPkm({
  playerBodyRef,
  pokemonKey,
  delayFrames = 36,
  followStrength = 6,
  minDistance = 1.25,
  scale,
}: FollowerPkmProps) {
  const followerBodyRef = React.useRef<RapierRigidBody | null>(null);
  const spriteGroupRef = React.useRef<THREE.Group>(null);
  const trailRef = React.useRef<THREE.Vector3[]>([]);
  const playerPositionRef = React.useRef(new THREE.Vector3());
  const followDirectionRef = React.useRef(new THREE.Vector3());
  const desiredDirectionRef = React.useRef(new THREE.Vector3());

  const targetPositionRef = React.useRef(new THREE.Vector3());
  const movementDeltaRef = React.useRef(new THREE.Vector3());
  const [animationFps, setAnimationFps] = React.useState(2);
  const animationNameRef = React.useRef<FOLLOWER_ANIMATIONS>(
    FOLLOWER_ANIMATIONS.WALK_DOWN,
  );
  const [, forceRender] = React.useState(0);

  const stopTargetRef = React.useRef(new THREE.Vector3());
  const stopStartPositionRef = React.useRef(new THREE.Vector3());

  const stopElapsedRef = React.useRef(0);
  const stopDurationRef = React.useRef(0);
  const hopElapsedRef = React.useRef(0);

  const wasMovingRef = React.useRef(false);

  const pokemonSprites = POKEMON_SPRITES[pokemonKey];

  const setBodyRef = React.useCallback((body: RapierRigidBody | null) => {
    followerBodyRef.current = body;
    if (!body) return;

    body.setEnabledRotations(false, false, false, false);
  }, []);

  const applyHopAnimation = () => {
    const spriteGroup = spriteGroupRef.current;
    if (!spriteGroup) return;

    spriteGroup.position.y =
      Math.sin(hopElapsedRef.current * HOP_ANIMATION_SPEED) *
      HOP_ANIMATION_HEIGHT;
  };

  const applyHorizontalVelocity = (body: RapierRigidBody) => {
    const bodyPos = body.translation();
    const currentVel = body.linvel();

    const velX =
      (targetPositionRef.current.x - bodyPos.x) * followStrength;
    const velZ =
      (targetPositionRef.current.z - bodyPos.z) * followStrength;

    body.setLinvel({ x: velX, y: currentVel.y, z: velZ }, true);

    movementDeltaRef.current.set(velX, 0, velZ);
  };

  const updateAnimationFromMovement = () => {
    if (movementDeltaRef.current.lengthSq() <= 0.000001) return;

    const nextAnimationName = getAnimationNameFromDelta(movementDeltaRef.current);

    if (animationNameRef.current !== nextAnimationName) {
      animationNameRef.current = nextAnimationName;
      forceRender((value) => value + 1);
    }
  };

  useFrame((_, delta) => {
    const playerBody = playerBodyRef.current;
    const body = followerBodyRef.current;

    if (!playerBody || !body) return;

    hopElapsedRef.current += delta;

    const bodyPos = body.translation();
    const playerPos = playerBody.translation();

    playerPositionRef.current.set(playerPos.x, playerPos.y, playerPos.z);

    const playerVelocity = playerBody.linvel();
    const horizontalSpeed = Math.hypot(playerVelocity.x, playerVelocity.z);

    const nextAnimationFps = horizontalSpeed > 3.5 ? 6 : 3.2;
    if (animationFps !== nextAnimationFps) {
      setAnimationFps(nextAnimationFps);
    }
    const isMoving = horizontalSpeed > 0.01;

    if (wasMovingRef.current && !isMoving) {
      trailRef.current = [];

      followDirectionRef.current.set(bodyPos.x, 0, bodyPos.z);
      followDirectionRef.current.sub(playerPositionRef.current);

      if (followDirectionRef.current.lengthSq() < 0.0001) {
        followDirectionRef.current.set(0, 0, 1);
      }

      followDirectionRef.current.normalize();

      stopTargetRef.current
        .copy(playerPositionRef.current)
        .addScaledVector(followDirectionRef.current, minDistance);

      stopStartPositionRef.current.set(bodyPos.x, bodyPos.y, bodyPos.z);

      const stopDistance = Math.hypot(
        stopTargetRef.current.x - stopStartPositionRef.current.x,
        stopTargetRef.current.z - stopStartPositionRef.current.z,
      );

      stopElapsedRef.current = 0;

      stopDurationRef.current = Math.max(
        stopDistance * STOP_APPROACH_SECONDS_PER_UNIT_DISTANCE,
        0.001,
      );
    }

    wasMovingRef.current = isMoving;

    if (!isMoving) {
      stopElapsedRef.current += delta;

      const progress = Math.min(
        stopElapsedRef.current / stopDurationRef.current,
        1,
      );

      targetPositionRef.current.lerpVectors(
        stopStartPositionRef.current,
        stopTargetRef.current,
        progress,
      );

      applyHorizontalVelocity(body);
      applyHopAnimation();
      updateAnimationFromMovement();

      return;
    }

    const nextTrailPoint =
      trailRef.current.length >= delayFrames
        ? (trailRef.current.shift() ?? new THREE.Vector3())
        : new THREE.Vector3();

    nextTrailPoint.copy(playerPositionRef.current);
    trailRef.current.push(nextTrailPoint);

    const delayedPos = trailRef.current[0];

    if (!delayedPos) {
      applyHopAnimation();
      return;
    }

    desiredDirectionRef.current.copy(delayedPos).sub(playerPositionRef.current);
    desiredDirectionRef.current.y = 0;

    const rawDistance = desiredDirectionRef.current.length();

    if (rawDistance < 0.0001) {
      const currentVel = body.linvel();
      body.setLinvel({ x: 0, y: currentVel.y, z: 0 }, true);
      applyHopAnimation();
      return;
    }

    desiredDirectionRef.current.normalize();

    followDirectionRef.current.lerp(
      desiredDirectionRef.current,
      1 - Math.exp(-10 * delta),
    );

    followDirectionRef.current.normalize();

    const desiredDistance = Math.max(rawDistance, minDistance);

    targetPositionRef.current
      .copy(playerPositionRef.current)
      .addScaledVector(followDirectionRef.current, desiredDistance);

    applyHorizontalVelocity(body);
    applyHopAnimation();
    updateAnimationFromMovement();
  });

  return (
    <RigidBody
      ref={setBodyRef}
      name={RIGID_BODY_NAMES.follower}
      type="dynamic"
      mass={0}
      colliders={false}
      collisionGroups={COLLISION_GROUPS.follower}
      linearDamping={1.5}
      ccd
      position={[0, 2, 31]}
    >
      <CapsuleCollider
        args={[0.35, 0.35]}
        collisionGroups={COLLISION_GROUPS.follower}
      />
      <group ref={spriteGroupRef} castShadow receiveShadow>
        <React.Suspense fallback={null}>
          <SpritePlaneAnimator
            key={pokemonKey}
            texturePath={pokemonSprites.SPRITE_SHEET}
            spriteDataUrl={pokemonSprites.SPRITE_DATA}
            animationName={animationNameRef.current}
            fps={animationFps}
            scale={scale}
            position={[0, 0, 0]}
            alphaTest={0.01}
            brightness={1}
          />
        </React.Suspense>
      </group>
    </RigidBody>
  );
}