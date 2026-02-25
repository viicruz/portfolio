import { KeyboardControls, type KeyboardControlsEntry } from "@react-three/drei";


export enum Controls {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
  Sprint = "sprint",
  Interact = "interact",
}

const keyboardControls: { name: Controls; keys: string | string[] }[] = [
  { name: Controls.Up, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.Down, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.Left, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.Right, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.Sprint, keys: ["ShiftLeft", "ShiftRight"] },
  { name: Controls.Interact, keys: ["Space"] },
];

type KeyboardControlsProps = {
  children: React.ReactNode;
}

export function CharacterControls(props: KeyboardControlsProps) {
  return (
    <KeyboardControls
      map={keyboardControls as KeyboardControlsEntry<Controls>[]}
    >
      {props.children}
    </KeyboardControls>
  );

}