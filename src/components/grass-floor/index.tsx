"use client";

//* Libraries imports
import React, { Suspense } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { MeshCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";

import { COLLISION_GROUPS, RIGID_BODY_NAMES } from "@/lib/rapier-collision";

const MODEL_PATH = "/assets/models/terrain/terrain.gltf";
const ALPHA_TEST = 0.01;
const FLOOR_SURFACE_Y = -0.75;
const COLLISION_EXCLUDED_NAME_TERMS = ["fence", "chain"] as const;

function shouldExcludeFromCollision(object: THREE.Object3D) {
  let current: THREE.Object3D | null = object;

  while (current) {
    const name = current.name.toLowerCase();

    for (const term of COLLISION_EXCLUDED_NAME_TERMS) {
      if (name.includes(term)) return true;
    }

    current = current.parent;
  }

  return false;
}

function prepareSceneWithCollisionExclusions(scene: THREE.Object3D) {
  const decorativeGroup = new THREE.Group();
  decorativeGroup.name = "decorative";

  const meshesToDetach: THREE.Mesh[] = [];

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (!shouldExcludeFromCollision(child)) return;

    meshesToDetach.push(child);
  });

  for (const mesh of meshesToDetach) {
    decorativeGroup.attach(mesh);
  }

  return { scene, decorativeGroup };
}

function configureMeshes(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.receiveShadow = true;

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

function GrassFloorModel() {
  const groupRef = React.useRef<THREE.Group>(null);
  const gltf = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(gltf.animations, groupRef);

  const { scene, decorativeGroup } = React.useMemo(() => {
    const clone = gltf.scene.clone(true);
    configureMeshes(clone);
    return prepareSceneWithCollisionExclusions(clone);
  }, [gltf.scene]);

  React.useEffect(() => {
    const action = actions.animation;
    if (!action) return;

    action.reset();
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.setDuration(2);
    action.play();
  }, [actions]);

  return (
    <RigidBody
      name={RIGID_BODY_NAMES.floor}
      type="fixed"
      colliders={false}
      position={[0, FLOOR_SURFACE_Y, 0]}
      collisionGroups={COLLISION_GROUPS.floor}
    >
      <group ref={groupRef}>
        <MeshCollider type="trimesh">
          <primitive object={scene} />
        </MeshCollider>
        <primitive object={decorativeGroup} />
      </group>
    </RigidBody>
  );
}

export function GrassFloor() {
  return (
    <Suspense fallback={null}>
      <GrassFloorModel />
    </Suspense>
  );
}

useGLTF.preload(MODEL_PATH);
