"use client";

//* Libraries imports
import React, { Suspense } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { MeshCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";

const MODEL_PATH = "/assets/models/terrain/terrain.gltf";
const ALPHA_TEST = 0.01;
const FLOOR_SURFACE_Y = -0.75;

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

  const scene = React.useMemo(() => {
    const clone = gltf.scene.clone(true);
    configureMeshes(clone);
    return clone;
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
      type="fixed"
      colliders={false}
      position={[0, FLOOR_SURFACE_Y, 0]}
    >
      <MeshCollider type="trimesh">
        <group ref={groupRef}>
          <primitive object={scene} />
        </group>
      </MeshCollider>
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
