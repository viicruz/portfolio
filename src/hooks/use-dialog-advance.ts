import { useEffect } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { Controls } from "@/contexts/controls";
import { useDialogStore } from "@/store";

type DialogAdvanceOptions = {
  enabled?: boolean;
};

export function useDialogAdvance(options?: DialogAdvanceOptions) {
  const enabled = options?.enabled ?? true;
  const advanceDialog = useDialogStore((state) => state.advanceDialog);
  const [subscribeKeys] = useKeyboardControls<Controls>();
  const dialogStore = useDialogStore();
  const dialogIntention = dialogStore.npcDialogIntention;

  useEffect(() => {
    if (!enabled) return;
    return subscribeKeys(
      (state) => state[Controls.Interact],
      (pressed) => {
        if (!pressed) return;
        console.log("Apertou space")
        if(dialogIntention) {
          console.log("caiu no if")
          dialogStore.startDialog(dialogIntention.npcId, dialogIntention.dialogId);
        }else{
          console.log("caiu no else")
          advanceDialog();
        }
      },
    );
  }, [subscribeKeys, advanceDialog, enabled, dialogIntention, dialogStore]);
}
