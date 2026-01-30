'use client';

//*Libraries imports
import { Canvas } from '@react-three/fiber';


type SceneProps = {
  children?: React.ReactNode;
}
export function Scene(props: SceneProps) {
  return (
    <Canvas>
      {props.children}
    </Canvas>
  );
};