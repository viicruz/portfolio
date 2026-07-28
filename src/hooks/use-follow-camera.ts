"use client";

//* Libraries imports
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";

const DEFAULT_OFFSET = new THREE.Vector3(0, 4, 8);
const DEFAULT_LOOK_AT_OFFSET = new THREE.Vector3(0, 1, 0);
const DEFAULT_FOLLOW_SMOOTH = 6;
const DEFAULT_LOOK_SMOOTH = 10;
const DEFAULT_LOOK_AHEAD = 0.28;
const MAX_DELTA = 0.05;

type FollowCameraOptions = {
  offset?: THREE.Vector3;
  lookAtOffset?: THREE.Vector3;
  /** Exponential follow speed (higher = snappier). */
  followSmooth?: number;
  /** Exponential look-at speed. */
  lookSmooth?: number;
  /** Seconds of velocity lookahead on XZ. */
  lookAhead?: number;
};

function dampFactor(smooth: number, delta: number): number {
  return 1 - Math.exp(-smooth * delta);
}

export function useFollowCamera(
  bodyRef: RefObject<RapierRigidBody | null>,
  options?: FollowCameraOptions,
) {
  const camera = useThree((state) => state.camera);

  const offset = options?.offset ?? DEFAULT_OFFSET;
  const lookAtOffset = options?.lookAtOffset ?? DEFAULT_LOOK_AT_OFFSET;
  const followSmooth = options?.followSmooth ?? DEFAULT_FOLLOW_SMOOTH;
  const lookSmooth = options?.lookSmooth ?? DEFAULT_LOOK_SMOOTH;
  const lookAhead = options?.lookAhead ?? DEFAULT_LOOK_AHEAD;

  const followGhostRef = useRef(new THREE.Object3D());
  const lookGhostRef = useRef(new THREE.Object3D());
  const desiredFollowRef = useRef(new THREE.Vector3());
  const desiredLookRef = useRef(new THREE.Vector3());
  const hasSnappedRef = useRef(false);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const clampedDelta = Math.min(delta, MAX_DELTA);
    const translation = body.translation();
    const velocity = body.linvel();

    const desiredFollow = desiredFollowRef.current;
    const desiredLook = desiredLookRef.current;
    const followGhost = followGhostRef.current;
    const lookGhost = lookGhostRef.current;

    desiredFollow.set(
      translation.x + velocity.x * lookAhead,
      translation.y,
      translation.z + velocity.z * lookAhead,
    );
    desiredLook
      .set(translation.x, translation.y, translation.z)
      .add(lookAtOffset);

    if (!hasSnappedRef.current) {
      followGhost.position.copy(desiredFollow);
      lookGhost.position.copy(desiredLook);
      hasSnappedRef.current = true;
    } else {
      followGhost.position.lerp(
        desiredFollow,
        dampFactor(followSmooth, clampedDelta),
      );
      lookGhost.position.lerp(desiredLook, dampFactor(lookSmooth, clampedDelta));
    }

    camera.position.copy(followGhost.position).add(offset);
    camera.lookAt(lookGhost.position);
  });
}