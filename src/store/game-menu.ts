"use client";

//* Libraries imports
import { create } from "zustand";

//* Utils imports
import { POKEMON_KEYS, type PokemonKey } from "@/utils/pokemon-sprites";

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

export type CursorDirection = "up" | "down" | "left" | "right";

function isValidPokemonKey(value: string): value is PokemonKey {
  return POKEMON_KEYS.includes(value as PokemonKey);
}

function isValidPartyOrder(value: unknown): value is PokemonKey[] {
  if (!Array.isArray(value) || value.length !== POKEMON_KEYS.length) {
    return false;
  }

  const seen = new Set<PokemonKey>();

  for (const entry of value) {
    if (
      typeof entry !== "string" ||
      !isValidPokemonKey(entry) ||
      seen.has(entry)
    ) {
      return false;
    }

    seen.add(entry);
  }

  return seen.size === POKEMON_KEYS.length;
}

function buildPartyOrderFromLead(leadPokemon: PokemonKey): PokemonKey[] {
  return [leadPokemon, ...POKEMON_KEYS.filter((key) => key !== leadPokemon)];
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

type GameMenuStore = {
  screen: MenuScreen;
  partyOrder: PokemonKey[];
  mainCursorIndex: number;

  openMenu: () => void;
  closeMenu: () => void;
  goBack: () => void;
  enterPokemonMenu: () => void;
  moveCursor: (direction: CursorDirection) => void;
  setMainCursorIndex: (index: number) => void;
  confirmSelection: () => void;
  setPartyOrder: (partyOrder: PokemonKey[]) => void;
  reorderPartyAfterDrag: (nextOrder: PokemonKey[]) => void;
};

export const useGameMenuStore = create<GameMenuStore>((set, get) => ({
  screen: "closed",
  partyOrder: loadPartyOrder(),
  mainCursorIndex: 0,

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
    });
  },

  goBack: () => {
    const screen = get().screen;

    if (screen === "pokemon") {
      set({ screen: "main" });
      return;
    }

    if (screen === "main") {
      get().closeMenu();
    }
  },

  enterPokemonMenu: () => {
    set({ screen: "pokemon" });
  },

  moveCursor: (direction) => {
    const state = get();

    if (state.screen !== "main") return;

    const delta = direction === "up" ? -1 : 1;
    const nextIndex =
      (state.mainCursorIndex + delta + MAIN_MENU_ITEM_COUNT) %
      MAIN_MENU_ITEM_COUNT;

    set({ mainCursorIndex: nextIndex });
  },

  setMainCursorIndex: (index) => {
    set({ mainCursorIndex: index });
  },

  confirmSelection: () => {
    const state = get();

    if (state.screen !== "main") return;

    if (state.mainCursorIndex === POKEMON_MENU_ITEM_INDEX) {
      get().enterPokemonMenu();
    }
  },

  setPartyOrder: (partyOrder) => {
    if (!isValidPartyOrder(partyOrder)) return;

    savePartyOrder(partyOrder);
    set({ partyOrder });
  },

  reorderPartyAfterDrag: (nextOrder) => {
    if (!isValidPartyOrder(nextOrder)) return;

    savePartyOrder(nextOrder);
    set({ partyOrder: nextOrder });
  },
}));
