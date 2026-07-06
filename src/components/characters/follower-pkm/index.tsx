"use client";

/**
 * Each frame the follower picks a target position and steers toward it with Rapier
 * velocity (not teleport). The target sits `minDistance` units behind the player:
 * opposite to movement direction while walking, or along the follower→player axis
 * when idle.
 *
 * Two layers keep the follower from clipping through the player:
 * 1. Orbit steering: if the straight path to the target crosses the player, the
 *    target is projected onto a circle around the player and the follower orbits
 *    toward the ideal slot instead of cutting through.
 * 2. Separation push: a radial repulsion force when inside PLAYER_AVOIDANCE_RADIUS.
 *
 * When the player stops, the follower eases into its resting slot behind them
 * (lerp over a distance-based duration) instead of snapping instantly.
 *
 * Visuals: walk direction is derived from velocity; a subtle hop bobs the sprite.
 */

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

//* Tuning constants

// Seconds of approach time per world unit when the player stops moving
const STOP_APPROACH_SECONDS_PER_UNIT_DISTANCE = 0.3;

// Sprite hop bob while walking
const HOP_ANIMATION_SPEED = 16;
const HOP_ANIMATION_HEIGHT = 0.03;

// Minimum time a walk direction must stay stable before the sprite switches
const SPRITE_DIRECTION_DEBOUNCE_SECONDS = 0.1;

// Radius within which orbit steering and separation push activate
const PLAYER_AVOIDANCE_RADIUS = 2;

// Radians per second when orbiting around the player to avoid clipping
const ORBIT_ANGULAR_SPEED = 5;

// Outward push strength when too close to the player
const SEPARATION_STRENGTH = 10;

// Exponential smoothing for the "behind" direction vector
const BEHIND_DIRECTION_SMOOTHING = 8;

// Cap follower speed relative to player speed so it never outruns them
const MAX_FOLLOW_SPEED_MULTIPLIER = 1.2;
const MAX_FOLLOW_SPEED_BASE = 1.5;

// If the follower drifts this far away, snap it back to the player
const TELEPORT_DISTANCE_THRESHOLD = 15;

// Smooth the reposition over a short time instead of snapping instantly
const TELEPORT_RECOVERY_SECONDS_PER_UNIT_DISTANCE = 0.025;
const TELEPORT_RECOVERY_MIN_SECONDS = 0.12;
const TELEPORT_RECOVERY_MAX_SECONDS = 0.35;

// Reused vectors to avoid per-frame allocations in hot paths
const tmpFollowerOffset = new THREE.Vector3();
const tmpIdealOffset = new THREE.Vector3();
const tmpPlayerVelocity = new THREE.Vector3();

/** Smallest signed angle from `fromAngle` to `toAngle` (used for orbit stepping). */
function shortestAngleDelta(fromAngle: number, toAngle: number) {
  let delta = toAngle - fromAngle;

  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }

  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }

  return delta;
}

/** True when the XZ segment from start to end passes through a circle at `center`. */
function segmentIntersectsCircle(
  segmentStart: THREE.Vector3,
  segmentEnd: THREE.Vector3,
  center: THREE.Vector3,
  radius: number,
) {
  const abX = segmentEnd.x - segmentStart.x;
  const abZ = segmentEnd.z - segmentStart.z;
  const acX = center.x - segmentStart.x;
  const acZ = center.z - segmentStart.z;

  const abLenSq = abX * abX + abZ * abZ;

  if (abLenSq < 0.000001) {
    const distSq = acX * acX + acZ * acZ;
    return distSq < radius * radius;
  }

  const t = Math.max(0, Math.min(1, (acX * abX + acZ * abZ) / abLenSq));
  const closestX = segmentStart.x + abX * t;
  const closestZ = segmentStart.z + abZ * t;
  const dx = center.x - closestX;
  const dz = center.z - closestZ;

  return dx * dx + dz * dz < radius * radius;
}

/**
 * Resolves the actual movement target. Returns `idealTarget` when the path is
 * clear; otherwise steps along an orbit around the player toward the ideal slot.
 */
