"use client";

//* Libraries imports
import { useId, useState, type ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";

//* Components imports
import { PokemonPartySlot } from "@/components/game-menu/pokemon-party-slot";
import { SortablePokemonPartySlot } from "@/components/game-menu/sortable-pokemon-party-slot";
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
import { PARTY_DISPLAY_SLOTS, type PokemonKey } from "@/utils/pokemon-sprites";

export function PokemonPartyOverlay() {
  const t = useTranslations("menu");
  const gameMenuStore = useGameMenuStore();
  const cancelButtonId = useId();
  const [activeDragKey, setActiveDragKey] = useState<PokemonKey | null>(null);
  const pkmList = useGameMenuStore((state) => state.partyOrder);

  const isOpen = gameMenuStore.screen === "pokemon";

  function handleOpenChange(open: boolean) {
    if (!open && gameMenuStore.screen === "pokemon") {
      gameMenuStore.goBack();
    }
  }

  function handleDragStart(
    event: Parameters<
      NonNullable<ComponentProps<typeof DragDropProvider>["onDragStart"]>
    >[0],
  ) {
    const source = event.operation.source;

    if (isSortable(source)) {
      setActiveDragKey(source.id as PokemonKey);
    }
  }

  function handleDragEnd(
    event: Parameters<
      NonNullable<ComponentProps<typeof DragDropProvider>["onDragEnd"]>
    >[0],
  ) {
    setActiveDragKey(null);

    if (event.canceled) return;

    const source = event.operation.source;

    if (!isSortable(source)) {
      return;
    }

    const nextOrder = move(gameMenuStore.partyOrder, event);

    gameMenuStore.reorderPartyAfterDrag(nextOrder);
  }

  const activeDragSlotIndex =
    activeDragKey !== null
      ? gameMenuStore.partyOrder.indexOf(activeDragKey)
      : -1;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg gap-3 border-black bg-teal-300 p-4 sm:max-w-lg sm:h-100 sm:max-h-100 overflow-y-hidden flex flex-col"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.08) 8px, rgba(255,255,255,0.08) 16px)",
        }}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t("pokemon")}</DialogTitle>
          <DialogDescription>{t("choosePokemon")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:h-80 sm:max-h-80 h-120 max-h-120">
          <DragDropProvider
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-2 w-full gap-3">
              {pkmList.map((pkm, index) => {
                return (
                  <SortablePokemonPartySlot
                    key={pkm}
                    slotIndex={index}
                    pokemonKey={pkm}
                    isLead={index === 0}
                  />
                );
              })}

              {Array.from(
                { length: PARTY_DISPLAY_SLOTS - pkmList.length },
                (_, index) => {
                  const key = `empty-slot-${index}`;
                  return (
                    <PokemonPartySlot
                      key={key}
                      slotIndex={index + pkmList.length}
                      pokemonKey={null}
                      isLead={false}
                    />
                  );
                },
              )}
            </div>

            <DragOverlay>
              {activeDragKey !== null && activeDragSlotIndex >= 0 ? (
                <PokemonPartySlot
                  slotIndex={activeDragSlotIndex}
                  pokemonKey={activeDragKey}
                  isLead={activeDragSlotIndex === 0}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DragDropProvider>
        </div>

        <div className="flex flex-row gap-2">
          <div className="flex flex-1 items-center rounded border-2 border-black bg-neutral-100 px-4 py-3 font-pixel text-xs text-black">
            {t("choosePokemon")}
          </div>
          <button
            id={cancelButtonId}
            type="button"
            className="cursor-pointer rounded bg-sky-600 px-6 py-3 font-pixel text-[10px] text-white"
            onClick={() => gameMenuStore.goBack()}
          >
            {t("cancel")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
