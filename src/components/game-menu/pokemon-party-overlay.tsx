"use client";

//* Libraries imports
import { useTranslations } from "next-intl";

//* Components imports
import { PokemonPartySlot } from "@/components/game-menu/pokemon-party-slot";

//* Store imports
import { useGameMenuStore } from "@/store/game-menu";

//* Utils imports
import { PARTY_DISPLAY_SLOTS } from "@/utils/pokemon-sprites";

export function PokemonPartyOverlay() {
  const t = useTranslations("menu");
  const gameMenuStore = useGameMenuStore();

  const messageKey =
    gameMenuStore.pokemonShiftIndex !== null ? "shiftPokemon" : "choosePokemon";

  function handleSlotClick(index: number) {
    if (index >= gameMenuStore.partyOrder.length) return;

    gameMenuStore.setPokemonCursorIndex(index);
    gameMenuStore.togglePokemonShift(index);
  }

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-30 flex flex-col bg-[#a8e6e6]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.08) 8px, rgba(255,255,255,0.08) 16px)",
      }}
    >
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="grid w-full max-w-lg grid-cols-2 gap-3">
          {Array.from({ length: PARTY_DISPLAY_SLOTS }, (_, slotIndex) => {
            const pokemonKey = gameMenuStore.partyOrder[slotIndex] ?? null;
            const isFilled = pokemonKey !== null;

            return (
              <PokemonPartySlot
                key={slotIndex}
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
      </div>

      <div className="flex items-stretch gap-2 p-4 pt-0">
        <div className="flex flex-1 items-center rounded border-2 border-[#1a1a1a] bg-[#d8d8d8] px-4 py-3 font-pixel text-[10px] text-[#1a1a1a]">
          {t(messageKey)}
        </div>
        <button
          id="game-menu-pokemon-cancel"
          type="button"
          className="cursor-pointer rounded border-2 border-white bg-[#3080c8] px-6 py-3 font-pixel text-[10px] text-white"
          onClick={() => gameMenuStore.goBack()}
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
