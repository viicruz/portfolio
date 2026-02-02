import type { Object3D } from "three";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";

import { Controls } from "@/contexts/controls";

export type PlayerMovementOptions = {
	speed?: number;
};

export function usePlayerMovement(
	ref: RefObject<Object3D | null>,
	options?: PlayerMovementOptions
) {
	const speed = options?.speed ?? 2.5;

	const keyboard = useKeyboardControls<Controls>();
	const getKeys = keyboard[1];

	useFrame((_, delta) => {
		if (!ref.current) return;

		const key = getKeys();
		const sprintMultiplier = key[Controls.Sprint] ? 2 : 1;
		const adjustedSpeed = speed * sprintMultiplier;

		if (key[Controls.Up]) {
			ref.current.position.z -= adjustedSpeed * delta;
		}
		if (key[Controls.Down]) {
			ref.current.position.z += adjustedSpeed * delta;
		}
		if (key[Controls.Left]) {
			ref.current.position.x -= adjustedSpeed * delta;
		}
		if (key[Controls.Right]) {
			ref.current.position.x += adjustedSpeed * delta;
		}
	});
}

