'use client';

import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";

const STOP_APPROACH_SECONDS_PER_UNIT_DISTANCE = 0.3;

type FollowerCubeProps = {
  playerBodyRef: React.RefObject<RapierRigidBody | null>;
  delayFrames?: number;
  followStrength?: number;
  minDistance?: number;
  color?: string;
  size?: number;
};

export function FollowerCube({
  playerBodyRef,
  delayFrames = 36,
  followStrength = 6,
  minDistance = 1.25,
  color = "crimson",
  size = 0.5,
}: FollowerCubeProps) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const trailRef = React.useRef<THREE.Vector3[]>([]);
  const playerPositionRef = React.useRef(new THREE.Vector3());
  const followDirectionRef = React.useRef(new THREE.Vector3());
  const currentPositionRef = React.useRef(new THREE.Vector3());
  const targetPositionRef = React.useRef(new THREE.Vector3());
  const stopTargetRef = React.useRef(new THREE.Vector3());
  const stopStartPositionRef = React.useRef(new THREE.Vector3());
  const stopElapsedRef = React.useRef(0);
  const stopDurationRef = React.useRef(0);
  const wasMovingRef = React.useRef(false);
  const groundY = -0.5;

  useFrame((_, delta) => {
    const playerBody = playerBodyRef.current;
    const mesh = meshRef.current;

    if (!playerBody || !mesh) return;

    const playerPos = playerBody.translation();
    playerPositionRef.current.set(playerPos.x, playerPos.y, playerPos.z);


    //determine if the player is moving based on velocity
    const playerVelocity = playerBody.linvel();
    const horizontalSpeed = Math.hypot(playerVelocity.x, playerVelocity.z);
    const isMoving = horizontalSpeed > 0.01;

    //if the player just stopped moving, drop the trail and move the cube to a fixed offset from the player
    if (wasMovingRef.current && !isMoving) {
      trailRef.current = [];

      followDirectionRef.current.copy(mesh.position).sub(playerPositionRef.current);

      if (followDirectionRef.current.lengthSq() === 0) {
        followDirectionRef.current.copy(
          playerVelocity.x !== 0 || playerVelocity.z !== 0
            ? new THREE.Vector3(playerVelocity.x, 0, playerVelocity.z)
            : new THREE.Vector3(0, 0, 1),
        );
      }

      followDirectionRef.current.y = 0;

      if (followDirectionRef.current.lengthSq() === 0) {
        followDirectionRef.current.set(0, 0, 1);
      }

      followDirectionRef.current.normalize();

      stopTargetRef.current
        .copy(playerPositionRef.current)
        .addScaledVector(followDirectionRef.current, minDistance);
      stopTargetRef.current.y = groundY;

      stopStartPositionRef.current.copy(mesh.position);
      stopStartPositionRef.current.y = groundY;

      const stopDistance = stopStartPositionRef.current.distanceTo(stopTargetRef.current);
      stopElapsedRef.current = 0;
      stopDurationRef.current = Math.max(
        stopDistance * STOP_APPROACH_SECONDS_PER_UNIT_DISTANCE,
        0.001,
      );

      wasMovingRef.current = false;
      return;
    }

    wasMovingRef.current = isMoving;

    //if the player is not moving, move the cube toward the stop target and wait for movement to resume
    if (!isMoving) {
      stopElapsedRef.current += delta;

      const progress = Math.min(stopElapsedRef.current / stopDurationRef.current, 1);
      mesh.position.lerpVectors(stopStartPositionRef.current, stopTargetRef.current, progress);
      mesh.position.y = groundY;
      return;
    }

    trailRef.current.push(playerPositionRef.current.clone());
    if (trailRef.current.length > delayFrames) {
      trailRef.current.shift();
    }

    const delayedPos = trailRef.current[0];
    if (!delayedPos) return;

    followDirectionRef.current
      .copy(delayedPos)
      .sub(playerPositionRef.current);

    const trailDistance = followDirectionRef.current.length();
    if (trailDistance === 0) return;

    followDirectionRef.current.normalize();

    const nextPosition = targetPositionRef.current
      .copy(playerPositionRef.current)
      .addScaledVector(followDirectionRef.current, trailDistance);
    targetPositionRef.current.y = groundY;

    currentPositionRef.current.copy(mesh.position);
    const nextDistance = nextPosition.distanceTo(playerPositionRef.current);

    if (nextDistance < minDistance) {
      currentPositionRef.current.y = groundY;
      mesh.position.copy(currentPositionRef.current);
      return;
    }

    const smoothing = 1 - Math.exp(-followStrength * delta);
    mesh.position.lerp(nextPosition, smoothing);
    mesh.position.y = groundY;

  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow position={[0, groundY, 0]}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default FollowerCube;