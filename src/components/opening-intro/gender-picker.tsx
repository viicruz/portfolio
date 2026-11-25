"use client";

//* Libraries imports
import { useTranslations } from "next-intl";

//* Components imports
import { PixelSprite } from "@/components/opening-intro/pixel-sprite";

//* Local imports
import { GENDER_OPTIONS } from "@/components/opening-intro/constants";

//* Utils imports
import { cn } from "@/lib/utils";
import type { PlayerGender } from "@/utils/player-profile";

type GenderPickerProps = {
  gender: PlayerGender;
  onGenderChange: (gender: PlayerGender) => void;
  onConfirm: () => void;
};

export function GenderPicker(props: GenderPickerProps) {
  const t = useTranslations("opening");

  return (
    <div className="absolute bottom-0 left-0 z-10 flex flex-col items-center pb-2 pl-1 sm:left-4 sm:pl-2">
      <div className="flex items-end gap-3 sm:gap-4">
        {GENDER_OPTIONS.map((option) => {
          const selected = props.gender === option.gender;

          return (
            <button
              aria-pressed={selected}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 bg-black/40 px-3 py-3 transition-colors sm:px-4",
                selected
                  ? "border-amber-200 text-amber-200"
                  : "border-white/20 text-white/70",
              )}
              id={option.id}
              key={option.id}
              onClick={() => props.onGenderChange(option.gender)}
              type="button"
            >
              <PixelSprite
                className="h-32 w-16 object-contain [image-rendering:pixelated]"
                src={option.src}
              />
              <span className="font-pixel text-[0.65rem]">
                {t(option.labelKey)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex w-full justify-center pt-3">
        <button
          className="rounded-xl border-2 border-amber-200 bg-amber-200/10 px-6 py-2 font-pixel text-[0.65rem] text-amber-200"
          id="opening-gender-confirm"
          onClick={props.onConfirm}
          type="button"
        >
          {t("submitName")}
        </button>
      </div>
    </div>
  );
}
