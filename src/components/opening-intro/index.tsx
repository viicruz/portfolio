"use client";

//* Components imports
import { GenderPicker } from "@/components/opening-intro/gender-picker";
import { OpeningDialog } from "@/components/opening-intro/opening-dialog";
import { PixelSprite } from "@/components/opening-intro/pixel-sprite";
import { PlayerNameDialog } from "@/components/opening-intro/player-name-dialog";
import { PokemonReveal } from "@/components/opening-intro/pokemon-reveal";
import { ProfessorSprite } from "@/components/opening-intro/professor-sprite";

//* Hooks imports
import { useOpeningFlow } from "@/components/opening-intro/use-opening-flow";
import { useOpeningKeyboard } from "@/components/opening-intro/use-opening-keyboard";

//* Local imports
import { OPENING_SPRITES } from "@/components/opening-intro/constants";

type OpeningIntroProps = {
  onComplete: () => void;
};

export function OpeningIntro(props: OpeningIntroProps) {
  const flow = useOpeningFlow(props.onComplete);

  useOpeningKeyboard({
    step: flow.step,
    onSetGender: flow.setGender,
    onSubmitGender: flow.submitGender,
    onConfirmReady: flow.confirmReady,
    onAdvanceTalk: flow.advanceTalk,
  });

  return (
    <div
      aria-label="Opening intro"
      className="absolute inset-0 z-50 flex flex-col items-center justify-end bg-neutral-950 pointer-events-auto"
      role="dialog"
    >
      <PixelSprite
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center [image-rendering:pixelated]"
        decorative
        src={OPENING_SPRITES.background}
      />

      <div className="relative flex flex-1 w-full max-w-5xl flex-col items-center justify-end px-6 pb-4 pt-16">
        <div className="relative h-96 w-full sm:h-[28rem]">
          {flow.step === "askGender" ? (
            <GenderPicker
              gender={flow.gender}
              onConfirm={flow.submitGender}
              onGenderChange={flow.setGender}
            />
          ) : null}

          <ProfessorSprite
            reducedMotion={flow.reducedMotion}
            translateClass={flow.stage.professorTranslateClass}
            visible={flow.professorVisible}
          />

          <PokemonReveal
            marillFadingOut={flow.stage.marillFadingOut}
            marillIdleActive={flow.stage.marillIdleActive}
            reducedMotion={flow.reducedMotion}
            revealPhase={flow.revealPhase}
            showMarill={flow.stage.showMarill}
            showPokeball={flow.stage.showPokeball}
          />
        </div>
      </div>

      <OpeningDialog
        lineIndex={flow.lineIndex}
        nameDraft={flow.nameDraft}
        onAdvance={flow.advanceTalk}
        onConfirmNo={flow.submitGender}
        onConfirmYes={flow.confirmReady}
        onTypingComplete={flow.markTypingDone}
        showContinueHint={flow.stage.showContinueHint}
        showDialog={flow.stage.showDialog}
        step={flow.step}
        typeSpeed={flow.typeSpeed}
        typingDone={flow.typingDone}
      />

      <PlayerNameDialog
        nameDraft={flow.nameDraft}
        onNameDraftChange={flow.setNameDraft}
        onSubmit={flow.handleSubmitName}
        open={flow.step === "askName"}
      />
    </div>
  );
}
