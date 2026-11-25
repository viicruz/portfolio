"use client";

//* Libraries imports
import { useEffect, useEffectEvent, useRef, useState } from "react";

//* Store imports
import { usePlayerProfileStore } from "@/store/player-profile";

//* Local imports
import {
  CLEAR_STAGE_GENDER_MS,
  CLEAR_STAGE_RETURN_MS,
  PROFESSOR_APPEAR_DELAY_MS,
  PROFESSOR_TALK_DELAY_MS,
} from "@/components/opening-intro/constants";
import type {
  OpeningStep,
  PokemonRevealPhase,
} from "@/components/opening-intro/types";
import {
  getClearStageTransition,
  getOpeningStageFlags,
  getPokemonReleaseTransition,
  getTypeSpeed,
  isTypingDone,
  POKEMON_REVEAL_TIMELINE,
  resolveAdvanceTalk,
} from "@/components/opening-intro/view-model";

//* Utils imports
import { sanitizePlayerName, type PlayerGender } from "@/utils/player-profile";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function useOpeningFlow(onComplete: () => void) {
  const completeOpening = usePlayerProfileStore(
    (state) => state.completeOpening,
  );

  const [step, setStep] = useState<OpeningStep>("professorAppear");
  const [professorVisible, setProfessorVisible] = useState(false);
  const [revealPhase, setRevealPhase] = useState<PokemonRevealPhase>("idle");
  const [lineIndex, setLineIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [gender, setGender] = useState<PlayerGender>("boy");
  const [nameDraft, setNameDraft] = useState("");
  const finishStartedRef = useRef(false);

  const reducedMotion = prefersReducedMotion();
  const typeSpeed = getTypeSpeed(reducedMotion);
  const sanitizedName = sanitizePlayerName(nameDraft);
  const stage = getOpeningStageFlags({
    step,
    revealPhase,
    reducedMotion,
    typingDone,
  });

  useEffect(() => {
    if (step !== "professorAppear") {
      return;
    }

    if (reducedMotion) {
      setProfessorVisible(true);
      setStep("professorTalk");
      return;
    }

    const appearId = window.setTimeout(() => {
      setProfessorVisible(true);
    }, PROFESSOR_APPEAR_DELAY_MS);

    const nextId = window.setTimeout(() => {
      setStep("professorTalk");
    }, PROFESSOR_TALK_DELAY_MS);

    return () => {
      window.clearTimeout(appearId);
      window.clearTimeout(nextId);
    };
  }, [step, reducedMotion]);

  useEffect(() => {
    if (step !== "releasePokemon") {
      return;
    }

    const timers: number[] = [];

    for (const cue of POKEMON_REVEAL_TIMELINE) {
      timers.push(
        window.setTimeout(() => {
          if (cue.kind === "showPokemon") {
            setRevealPhase("marill");
            setLineIndex(0);
            setStep("showPokemon");
            return;
          }

          setRevealPhase(cue.phase);
        }, cue.at),
      );
    }

    return () => {
      for (const id of timers) {
        window.clearTimeout(id);
      }
    };
  }, [step]);

  useEffect(() => {
    if (step !== "clearStage") {
      return;
    }

    const returnId = window.setTimeout(() => {
      setRevealPhase("returnProfessor");
    }, CLEAR_STAGE_RETURN_MS);

    const genderId = window.setTimeout(() => {
      setStep("askGender");
    }, CLEAR_STAGE_GENDER_MS);

    return () => {
      window.clearTimeout(returnId);
      window.clearTimeout(genderId);
    };
  }, [step]);

  // lineIndex restarts typing when the spoken line changes and step stays the same.
  // biome-ignore lint/correctness/useExhaustiveDependencies: lineIndex is the reset key for the next line
  useEffect(() => {
    setTypingDone(isTypingDone(step, typeSpeed));
  }, [step, lineIndex, typeSpeed]);

  const finishIntro = useEffectEvent(() => {
    if (finishStartedRef.current) {
      return;
    }

    finishStartedRef.current = true;

    completeOpening({
      name: sanitizePlayerName(nameDraft),
      gender,
    });

    // Opaque handoff — Scene owns the reveal/loading veil; fading first would
    // flash the 3D world before the next overlay mounts.
    onComplete();
  });

  const beginPokemonRelease = useEffectEvent(() => {
    const transition = getPokemonReleaseTransition(reducedMotion);

    setRevealPhase(transition.revealPhase);
    setStep(transition.step);

    if (transition.resetLineIndex) {
      setLineIndex(0);
    }
  });

  const beginClearStage = useEffectEvent(() => {
    const transition = getClearStageTransition(reducedMotion);

    setRevealPhase(transition.revealPhase);
    setStep(transition.step);
  });

  const advanceTalk = useEffectEvent(() => {
    const result = resolveAdvanceTalk({ typingDone, step, lineIndex });

    if (result === null) {
      return;
    }

    if (result.type === "completeTyping") {
      setTypingDone(true);
      return;
    }

    if (result.type === "nextLine") {
      setLineIndex((current) => current + 1);
      return;
    }

    if (result.type === "beginPokemonRelease") {
      beginPokemonRelease();
      return;
    }

    if (result.type === "beginClearStage") {
      beginClearStage();
      return;
    }

    finishIntro();
  });

  const submitGender = () => {
    setStep("askName");
  };

  const confirmReady = () => {
    setStep("ready");
    setLineIndex(0);
  };

  const handleSubmitName = () => {
    if (sanitizedName.length === 0) {
      return;
    }

    setNameDraft(sanitizedName);
    setStep("confirm");
  };

  const markTypingDone = () => {
    setTypingDone(true);
  };

  return {
    step,
    revealPhase,
    lineIndex,
    typingDone,
    typeSpeed,
    gender,
    nameDraft,
    sanitizedName,
    reducedMotion,
    professorVisible,
    stage,
    setGender,
    setNameDraft,
    advanceTalk,
    submitGender,
    confirmReady,
    handleSubmitName,
    markTypingDone,
  };
}
