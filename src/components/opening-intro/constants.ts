//* Utils imports
import type { PlayerGender } from "@/utils/player-profile";

export const PROFESSOR_LINE_KEYS = ["1", "2", "3", "4", "5"] as const;
export const POKEMON_LINE_KEYS = ["1", "2", "3"] as const;

export const APPEAR_MS = 500;
export const MARILL_IDLE_MS = 700;
export const PROFESSOR_SHIFT_MS = 550;
export const POKEBALL_APPEAR_MS = 350;
export const POKEBALL_HOLD_MS = 700;
export const POKEBALL_SHAKE_MS = 500;
export const MARILL_ENTER_MS = 400;
export const MARILL_FADE_MS = 1100;

export const PROFESSOR_APPEAR_DELAY_MS = 50;
export const PROFESSOR_TALK_DELAY_MS = APPEAR_MS + 80;
export const DEFAULT_TYPE_SPEED = 28;

export const CLEAR_STAGE_RETURN_MS = MARILL_FADE_MS;
export const CLEAR_STAGE_GENDER_MS = MARILL_FADE_MS + PROFESSOR_SHIFT_MS;

export const PROFESSOR_TRANSLATE_SHIFTED =
  "-translate-x-[calc(50%+9.5rem)] sm:-translate-x-[calc(50%+12rem)]";
export const PROFESSOR_TRANSLATE_GENDER =
  "-translate-x-[calc(50%-8rem)] sm:-translate-x-[calc(50%-11rem)]";
export const PROFESSOR_TRANSLATE_CENTER = "-translate-x-1/2";

export const OPENING_SPRITES = {
  background: "/assets/sprites/opening/background.png",
  professor: "/assets/sprites/opening/professor.png",
  marill: "/assets/sprites/opening/marill.png",
  marillIdle: "/assets/sprites/opening/marill-2.png",
  ethan: "/assets/sprites/opening/ethan.png",
  lyra: "/assets/sprites/opening/lyra.png",
  pokeball: "/assets/sprites/opening/pokeball.png",
} as const;

export const CONFIRM_KEYS = new Set(["Enter", " ", "z", "Z"]);
export const ADVANCE_KEYS = new Set(["Enter", " ", "z", "Z", "a", "A"]);

type GenderOption = {
  id: string;
  gender: PlayerGender;
  src: string;
  labelKey: "boy" | "girl";
};

export const GENDER_OPTIONS: readonly GenderOption[] = [
  {
    id: "opening-gender-boy",
    gender: "boy",
    src: OPENING_SPRITES.ethan,
    labelKey: "boy",
  },
  {
    id: "opening-gender-girl",
    gender: "girl",
    src: OPENING_SPRITES.lyra,
    labelKey: "girl",
  },
];
