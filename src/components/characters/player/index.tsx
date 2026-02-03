//*Libraries imports
import * as THREE from "three";
import React from "react";
import { RigidBody, type RapierRigidBody, CapsuleCollider } from "@react-three/rapier";

//* Hooks imports
import { useFollowCamera } from "@/hooks/useFollowCamera"
import { usePlayerMovement } from "@/hooks/usePlayerMovement";


const SPEED = 2.5;

export function Player() {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const bodyRef = React.useRef<RapierRigidBody | null>(null);

  // Keep the capsule upright: allow yaw (Y), lock roll/pitch (X/Z)
  React.useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    // Disable rotation around X and Z, keep Y rotation enabled
    body.setEnabledRotations(false, false, false, false);
    // Add some angular damping to resist any residual spin
    body.setAngularDamping(5);
  }, []);

  //@ts-expect-error
  useFollowCamera(meshRef, {
    //45 degrees behind and above the player
    offset: new THREE.Vector3(0, 15, 20),
    lerp: 0.1,
  })

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
      position={[0, 2, 0]}
    >
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <capsuleGeometry args={[0.5, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <CapsuleCollider args={[0.5, 0.5]} />
    </RigidBody>
  );
}