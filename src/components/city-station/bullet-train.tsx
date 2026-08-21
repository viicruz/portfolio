"use client";

//* Libraries imports
import React, { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MODEL_PATH = "/assets/models/train-tracks/bullet-train.glb";
const MODEL_SCALE = 1 / 16;
const ALPHA_TEST = 0.01;
const START_POSITION: [number, number, number] = [-15, 2.4, -7];
const END_POSITION: [number, number, number] = [60, 2.4, -7];
const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0];
const TRAVEL_DURATION = 16;
const DWELL_DURATION = 5;
const CYCLE_DURATION = DWELL_DURATION * 2 + TRAVEL_DURATION * 2; // 60s

// Track rattle while moving (world units / radians on inner group). */
const SHAKE_Y = 0.02;
const SHAKE_Z = 0.0125;
const SHAKE_PITCH = 0.006;
const SHAKE_ROLL = 0.009;
const SHAKE_FREQ_FAST = 7;
const SHAKE_FREQ_SLOW = 3;

// World-space x bounds of the city station interior (tweak in scene).
const STATION_CLIP_MIN_X = -11;
const STATION_CLIP_MAX_X = -4;
// Track Z used by the station / clip guides.
const STATION_CLIP_Z = -7;
// Set true to draw clip plane helpers (also on in development by default)
const DEBUG_CLIP_GUIDES =
  process.env.NODE_ENV === "development";
const CLIP_HELPER_SIZE = 12;

const WEST_CLIP_PLANE = new THREE.Plane(
  new THREE.Vector3(1, 0, 0),
  -STATION_CLIP_MIN_X,
);
const EAST_CLIP_PLANE = new THREE.Plane(
  new THREE.Vector3(-1, 0, 0),
  STATION_CLIP_MAX_X,
);
const DOCKED_CLIP_PLANES = [WEST_CLIP_PLANE, EAST_CLIP_PLANE];
const TRAVEL_CLIP_PLANES = [WEST_CLIP_PLANE];

type BulletTrainProps = {
  position?: [number, number, number];
  endPosition?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  // Override clip debug guides (defaults to development)
  debugClipGuides?: boolean;
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

// Normalized derivative of easeInOutCubic (0 at ends, 1 at midpoint)
function easeInOutCubicSpeed(t: number): number {
  return t < 0.5 ? 4 * t * t : 4 * (1 - t) * (1 - t);
}

function getRouteProgress(cycleTime: number): number {
  const outboundStart = DWELL_DURATION;
  const outboundEnd = outboundStart + TRAVEL_DURATION;
  const returnStart = outboundEnd + DWELL_DURATION;
  const returnEnd = returnStart + TRAVEL_DURATION;

  if (cycleTime < outboundStart) {
    return 0;
  }

  if (cycleTime < outboundEnd) {
    const u = (cycleTime - outboundStart) / TRAVEL_DURATION;
    return easeInOutCubic(u);
  }

  if (cycleTime < returnStart) {
    return 1;
  }

  if (cycleTime < returnEnd) {
    const u = (cycleTime - returnStart) / TRAVEL_DURATION;
    return 1 - easeInOutCubic(u);
  }

  return 0;
}

/** Rattle intensity 0..1 from travel speed (zero while dwelling). */
function getTravelIntensity(cycleTime: number): number {
  const outboundStart = DWELL_DURATION;
  const outboundEnd = outboundStart + TRAVEL_DURATION;
  const returnStart = outboundEnd + DWELL_DURATION;
  const returnEnd = returnStart + TRAVEL_DURATION;

  if (cycleTime >= outboundStart && cycleTime < outboundEnd) {
    const u = (cycleTime - outboundStart) / TRAVEL_DURATION;
    return easeInOutCubicSpeed(u);
  }

  if (cycleTime >= returnStart && cycleTime < returnEnd) {
    const u = (cycleTime - returnStart) / TRAVEL_DURATION;
    return easeInOutCubicSpeed(u);
  }

  return 0;
}

function configureMeshes(
  object: THREE.Object3D,
  materials: THREE.Material[],
) {
  materials.length = 0;

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.castShadow = true;
    child.receiveShadow = false;

    const meshMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of meshMaterials) {
      material.transparent = false;
      material.opacity = 1;
      material.alphaTest = ALPHA_TEST;
      material.depthWrite = true;
      material.clippingPlanes = DOCKED_CLIP_PLANES;
      material.clipShadows = true;

      if (material.map) {
        material.map.minFilter = THREE.NearestFilter;
        material.map.magFilter = THREE.NearestFilter;
        material.map.generateMipmaps = false;
        material.map.needsUpdate = true;
      }

      material.needsUpdate = true;
      materials.push(material);
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
        clippingPlanes: DOCKED_CLIP_PLANES,
        clipShadows: true,
      });
      materials.push(child.customDepthMaterial);
    }
  });
}

function setClipPlanes(
  materials: THREE.Material[],
  planes: THREE.Plane[],
) {
  for (const material of materials) {
    material.clippingPlanes = planes;
  }
}

