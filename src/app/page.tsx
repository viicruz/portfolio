import { Scene } from "@/components/scene";

export default function Home() {
  return (
    <main className="w-full h-svh">
      <Scene>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="orange" />
        </mesh>
      </Scene>
    </main>
  );
}
