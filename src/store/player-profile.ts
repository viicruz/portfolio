"use client";

//* Libraries imports
import { create } from "zustand";

//* Utils imports
import {
  loadPlayerProfile,
  savePlayerProfile,
  sanitizePlayerName,
  type PlayerGender,
  type PlayerProfile,
} from "@/utils/player-profile";

type PlayerProfileStore = {
  hydrated: boolean;
  profile: PlayerProfile | null;
  hasCompletedOpening: boolean;
  hydrate: () => void;
  completeOpening: (input: {
    name: string;
    gender: PlayerGender;
  }) => void;
};

export const usePlayerProfileStore = create<PlayerProfileStore>((set) => ({
  hydrated: false,
  profile: null,
  hasCompletedOpening: false,

  hydrate: () => {
    const profile = loadPlayerProfile();

    set({
      hydrated: true,
      profile,
      hasCompletedOpening: profile !== null,
    });
  },

  completeOpening: (input) => {
    const profile: PlayerProfile = {
      name: sanitizePlayerName(input.name),
      gender: input.gender,
    };

    savePlayerProfile(profile);

    set({
      profile,
      hasCompletedOpening: true,
      hydrated: true,
    });
  },
}));