import { useEffect } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { Controls } from "@/contexts/controls";
import { useDialogStore } from "@/store";

type DialogAdvanceOptions = {
  enabled?: boolean;
};

export function useDialogAdvance(options?: DialogAdvanceOptions) {
  const enabled = options?.enabled ?? true;
  const isOnDialog = useDialogStore((state) => state.isOnDialog);
  const advanceDialog = useDialogStore((state) => state.advanceDialog);
  const [subscribeKeys] = useKeyboardControls<Controls>();

  useEffect(() => {
    if (!enabled) return;
    return subscribeKeys(
      (state) => state[Controls.Interact],
      (pressed) => {
        if (!pressed || !isOnDialog) return;
        advanceDialog();
      },
    );
  }, [subscribeKeys, isOnDialog, advanceDialog, enabled]);
}
