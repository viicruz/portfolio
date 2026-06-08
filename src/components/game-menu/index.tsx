"use client";

//* Libraries imports
import { useTranslations } from "next-intl";

//* Store imports
import {
  POKEMON_MENU_ITEM_INDEX,
  useGameMenuStore,
} from "@/store/game-menu";

//* Utils imports
import type { PokemonKey } from "@/utils/pokemon-sprites";

const MAIN_MENU_ITEMS = [
  "pokemon",
  "pack",
  "player",
  "save",
  "option",
  "exit",
] as const;

const POKEMON_LABEL_KEYS: Record<PokemonKey, "chikorita" | "cyndaquil" | "totodile"> = {
  CHIKORITA: "chikorita",
  CYNDAQUIL: "cyndaquil",
  TOTODILE: "totodile",
};

export function GameMenu() {
  const t = useTranslations("menu");
  const gameMenuStore = useGameMenuStore();

  if (gameMenuStore.screen === "closed") return null;

  function handleMainMenuClick(index: number) {
    gameMenuStore.setMainCursorIndex(index);

    if (index === POKEMON_MENU_ITEM_INDEX) {
      gameMenuStore.confirmSelection();
    }
  }

  function handlePokemonMenuClick(index: number) {
    gameMenuStore.setPokemonCursorIndex(index);
    gameMenuStore.togglePokemonShift(index);
  }

  return (
    <div className="absolute top-8 right-8 z-20 w-full max-w-xs pointer-events-auto">
      <div className="border py-1 px-2 rounded-2xl bg-black/50">
        <div className="bg-white rounded-xl px-4 py-3 font-pixel text-xs flex flex-col gap-1">
          {gameMenuStore.screen === "main" && (
            <div className="flex flex-col gap-1">
              {MAIN_MENU_ITEMS.map((itemKey, index) => {
                const isSelected = gameMenuStore.mainCursorIndex === index;
                const isEnabled = index === POKEMON_MENU_ITEM_INDEX;

                return (
                  <button
                    key={itemKey}
                    id={`game-menu-main-${itemKey}`}
                    type="button"
                    className={`flex items-center gap-2 text-left w-full py-1 px-1 rounded ${
                      isEnabled ? "cursor-pointer" : "cursor-default opacity-40"
                    } ${isSelected ? "bg-blue-100" : ""}`}
                    onClick={() => handleMainMenuClick(index)}
                  >
                    <span className="w-3 shrink-0">
                      {isSelected ? "▶" : ""}
                    </span>
                    <span>{t(itemKey)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {gameMenuStore.screen === "pokemon" && (
            <div className="flex flex-col gap-1">
              {gameMenuStore.partyOrder.map((pokemonKey, index) => {
                const isSelected = gameMenuStore.pokemonCursorIndex === index;
                const isShifting = gameMenuStore.pokemonShiftIndex === index;
                const isLead = index === 0;
                const labelKey = POKEMON_LABEL_KEYS[pokemonKey];

                return (
                  <button
                    key={pokemonKey}
                    id={`game-menu-pokemon-${pokemonKey.toLowerCase()}`}
                    type="button"
                    className={`flex items-center gap-2 text-left w-full p-1 rounded cursor-pointer ${
                      isShifting ? "bg-yellow-100" : isSelected ? "bg-blue-100" : ""
                    }`}
                    onClick={() => handlePokemonMenuClick(index)}
                  >
                    <span className="w-3 shrink-0">
                      {isShifting ? "⇅" : isSelected ? "▶" : ""}
                    </span>
                    <span className={isLead ? "text-blue-700" : ""}>
                      {t(labelKey)}
                    </span>
                    {isLead ? (
                      <span className="text-blue-700 ml-auto">
                        {t("active")}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
