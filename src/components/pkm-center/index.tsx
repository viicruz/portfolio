"use client";

//* Libraries imports
import React, { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/assets/models/pkm-center/pkm-center.glb";
const MODEL_SCALE = 1 / 16;
const DEFAULT_POSITION: [number, number, number] = [0, 2, -10];
const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0];

type PkmCenterProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

function configureMeshes(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.castShadow = true;
    child.receiveShadow = true;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      material.transparent = false;
      material.opacity = 1;
      material.alphaTest = 0;
      material.depthWrite = true;
      material.needsUpdate = true;
    }
  });
}

function PkmCenterModel(props: PkmCenterProps) {
  const gltf = useGLTF(MODEL_PATH);

  React.useMemo(() => {
    configureMeshes(gltf.scene);
  }, [gltf.scene]);

  const position = props.position ?? DEFAULT_POSITION;
  const rotation = props.rotation ?? DEFAULT_ROTATION;
  const scale = props.scale ?? MODEL_SCALE;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={gltf.scene} />
    </group>
  );
}

export function PkmCenter(props: PkmCenterProps) {
  return (
    <Suspense fallback={null}>
      <PkmCenterModel
        position={props.position}
        rotation={props.rotation}
        scale={props.scale}
      />
    </Suspense>
  );
}

useGLTF.preload(MODEL_PATH);