function resolveOrbitTarget(
  playerPos: THREE.Vector3,
  followerPos: THREE.Vector3,
  idealTarget: THREE.Vector3,
  orbitRadius: number,
  avoidanceRadius: number,
  delta: number,
  output: THREE.Vector3,
) {
  tmpFollowerOffset.set(
    followerPos.x - playerPos.x,
    0,
    followerPos.z - playerPos.z,
  );

  const distToPlayer = tmpFollowerOffset.length();

  // Detour if already inside the avoidance zone or the path would cross it
  const pathCrossesPlayer = segmentIntersectsCircle(
    followerPos,
    idealTarget,
    playerPos,
    avoidanceRadius,
  );

  const needsOrbit = distToPlayer < avoidanceRadius || pathCrossesPlayer;

  if (!needsOrbit) {
    output.copy(idealTarget);
    return output;
  }

  tmpIdealOffset.set(
    idealTarget.x - playerPos.x,
    0,
    idealTarget.z - playerPos.z,
  );

  let currentAngle: number;

  if (distToPlayer < 0.0001) {
    currentAngle = Math.atan2(tmpIdealOffset.x, tmpIdealOffset.z);
  } else {
    currentAngle = Math.atan2(tmpFollowerOffset.x, tmpFollowerOffset.z);
  }

  const targetAngle = Math.atan2(tmpIdealOffset.x, tmpIdealOffset.z);
  const angleDelta = shortestAngleDelta(currentAngle, targetAngle);
  const maxStep = ORBIT_ANGULAR_SPEED * delta;
  const step =
    Math.abs(angleDelta) <= maxStep
      ? angleDelta
      : Math.sign(angleDelta) * maxStep;
  const nextAngle = currentAngle + step;

  output.set(
    playerPos.x + Math.sin(nextAngle) * orbitRadius,
    followerPos.y,
    playerPos.z + Math.cos(nextAngle) * orbitRadius,
  );

  return output;
}

/**
 * Computes the smoothed "behind the player" direction on the XZ plane.
 * While moving: opposite to velocity. While slow/idle: follower away from player.
 */
function resolveBehindDirection(
  playerVelocity: THREE.Vector3,
  horizontalSpeed: number,
  playerPos: THREE.Vector3,
  followerPos: THREE.Vector3,
  currentDirection: THREE.Vector3,
  delta: number,
  output: THREE.Vector3,
) {
  if (horizontalSpeed > 0.15) {
    // Trail behind movement
    output.set(-playerVelocity.x, 0, -playerVelocity.z);

    if (output.lengthSq() > 0.0001) {
      output.normalize();
    } else {
      output.copy(currentDirection);
    }
  } else {
    // Keep current relative side when the player is nearly stationary
    output.set(followerPos.x - playerPos.x, 0, followerPos.z - playerPos.z);

    if (output.lengthSq() < 0.0001) {
      output.copy(currentDirection);

      if (output.lengthSq() < 0.0001) {
        output.set(0, 0, 1);
      }
    }

    output.normalize();
  }

  currentDirection.lerp(
    output,
    1 - Math.exp(-BEHIND_DIRECTION_SMOOTHING * delta),
  );
  currentDirection.normalize();

  output.copy(currentDirection);
  return output;
}

enum FOLLOWER_ANIMATIONS {
  WALK_UP = "walk_up",
  WALK_DOWN = "walk_down",
  WALK_LEFT = "walk_left",
  WALK_RIGHT = "walk_right",
}

/** Picks a walk animation from the dominant axis of horizontal velocity. */
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
  followStrength?: number;
  minDistance?: number;
  scale: [number, number, number];
};

