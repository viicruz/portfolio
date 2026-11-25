//* Libraries imports
import { describe, expect, it } from "bun:test";

//* Local imports
import {
  CLEAR_STAGE_GENDER_MS,
  CLEAR_STAGE_RETURN_MS,
  OPENING_SPRITES,
} from "@/components/opening-intro/constants";
import type {
  OpeningStep,
  PokemonRevealPhase,
} from "@/components/opening-intro/types";
import {
  getClearStageTransition,
  getOpeningDialogMessage,
  getOpeningStageFlags,
  getPokemonReleaseTransition,
  isTypingDone,
  POKEMON_REVEAL_TIMELINE,
  resolveAdvanceTalk,
  resolveOpeningKeyAction,
  showsInstantLine,
} from "@/components/opening-intro/view-model";
import { OPENING_SPRITE_PATHS } from "@/utils/preload-opening-assets";

const CONFIRM_KEY_CASES = ["Enter", " ", "z", "Z"] as const;
const ADVANCE_KEY_CASES = ["Enter", " ", "z", "Z", "a", "A"] as const;
const TALK_STEPS = ["professorTalk", "showPokemon", "ready"] as const;

function stageFlags(
  step: OpeningStep,
  revealPhase: PokemonRevealPhase,
  options?: { reducedMotion?: boolean; typingDone?: boolean },
) {
  return getOpeningStageFlags({
    step,
    revealPhase,
    reducedMotion: options?.reducedMotion ?? false,
    typingDone: options?.typingDone ?? false,
  });
}

