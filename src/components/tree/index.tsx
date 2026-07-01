"use client";

//* Libraries imports
import React, { Suspense } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import { CylinderCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";

//* Local imports
import { TREE_COLLIDER_ARGS } from "@/components/tree/tree-collider";
import {
  COLLISION_GROUPS,
  RIGID_BODY_NAMES,
} from "@/lib/rapier-collision";

const MODEL_PATH = "/assets/models/tree/tree.gltf";
const MODEL_SCALE = 1;
const ALPHA_TEST = 0.01;
const DEFAULT_POSITION: [number, number, number] = [0, 2, -10];
const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0];

export type TreeProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

function configureMeshes(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    // child.castShadow = false;
    // child.receiveShadow = false;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      material.transparent = false;
      material.opacity = 1;
      material.alphaTest = ALPHA_TEST;
      material.depthWrite = true;

      if (material.map) {
        material.map.minFilter = THREE.NearestFilter;
        material.map.magFilter = THREE.NearestFilter;
        material.map.generateMipmaps = false;
        material.map.needsUpdate = true;
      }

      material.needsUpdate = true;
    }

    const primaryMaterial = Array.isArray(child.material)
      ? child.material[0]
      : child.material;

    if (primaryMaterial.map) {
      child.customDepthMaterial = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        alphaTest: ALPHA_TEST,
        map: primaryMaterial.map,
        side: THREE.DoubleSide,
      });
    }
  });
}

export function TreeModel(props: TreeProps) {
  const gltf = useGLTF(MODEL_PATH);

  React.useMemo(() => {
    configureMeshes(gltf.scene);
  }, [gltf.scene]);

  const position = props.position ?? DEFAULT_POSITION;
  const rotation = props.rotation ?? DEFAULT_ROTATION;
  const scale = props.scale ?? MODEL_SCALE;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Clone object={gltf.scene} castShadow={false} receiveShadow={false} />
    </group>
  );
}

export function Tree(props: TreeProps) {
  return (
    <RigidBody
      name={RIGID_BODY_NAMES.obstacle}
      type="fixed"
      colliders={false}
      position={props.position ?? DEFAULT_POSITION}
      rotation={props.rotation ?? DEFAULT_ROTATION}
      collisionGroups={COLLISION_GROUPS.obstacle}
    >
      <CylinderCollider
        args={[...TREE_COLLIDER_ARGS]}
        collisionGroups={COLLISION_GROUPS.obstacle}
      />
      <Suspense fallback={null}>
        <TreeModel position={[0, 0, 0]} scale={props.scale ?? MODEL_SCALE} />
      </Suspense>
    </RigidBody>
  );
}

useGLTF.preload(MODEL_PATH);
