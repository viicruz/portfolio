"use client";

//* Libraries imports
import { CylinderCollider, RigidBody } from "@react-three/rapier";

//* Local imports
import type { TreePlacement } from "@/components/forest/forest-layout";
import { TREE_COLLIDER_ARGS } from "@/components/tree/tree-collider";
import {
  COLLISION_GROUPS,
  RIGID_BODY_NAMES,
} from "@/lib/rapier-collision";

type ForestTreeCollidersProps = {
  placements: TreePlacement[];
};

export function ForestTreeColliders(props: ForestTreeCollidersProps) {
  return (
    <RigidBody
      name={RIGID_BODY_NAMES.obstacle}
      type="fixed"
      colliders={false}
      collisionGroups={COLLISION_GROUPS.obstacle}
    >
      {props.placements.map((placement) => (
        <CylinderCollider
          key={`${placement.position[0]}-${placement.position[2]}`}
          position={placement.position}
          rotation={placement.rotation}
          args={[...TREE_COLLIDER_ARGS]}
          collisionGroups={COLLISION_GROUPS.obstacle}
        />
      ))}
    </RigidBody>
  );
}
