//* Libraries imports
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type React from "react";

type FollowCameraOptions = {
  offset?: THREE.Vector3;
  lerp?: number;
  lookAtOffset?: THREE.Vector3;
}

export function useFollowCamera(targetRef: React.RefObject<THREE.Object3D> | null, options?: FollowCameraOptions) {
  
  // get real state of threejs camera
  const camera = useThree((state) => state.camera);
  const offset = options?.offset ?? new THREE.Vector3(0, 4, 8);

  const lookAtOffset = options?.lookAtOffset ?? new THREE.Vector3(0, 1, 0);
  const lerp = options?.lerp ?? 0.01;

  const desiredPosition = new THREE.Vector3();
  const lookAtPosition = new THREE.Vector3();
  const worldTarget = new THREE.Vector3();

  useFrame(()=>{
    if(!targetRef?.current) return;

    // Use world position so it works when the target is a child of a moving parent (e.g., Rapier RigidBody)
    targetRef.current.getWorldPosition(worldTarget);
    desiredPosition.copy(worldTarget).add(offset);
    camera.position.lerp(desiredPosition, lerp);

    lookAtPosition.copy(worldTarget).add(lookAtOffset);

    camera.lookAt(lookAtPosition);
  })
};
