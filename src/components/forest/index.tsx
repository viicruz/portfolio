"use client";

//* Libraries imports
import { Suspense, useMemo } from "react";

//* Components imports
import { TreeModel } from "@/components/tree/index";

//* Local imports
import { resolveForestPlacements } from "@/components/forest/forest-layout";

type ForestProps = {
  baseY?: number;
  scale?: number;
};

function ForestTrees(props: ForestProps) {
  const baseY = props.baseY ?? -0.749;
  const scale = props.scale ?? 1.25;

  const placements = useMemo(
    () => resolveForestPlacements(baseY),
    [baseY],
  );

  console.log("rendering forest trees");

  return (
    <group>
      {placements.map((placement) => (
        <TreeModel
          key={`${placement.position[0]}-${placement.position[2]}`}
          position={placement.position}
          rotation={placement.rotation}
          scale={placement.scale ?? scale}
        />
      ))}
    </group>
  );
}

export function Forest(props: ForestProps) {
  return (
    <Suspense fallback={null}>
      <ForestTrees baseY={props.baseY} scale={props.scale} />
    </Suspense>
  );
}

