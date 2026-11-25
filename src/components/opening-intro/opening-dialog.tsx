"use client";

//* Libraries imports
import { useTranslations } from "next-intl";
import { ReactTyped } from "react-typed";

//* Local imports
import type { OpeningStep } from "@/components/opening-intro/types";
import {
  getOpeningDialogMessage,
  showsAdvanceTarget,
  showsInstantLine,
  showsPlainPrompt,
  showsSpokenLine,
  type OpeningDialogMessage,
} from "@/components/opening-intro/view-model";

type OpeningDialogProps = {
  step: OpeningStep;
  lineIndex: number;
  nameDraft: string;
  typingDone: boolean;
  typeSpeed: number;
  showDialog: boolean;
  showContinueHint: boolean;
  onAdvance: () => void;
  onTypingComplete: () => void;
  onConfirmYes: () => void;
  onConfirmNo: () => void;
};

function readDialogText(
  translate: ReturnType<typeof useTranslations<"opening">>,
  message: OpeningDialogMessage,
): string {
  if (message.kind === "none") {
    return "";
  }

  if (message.kind === "line") {
    if (message.group === "professor") {
      return translate(
        `professorLines.${message.lineKey}` as "professorLines.1",
      );
    }

    return translate(`pokemonLines.${message.lineKey}` as "pokemonLines.1");
  }

  if (message.kind === "prompt") {
    return message.key === "genderPrompt"
      ? translate("genderPrompt")
      : translate("namePrompt");
  }

  return message.key === "confirmName"
    ? translate("confirmName", { name: message.name })
    : translate("readyLine", { name: message.name });
}

export function OpeningDialog(props: OpeningDialogProps) {
  const t = useTranslations("opening");
  const dialogText = readDialogText(
    t,
    getOpeningDialogMessage(props.step, props.lineIndex, props.nameDraft),
  );
  const spoken = showsSpokenLine(props.step);
  const instant = showsInstantLine(
    props.step,
    props.typingDone,
    props.typeSpeed,
  );

  if (!props.showDialog) {
    return <div className="h-36 w-full" />;
  }

  return (
    <div className="flex w-full justify-center px-4 pb-8">
      <div className="relative w-full max-w-5xl rounded-2xl border border-white/20 bg-black/50 px-2 py-1 pr-8">
        {showsAdvanceTarget(props.step) ? (
          <button
            aria-label={t("continueHint")}
            className="absolute inset-0 z-10 cursor-pointer rounded-2xl"
            id="opening-dialog-advance"
            onClick={props.onAdvance}
            type="button"
          />
        ) : null}

        <div className="flex min-h-28 flex-col justify-center rounded-xl bg-white px-3 py-3 font-pixel text-base text-black sm:text-xl">
          {props.step === "confirm" ? (
            <div className="flex flex-col gap-3">
              <p>{dialogText}</p>
              <div className="flex items-center gap-3">
                <button
                  className="rounded bg-sky-600 px-4 py-2 font-pixel text-[0.65rem] text-white"
                  id="opening-confirm-yes"
                  onClick={props.onConfirmYes}
                  type="button"
                >
                  {t("yes")}
                </button>
                <button
                  className="rounded bg-neutral-700 px-4 py-2 font-pixel text-[0.65rem] text-white"
                  id="opening-confirm-no"
                  onClick={props.onConfirmNo}
                  type="button"
                >
                  {t("no")}
                </button>
              </div>
            </div>
          ) : null}

          {showsPlainPrompt(props.step) ? <p>{dialogText}</p> : null}

          {spoken ? (
            instant ? (
              <p>{dialogText}</p>
            ) : (
              <ReactTyped
                key={`${props.step}-${props.lineIndex}`}
                onComplete={props.onTypingComplete}
                showCursor={false}
                strings={[dialogText]}
                typeSpeed={props.typeSpeed}
              />
            )
          ) : null}
        </div>

        {props.showContinueHint ? (
          <div className="pointer-events-none absolute right-3 bottom-5 animate-bounce">
            <span className="font-pixel text-[0.55rem] text-white/80">▼</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
