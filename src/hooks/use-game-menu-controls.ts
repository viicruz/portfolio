"use client";
//* Libraries imports
import { useEffect } from "react";
import { useKeyboardControls } from "@react-three/drei";

//* Context imports
import { Controls } from "@/contexts/controls";

//* Store imports
import { useDialogStore } from "@/store";
import { useGameMenuStore } from "@/store/game-menu";

type GameMenuControlsOptions = {
  enabled?: boolean;
};

/**
 * This hook is used to handle the game menu controls.
 * It is used to open and close the menu, navigate through the menu, and select items.
 */

export function useGameMenuControls(options?: GameMenuControlsOptions) {
  const enabled = options?.enabled ?? true;
  const [subscribeKeys] = useKeyboardControls<Controls>();

  useEffect(() => {
    if (!enabled) return;

    const unsubscribeMenu = subscribeKeys(
      (state) => state[Controls.Menu],
      (pressed) => {
        if (!pressed) return;

        const menuState = useGameMenuStore.getState();
        const dialogState = useDialogStore.getState();

        if (menuState.screen === "closed") {
          if (dialogState.isOnDialog) return;
          menuState.openMenu();
          return;
        }

        menuState.goBack();
      },
    );

    const unsubscribeUp = subscribeKeys(
      (state) => state[Controls.Up],
      (pressed) => {
        if (!pressed) return;
        const menuState = useGameMenuStore.getState();
        if (menuState.screen !== "main") return;
        menuState.moveCursor("up");
      },
    );

    const unsubscribeDown = subscribeKeys(
      (state) => state[Controls.Down],
      (pressed) => {
        if (!pressed) return;
        const menuState = useGameMenuStore.getState();
        if (menuState.screen !== "main") return;
        menuState.moveCursor("down");
      },
    );

    const unsubscribeLeft = subscribeKeys(
      (state) => state[Controls.Left],
      (pressed) => {
        if (!pressed) return;
        const menuState = useGameMenuStore.getState();
        if (menuState.screen !== "main") return;
        menuState.moveCursor("left");
      },
    );

    const unsubscribeRight = subscribeKeys(
      (state) => state[Controls.Right],
      (pressed) => {
        if (!pressed) return;
        const menuState = useGameMenuStore.getState();
        if (menuState.screen !== "main") return;
        menuState.moveCursor("right");
      },
    );

    const unsubscribeInteract = subscribeKeys(
      (state) => state[Controls.Interact],
      (pressed) => {
        if (!pressed) return;
        const menuState = useGameMenuStore.getState();
        if (menuState.screen !== "main") return;
        menuState.confirmSelection();
      },
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      const menuState = useGameMenuStore.getState();
      if (menuState.screen === "closed") return;

      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
      }

      if (event.key === "Escape") {
        menuState.goBack();
        return;
      }

      if (event.key === "Enter" && menuState.screen === "main") {
        menuState.confirmSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unsubscribeMenu();
      unsubscribeUp();
      unsubscribeDown();
      unsubscribeLeft();
      unsubscribeRight();
      unsubscribeInteract();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, subscribeKeys]);
}
