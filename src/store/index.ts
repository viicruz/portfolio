import { create } from "zustand";

//*Tranlation json import
import en from "../../messages/en.json";

type Translation = typeof en.dialogs;

type DialogStore = {
  npcId: string | null;
  dialogId: string | null;
  dialogLine: number;
  isOnDialog: boolean;
  canDialogAdvance: boolean;
  translationObject: Translation;
  isLastDialogLine: boolean;

  setNpcId: (npcId: string | null) => void;
  setDialogId: (dialogId: string | null) => void;
  setDialogLine: (dialogLine: number) => void;
  setIsOnDialog: (isOnDialog: boolean) => void;
  advanceDialog: () => void;
};

export const useDialogStore = create<DialogStore>((set) => ({
  npcId: "npc1",
  dialogId: "dialog1",
  dialogLine: 1,
  isOnDialog: true,
  canDialogAdvance: true,
  translationObject: en.dialogs,
  isLastDialogLine: false,

  setNpcId: (npcId) => set({ npcId }),
  setDialogId: (dialogId) => set({ dialogId }),
  setDialogLine: (dialogLine) => set({ dialogLine }),
  setIsOnDialog: (isOnDialog) => set({ isOnDialog }),
  advanceDialog: () => {
    set((state) => {
      const actualNpcId = state.npcId;
      const actualDialogId = state.dialogId;
      const actualDialogLine = state.dialogLine;
      const npcDialog =
        state.translationObject[actualNpcId as keyof typeof en.dialogs];
      const dialogLines = npcDialog
        ? npcDialog[actualDialogId as keyof typeof npcDialog]
        : null;
      const nextDialogLine = actualDialogLine + 1;
      const canDialogAdvance = dialogLines
        ? !!dialogLines[nextDialogLine.toString() as keyof typeof dialogLines]
        : false;

      const isLastDialogLine = dialogLines
        ? !dialogLines[
            (nextDialogLine + 1).toString() as keyof typeof dialogLines
          ]
        : false;

      if (canDialogAdvance) {
        console.log("Dialog advanced to line", {
          npcId: actualNpcId,
          dialogId: actualDialogId,
          dialogLine: nextDialogLine,
          canDialogAdvance,
          actualDialogId,
          actualDialogLine,
          dialogLines,
          nextDialogLine,
        });
        return {
          dialogLine: nextDialogLine,
          canDialogAdvance,
          isLastDialogLine,
        };
      } else {
        console.log("Dialog can't advance");
        return {
          npcId: null,
          dialogId: null,
          dialogLine: 1,
          isOnDialog: false,
          canDialogAdvance: true,
          isLastDialogLine: false
        };
      }
    });
  },
}));
