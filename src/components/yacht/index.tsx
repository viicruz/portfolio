"use client";

//* Libraries imports
import React, { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MODEL_PATH = "/assets/models/yacht/yacht.glb";
const MODEL_SCALE = 1 / 16;
const ALPHA_TEST = 0.01;
const DEFAULT_POSITION: [number, number, number] = [0, 2, -10];
const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0];
const WAVE_VERTICAL_AMPLITUDE = 0.14;
const WAVE_TILT_AMPLITUDE = 0.045;
const WAVE_SPEED = 1.15;

type YachtProps = {
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

function YachtModel(props: YachtProps) {
  const gltf = useGLTF(MODEL_PATH);
  const groupRef = React.useRef<THREE.Group>(null);
  const waveTimeRef = React.useRef(0);
  const basePositionRef = React.useRef<[number, number, number]>(
    props.position ?? DEFAULT_POSITION,
  );
  const baseRotationRef = React.useRef<[number, number, number]>(
    props.rotation ?? DEFAULT_ROTATION,
  );

  React.useEffect(() => {
    configureMeshes(gltf.scene);
  }, [gltf.scene]);

  React.useEffect(() => {
    basePositionRef.current = props.position ?? DEFAULT_POSITION;
  }, [props.position]);

  React.useEffect(() => {
    baseRotationRef.current = props.rotation ?? DEFAULT_ROTATION;
  }, [props.rotation]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    waveTimeRef.current += delta;

    const wavePhase = waveTimeRef.current * WAVE_SPEED;
    const bob = Math.sin(wavePhase) * WAVE_VERTICAL_AMPLITUDE;
    const tilt = Math.sin(wavePhase + Math.PI / 2) * WAVE_TILT_AMPLITUDE;
    const roll = Math.sin(wavePhase * 0.7) * WAVE_TILT_AMPLITUDE * 0.65;
    const [baseX, baseY, baseZ] = basePositionRef.current;
    const [baseRotX, baseRotY, baseRotZ] = baseRotationRef.current;

    group.position.set(baseX, baseY + bob, baseZ);
    group.rotation.set(baseRotX + tilt, baseRotY, baseRotZ + roll);
  });

  return (
    <group ref={groupRef} scale={props.scale ?? MODEL_SCALE}>
      <primitive object={gltf.scene} />
    </group>
  );
}

export function Yacht(props: YachtProps) {
  return (
    <Suspense fallback={null}>
      <YachtModel
        position={props.position ?? DEFAULT_POSITION}
        rotation={props.rotation ?? DEFAULT_ROTATION}
        scale={props.scale}
      />
    </Suspense>
  );
}

useGLTF.preload(MODEL_PATH);
