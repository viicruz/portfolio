'use client';

import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";

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
  const targetPositionRef = React.useRef(new THREE.Vector3());
  const groundY = -0.5;

  useFrame((_, delta) => {
    const playerBody = playerBodyRef.current;
    const mesh = meshRef.current;

    if (!playerBody || !mesh) return;

    const playerPos = playerBody.translation();
    playerPositionRef.current.set(playerPos.x, playerPos.y, playerPos.z);

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

    const clampedDistance = Math.max(minDistance, trailDistance);
    targetPositionRef.current
      .copy(playerPositionRef.current)
      .addScaledVector(followDirectionRef.current, clampedDistance);
    targetPositionRef.current.y = groundY;

    const smoothing = 1 - Math.exp(-followStrength * delta);
    mesh.position.lerp(targetPositionRef.current, smoothing);
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