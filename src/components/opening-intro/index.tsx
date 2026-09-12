"use client";

//* Libraries imports
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ReactTyped } from "react-typed";

//* Store imports
import { usePlayerProfileStore } from "@/store/player-profile";

//* Utils imports
import { cn } from "@/lib/utils";
import {
  MAX_NAME_LENGTH,
  sanitizePlayerName,
  type PlayerGender,
} from "@/utils/player-profile";

const PROFESSOR_LINE_KEYS = ["1", "2", "3", "4", "5"] as const;
const POKEMON_LINE_KEYS = ["1", "2", "3"] as const;

const APPEAR_MS = 500;
const MARILL_IDLE_MS = 700;
const PROFESSOR_SHIFT_MS = 550;
const POKEBALL_APPEAR_MS = 350;
const POKEBALL_HOLD_MS = 700;
const POKEBALL_SHAKE_MS = 500;
const MARILL_ENTER_MS = 400;
const MARILL_FADE_MS = 1100;

type OpeningStep =
  | "professorAppear"
  | "professorTalk"
  | "releasePokemon"
  | "showPokemon"
  | "clearStage"
  | "askGender"
  | "askName"
  | "confirm"
  | "ready";

type PokemonRevealPhase =
  | "idle"
  | "shiftProfessor"
  | "pokeball"
  | "shake"
  | "marillEnter"
  | "marill"
  | "fadeMarill"
  | "returnProfessor";

