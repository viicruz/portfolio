"use client";

//* Libraries imports
import React, { Suspense } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";

//* Utils imports
import { COLLISION_GROUPS, RIGID_BODY_NAMES } from "@/lib/rapier-collision";

const MODEL_PATH = "/assets/models/lamp/lamp.glb";
const MODEL_SCALE = 1 / 16;
const ALPHA_TEST = 0.01;
const DEFAULT_POSITION: [number, number, number] = [0, 2, -10];
const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0];

type LampProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

function configureMeshes(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.castShadow = true;
    child.receiveShadow = false;

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

function LampModel(props: LampProps) {
  const gltf = useGLTF(MODEL_PATH);

  React.useMemo(() => {
    configureMeshes(gltf.scene);
  }, [gltf.scene]);

  return (
    <Clone object={gltf.scene} scale={props.scale ?? MODEL_SCALE} />
  );
}

export function Lamp(props: LampProps) {
  return (
    <Suspense fallback={null}>
      <RigidBody
        type="fixed"
        colliders="trimesh"
        position={props.position ?? DEFAULT_POSITION}
        rotation={props.rotation ?? DEFAULT_ROTATION}
        scale={props.scale ?? MODEL_SCALE}
        name={RIGID_BODY_NAMES.obstacle}
        collisionGroups={COLLISION_GROUPS.obstacle}
      >
        <LampModel
          scale={props.scale}
        />
      </RigidBody>
    </Suspense>
  );
}

useGLTF.preload(MODEL_PATH);
