'use client';

//* Libraries imports
import { RigidBody } from "@react-three/rapier";

type InteractionSphereProps = {
  children?: React.ReactNode;
  onPlayerEnter?: () => void;
  onPlayerExit?: () => void;
}

export function InteractionSphere(props: InteractionSphereProps) {
  return (
    <group>
      <RigidBody onIntersectionEnter={() => { console.log('Entrou na área de interação') }} sensor colliders="cuboid" mass={1} type="fixed">
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.25, 16, 16]} />
          <meshBasicMaterial transparent opacity={0.5} />
        </mesh>
      </RigidBody>
      {props.children}
    </group>
  );
}