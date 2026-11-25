"use client";

//* Libraries imports
import { useEffect, useEffectEvent } from "react";

//* Local imports
import type { OpeningStep } from "@/components/opening-intro/types";
import { resolveOpeningKeyAction } from "@/components/opening-intro/view-model";

//* Utils imports
import type { PlayerGender } from "@/utils/player-profile";

type UseOpeningKeyboardProps = {
  step: OpeningStep;
  onSetGender: (gender: PlayerGender) => void;
  onSubmitGender: () => void;
  onConfirmReady: () => void;
  onAdvanceTalk: () => void;
};

export function useOpeningKeyboard(props: UseOpeningKeyboardProps) {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const action = resolveOpeningKeyAction(props.step, event.key);

    if (action === null) {
      return;
    }

    event.preventDefault();

    if (action.type === "setGender") {
      props.onSetGender(action.gender);
      return;
    }

    if (action.type === "submitGender") {
      props.onSubmitGender();
      return;
    }

    if (action.type === "confirmReady") {
      props.onConfirmReady();
      return;
    }

    props.onAdvanceTalk();
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
