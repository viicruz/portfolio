//* Libraries imports
import * as THREE from "three";
import React from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

type SpriteFrame = {
  frame: { x: number; y: number; w: number; h: number };
};

type SpriteSheetData = {
  frames: Record<string, SpriteFrame>;
  meta: {
    size: { w: number; h: number };
  };
};

type SpritePlaneAnimatorProps = {
  texturePath: string;
  spriteDataUrl: string;
  animationName: string;
  fps?: number;
  scale?: [number, number, number];
  position?: [number, number, number];
  alphaTest?: number;
};

const _cameraDir = new THREE.Vector3();

function parseAnimationFrames(
  spriteData: SpriteSheetData,
  animationName: string,
): SpriteFrame[] {
  const prefix = `${animationName}_`;
  return Object.keys(spriteData.frames)
    .filter((name) => name.startsWith(prefix))
    .sort()
    .map((name) => spriteData.frames[name]);
}

export function SpritePlaneAnimator(props: SpritePlaneAnimatorProps) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const frameIndexRef = React.useRef(0);
  const elapsedRef = React.useRef(0);
  const prevAnimationRef = React.useRef(props.animationName);

  const { camera } = useThree();

  const baseTexture = useTexture(props.texturePath);
  const texture = React.useMemo(() => {
    const t = baseTexture.clone();
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
    return t;
  }, [baseTexture]);

  const raw = useLoader(THREE.FileLoader, props.spriteDataUrl) as string;
  const spriteData = React.useMemo(
    () => JSON.parse(raw) as SpriteSheetData,
    [raw],
  );

  const frames = React.useMemo(
    () => parseAnimationFrames(spriteData, props.animationName),
    [spriteData, props.animationName],
  );

  const customDepthMaterial = React.useMemo(() => {
    const mat = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      alphaTest: props.alphaTest ?? 0.01,
    });
    mat.map = texture;
    mat.side = THREE.DoubleSide;
    return mat;
  }, [texture, props.alphaTest]);

  if (prevAnimationRef.current !== props.animationName) {
    prevAnimationRef.current = props.animationName;
    frameIndexRef.current = 0;
    elapsedRef.current = 0;
  }

  useFrame((_, delta) => {
    if (!meshRef.current || frames.length === 0) return;

    const fps = props.fps ?? 8;
    elapsedRef.current += delta;
    const frameDuration = 1 / fps;
    while (elapsedRef.current >= frameDuration) {
      elapsedRef.current -= frameDuration;
      frameIndexRef.current = (frameIndexRef.current + 1) % frames.length;
    }

    const frame = frames[frameIndexRef.current];
    const { w: sheetW, h: sheetH } = spriteData.meta.size;
    const { x, y, w, h } = frame.frame;

    texture.repeat.set(w / sheetW, h / sheetH);
    texture.offset.set(x / sheetW, 1 - (y + h) / sheetH);

    camera.getWorldDirection(_cameraDir);
    _cameraDir.y = 0;
    _cameraDir.normalize();
    meshRef.current.rotation.y = Math.atan2(-_cameraDir.x, -_cameraDir.z);
  });

  return (
    <mesh
      ref={meshRef}
      position={props.position ?? [0, 0, 0]}
      scale={props.scale ?? [1, 1, 1]}
      castShadow
      customDepthMaterial={customDepthMaterial}
    >
      <planeGeometry args={[1, 1.25]} />
      <meshStandardMaterial
        map={texture}
        alphaTest={props.alphaTest ?? 0.01}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
