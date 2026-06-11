"use client";

//* Libraries imports
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

//* Components imports
import { PokemonPartyOverlay } from "@/components/game-menu/pokemon-party-overlay";

//* Store imports
import { POKEMON_MENU_ITEM_INDEX, useGameMenuStore } from "@/store/game-menu";

const MAIN_MENU_ITEMS = [
  "pokemon",
  "pack",
  "player",
  "save",
  "option",
  "exit",
] as const;

export function GameMenu() {
  const t = useTranslations("menu");
  const gameMenuStore = useGameMenuStore();

  if (gameMenuStore.screen === "closed") return null;

  if (gameMenuStore.screen === "pokemon") {
    return <PokemonPartyOverlay />;
  }

  function handleMainMenuClick(index: number) {
    gameMenuStore.setMainCursorIndex(index);

    if (index === POKEMON_MENU_ITEM_INDEX) {
      gameMenuStore.confirmSelection();
    }
  }

  return (
    <div className="pointer-events-auto absolute top-8 right-8 z-20 w-full max-w-xs">
      <div className="rounded-2xl border bg-black/50 px-2 py-1">
        <div className="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 font-pixel text-xs">
          <div className="flex flex-col gap-1">
            {MAIN_MENU_ITEMS.map((itemKey, index) => {
              const isSelected = gameMenuStore.mainCursorIndex === index;
              const isEnabled = index === POKEMON_MENU_ITEM_INDEX;

              return (
                <button
                  key={itemKey}
                  id={`game-menu-main-${itemKey}`}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded py-1 px-1 text-left",
                    isEnabled ? "cursor-pointer" : "cursor-default opacity-40",
                    isSelected ? "bg-blue-100" : "",
                  )}
                  onClick={() => handleMainMenuClick(index)}
                >
                  <span className="w-3 shrink-0">{isSelected ? "▶" : ""}</span>
                  <span>{t(itemKey)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
