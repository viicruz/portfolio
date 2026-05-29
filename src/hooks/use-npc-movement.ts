"use client";

import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";

export type PatrolPoint = {
  position: [number, number, number];
  waitMs?: number;
  speed?: number; // units per second for that segment
};

export type PatrolRoute = {
  points: PatrolPoint[];
  loop?: boolean; // wrap around
  pendulum?: boolean; // go back and forth
  localSpace?: boolean; // positions relative to spawn
  startIndex?: number;
};

export type NpcBehavior =
  | { kind: "patrol"; route: PatrolRoute }
  | { kind: "none" };

export type UseNpcMovementControls = {
  pause: () => void;
  resume: () => void;
  isPaused: () => boolean;
};

type Options = {
  defaultSpeed?: number;
  arrivalEpsilon?: number;
};

export function useNpcMovement(
  bodyRef: React.RefObject<RapierRigidBody | null>,
  behavior?: NpcBehavior,
  options?: Options,
): UseNpcMovementControls {
  const pausedRef = useRef(false);

  const defaultSpeed = options?.defaultSpeed ?? 1.5;
  const arrivalEpsilon = options?.arrivalEpsilon ?? 0.05;

  const spawnRef = useRef(new THREE.Vector3());
  const targetRef = useRef(new THREE.Vector3());
  const tmpVec = useRef(new THREE.Vector3());

  const routeIndexRef = useRef(0);
  const forwardRef = useRef(true); // for pendulum
  const waitElapsedRef = useRef(0);
  const stateRef = useRef<"idle" | "moving" | "waiting">("idle");
  const spawnInitializedRef = useRef(false);

  // initialize spawn position once body becomes available
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const p = body.translation();
    spawnRef.current.set(p.x, p.y, p.z);

    // set start index
    if (behavior && behavior.kind === "patrol") {
      routeIndexRef.current = behavior.route.startIndex ?? 0;
    }
  }, [bodyRef, behavior]);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  const isPaused = useCallback(() => pausedRef.current, []);

  useFrame((_, delta) => {
    // lazy-initialize spawn position and start index when body appears
    const bodyNow = bodyRef.current;
    if (bodyNow && !spawnInitializedRef.current) {
      const p = bodyNow.translation();
      spawnRef.current.set(p.x, p.y, p.z);
      spawnInitializedRef.current = true;

      if (behavior && behavior.kind === "patrol") {
        routeIndexRef.current = behavior.route.startIndex ?? 0;
      }
    }
    if (pausedRef.current) return;
    const body = bodyRef.current;
    if (!body || !behavior || behavior.kind !== "patrol") return;

    const route = behavior.route;
    if (!route.points || route.points.length === 0) return;

    // current world position of body
    const cur = body.translation();
    tmpVec.current.set(cur.x, cur.y, cur.z);

    // compute target world position for current route point
    const point = route.points[routeIndexRef.current];
    if (!point) return;

    if (route.localSpace) {
      targetRef.current.set(...point.position).add(spawnRef.current);
    } else {
      targetRef.current.set(...point.position);
    }

    const dist = tmpVec.current.distanceTo(targetRef.current);

    // arrival handling (only on first frame at a waypoint; avoid resetting wait timer)
    if (dist <= arrivalEpsilon && stateRef.current !== "waiting") {
      const waitMs = point.waitMs ?? 0;
      if (waitMs > 0) {
        stateRef.current = "waiting";
        waitElapsedRef.current = 0;
      } else {
        if (route.pendulum) {
          if (forwardRef.current) {
            if (routeIndexRef.current >= route.points.length - 1) forwardRef.current = false;
            else routeIndexRef.current++;
          } else {
            if (routeIndexRef.current <= 0) forwardRef.current = true;
            else routeIndexRef.current--;
          }
        } else if (route.loop) {
          routeIndexRef.current = (routeIndexRef.current + 1) % route.points.length;
        } else if (routeIndexRef.current < route.points.length - 1) {
          routeIndexRef.current++;
        }
      }

      return;
    }

    // waiting state
    if (stateRef.current === "waiting") {
      waitElapsedRef.current += delta * 1000;
      const waitMs = point.waitMs ?? 0;
      if (waitElapsedRef.current >= waitMs) {
        stateRef.current = "moving";
        // advance index for next target, same logic as above
        if (route.pendulum) {
          if (forwardRef.current) {
            if (routeIndexRef.current >= route.points.length - 1) forwardRef.current = false;
            else routeIndexRef.current++;
          } else {
            if (routeIndexRef.current <= 0) forwardRef.current = true;
            else routeIndexRef.current--;
          }
        } else if (route.loop) {
          routeIndexRef.current = (routeIndexRef.current + 1) % route.points.length;
        } else {
          if (routeIndexRef.current < route.points.length - 1) routeIndexRef.current++;
        }
      }
      return;
    }

    // moving state (or default)
    stateRef.current = "moving";

    const speed = point.speed ?? defaultSpeed;

    // move by speed * delta towards target
    const step = Math.min(1, (speed * delta) / Math.max(dist, 1e-6));

    tmpVec.current.lerp(targetRef.current, step);

    // set new position on the body (kinematic-style movement)
    if (typeof body.setNextKinematicTranslation === "function") {
      body.setNextKinematicTranslation({ x: tmpVec.current.x, y: tmpVec.current.y, z: tmpVec.current.z });
    } else {
      body.setTranslation({ x: tmpVec.current.x, y: tmpVec.current.y, z: tmpVec.current.z }, true);
    }
  });

  return { pause, resume, isPaused };
}