export function FollowerPkm({
  playerBodyRef,
  pokemonKey,
  followStrength = 6,
  minDistance = 1.25,
  scale,
}: FollowerPkmProps) {
  const followerBodyRef = React.useRef<RapierRigidBody | null>(null);
  const spriteGroupRef = React.useRef<THREE.Group>(null);

  // Cached world positions updated each frame
  const playerPositionRef = React.useRef(new THREE.Vector3());
  const followerPositionRef = React.useRef(new THREE.Vector3());

  // Smoothed "behind" axis; persists across stop/start transitions
  const followDirectionRef = React.useRef(new THREE.Vector3());
  const desiredDirectionRef = React.useRef(new THREE.Vector3());

  // idealTarget = where we want to be; targetPosition = after orbit correction
  const idealTargetRef = React.useRef(new THREE.Vector3());
  const targetPositionRef = React.useRef(new THREE.Vector3());
  const movementDeltaRef = React.useRef(new THREE.Vector3());

  const [animationFps, setAnimationFps] = React.useState(2);
  const animationNameRef = React.useRef<FOLLOWER_ANIMATIONS>(
    FOLLOWER_ANIMATIONS.WALK_DOWN,
  );
  const pendingAnimationRef = React.useRef<FOLLOWER_ANIMATIONS | null>(null);
  const pendingAnimationElapsedRef = React.useRef(0);
  const [, forceRender] = React.useState(0);

  // Stop easing: lerp from current position to slot behind player when they halt
  const stopTargetRef = React.useRef(new THREE.Vector3());
  const stopStartPositionRef = React.useRef(new THREE.Vector3());
  const stopElapsedRef = React.useRef(0);
  const stopDurationRef = React.useRef(0);

  // Teleport recovery: when the follower drifts too far, snap it back to the player
  const teleportStartPositionRef = React.useRef(new THREE.Vector3());
  const teleportTargetPositionRef = React.useRef(new THREE.Vector3());
  const teleportElapsedRef = React.useRef(0);
  const teleportDurationRef = React.useRef(0);
  const teleportRecoveryActiveRef = React.useRef(false);

  const hopElapsedRef = React.useRef(0);
  const wasMovingRef = React.useRef(false);

  const pokemonSprites = POKEMON_SPRITES[pokemonKey];

  const setBodyRef = React.useCallback((body: RapierRigidBody | null) => {
    followerBodyRef.current = body;
    if (!body) return;

    body.setEnabledRotations(false, false, false, false);
  }, []);

  
/** The idea is to compute a vector from the player to the follower, normalize it,
 *  and then use that as the direction to place the follower at a minimum distance behind the player.
 *  If the follower is too close to the player, we can use this vector to push it away. 
 *  If it's too far, we can use it to pull it closer. This ensures that the follower
 *  maintains a consistent distance from the player while also avoiding collisions.
* */ 
  const startTeleportRecovery = (
    body: RapierRigidBody,
    bodyPos: { x: number; y: number; z: number },
    playerPos: { x: number; y: number; z: number },
  ) => {
    tmpFollowerOffset.set(
      bodyPos.x - playerPos.x,
      0,
      bodyPos.z - playerPos.z,
    );

    if (tmpFollowerOffset.lengthSq() < 0.0001) {
      tmpFollowerOffset.copy(followDirectionRef.current);
    }

    if (tmpFollowerOffset.lengthSq() < 0.0001) {
      tmpFollowerOffset.set(0, 0, 1);
    }

    tmpFollowerOffset.normalize();

    teleportStartPositionRef.current.set(bodyPos.x, bodyPos.y, bodyPos.z);
    teleportTargetPositionRef.current
      .copy(playerPos)
      .addScaledVector(tmpFollowerOffset, minDistance);

    const recoveryDistance = Math.hypot(
      teleportTargetPositionRef.current.x - teleportStartPositionRef.current.x,
      teleportTargetPositionRef.current.z - teleportStartPositionRef.current.z,
    );

    teleportElapsedRef.current = 0;
    teleportDurationRef.current = THREE.MathUtils.clamp(
      recoveryDistance * TELEPORT_RECOVERY_SECONDS_PER_UNIT_DISTANCE,
      TELEPORT_RECOVERY_MIN_SECONDS,
      TELEPORT_RECOVERY_MAX_SECONDS,
    );
    teleportRecoveryActiveRef.current = true;

    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    stopElapsedRef.current = 0;
    stopDurationRef.current = 0;
    wasMovingRef.current = false;
    pendingAnimationRef.current = null;
    pendingAnimationElapsedRef.current = 0;
  };

  // Vertical sine bob on the sprite group (body Y stays physics-driven)
  const applyHopAnimation = () => {
    const spriteGroup = spriteGroupRef.current;
    if (!spriteGroup) return;

    spriteGroup.position.y =
      Math.sin(hopElapsedRef.current * HOP_ANIMATION_SPEED) *
      HOP_ANIMATION_HEIGHT;
  };

  // Proportional steering toward targetPosition, plus separation and speed cap
  const applyHorizontalVelocity = (
    body: RapierRigidBody,
    playerHorizontalSpeed: number,
  ) => {
    const bodyPos = body.translation();
    const currentVel = body.linvel();

    let velX = (targetPositionRef.current.x - bodyPos.x) * followStrength;
    let velZ = (targetPositionRef.current.z - bodyPos.z) * followStrength;

    // Radial push away from the player when inside the avoidance radius
    const playerPos = playerPositionRef.current;
    const sepX = bodyPos.x - playerPos.x;
    const sepZ = bodyPos.z - playerPos.z;
    const dist = Math.hypot(sepX, sepZ);

    if (dist < PLAYER_AVOIDANCE_RADIUS && dist > 0.0001) {
      const push = (PLAYER_AVOIDANCE_RADIUS - dist) * SEPARATION_STRENGTH;
      velX += (sepX / dist) * push;
      velZ += (sepZ / dist) * push;
    }

    const maxSpeed =
      playerHorizontalSpeed * MAX_FOLLOW_SPEED_MULTIPLIER +
      MAX_FOLLOW_SPEED_BASE;
    const speed = Math.hypot(velX, velZ);

    if (speed > maxSpeed && speed > 0.0001) {
      const scale = maxSpeed / speed;
      velX *= scale;
      velZ *= scale;
    }

    body.setLinvel({ x: velX, y: currentVel.y, z: velZ }, true);

    movementDeltaRef.current.set(velX, 0, velZ);
  };

  // animationName lives in a ref to avoid re-rendering every frame; forceRender on change
  const updateAnimationFromMovement = (delta: number) => {
    if (movementDeltaRef.current.lengthSq() <= 0.000001) return;

    const nextAnimationName = getAnimationNameFromDelta(
      movementDeltaRef.current,
    );

    if (nextAnimationName === animationNameRef.current) {
      pendingAnimationRef.current = null;
      pendingAnimationElapsedRef.current = 0;
      return;
    }

    if (pendingAnimationRef.current !== nextAnimationName) {
      pendingAnimationRef.current = nextAnimationName;
      pendingAnimationElapsedRef.current = 0;
      return;
    }

    pendingAnimationElapsedRef.current += delta;

    if (
      pendingAnimationElapsedRef.current >= SPRITE_DIRECTION_DEBOUNCE_SECONDS
    ) {
      animationNameRef.current = nextAnimationName;
      pendingAnimationRef.current = null;
      pendingAnimationElapsedRef.current = 0;
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

    followerPositionRef.current.set(bodyPos.x, bodyPos.y, bodyPos.z);
    playerPositionRef.current.set(playerPos.x, playerPos.y, playerPos.z);

    if (teleportRecoveryActiveRef.current) {
      teleportElapsedRef.current += delta;

      const recoveryProgress = Math.min(
        teleportElapsedRef.current / teleportDurationRef.current,
        1,
      );
      const easedProgress =
        recoveryProgress * recoveryProgress * (3 - 2 * recoveryProgress);

      followerPositionRef.current.lerpVectors(
        teleportStartPositionRef.current,
        teleportTargetPositionRef.current,
        easedProgress,
      );

      body.setTranslation(
        {
          x: followerPositionRef.current.x,
          y: followerPositionRef.current.y,
          z: followerPositionRef.current.z,
        },
        true,
      );
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      applyHopAnimation();

      if (recoveryProgress >= 1) {
        teleportRecoveryActiveRef.current = false;
        body.setTranslation(
          {
            x: teleportTargetPositionRef.current.x,
            y: teleportTargetPositionRef.current.y,
            z: teleportTargetPositionRef.current.z,
          },
          true,
        );
      }

      return;
    }

    const distanceToPlayer = Math.hypot(
      bodyPos.x - playerPos.x,
      bodyPos.z - playerPos.z,
    );

    if (distanceToPlayer > TELEPORT_DISTANCE_THRESHOLD) {
      startTeleportRecovery(body, bodyPos, playerPositionRef.current);
      return;
    }

    const playerVelocity = playerBody.linvel();
    const horizontalSpeed = Math.hypot(playerVelocity.x, playerVelocity.z);

    const nextAnimationFps = horizontalSpeed > 3.5 ? 6 : 3.2;
    if (animationFps !== nextAnimationFps) {
      setAnimationFps(nextAnimationFps);
    }
    const isMoving = horizontalSpeed > 0.01;

    // Player just stopped — begin easing into the resting slot behind them
    if (wasMovingRef.current && !isMoving) {
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
      // Idle: interpolate toward stop target, then apply orbit + velocity
      stopElapsedRef.current += delta;

      const progress = Math.min(
        stopElapsedRef.current / stopDurationRef.current,
        1,
      );

      idealTargetRef.current.lerpVectors(
        stopStartPositionRef.current,
        stopTargetRef.current,
        progress,
      );

      resolveOrbitTarget(
        playerPositionRef.current,
        followerPositionRef.current,
        idealTargetRef.current,
        minDistance,
        PLAYER_AVOIDANCE_RADIUS,
        delta,
        targetPositionRef.current,
      );

      applyHorizontalVelocity(body, 0);
      applyHopAnimation();
      updateAnimationFromMovement(delta);

      return;
    }

    // Moving: target a fixed offset behind the player, orbit if path is blocked
    tmpPlayerVelocity.set(playerVelocity.x, 0, playerVelocity.z);

    resolveBehindDirection(
      tmpPlayerVelocity,
      horizontalSpeed,
      playerPositionRef.current,
      followerPositionRef.current,
      followDirectionRef.current,
      delta,
      desiredDirectionRef.current,
    );

    idealTargetRef.current
      .copy(playerPositionRef.current)
      .addScaledVector(desiredDirectionRef.current, minDistance);

    resolveOrbitTarget(
      playerPositionRef.current,
      followerPositionRef.current,
      idealTargetRef.current,
      minDistance,
      PLAYER_AVOIDANCE_RADIUS,
      delta,
      targetPositionRef.current,
    );

    applyHorizontalVelocity(body, horizontalSpeed);
    applyHopAnimation();
    updateAnimationFromMovement(delta);
  });

  return (
    <RigidBody
      ref={setBodyRef}
      name={RIGID_BODY_NAMES.follower}
      type="dynamic"
      mass={0.5}
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
