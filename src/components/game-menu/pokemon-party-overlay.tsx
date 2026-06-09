"use client";

//* Libraries imports
import { useId } from "react";
import { useTranslations } from "next-intl";

//* Components imports
import { PokemonPartySlot } from "@/components/game-menu/pokemon-party-slot";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

//* Store imports
import { useGameMenuStore } from "@/store/game-menu";

//* Utils imports
import { PARTY_DISPLAY_SLOTS } from "@/utils/pokemon-sprites";

export function PokemonPartyOverlay() {
  const t = useTranslations("menu");
  const gameMenuStore = useGameMenuStore();
  const cancelButtonId = useId();

  const messageKey =
    gameMenuStore.pokemonShiftIndex !== null ? "shiftPokemon" : "choosePokemon";

  const isOpen = gameMenuStore.screen === "pokemon";

  function handleOpenChange(open: boolean) {
    if (!open && gameMenuStore.screen === "pokemon") {
      gameMenuStore.goBack();
    }
  }

  function handleSlotClick(index: number) {
    if (index >= gameMenuStore.partyOrder.length) return;

    gameMenuStore.setPokemonCursorIndex(index);
    gameMenuStore.togglePokemonShift(index);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg gap-3 border-[#1a1a1a] bg-[#a8e6e6] p-4 sm:max-w-lg"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.08) 8px, rgba(255,255,255,0.08) 16px)",
        }}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t("pokemon")}</DialogTitle>
          <DialogDescription>{t(messageKey)}</DialogDescription>
        </DialogHeader>

        <div className="grid w-full grid-cols-2 gap-3">
          {Array.from({ length: PARTY_DISPLAY_SLOTS }, (_, slotIndex) => {
            const pokemonKey = gameMenuStore.partyOrder[slotIndex] ?? null;
            const isFilled = pokemonKey !== null;
            const slotId = `game-menu-pokemon-slot-${slotIndex}`;

            return (
              <PokemonPartySlot
                key={slotId}
                slotIndex={slotIndex}
                pokemonKey={pokemonKey}
                isSelected={
                  isFilled && gameMenuStore.pokemonCursorIndex === slotIndex
                }
                isShifting={
                  isFilled && gameMenuStore.pokemonShiftIndex === slotIndex
                }
                isLead={slotIndex === 0 && isFilled}
                onClick={() => handleSlotClick(slotIndex)}
              />
            );
          })}
        </div>

        <div className="flex items-stretch gap-2">
          <div className="flex flex-1 items-center rounded border-2 border-[#1a1a1a] bg-[#d8d8d8] px-4 py-3 font-pixel text-[10px] text-[#1a1a1a]">
            {t(messageKey)}
          </div>
          <button
            id={cancelButtonId}
            type="button"
            className="cursor-pointer rounded border-2 border-white bg-[#3080c8] px-6 py-3 font-pixel text-[10px] text-white"
            onClick={() => gameMenuStore.goBack()}
          >
            {t("cancel")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
