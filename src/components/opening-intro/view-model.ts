//* Utils imports
import { sanitizePlayerName, type PlayerGender } from "@/utils/player-profile";

//* Local imports
import {
  ADVANCE_KEYS,
  CONFIRM_KEYS,
  DEFAULT_TYPE_SPEED,
  MARILL_ENTER_MS,
  POKEBALL_APPEAR_MS,
  POKEBALL_HOLD_MS,
  POKEBALL_SHAKE_MS,
  POKEMON_LINE_KEYS,
  PROFESSOR_LINE_KEYS,
  PROFESSOR_SHIFT_MS,
  PROFESSOR_TRANSLATE_CENTER,
  PROFESSOR_TRANSLATE_GENDER,
  PROFESSOR_TRANSLATE_SHIFTED,
} from "@/components/opening-intro/constants";
import type {
  OpeningStep,
  PokemonRevealPhase,
} from "@/components/opening-intro/types";

const DIALOG_STEPS = new Set<OpeningStep>([
  "professorTalk",
  "releasePokemon",
  "showPokemon",
  "clearStage",
  "askGender",
  "askName",
  "confirm",
  "ready",
]);

const TYPING_HELD_STEPS = new Set<OpeningStep>([
  "askGender",
  "askName",
  "confirm",
  "releasePokemon",
  "clearStage",
]);

export type PokemonRevealCue =
  | {
      at: number;
      kind: "phase";
      phase: "pokeball" | "shake" | "marillEnter";
    }
  | { at: number; kind: "showPokemon" };

const RELEASE_POKEBALL_AT = PROFESSOR_SHIFT_MS;
const RELEASE_SHAKE_AT =
  RELEASE_POKEBALL_AT + POKEBALL_APPEAR_MS + POKEBALL_HOLD_MS;
const RELEASE_MARILL_ENTER_AT = RELEASE_SHAKE_AT + POKEBALL_SHAKE_MS;
const RELEASE_SHOW_POKEMON_AT = RELEASE_MARILL_ENTER_AT + MARILL_ENTER_MS;

export const POKEMON_REVEAL_TIMELINE: readonly PokemonRevealCue[] = [
  { at: RELEASE_POKEBALL_AT, kind: "phase", phase: "pokeball" },
  { at: RELEASE_SHAKE_AT, kind: "phase", phase: "shake" },
  { at: RELEASE_MARILL_ENTER_AT, kind: "phase", phase: "marillEnter" },
  { at: RELEASE_SHOW_POKEMON_AT, kind: "showPokemon" },
];

export type OpeningStageInput = {
  step: OpeningStep;
  revealPhase: PokemonRevealPhase;
  reducedMotion: boolean;
  typingDone: boolean;
};

export type OpeningStageFlags = {
  professorTranslateClass: string;
  marillFadingOut: boolean;
  showPokeball: boolean;
  showMarill: boolean;
  marillIdleActive: boolean;
  showDialog: boolean;
  showContinueHint: boolean;
};

export type OpeningDialogMessage =
  | { kind: "none" }
  | { kind: "line"; group: "professor" | "pokemon"; lineKey: string }
  | { kind: "prompt"; key: "genderPrompt" | "namePrompt" }
  | { kind: "named"; key: "confirmName" | "readyLine"; name: string };

export type OpeningKeyAction =
  | { type: "setGender"; gender: PlayerGender }
  | { type: "submitGender" }
  | { type: "confirmReady" }
  | { type: "advanceTalk" };

export type AdvanceTalkResult =
  | { type: "completeTyping" }
  | { type: "nextLine" }
  | { type: "beginPokemonRelease" }
  | { type: "beginClearStage" }
  | { type: "finishIntro" };

export type PokemonReleaseTransition = {
  step: "showPokemon" | "releasePokemon";
  revealPhase: "marill" | "shiftProfessor";
  resetLineIndex: boolean;
};

export type ClearStageTransition = {
  step: "askGender" | "clearStage";
  revealPhase: "returnProfessor" | "fadeMarill";
};

export function getTypeSpeed(reducedMotion: boolean): number {
  if (reducedMotion) {
    return 0;
  }

  return DEFAULT_TYPE_SPEED;
}

export function isTypingDone(step: OpeningStep, typeSpeed: number): boolean {
  return typeSpeed === 0 || TYPING_HELD_STEPS.has(step);
}

