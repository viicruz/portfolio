'use client';

//*Libraries imports
import { Canvas } from '@react-three/fiber';


type SceneProps = {
  children?: React.ReactNode;
}
export function Scene(props: SceneProps) {
  return (
    <Canvas camera={{fov: 45}}>
      {props.children}
    </Canvas>
  );
};
