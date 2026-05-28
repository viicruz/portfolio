'use client';

//* Libraries imports
import { RigidBody, type CuboidCollider } from "@react-three/rapier";
import { CuboidCollider as CuboidColliderComp } from "@react-three/rapier";

type InteractionSphereProps = {
  children?: React.ReactNode;
  onPlayerEnter?: () => void;
  onPlayerExit?: () => void;
  position?: [number, number, number];
  asChild?: boolean; // render collider as child (attach to parent RigidBody)
}

export function InteractionSphere(props: InteractionSphereProps) {
  // when used as child inside a RigidBody, render a collider component so it moves with parent
  if (props.asChild) {
    return (
      <group>
        {/* child collider attached to parent rigid body */}
        <CuboidColliderComp args={[1.25, 1.25, 1.25]} sensor onIntersectionEnter={props.onPlayerEnter} onIntersectionExit={props.onPlayerExit} />
        {props.children}
      </group>
    );
  }

  return (
    <group>
      <RigidBody position={props.position ?? [0, 0, 0]} onIntersectionEnter={props.onPlayerEnter} onIntersectionExit={props.onPlayerExit} sensor colliders="cuboid" mass={1} type="fixed">
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.25, 16, 16]} />
          <meshBasicMaterial transparent opacity={0.5} />
        </mesh>
      </RigidBody>
      {props.children}
    </group>
  );
}