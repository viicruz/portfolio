export type OpeningStep =
  | "professorAppear"
  | "professorTalk"
  | "releasePokemon"
  | "showPokemon"
  | "clearStage"
  | "askGender"
  | "askName"
  | "confirm"
  | "ready";

export type PokemonRevealPhase =
  | "idle"
  | "shiftProfessor"
  | "pokeball"
  | "shake"
  | "marillEnter"
  | "marill"
  | "fadeMarill"
  | "returnProfessor";
