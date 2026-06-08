"use client";

//* Libraries imports
import { create } from "zustand";

//* Utils imports
import {
  POKEMON_KEYS,
  type PokemonKey,
} from "@/utils/pokemon-sprites";

const LEGACY_ACTIVE_POKEMON_STORAGE_KEY = "portfolio:active-pokemon:v1";
const PARTY_ORDER_STORAGE_KEY = "portfolio:pokemon-party:v1";

const DEFAULT_PARTY_ORDER: PokemonKey[] = [
  "CYNDAQUIL",
  "CHIKORITA",
  "TOTODILE",
];

export type MenuScreen = "closed" | "main" | "pokemon";

export const MAIN_MENU_ITEM_COUNT = 6;
export const POKEMON_MENU_ITEM_INDEX = 0;

function isValidPokemonKey(value: string): value is PokemonKey {
  return POKEMON_KEYS.includes(value as PokemonKey);
}

function isValidPartyOrder(value: unknown): value is PokemonKey[] {
  if (!Array.isArray(value) || value.length !== POKEMON_KEYS.length) {
    return false;
  }

  const seen = new Set<PokemonKey>();

  for (const entry of value) {
    if (typeof entry !== "string" || !isValidPokemonKey(entry) || seen.has(entry)) {
      return false;
    }

    seen.add(entry);
  }

  return seen.size === POKEMON_KEYS.length;
}

function buildPartyOrderFromLead(leadPokemon: PokemonKey): PokemonKey[] {
  return [
    leadPokemon,
    ...POKEMON_KEYS.filter((key) => key !== leadPokemon),
  ];
}

function loadPartyOrder(): PokemonKey[] {
  if (typeof window === "undefined") return [...DEFAULT_PARTY_ORDER];

  try {
    const storedParty = localStorage.getItem(PARTY_ORDER_STORAGE_KEY);

    if (storedParty) {
      const parsed = JSON.parse(storedParty) as unknown;

      if (isValidPartyOrder(parsed)) {
        return parsed;
      }
    }

    const legacyActivePokemon = localStorage.getItem(
      LEGACY_ACTIVE_POKEMON_STORAGE_KEY,
    );

    if (legacyActivePokemon && isValidPokemonKey(legacyActivePokemon)) {
      const migratedParty = buildPartyOrderFromLead(legacyActivePokemon);
      savePartyOrder(migratedParty);
      return migratedParty;
    }
  } catch {
    // localStorage unavailable or invalid JSON
  }

  return [...DEFAULT_PARTY_ORDER];
}

function savePartyOrder(partyOrder: PokemonKey[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PARTY_ORDER_STORAGE_KEY, JSON.stringify(partyOrder));
  } catch {
    // localStorage unavailable
  }
}

export function getLeadPokemon(partyOrder: PokemonKey[]): PokemonKey {
  return partyOrder[0] ?? DEFAULT_PARTY_ORDER[0];
}

function swapAdjacentPartyMember(
  partyOrder: PokemonKey[],
  index: number,
  direction: "up" | "down",
): PokemonKey[] {
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= partyOrder.length) {
    return partyOrder;
  }

  const nextPartyOrder = [...partyOrder];
  const currentPokemon = nextPartyOrder[index];
  nextPartyOrder[index] = nextPartyOrder[targetIndex];
  nextPartyOrder[targetIndex] = currentPokemon;

  return nextPartyOrder;
}

type GameMenuStore = {
  screen: MenuScreen;
  partyOrder: PokemonKey[];
  mainCursorIndex: number;
  pokemonCursorIndex: number;
  pokemonShiftIndex: number | null;

  openMenu: () => void;
  closeMenu: () => void;
  goBack: () => void;
  enterPokemonMenu: () => void;
  moveCursor: (direction: "up" | "down") => void;
  setMainCursorIndex: (index: number) => void;
  setPokemonCursorIndex: (index: number) => void;
  confirmSelection: () => void;
  togglePokemonShift: (index: number) => void;
  setPartyOrder: (partyOrder: PokemonKey[]) => void;
};

export const useGameMenuStore = create<GameMenuStore>((set, get) => ({
  screen: "closed",
  partyOrder: loadPartyOrder(),
  mainCursorIndex: 0,
  pokemonCursorIndex: 0,
  pokemonShiftIndex: null,

  openMenu: () => {
    set({
      screen: "main",
      mainCursorIndex: POKEMON_MENU_ITEM_INDEX,
    });
  },

  closeMenu: () => {
    set({
      screen: "closed",
      mainCursorIndex: POKEMON_MENU_ITEM_INDEX,
      pokemonCursorIndex: 0,
      pokemonShiftIndex: null,
    });
  },

  goBack: () => {
    const screen = get().screen;

    if (screen === "pokemon") {
      set({
        screen: "main",
        pokemonCursorIndex: 0,
        pokemonShiftIndex: null,
      });
      return;
    }

    if (screen === "main") {
      get().closeMenu();
    }
  },

  enterPokemonMenu: () => {
    set({
      screen: "pokemon",
      pokemonCursorIndex: 0,
      pokemonShiftIndex: null,
    });
  },

  moveCursor: (direction) => {
    const state = get();

    if (state.screen === "main") {
      const delta = direction === "up" ? -1 : 1;
      const nextIndex =
        (state.mainCursorIndex + delta + MAIN_MENU_ITEM_COUNT) %
        MAIN_MENU_ITEM_COUNT;

      set({ mainCursorIndex: nextIndex });
      return;
    }

    if (state.screen === "pokemon") {
      if (state.pokemonShiftIndex !== null) {
        const shiftIndex = state.pokemonShiftIndex;
        const targetIndex = direction === "up" ? shiftIndex - 1 : shiftIndex + 1;

        if (targetIndex < 0 || targetIndex >= state.partyOrder.length) {
          return;
        }

        const nextPartyOrder = swapAdjacentPartyMember(
          state.partyOrder,
          shiftIndex,
          direction,
        );

        savePartyOrder(nextPartyOrder);
        set({
          partyOrder: nextPartyOrder,
          pokemonCursorIndex: targetIndex,
          pokemonShiftIndex: targetIndex,
        });

        return;
      }

      const delta = direction === "up" ? -1 : 1;
      const nextIndex =
        (state.pokemonCursorIndex + delta + POKEMON_KEYS.length) %
        POKEMON_KEYS.length;

      set({ pokemonCursorIndex: nextIndex });
    }
  },

  setMainCursorIndex: (index) => {
    set({ mainCursorIndex: index });
  },

  setPokemonCursorIndex: (index) => {
    set({ pokemonCursorIndex: index });
  },

  confirmSelection: () => {
    const state = get();

    if (state.screen === "main") {
      if (state.mainCursorIndex === POKEMON_MENU_ITEM_INDEX) {
        get().enterPokemonMenu();
      }
      return;
    }

    if (state.screen === "pokemon") {
      get().togglePokemonShift(state.pokemonCursorIndex);
    }
  },

  togglePokemonShift: (index) => {
    const state = get();

    if (state.pokemonShiftIndex === index) {
      set({ pokemonShiftIndex: null });
      return;
    }

    set({
      pokemonCursorIndex: index,
      pokemonShiftIndex: index,
    });
  },

  setPartyOrder: (partyOrder) => {
    if (!isValidPartyOrder(partyOrder)) return;

    savePartyOrder(partyOrder);
    set({ partyOrder });
  },
}));
