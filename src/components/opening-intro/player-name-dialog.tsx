"use client";

//* Libraries imports
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";

//* Components imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

//* Utils imports
import { MAX_NAME_LENGTH, sanitizePlayerName } from "@/utils/player-profile";

type PlayerNameDialogProps = {
  open: boolean;
  nameDraft: string;
  onNameDraftChange: (value: string) => void;
  onSubmit: () => void;
};

export function PlayerNameDialog(props: PlayerNameDialogProps) {
  const t = useTranslations("opening");
  const canSubmitName = sanitizePlayerName(props.nameDraft).length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmitName) {
      return;
    }

    props.onSubmit();
  };

  return (
    <Dialog onOpenChange={() => undefined} open={props.open}>
      <DialogContent
        className="z-60 max-w-md gap-4 border-2 border-black bg-white p-6 font-pixel sm:max-w-md"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        overlayClassName="z-60"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="font-pixel text-base leading-snug text-black sm:text-lg">
            {t("namePrompt")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("namePlaceholder")}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            autoComplete="off"
            className="h-11 w-full rounded border-2 border-black bg-neutral-100 px-3 py-2 font-pixel text-sm uppercase text-black shadow-none outline-none placeholder:text-neutral-400 focus-visible:border-amber-500 focus-visible:ring-0"
            id="opening-player-name"
            maxLength={MAX_NAME_LENGTH}
            onChange={(event) => props.onNameDraftChange(event.target.value)}
            placeholder={t("namePlaceholder")}
            type="text"
            value={props.nameDraft}
          />

          <DialogFooter>
            <button
              className="rounded bg-sky-600 px-4 py-2 font-pixel text-[0.65rem] text-white disabled:opacity-40"
              disabled={!canSubmitName}
              id="opening-name-submit"
              type="submit"
            >
              {t("submitName")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
