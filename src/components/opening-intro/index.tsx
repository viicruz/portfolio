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

const OPENING_ASSETS = [
  "/assets/sprites/opening/professor",
  "/assets/sprites/opening/marill.png",
  "/assets/sprites/opening/ethan",
  "/assets/sprites/opening/lyra",
] as const;

const PROFESSOR_LINE_KEYS = ["1", "2", "3", "4", "5"] as const;
const POKEMON_LINE_KEYS = ["1", "2", "3"] as const;

const APPEAR_MS = 500;

type OpeningStep =
  | "professorAppear"
  | "professorTalk"
  | "showPokemon"
  | "askGender"
  | "askName"
  | "confirm"
  | "ready";

type OpeningIntroProps = {
  onComplete: () => void;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function preloadOpeningImages() {
  for (const src of OPENING_ASSETS) {
    const image = new Image();
    image.src = src;
  }
}

export function OpeningIntro(props: OpeningIntroProps) {
  const t = useTranslations("opening");
  const completeOpening = usePlayerProfileStore((state) => state.completeOpening);

  const [step, setStep] = useState<OpeningStep>("professorAppear");
  const [professorVisible, setProfessorVisible] = useState(false);
  const [pokemonVisible, setPokemonVisible] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [gender, setGender] = useState<PlayerGender>("boy");
  const [nameDraft, setNameDraft] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const finishStartedRef = useRef(false);

  const reducedMotion = prefersReducedMotion();
  const typeSpeed = reducedMotion ? 0 : 28;

  useEffect(() => {
    preloadOpeningImages();
  }, []);

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
    if (step === "askName") {
      nameInputRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    const isInteractiveFormStep =
      step === "askGender" || step === "askName" || step === "confirm";

    // lineIndex in the expression forces a reset whenever the spoken line changes
    setTypingDone(
      typeSpeed === 0 || isInteractiveFormStep || lineIndex < 0,
    );
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

      setLineIndex(0);
      setPokemonVisible(true);
      setStep("showPokemon");
      return;
    }

    if (step === "showPokemon") {
      if (lineIndex < POKEMON_LINE_KEYS.length - 1) {
        setLineIndex((current) => current + 1);
        return;
      }

      setStep("askGender");
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
    if (step === "professorTalk") {
      return t(`professorLines.${PROFESSOR_LINE_KEYS[lineIndex]}`);
    }

    if (step === "showPokemon") {
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
    step === "showPokemon" ||
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
      <div className="relative flex flex-1 w-full max-w-3xl items-end justify-center px-6 pb-4 pt-16">
        <div className="relative flex items-end justify-center gap-6">
          {/* biome-ignore lint/performance/noImgElement: pixel-art sprite needs crisp nearest-neighbor scaling */}
          <img
            alt=""
            className={cn(
              "h-40 w-20 object-contain [image-rendering:pixelated] transition-opacity ease-out sm:h-52 sm:w-24",
              professorVisible ? "opacity-100" : "opacity-0",
            )}
            src="/assets/sprites/opening/professor.png"
            style={{
              transitionDuration: `${reducedMotion ? 0 : APPEAR_MS}ms`,
              transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />

          {(step === "showPokemon" ||
            step === "askGender" ||
            step === "askName" ||
            step === "confirm" ||
            step === "ready") && (
            <>
              {/* biome-ignore lint/performance/noImgElement: pixel-art sprite needs crisp nearest-neighbor scaling */}
              <img
                alt=""
                className={cn(
                  "mb-6 h-16 w-16 object-contain [image-rendering:pixelated] transition-opacity ease-out sm:h-20 sm:w-20",
                  pokemonVisible ? "opacity-100" : "opacity-0",
                )}
                src="/assets/sprites/opening/marill.png"
                style={{
                  transitionDuration: `${reducedMotion ? 0 : APPEAR_MS}ms`,
                  transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              />
            </>
          )}
        </div>
      </div>

      {step === "askGender" ? (
        <div className="flex w-full max-w-3xl items-center justify-center gap-8 px-6 pb-4">
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
      ) : null}

      {step === "askGender" ? (
        <div className="flex w-full max-w-3xl justify-center px-6 pb-2">
          <button
            className="rounded-xl border-2 border-amber-200 bg-amber-200/10 px-6 py-2 font-pixel text-[0.65rem] text-amber-200"
            id="opening-gender-confirm"
            onClick={() => setStep("askName")}
            type="button"
          >
            {t("submitName")}
          </button>
        </div>
      ) : null}

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
                step === "showPokemon" ||
                step === "ready") && (
                <>
                  {typingDone || typeSpeed === 0 ? (
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