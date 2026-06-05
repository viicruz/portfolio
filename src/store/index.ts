'use client';

import { create } from "zustand";

//*Tranlation json import
import en from "../../messages/en.json";

//* Sound effect imports
const dialogAdvanceSfx =
  typeof window !== "undefined"
    ? new Audio("/assets/sounds/interaction_sound.mp3")
    : ({} as HTMLAudioElement);

const bumpingSfx =
  typeof window !== "undefined"
    ? new Audio("/assets/sounds/bumping_sound.mp3")
    : ({} as HTMLAudioElement);

if (typeof window !== "undefined") {
  dialogAdvanceSfx.volume = 0.5;
  bumpingSfx.volume = 0.5;
}

export const playBumpingSound = () => {
  if (typeof window === "undefined") return;
  bumpingSfx.currentTime = 0;
  void bumpingSfx.play().catch(() => {});
};

type Translation = typeof en.dialogs;

type DialogStore = {
  npcId: string | null;
  dialogId: string | null;
  dialogLine: number;
  isOnDialog: boolean;
  canDialogAdvance: boolean;
  translationObject: Translation;
  isLastDialogLine: boolean;
  npcDialogIntention: {npcId: string, dialogId: string} | null;
  globalPlayerPosition: [number, number, number] | null;

  setNpcId: (npcId: string | null) => void;
  setDialogId: (dialogId: string | null) => void;
  setDialogLine: (dialogLine: number) => void;
  setIsOnDialog: (isOnDialog: boolean) => void;
  advanceDialog: () => void;
  setCanDialogAdvance: (canDialogAdvance: boolean) => void;
  setNpcDialogIntention: (npcDialogIntention: {npcId: string, dialogId: string} | null) => void;
  startDialog: (npcId: string, dialogId: string) => void;
  setDialogNull: () => void;
  setGlobalPlayerPosition: (position: [number, number, number] | null) => void;
};

export const useDialogStore = create<DialogStore>((set) => ({
  npcId: null,
  dialogId: null,
  dialogLine: 1,
  isOnDialog: false,
  canDialogAdvance: false,
  translationObject: en.dialogs,
  isLastDialogLine: false,
  npcDialogIntention: null,
  globalPlayerPosition: null,
  setCanDialogAdvance: (canDialogAdvance) => set({ canDialogAdvance }),
  setNpcDialogIntention: (npcDialogIntention) => set({ npcDialogIntention }),
  setGlobalPlayerPosition: (position) => set({ globalPlayerPosition: position }),
  startDialog: (npcId, dialogId) => {
    if(!npcId || !dialogId) return;
    set({
      npcId,
      dialogId,
      dialogLine: 1,
      isOnDialog: true,
      canDialogAdvance: true,
      npcDialogIntention: null,
    });
    dialogAdvanceSfx.currentTime = 0;
    dialogAdvanceSfx.play();
  },

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
        dialogAdvanceSfx.currentTime = 0;
        dialogAdvanceSfx.play();
        return {
          dialogLine: nextDialogLine,
          canDialogAdvance,
          isLastDialogLine,
        };
      } else {
        console.log("Dialog can't advance");
        const actualNpcId = state.npcId;
        return {
          npcId: null,
          dialogId: null,
          dialogLine: 1,
          isOnDialog: false,
          canDialogAdvance: true,
          isLastDialogLine: false,
          npcDialogIntention: {npcId: actualNpcId as string, dialogId: state.dialogId as string}
        };
      }
    });
  },
  setDialogNull: () => {
    set({
      npcId: null,
      dialogId: null,
      dialogLine: 1,
      isOnDialog: false,
      canDialogAdvance: false,
      isLastDialogLine: false,
      npcDialogIntention: null
    });
  }
}));
