'use client';

//*Libraries imports
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';


type SceneProps = {
  children?: React.ReactNode;
}
export function Scene(props: SceneProps) {
  return (
    <Canvas camera={{fov: 40}}>
      <Suspense>
        <Physics debug>
          {props.children}
        </Physics>
      </Suspense>
    </Canvas>
  );
};