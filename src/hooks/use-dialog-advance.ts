"use client";

//* Libraries imports
import { useEffect } from "react";
import { useKeyboardControls } from "@react-three/drei";

//* Context imports
import { Controls } from "@/contexts/controls";

//* Store imports
import { useDialogStore } from "@/store";
import { useGameMenuStore } from "@/store/game-menu";

type DialogAdvanceOptions = {
  enabled?: boolean;
};

export function useDialogAdvance(options?: DialogAdvanceOptions) {
  const enabled = options?.enabled ?? true;
  const advanceDialog = useDialogStore((state) => state.advanceDialog);
  const [subscribeKeys] = useKeyboardControls<Controls>();
  const dialogStore = useDialogStore();
  const dialogIntention = dialogStore.npcDialogIntention;
  const menuScreen = useGameMenuStore((state) => state.screen);

  useEffect(() => {
    if (!enabled) return;
    return subscribeKeys(
      (state) => state[Controls.Interact],
      (pressed) => {
        if (!pressed) return;
        if (menuScreen !== "closed") return;
        if (dialogIntention) {
          dialogStore.startDialog(
            dialogIntention.npcId,
            dialogIntention.dialogId,
          );
        } else {
          advanceDialog();
        }
      },
    );
  }, [
    subscribeKeys,
    advanceDialog,
    enabled,
    dialogIntention,
    dialogStore,
    menuScreen,
  ]);
}