type OpeningIntroProps = {
  onComplete: () => void;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function OpeningIntro(props: OpeningIntroProps) {
  const t = useTranslations("opening");
  const completeOpening = usePlayerProfileStore((state) => state.completeOpening);

  const [step, setStep] = useState<OpeningStep>("professorAppear");
  const [professorVisible, setProfessorVisible] = useState(false);
  const [revealPhase, setRevealPhase] = useState<PokemonRevealPhase>("idle");
  const [lineIndex, setLineIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [gender, setGender] = useState<PlayerGender>("boy");
  const [nameDraft, setNameDraft] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const finishStartedRef = useRef(false);

  const reducedMotion = prefersReducedMotion();
  const typeSpeed = reducedMotion ? 0 : 28;
  const professorShifted =
    step === "releasePokemon" ||
    step === "showPokemon" ||
    revealPhase === "fadeMarill";
  const marillFadingOut =
    revealPhase === "fadeMarill" ||
    revealPhase === "returnProfessor" ||
    step === "askGender" ||
    step === "askName" ||
    step === "confirm" ||
    step === "ready";
  const showPokeball =
    revealPhase === "pokeball" || revealPhase === "shake";
  const showMarill =
    revealPhase === "marillEnter" ||
    revealPhase === "marill" ||
    revealPhase === "fadeMarill" ||
    revealPhase === "returnProfessor";
  const marillIdleActive =
    revealPhase === "marill" && !reducedMotion && !marillFadingOut;

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
    }, 50);

    const nextId = window.setTimeout(() => {
      setStep("professorTalk");
    }, APPEAR_MS + 80);

    return () => {
      window.clearTimeout(appearId);
      window.clearTimeout(nextId);
    };
  }, [step, reducedMotion]);

  useEffect(() => {
    if (step !== "releasePokemon") {
      return;
    }

    if (reducedMotion) {
      setRevealPhase("marill");
      setLineIndex(0);
      setStep("showPokemon");
      return;
    }

    const timers: number[] = [];
    let elapsed = 0;

    const schedule = (delay: number, callback: () => void) => {
      timers.push(window.setTimeout(callback, delay));
    };

    elapsed += PROFESSOR_SHIFT_MS;
    schedule(elapsed, () => setRevealPhase("pokeball"));

    elapsed += POKEBALL_APPEAR_MS + POKEBALL_HOLD_MS;
    schedule(elapsed, () => setRevealPhase("shake"));

    elapsed += POKEBALL_SHAKE_MS;
    schedule(elapsed, () => setRevealPhase("marillEnter"));

    elapsed += MARILL_ENTER_MS;
    schedule(elapsed, () => {
      setRevealPhase("marill");
      setLineIndex(0);
      setStep("showPokemon");
    });

    return () => {
      for (const id of timers) {
        window.clearTimeout(id);
      }
    };
  }, [step, reducedMotion]);

  useEffect(() => {
    if (step !== "clearStage") {
      return;
    }

    if (reducedMotion) {
      setRevealPhase("returnProfessor");
      setStep("askGender");
      return;
    }

    const returnId = window.setTimeout(() => {
      setRevealPhase("returnProfessor");
    }, MARILL_FADE_MS);

    const genderId = window.setTimeout(() => {
      setStep("askGender");
    }, MARILL_FADE_MS + PROFESSOR_SHIFT_MS);

    return () => {
      window.clearTimeout(returnId);
      window.clearTimeout(genderId);
    };
  }, [step, reducedMotion]);

  useEffect(() => {
    if (step === "askName") {
      nameInputRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    const keepTypingDone =
      step === "askGender" ||
      step === "askName" ||
      step === "confirm" ||
      step === "releasePokemon" ||
      step === "clearStage";

    // lineIndex in the expression forces a reset whenever the spoken line changes
    setTypingDone(typeSpeed === 0 || keepTypingDone || lineIndex < 0);
  }, [step, lineIndex, typeSpeed]);

  const finishIntro = useEffectEvent(() => {
    if (finishStartedRef.current) {
      return;
    }

    finishStartedRef.current = true;

    const trimmedName = sanitizePlayerName(nameDraft);

    completeOpening({
      name: trimmedName,
      gender,
    });

    // Opaque handoff — Scene owns the reveal/loading veil; fading first would
    // flash the 3D world before the next overlay mounts.
    props.onComplete();
  });

  const beginPokemonRelease = useEffectEvent(() => {
    if (reducedMotion) {
      setRevealPhase("marill");
      setLineIndex(0);
      setStep("showPokemon");
      return;
    }

    setRevealPhase("shiftProfessor");
    setStep("releasePokemon");
  });

  const beginClearStage = useEffectEvent(() => {
    if (reducedMotion) {
      setRevealPhase("returnProfessor");
      setStep("askGender");
      return;
    }

    setRevealPhase("fadeMarill");
    setStep("clearStage");
  });

  const advanceTalk = useEffectEvent(() => {
    if (!typingDone) {
      setTypingDone(true);
      return;
    }

    if (step === "professorTalk") {
      if (lineIndex < PROFESSOR_LINE_KEYS.length - 1) {
        setLineIndex((current) => current + 1);
        return;
      }

      beginPokemonRelease();
      return;
    }

    if (step === "showPokemon") {
      if (lineIndex < POKEMON_LINE_KEYS.length - 1) {
        setLineIndex((current) => current + 1);
        return;
      }

      beginClearStage();
      return;
    }

    if (step === "ready") {
      finishIntro();
    }
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (step === "askGender") {
        if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
          event.preventDefault();
          setGender("boy");
          return;
        }

        if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
          event.preventDefault();
          setGender("girl");
          return;
        }

        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "z" ||
          event.key === "Z"
        ) {
          event.preventDefault();
          setStep("askName");
        }

        return;
      }

      if (step === "askName") {
        return;
      }

      if (step === "confirm") {
        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "z" ||
          event.key === "Z"
        ) {
          event.preventDefault();
          setStep("ready");
          setLineIndex(0);
        }

        return;
      }

      if (
        step === "professorTalk" ||
        step === "showPokemon" ||
        step === "ready"
      ) {
        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "z" ||
          event.key === "Z" ||
          event.key === "a" ||
          event.key === "A"
        ) {
          event.preventDefault();
          advanceTalk();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [step]);

  const dialogText = (() => {
    if (step === "professorTalk" || step === "releasePokemon") {
      return t(`professorLines.${PROFESSOR_LINE_KEYS[lineIndex]}`);
    }

    if (step === "showPokemon" || step === "clearStage") {
      return t(`pokemonLines.${POKEMON_LINE_KEYS[lineIndex]}`);
    }

    if (step === "askGender") {
      return t("genderPrompt");
    }

    if (step === "askName") {
      return t("namePrompt");
    }

    if (step === "confirm") {
      return t("confirmName", { name: sanitizePlayerName(nameDraft) });
    }

    if (step === "ready") {
      return t("readyLine", { name: sanitizePlayerName(nameDraft) });
    }

    return "";
  })();

  const showDialog =
    step === "professorTalk" ||
    step === "releasePokemon" ||
    step === "showPokemon" ||
    step === "clearStage" ||
    step === "askGender" ||
    step === "askName" ||
    step === "confirm" ||
    step === "ready";

  const showContinueHint =
    (step === "professorTalk" ||
      step === "showPokemon" ||
      step === "ready") &&
    typingDone;

  const sanitizedName = sanitizePlayerName(nameDraft);
  const canSubmitName = sanitizedName.length > 0;

  const handleDialogClick = () => {
    if (
      step === "professorTalk" ||
      step === "showPokemon" ||
      step === "ready"
    ) {
      advanceTalk();
    }
  };

  const handleSubmitName = () => {
    if (!canSubmitName) {
      return;
    }

    setNameDraft(sanitizedName);
    setStep("confirm");
  };

  const handleConfirmYes = () => {
    setStep("ready");
    setLineIndex(0);
  };

  const handleConfirmNo = () => {
    setStep("askName");
  };

  return (
    <div
      aria-label="Opening intro"
      className="absolute inset-0 z-50 flex flex-col items-center justify-end bg-neutral-950 pointer-events-auto"
      role="dialog"
    >
      <div className="relative flex flex-1 w-full max-w-3xl flex-col items-center justify-end px-6 pb-4 pt-16">
        {step === "askGender" ? (
          <div className="flex w-full flex-col items-center pb-4">
            <div className="flex w-full items-center justify-center gap-8">
              <button
                aria-pressed={gender === "boy"}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 bg-black/40 px-4 py-3 transition-colors",
                  gender === "boy"
                    ? "border-amber-200 text-amber-200"
                    : "border-white/20 text-white/70",
                )}
                id="opening-gender-boy"
                onClick={() => setGender("boy")}
                type="button"
              >
                {/* biome-ignore lint/performance/noImgElement: pixel-art sprite needs crisp nearest-neighbor scaling */}
                <img
                  alt=""
                  className="h-32 w-16 object-contain [image-rendering:pixelated]"
                  src="/assets/sprites/opening/ethan.png"
                />
                <span className="font-pixel text-[0.65rem]">{t("boy")}</span>
              </button>

              <button
                aria-pressed={gender === "girl"}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 bg-black/40 px-4 py-3 transition-colors",
                  gender === "girl"
                    ? "border-amber-200 text-amber-200"
                    : "border-white/20 text-white/70",
                )}
                id="opening-gender-girl"
                onClick={() => setGender("girl")}
                type="button"
              >
                {/* biome-ignore lint/performance/noImgElement: pixel-art sprite needs crisp nearest-neighbor scaling */}
                <img
                  alt=""
                  className="h-32 w-16 object-contain [image-rendering:pixelated]"
                  src="/assets/sprites/opening/lyra.png"
                />
                <span className="font-pixel text-[0.65rem]">{t("girl")}</span>
              </button>
            </div>

            <div className="flex w-full justify-center pt-3">
              <button
                className="rounded-xl border-2 border-amber-200 bg-amber-200/10 px-6 py-2 font-pixel text-[0.65rem] text-amber-200"
                id="opening-gender-confirm"
                onClick={() => setStep("askName")}
                type="button"
              >
                {t("submitName")}
              </button>
            </div>
          </div>
        ) : null}

        <div className="relative h-40 w-full sm:h-52">
          {/* biome-ignore lint/performance/noImgElement: pixel-art sprite needs crisp nearest-neighbor scaling */}
          <img
            alt=""
            className={cn(
              "absolute bottom-0 left-1/2 h-40 w-20 object-contain [image-rendering:pixelated] ease-out sm:h-52 sm:w-24",
              professorVisible ? "opacity-100" : "opacity-0",
              professorShifted
                ? "-translate-x-[calc(50%+4.5rem)] sm:-translate-x-[calc(50%+6rem)]"
                : "-translate-x-1/2",
            )}
            src="/assets/sprites/opening/professor.png"
            style={{
              transitionDuration: reducedMotion
                ? "0ms"
                : `${APPEAR_MS}ms, ${PROFESSOR_SHIFT_MS}ms`,
              transitionProperty: "opacity, translate",
              transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />

          {revealPhase !== "idle" ? (
            <div className="absolute bottom-0 left-1/2 flex h-20 w-20 translate-x-3 items-end justify-center sm:h-24 sm:w-24 sm:translate-x-5">
              {showPokeball ? (
                <div
                  className={cn(
                    "flex h-8 w-8 items-end justify-center sm:h-9 sm:w-9",
                    revealPhase === "pokeball" ? "animate-pokeball-drop" : undefined,
                    revealPhase === "shake" ? "animate-pokeball-shake" : undefined,
                  )}
                  style={{
                    animationDuration:
                      revealPhase === "pokeball"
                        ? `${POKEBALL_APPEAR_MS}ms`
                        : `${POKEBALL_SHAKE_MS}ms`,
                  }}
                >
                  {/* biome-ignore lint/performance/noImgElement: pixel-art sprite needs crisp nearest-neighbor scaling */}
                  <img
                    alt=""
                    className="h-full w-full object-contain [image-rendering:pixelated]"
                    src="/assets/sprites/opening/pokeball.png"
                  />
                </div>
              ) : null}

              {showMarill ? (
                <div
                  className={cn(
                    "relative h-16 w-16 origin-bottom pb-2 sm:h-20 sm:w-20",
                    revealPhase === "marillEnter" && !marillFadingOut
                      ? "animate-marill-enter"
                      : undefined,
                    marillFadingOut ? "opacity-0" : "opacity-100",
                  )}
                  style={{
                    animationDuration:
                      revealPhase === "marillEnter" && !marillFadingOut
                        ? `${MARILL_ENTER_MS}ms`
                        : undefined,
                    transitionDuration: reducedMotion
                      ? "0ms"
                      : `${MARILL_FADE_MS}ms`,
                    transitionProperty: "opacity",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {/* biome-ignore lint/performance/noImgElement: pixel-art sprite needs crisp nearest-neighbor scaling */}
                  <img
                    alt=""
                    className={cn(
                      "absolute inset-0 h-full w-full object-contain [image-rendering:pixelated]",
                      marillIdleActive ? "animate-marill-idle-a" : undefined,
                    )}
                    src="/assets/sprites/opening/marill.png"
                    style={
                      marillIdleActive
                        ? { animationDuration: `${MARILL_IDLE_MS * 2}ms` }
                        : undefined
                    }
                  />
                  {/* biome-ignore lint/performance/noImgElement: pixel-art sprite needs crisp nearest-neighbor scaling */}
                  <img
                    alt=""
                    className={cn(
                      "absolute inset-0 h-full w-full object-contain [image-rendering:pixelated]",
                      marillIdleActive ? "animate-marill-idle-b" : "hidden",
                    )}
                    src="/assets/sprites/opening/marill-2.png"
                    style={
                      marillIdleActive
                        ? { animationDuration: `${MARILL_IDLE_MS * 2}ms` }
                        : undefined
                    }
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {showDialog ? (
        <div className="flex w-full justify-center px-4 pb-8">
          <div className="relative w-full max-w-5xl rounded-2xl border border-white/20 bg-black/50 px-2 py-1 pr-8">
            {step === "professorTalk" ||
            step === "showPokemon" ||
            step === "ready" ? (
              <button
                aria-label={t("continueHint")}
                className="absolute inset-0 z-10 cursor-pointer rounded-2xl"
                id="opening-dialog-advance"
                onClick={handleDialogClick}
                type="button"
              />
            ) : null}

            <div className="flex min-h-28 flex-col justify-center rounded-xl bg-white px-3 py-3 font-pixel text-base text-black sm:text-xl">
              {step === "askName" ? (
                <div className="flex flex-col gap-3">
                  <p>{dialogText}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      autoComplete="off"
                      className="w-full max-w-xs rounded border-2 border-black bg-neutral-100 px-3 py-2 font-pixel text-sm uppercase outline-none focus:border-amber-500"
                      id="opening-player-name"
                      maxLength={MAX_NAME_LENGTH}
                      onChange={(event) => setNameDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSubmitName();
                        }
                      }}
                      placeholder={t("namePlaceholder")}
                      ref={nameInputRef}
                      type="text"
                      value={nameDraft}
                    />
                    <button
                      className="rounded bg-sky-600 px-4 py-2 font-pixel text-[0.65rem] text-white disabled:opacity-40"
                      disabled={!canSubmitName}
                      id="opening-name-submit"
                      onClick={handleSubmitName}
                      type="button"
                    >
                      {t("submitName")}
                    </button>
                  </div>
                </div>
              ) : null}

              {step === "confirm" ? (
                <div className="flex flex-col gap-3">
                  <p>{dialogText}</p>
                  <div className="flex items-center gap-3">
                    <button
                      className="rounded bg-sky-600 px-4 py-2 font-pixel text-[0.65rem] text-white"
                      id="opening-confirm-yes"
                      onClick={handleConfirmYes}
                      type="button"
                    >
                      {t("yes")}
                    </button>
                    <button
                      className="rounded bg-neutral-700 px-4 py-2 font-pixel text-[0.65rem] text-white"
                      id="opening-confirm-no"
                      onClick={handleConfirmNo}
                      type="button"
                    >
                      {t("no")}
                    </button>
                  </div>
                </div>
              ) : null}

              {step === "askGender" ? <p>{dialogText}</p> : null}

              {(step === "professorTalk" ||
                step === "releasePokemon" ||
                step === "showPokemon" ||
                step === "clearStage" ||
                step === "ready") && (
                <>
                  {step === "releasePokemon" ||
                  step === "clearStage" ||
                  typingDone ||
                  typeSpeed === 0 ? (
                    <p>{dialogText}</p>
                  ) : (
                    <ReactTyped
                      key={`${step}-${lineIndex}`}
                      strings={[dialogText]}
                      typeSpeed={typeSpeed}
                      showCursor={false}
                      onComplete={() => setTypingDone(true)}
                    />
                  )}
                </>
              )}
            </div>

            {showContinueHint ? (
              <div className="pointer-events-none absolute right-3 bottom-5 animate-bounce">
                <span className="font-pixel text-[0.55rem] text-white/80">
                  ▼
                </span>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="h-36 w-full" />
      )}
    </div>
  );
}