function ClipDebugGuides() {
  const midX = (STATION_CLIP_MIN_X + STATION_CLIP_MAX_X) / 2;
  const width = STATION_CLIP_MAX_X - STATION_CLIP_MIN_X;

  const westHelper = React.useMemo(
    () => new THREE.PlaneHelper(WEST_CLIP_PLANE, CLIP_HELPER_SIZE, 0x00ffff),
    [],
  );
  const eastHelper = React.useMemo(
    () => new THREE.PlaneHelper(EAST_CLIP_PLANE, CLIP_HELPER_SIZE, 0xff00ff),
    [],
  );

  React.useEffect(() => {
    return () => {
      westHelper.removeFromParent();
      eastHelper.removeFromParent();
    };
  }, [westHelper, eastHelper]);

  return (
    <group>
      <primitive object={westHelper} />
      <primitive object={eastHelper} />

      {/* Vertical wall markers at clip X (easier to read than PlaneHelper alone). */}
      <mesh
        position={[STATION_CLIP_MIN_X, 3, STATION_CLIP_Z]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh
        position={[STATION_CLIP_MAX_X, 3, STATION_CLIP_Z]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial
          color="#ff00ff"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Allowed volume strip on the ground between the two planes. */}
      <mesh
        position={[midX, 0.05, STATION_CLIP_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, 4]} />
        <meshBasicMaterial
          color="#88ff88"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function BulletTrainModel(props: BulletTrainProps) {
  const gltf = useGLTF(MODEL_PATH);
  const groupRef = React.useRef<THREE.Group>(null);
  const shakeRef = React.useRef<THREE.Group>(null);
  const cycleTimeRef = React.useRef(0);
  const materialsRef = React.useRef<THREE.Material[]>([]);
  const isDockedClipRef = React.useRef(true);
  const startPositionRef = React.useRef<[number, number, number]>(
    props.position ?? START_POSITION,
  );
  const endPositionRef = React.useRef<[number, number, number]>(
    props.endPosition ?? END_POSITION,
  );
  const baseRotationRef = React.useRef<[number, number, number]>(
    props.rotation ?? DEFAULT_ROTATION,
  );

  React.useEffect(() => {
    configureMeshes(gltf.scene, materialsRef.current);
    isDockedClipRef.current = true;
  }, [gltf.scene]);

  React.useEffect(() => {
    startPositionRef.current = props.position ?? START_POSITION;
  }, [props.position]);

  React.useEffect(() => {
    endPositionRef.current = props.endPosition ?? END_POSITION;
  }, [props.endPosition]);

  React.useEffect(() => {
    baseRotationRef.current = props.rotation ?? DEFAULT_ROTATION;
  }, [props.rotation]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const shake = shakeRef.current;
    if (!group || !shake) return;

    cycleTimeRef.current =
      (cycleTimeRef.current + delta) % CYCLE_DURATION;

    const cycleTime = cycleTimeRef.current;
    const progress = getRouteProgress(cycleTime);
    const [startX, startY, startZ] = startPositionRef.current;
    const [endX, , endZ] = endPositionRef.current;
    const [baseRotX, baseRotY, baseRotZ] = baseRotationRef.current;

    const x = THREE.MathUtils.lerp(startX, endX, progress);
    const y = startY;
    const z = THREE.MathUtils.lerp(startZ, endZ, progress);

    group.position.set(x, y, z);
    group.rotation.set(baseRotX, baseRotY, baseRotZ);

    const intensity = getTravelIntensity(cycleTime);
    if (intensity > 0) {
      const t = state.clock.elapsedTime;
      shake.position.y =
        (Math.sin(t * SHAKE_FREQ_FAST) +
          Math.sin(t * SHAKE_FREQ_SLOW) * 0.4) *
        SHAKE_Y *
        intensity;
      shake.position.z =
        Math.sin(t * SHAKE_FREQ_FAST * 0.8 + 1.1) * SHAKE_Z * intensity;
      shake.rotation.x =
        Math.sin(t * SHAKE_FREQ_FAST * 0.7) * SHAKE_PITCH * intensity;
      shake.rotation.z =
        Math.sin(t * SHAKE_FREQ_SLOW * 1.3) * SHAKE_ROLL * intensity;
    } else {
      shake.position.y = 0;
      shake.position.z = 0;
      shake.rotation.x = 0;
      shake.rotation.z = 0;
    }

    const shouldUseDockedClip = progress === 0;
    if (shouldUseDockedClip !== isDockedClipRef.current) {
      isDockedClipRef.current = shouldUseDockedClip;
      setClipPlanes(
        materialsRef.current,
        shouldUseDockedClip ? DOCKED_CLIP_PLANES : TRAVEL_CLIP_PLANES,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={shakeRef} scale={props.scale ?? MODEL_SCALE}>
        <primitive object={gltf.scene} />
      </group>
    </group>
  );
}

export function BulletTrain(props: BulletTrainProps) {
  const showClipGuides = props.debugClipGuides ?? DEBUG_CLIP_GUIDES;

  return (
    <Suspense fallback={null}>
      {showClipGuides ? <ClipDebugGuides /> : null}
      <BulletTrainModel
        position={props.position ?? START_POSITION}
        endPosition={props.endPosition ?? END_POSITION}
        rotation={props.rotation ?? DEFAULT_ROTATION}
        scale={props.scale}
      />
    </Suspense>
  );
}

useGLTF.preload(MODEL_PATH);
