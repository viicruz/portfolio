"use client";

//* Libraries imports
import React, { Suspense } from "react";
import { useGLTF, Clone, useAnimations } from "@react-three/drei";
import * as THREE from "three";

//* Local imports
import { SPAWN_AREA_GRASS_PLACEMENTS } from "@/components/flower/flower-layout";

const MODEL_PATH = "/assets/models/nature/flower.gltf";
const ANIMATION_NAME = "sprite-1";
const MODEL_SCALE = 1;
const ALPHA_TEST = 0.01;
const DEFAULT_POSITION: [number, number, number] = [0, -0.749, 30];

export type GrassProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

function configureMeshes(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

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

export function FlowerModel(props: GrassProps) {
  const groupRef = React.useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, groupRef);

  React.useMemo(() => {
    configureMeshes(scene);
  }, [scene]);

  React.useEffect(() => {
    const action = actions[ANIMATION_NAME];
    if (!action) return;

    action.reset();
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.setDuration(2);
    action.play();
  }, [actions]);

  const position = props.position ?? DEFAULT_POSITION;
  // const rotation = props.rotation ?? DEFAULT_ROTATION;
  const scale = props.scale ?? MODEL_SCALE;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <Clone object={scene} castShadow={false} receiveShadow={false} />
    </group>
  );
}

function FlowerPatches() {
  return (
    <group>
      {SPAWN_AREA_GRASS_PLACEMENTS.map((placement) => (
        <FlowerModel
          key={`${placement.position[0]}-${placement.position[2]}`}
          position={placement.position}
          rotation={placement.rotation}
          scale={placement.scale}
        />
      ))}
    </group>
  );
}

export function Flower() {
  return (
    <Suspense fallback={null}>
      <FlowerPatches />
    </Suspense>
  );
}

useGLTF.preload(MODEL_PATH);