describe("opening intro view model", () => {
  describe("pokemon reveal timeline", () => {
    it("schedules the pokeball, shake, entrance, and reveal at the original delays", () => {
      expect(POKEMON_REVEAL_TIMELINE).toEqual([
        { at: 550, kind: "phase", phase: "pokeball" },
        { at: 1600, kind: "phase", phase: "shake" },
        { at: 2100, kind: "phase", phase: "marillEnter" },
        { at: 2500, kind: "showPokemon" },
      ]);
    });

    it("returns the professor before asking for a gender", () => {
      expect(CLEAR_STAGE_RETURN_MS).toBe(1100);
      expect(CLEAR_STAGE_GENDER_MS).toBe(1650);
    });
  });

  describe("stage flags", () => {
    it("hides the dialog while the professor is appearing", () => {
      const flags = stageFlags("professorAppear", "idle");

      expect(flags.showDialog).toBe(false);
      expect(flags.showPokeball).toBe(false);
      expect(flags.showMarill).toBe(false);
      expect(flags.professorTranslateClass).toBe("-translate-x-1/2");
    });

    it("shifts the professor during the release and the pokemon talk", () => {
      const shifted =
        "-translate-x-[calc(50%+9.5rem)] sm:-translate-x-[calc(50%+12rem)]";

      expect(
        stageFlags("releasePokemon", "shiftProfessor").professorTranslateClass,
      ).toBe(shifted);
      expect(stageFlags("showPokemon", "marill").professorTranslateClass).toBe(
        shifted,
      );
      expect(
        stageFlags("clearStage", "fadeMarill").professorTranslateClass,
      ).toBe(shifted);
    });

    it("centers the professor again while marill fades back", () => {
      expect(
        stageFlags("clearStage", "returnProfessor").professorTranslateClass,
      ).toBe("-translate-x-1/2");
    });

    it("moves the professor aside while asking for a gender", () => {
      expect(
        stageFlags("askGender", "returnProfessor").professorTranslateClass,
      ).toBe("-translate-x-[calc(50%-8rem)] sm:-translate-x-[calc(50%-11rem)]");
    });

    it("shows the pokeball only while it drops or shakes", () => {
      expect(stageFlags("releasePokemon", "pokeball").showPokeball).toBe(true);
      expect(stageFlags("releasePokemon", "shake").showPokeball).toBe(true);
      expect(stageFlags("releasePokemon", "marillEnter").showPokeball).toBe(
        false,
      );
    });

    it("shows marill from the entrance through the professor return", () => {
      expect(stageFlags("releasePokemon", "marillEnter").showMarill).toBe(true);
      expect(stageFlags("showPokemon", "marill").showMarill).toBe(true);
      expect(stageFlags("clearStage", "fadeMarill").showMarill).toBe(true);
      expect(stageFlags("clearStage", "returnProfessor").showMarill).toBe(true);
    });

    it("plays the idle animation only while marill is fully shown", () => {
      expect(stageFlags("showPokemon", "marill").marillIdleActive).toBe(true);
      expect(
        stageFlags("showPokemon", "marill", { reducedMotion: true })
          .marillIdleActive,
      ).toBe(false);
      expect(stageFlags("clearStage", "fadeMarill").marillIdleActive).toBe(
        false,
      );
      expect(stageFlags("clearStage", "fadeMarill").marillFadingOut).toBe(true);
    });

    it("keeps marill faded during the questions that follow the reveal", () => {
      for (const step of [
        "askGender",
        "askName",
        "confirm",
        "ready",
      ] as const) {
        expect(stageFlags(step, "returnProfessor").marillFadingOut).toBe(true);
      }
    });

    it("shows the continue hint only after a spoken line finishes typing", () => {
      expect(
        stageFlags("professorTalk", "idle", { typingDone: false })
          .showContinueHint,
      ).toBe(false);
      expect(
        stageFlags("ready", "returnProfessor", { typingDone: true })
          .showContinueHint,
      ).toBe(true);
      expect(
        stageFlags("askGender", "returnProfessor", { typingDone: true })
          .showContinueHint,
      ).toBe(false);
    });
  });

  describe("dialog copy", () => {
    it("reads professor lines during the talk and the release", () => {
      expect(getOpeningDialogMessage("professorTalk", 0, "")).toEqual({
        kind: "line",
        group: "professor",
        lineKey: "1",
      });
      expect(getOpeningDialogMessage("professorTalk", 4, "unused")).toEqual({
        kind: "line",
        group: "professor",
        lineKey: "5",
      });
      expect(getOpeningDialogMessage("releasePokemon", 4, "")).toEqual({
        kind: "line",
        group: "professor",
        lineKey: "5",
      });
    });

    it("reads pokemon lines during the pokemon talk and the clear", () => {
      expect(getOpeningDialogMessage("showPokemon", 0, "")).toEqual({
        kind: "line",
        group: "pokemon",
        lineKey: "1",
      });
      expect(getOpeningDialogMessage("showPokemon", 2, "")).toEqual({
        kind: "line",
        group: "pokemon",
        lineKey: "3",
      });
      expect(getOpeningDialogMessage("clearStage", 2, "")).toEqual({
        kind: "line",
        group: "pokemon",
        lineKey: "3",
      });
    });

    it("sanitizes the drafted name once for the confirm and ready lines", () => {
      const draft = "  victor extra name  ";

      expect(getOpeningDialogMessage("confirm", 0, draft)).toEqual({
        kind: "named",
        key: "confirmName",
        name: "victor extra",
      });
      expect(getOpeningDialogMessage("ready", 0, draft)).toEqual({
        kind: "named",
        key: "readyLine",
        name: "victor extra",
      });
    });

    it("returns no line before the professor starts talking", () => {
      expect(getOpeningDialogMessage("professorAppear", 0, "Oak")).toEqual({
        kind: "none",
      });
    });
  });

  describe("resolveOpeningKeyAction", () => {
    describe("askGender", () => {
      it("selects boy from the left arrow and the A key", () => {
        expect(resolveOpeningKeyAction("askGender", "ArrowLeft")).toEqual({
          type: "setGender",
          gender: "boy",
        });
        expect(resolveOpeningKeyAction("askGender", "a")).toEqual({
          type: "setGender",
          gender: "boy",
        });
        expect(resolveOpeningKeyAction("askGender", "A")).toEqual({
          type: "setGender",
          gender: "boy",
        });
      });

      it("selects girl from the right arrow and the D key", () => {
        expect(resolveOpeningKeyAction("askGender", "ArrowRight")).toEqual({
          type: "setGender",
          gender: "girl",
        });
        expect(resolveOpeningKeyAction("askGender", "d")).toEqual({
          type: "setGender",
          gender: "girl",
        });
        expect(resolveOpeningKeyAction("askGender", "D")).toEqual({
          type: "setGender",
          gender: "girl",
        });
      });

      it("submits the gender from the confirm keys", () => {
        for (const key of CONFIRM_KEY_CASES) {
          expect(resolveOpeningKeyAction("askGender", key)).toEqual({
            type: "submitGender",
          });
        }
      });

      it("ignores unrelated keys", () => {
        expect(resolveOpeningKeyAction("askGender", "x")).toBeNull();
      });
    });

    describe("askName", () => {
      it("ignores keyboard input so the name field keeps the keys", () => {
        expect(resolveOpeningKeyAction("askName", "Enter")).toBeNull();
        expect(resolveOpeningKeyAction("askName", "a")).toBeNull();
      });
    });

    describe("confirm", () => {
      it("accepts the name from the confirm keys", () => {
        for (const key of CONFIRM_KEY_CASES) {
          expect(resolveOpeningKeyAction("confirm", key)).toEqual({
            type: "confirmReady",
          });
        }
      });

      it("ignores the A key", () => {
        expect(resolveOpeningKeyAction("confirm", "a")).toBeNull();
        expect(resolveOpeningKeyAction("confirm", "A")).toBeNull();
      });
    });

    describe("spoken lines", () => {
      it("advances professor talk, pokemon talk, and the ready line", () => {
        for (const step of TALK_STEPS) {
          for (const key of ADVANCE_KEY_CASES) {
            expect(resolveOpeningKeyAction(step, key)).toEqual({
              type: "advanceTalk",
            });
          }
        }
      });

      it("ignores unrelated keys", () => {
        expect(resolveOpeningKeyAction("professorTalk", "d")).toBeNull();
      });
    });

    describe("timed steps", () => {
      it("ignores keys while a transition is playing", () => {
        expect(resolveOpeningKeyAction("professorAppear", "Enter")).toBeNull();
        expect(resolveOpeningKeyAction("releasePokemon", "Enter")).toBeNull();
        expect(resolveOpeningKeyAction("clearStage", "z")).toBeNull();
      });
    });
  });

  describe("resolveAdvanceTalk", () => {
    it("completes the current line before advancing", () => {
      expect(
        resolveAdvanceTalk({
          typingDone: false,
          step: "professorTalk",
          lineIndex: 0,
        }),
      ).toEqual({ type: "completeTyping" });
    });

    it("advances to the next professor line", () => {
      expect(
        resolveAdvanceTalk({
          typingDone: true,
          step: "professorTalk",
          lineIndex: 3,
        }),
      ).toEqual({ type: "nextLine" });
    });

    it("starts the pokemon release after the last professor line", () => {
      expect(
        resolveAdvanceTalk({
          typingDone: true,
          step: "professorTalk",
          lineIndex: 4,
        }),
      ).toEqual({ type: "beginPokemonRelease" });
    });

    it("advances to the next pokemon line", () => {
      expect(
        resolveAdvanceTalk({
          typingDone: true,
          step: "showPokemon",
          lineIndex: 1,
        }),
      ).toEqual({ type: "nextLine" });
    });

    it("clears the stage after the last pokemon line", () => {
      expect(
        resolveAdvanceTalk({
          typingDone: true,
          step: "showPokemon",
          lineIndex: 2,
        }),
      ).toEqual({ type: "beginClearStage" });
    });

    it("finishes the intro on the ready line", () => {
      expect(
        resolveAdvanceTalk({
          typingDone: true,
          step: "ready",
          lineIndex: 0,
        }),
      ).toEqual({ type: "finishIntro" });
    });

    it("does nothing on steps the dialog does not advance", () => {
      expect(
        resolveAdvanceTalk({
          typingDone: true,
          step: "askGender",
          lineIndex: 0,
        }),
      ).toBeNull();
    });
  });

  describe("motion transitions", () => {
    it("skips the release timeline when motion is reduced", () => {
      expect(getPokemonReleaseTransition(true)).toEqual({
        step: "showPokemon",
        revealPhase: "marill",
        resetLineIndex: true,
      });
    });

    it("starts the professor shift when motion is allowed", () => {
      expect(getPokemonReleaseTransition(false)).toEqual({
        step: "releasePokemon",
        revealPhase: "shiftProfessor",
        resetLineIndex: false,
      });
    });

    it("asks for a gender immediately when motion is reduced", () => {
      expect(getClearStageTransition(true)).toEqual({
        step: "askGender",
        revealPhase: "returnProfessor",
      });
    });

    it("fades marill before asking for a gender when motion is allowed", () => {
      expect(getClearStageTransition(false)).toEqual({
        step: "clearStage",
        revealPhase: "fadeMarill",
      });
    });
  });

  describe("isTypingDone", () => {
    it("keeps the line complete on steps that do not type", () => {
      for (const step of [
        "askGender",
        "askName",
        "confirm",
        "releasePokemon",
        "clearStage",
      ] as const) {
        expect(isTypingDone(step, 28)).toBe(true);
      }
    });

    it("starts spoken lines untyped", () => {
      expect(isTypingDone("professorTalk", 28)).toBe(false);
      expect(isTypingDone("showPokemon", 28)).toBe(false);
      expect(isTypingDone("ready", 28)).toBe(false);
    });

    it("marks every line complete when the type speed is zero", () => {
      expect(isTypingDone("professorTalk", 0)).toBe(true);
    });
  });

  describe("spoken line swap", () => {
    it("starts the replacement line untyped at the normal type speed", () => {
      for (const step of TALK_STEPS) {
        const typingDone = isTypingDone(step, 28);

        expect(typingDone).toBe(false);
        expect(showsInstantLine(step, typingDone, 28)).toBe(false);
      }
    });

    it("starts the replacement line fully typed when the type speed is zero", () => {
      for (const step of TALK_STEPS) {
        const typingDone = isTypingDone(step, 0);

        expect(typingDone).toBe(true);
        expect(showsInstantLine(step, typingDone, 0)).toBe(true);
      }
    });
  });

  describe("opening sprites", () => {
    it("preloads every sprite the stage renders", () => {
      expect([...OPENING_SPRITE_PATHS].toSorted()).toEqual(
        Object.values(OPENING_SPRITES).toSorted(),
      );
    });
  });
});
