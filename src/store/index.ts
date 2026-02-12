import { create } from "zustand";

type DialogStore = {
  npcId: string | null;
  dialogId: string | null;
  dialogLine: number;
  isOnDialog: boolean;
  setNpcId: (npcId: string | null) => void;
  setDialogId: (dialogId: string | null) => void;
  setDialogLine: (dialogLine: number) => void;
  setIsOnDialog: (isOnDialog: boolean) => void;
};

export const useDialogStore = create<DialogStore>((set) => ({
  npcId: null,
  dialogId: null,
  dialogLine: 0,
  isOnDialog: true,

  setNpcId: (npcId) => set({ npcId }),
  setDialogId: (dialogId) => set({ dialogId }),
  setDialogLine: (dialogLine) => set({ dialogLine }),
  setIsOnDialog: (isOnDialog) => set({ isOnDialog }),
}));
