"use client";
import { Scene } from "@/components/scene";
import { OrbitControls } from "@react-three/drei"; 

export default function Home() {
  return (
    <main className="w-full h-svh">
      <Scene>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="orange" />
        </mesh>
        <OrbitControls />
      </Scene>
    </main>
  );
}
