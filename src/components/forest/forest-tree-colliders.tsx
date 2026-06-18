"use client";

//* Libraries imports
import { CylinderCollider, RigidBody } from "@react-three/rapier";

//* Local imports
import type { TreePlacement } from "@/components/forest/forest-layout";
import { TREE_COLLIDER_ARGS } from "@/components/tree/tree-collider";

type ForestTreeCollidersProps = {
  placements: TreePlacement[];
};

export function ForestTreeColliders(props: ForestTreeCollidersProps) {
  return (
    <RigidBody type="fixed" colliders={false}>
      {props.placements.map((placement) => (
        <CylinderCollider
          key={`${placement.position[0]}-${placement.position[2]}`}
          position={placement.position}
          rotation={placement.rotation}
          args={[...TREE_COLLIDER_ARGS]}
        />
      ))}
    </RigidBody>
  );
}
