"use client";

//* Libraries imports
import React, { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { COLLISION_GROUPS, RIGID_BODY_NAMES } from "@/lib/rapier-collision";
import { RigidBody } from "@react-three/rapier";

const MODEL_PATH1 = "/assets/models/buildings/building1.glb";
const MODEL_PATH2 = "/assets/models/buildings/building2.glb";
const MODEL_SCALE = 1 / 16;
const ALPHA_TEST = 0.01;
const DEFAULT_POSITION: [number, number, number] = [0, 2, -10];
const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0];

type BuildingProps = {
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

function Building1Model(props: BuildingProps) {
  const gltf = useGLTF(MODEL_PATH1);

  React.useMemo(() => {
    configureMeshes(gltf.scene);
  }, [gltf.scene]);

  return (
    <primitive object={gltf.scene} scale={props.scale ?? MODEL_SCALE} />
  );
}

export function Building1(props: BuildingProps) {
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
        <Building1Model
          scale={props.scale}
        />
      </RigidBody>
    </Suspense>
  );
}

useGLTF.preload(MODEL_PATH1);


function BuildingModel2(props: BuildingProps) {
  const gltf = useGLTF(MODEL_PATH2);

  React.useMemo(() => {
    configureMeshes(gltf.scene);
  }, [gltf.scene]);

  return (
    <primitive object={gltf.scene} scale={props.scale ?? MODEL_SCALE} />
  );
}

export function Building2(props: BuildingProps) {
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
        <BuildingModel2
          scale={props.scale}
        />
      </RigidBody>
    </Suspense>
  );
}

useGLTF.preload(MODEL_PATH2);