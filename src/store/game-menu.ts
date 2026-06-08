"use client";

//* Libraries imports
import { create } from "zustand";

//* Utils imports
import {
  POKEMON_KEYS,
  type PokemonKey,
} from "@/utils/pokemon-sprites";

const ACTIVE_POKEMON_STORAGE_KEY = "portfolio:active-pokemon:v1";

export type MenuScreen = "closed" | "main" | "pokemon";

export const MAIN_MENU_ITEM_COUNT = 6;
export const POKEMON_MENU_ITEM_INDEX = 0;

function isValidPokemonKey(value: string): value is PokemonKey {
  return POKEMON_KEYS.includes(value as PokemonKey);
}

function loadActivePokemon(): PokemonKey {
  if (typeof window === "undefined") return "CYNDAQUIL";

  try {
    const stored = localStorage.getItem(ACTIVE_POKEMON_STORAGE_KEY);
    if (stored && isValidPokemonKey(stored)) return stored;
  } catch {
    // localStorage unavailable
  }

  return "CYNDAQUIL";
}

function saveActivePokemon(pokemon: PokemonKey) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(ACTIVE_POKEMON_STORAGE_KEY, pokemon);
  } catch {
    // localStorage unavailable
  }
}

export function getOrderedPokemonList(activePokemon: PokemonKey): PokemonKey[] {
  return [
    activePokemon,
    ...POKEMON_KEYS.filter((key) => key !== activePokemon),
  ];
}

type GameMenuStore = {
  screen: MenuScreen;
  activePokemon: PokemonKey;
  mainCursorIndex: number;
  pokemonCursorIndex: number;

  openMenu: () => void;
  closeMenu: () => void;
  goBack: () => void;
  enterPokemonMenu: () => void;
  moveCursor: (direction: "up" | "down") => void;
  setMainCursorIndex: (index: number) => void;
  setPokemonCursorIndex: (index: number) => void;
  confirmSelection: () => void;
  setActivePokemon: (pokemon: PokemonKey) => void;
};

export const useGameMenuStore = create<GameMenuStore>((set, get) => ({
  screen: "closed",
  activePokemon: loadActivePokemon(),
  mainCursorIndex: 0,
  pokemonCursorIndex: 0,

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
    });
  },

  goBack: () => {
    const screen = get().screen;

    if (screen === "pokemon") {
      set({
        screen: "main",
        pokemonCursorIndex: 0,
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
      const orderedList = getOrderedPokemonList(state.activePokemon);
      const selectedPokemon = orderedList[state.pokemonCursorIndex];

      if (selectedPokemon) {
        get().setActivePokemon(selectedPokemon);
      }

      get().closeMenu();
    }
  },

  setActivePokemon: (pokemon) => {
    saveActivePokemon(pokemon);
    set({ activePokemon: pokemon });
  },
}));