export function getOpeningStageFlags(
  input: OpeningStageInput,
): OpeningStageFlags {
  const professorShifted =
    input.step === "releasePokemon" ||
    input.step === "showPokemon" ||
    input.revealPhase === "fadeMarill";

  let professorTranslateClass = PROFESSOR_TRANSLATE_CENTER;

  if (professorShifted) {
    professorTranslateClass = PROFESSOR_TRANSLATE_SHIFTED;
  } else if (input.step === "askGender") {
    professorTranslateClass = PROFESSOR_TRANSLATE_GENDER;
  }

  const marillFadingOut =
    input.revealPhase === "fadeMarill" ||
    input.revealPhase === "returnProfessor" ||
    input.step === "askGender" ||
    input.step === "askName" ||
    input.step === "confirm" ||
    input.step === "ready";

  const showContinueHint =
    (input.step === "professorTalk" ||
      input.step === "showPokemon" ||
      input.step === "ready") &&
    input.typingDone;

  return {
    professorTranslateClass,
    marillFadingOut,
    showPokeball:
      input.revealPhase === "pokeball" || input.revealPhase === "shake",
    showMarill:
      input.revealPhase === "marillEnter" ||
      input.revealPhase === "marill" ||
      input.revealPhase === "fadeMarill" ||
      input.revealPhase === "returnProfessor",
    marillIdleActive:
      input.revealPhase === "marill" &&
      !input.reducedMotion &&
      !marillFadingOut,
    showDialog: DIALOG_STEPS.has(input.step),
    showContinueHint,
  };
}

export function getOpeningDialogMessage(
  step: OpeningStep,
  lineIndex: number,
  nameDraft: string,
): OpeningDialogMessage {
  if (step === "professorTalk" || step === "releasePokemon") {
    return {
      kind: "line",
      group: "professor",
      lineKey: `${PROFESSOR_LINE_KEYS[lineIndex]}`,
    };
  }

  if (step === "showPokemon" || step === "clearStage") {
    return {
      kind: "line",
      group: "pokemon",
      lineKey: `${POKEMON_LINE_KEYS[lineIndex]}`,
    };
  }

  if (step === "askGender") {
    return { kind: "prompt", key: "genderPrompt" };
  }

  if (step === "askName") {
    return { kind: "prompt", key: "namePrompt" };
  }

  const name = sanitizePlayerName(nameDraft);

  if (step === "confirm") {
    return { kind: "named", key: "confirmName", name };
  }

  if (step === "ready") {
    return { kind: "named", key: "readyLine", name };
  }

  return { kind: "none" };
}

export function resolveOpeningKeyAction(
  step: OpeningStep,
  key: string,
): OpeningKeyAction | null {
  if (step === "askGender") {
    if (key === "ArrowLeft" || key === "a" || key === "A") {
      return { type: "setGender", gender: "boy" };
    }

    if (key === "ArrowRight" || key === "d" || key === "D") {
      return { type: "setGender", gender: "girl" };
    }

    if (CONFIRM_KEYS.has(key)) {
      return { type: "submitGender" };
    }

    return null;
  }

  if (step === "askName") {
    return null;
  }

  if (step === "confirm") {
    if (CONFIRM_KEYS.has(key)) {
      return { type: "confirmReady" };
    }

    return null;
  }

  if (
    (step === "professorTalk" || step === "showPokemon" || step === "ready") &&
    ADVANCE_KEYS.has(key)
  ) {
    return { type: "advanceTalk" };
  }

  return null;
}

export function resolveAdvanceTalk(input: {
  typingDone: boolean;
  step: OpeningStep;
  lineIndex: number;
}): AdvanceTalkResult | null {
  if (!input.typingDone) {
    return { type: "completeTyping" };
  }

  if (input.step === "professorTalk") {
    if (input.lineIndex < PROFESSOR_LINE_KEYS.length - 1) {
      return { type: "nextLine" };
    }

    return { type: "beginPokemonRelease" };
  }

  if (input.step === "showPokemon") {
    if (input.lineIndex < POKEMON_LINE_KEYS.length - 1) {
      return { type: "nextLine" };
    }

    return { type: "beginClearStage" };
  }

  if (input.step === "ready") {
    return { type: "finishIntro" };
  }

  return null;
}

export function getPokemonReleaseTransition(
  reducedMotion: boolean,
): PokemonReleaseTransition {
  if (reducedMotion) {
    return {
      step: "showPokemon",
      revealPhase: "marill",
      resetLineIndex: true,
    };
  }

  return {
    step: "releasePokemon",
    revealPhase: "shiftProfessor",
    resetLineIndex: false,
  };
}

export function getClearStageTransition(
  reducedMotion: boolean,
): ClearStageTransition {
  if (reducedMotion) {
    return { step: "askGender", revealPhase: "returnProfessor" };
  }

  return { step: "clearStage", revealPhase: "fadeMarill" };
}

export function showsSpokenLine(step: OpeningStep): boolean {
  return (
    step === "professorTalk" ||
    step === "releasePokemon" ||
    step === "showPokemon" ||
    step === "clearStage" ||
    step === "ready"
  );
}

export function showsAdvanceTarget(step: OpeningStep): boolean {
  return step === "professorTalk" || step === "showPokemon" || step === "ready";
}

export function showsPlainPrompt(step: OpeningStep): boolean {
  return step === "askGender" || step === "askName";
}

export function showsInstantLine(
  step: OpeningStep,
  typingDone: boolean,
  typeSpeed: number,
): boolean {
  return (
    step === "releasePokemon" ||
    step === "clearStage" ||
    typingDone ||
    typeSpeed === 0
  );
}
