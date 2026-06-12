"use client";

import { Tree } from "@/components/tree/index";

type ForestProps = {
  baseY?: number;
  scale?: number;
};

// Fila da frente (z = 30) — horizontal
const FRONT_X_POSITIONS = [-20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20];

// Fila do fundo (z = 55) — horizontal
const BACK_X_POSITIONS = [-20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20];

// Coluna esquerda (x = -20) — profundidade
const LEFT_Z_POSITIONS = [34, 38, 42, 46, 50];

// Coluna direita (x = 20) — profundidade
const RIGHT_Z_POSITIONS = [34, 38, 42, 46, 50];

export function Forest({ baseY = -0.749, scale = 1.25 }: ForestProps) {
  return (
    <group>
      {/* Fila frontal */}
      {FRONT_X_POSITIONS.map((x) => (
        <Tree key={`front-${x}`} position={[x, baseY, 30]} scale={scale} />
      ))}

      {/* Fila do fundo */}
      {BACK_X_POSITIONS.map((x) => (
        <Tree key={`back-${x}`} position={[x, baseY, 55]} scale={scale} />
      ))}

      {/* Coluna lateral esquerda */}
      {LEFT_Z_POSITIONS.map((z) => (
        <Tree key={`left-${z}`} position={[-20, baseY, z]} scale={scale} />
      ))}

      {/* Coluna lateral direita */}
      {RIGHT_Z_POSITIONS.map((z) => (
        <Tree key={`right-${z}`} position={[20, baseY, z]} scale={scale} />
      ))}
    </group>
  );
}