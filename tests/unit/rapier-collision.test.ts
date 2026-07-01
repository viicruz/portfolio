import { describe, expect, test } from "bun:test";
import {
  RAPIER_COLLISION_GROUPS,
  RIGID_BODY_NAMES,
  buildCollisionGroups,
  getCollisionObjectName,
  isFloorCollision,
  shouldPlayBumpingSound,
} from "@/lib/rapier-collision";

describe("rapier-collision helpers", () => {
  describe("Given membership and filter group names", () => {
    test("When building collision groups, then it should map named groups to rapier indices", () => {
      const result = buildCollisionGroups(["player", "npc"], ["floor"]);

      expect(RAPIER_COLLISION_GROUPS.player).toBe(0);
      expect(RAPIER_COLLISION_GROUPS.npc).toBe(2);
      expect(result).toBeDefined();
    });
  });

  describe("Given a collision event with a rigid body or collider object", () => {
    test("When resolving the collision object name, then it should return the rigid body name when available", () => {
      expect(
        getCollisionObjectName({ rigidBodyObject: { name: RIGID_BODY_NAMES.floor } }),
      ).toBe(RIGID_BODY_NAMES.floor);
    });

    test("When resolving the collision object name, then it should fall back to the collider name", () => {
      expect(
        getCollisionObjectName({ colliderObject: { name: RIGID_BODY_NAMES.npc } }),
      ).toBe(RIGID_BODY_NAMES.npc);
    });
  });

  describe("Given a collision against the floor", () => {
    test("When checking if it is a floor collision, then it should return true", () => {
      expect(
        isFloorCollision({ other: { rigidBodyObject: { name: RIGID_BODY_NAMES.floor } } }),
      ).toBe(true);
    });

    test("When checking whether to play the bumping sound, then it should return false", () => {
      expect(
        shouldPlayBumpingSound({ other: { rigidBodyObject: { name: RIGID_BODY_NAMES.floor } } }),
      ).toBe(false);
    });
  });

  describe("Given a collision against an NPC", () => {
    test("When checking whether to play the bumping sound, then it should return true", () => {
      expect(
        shouldPlayBumpingSound({ other: { rigidBodyObject: { name: RIGID_BODY_NAMES.npc } } }),
      ).toBe(true);
    });
  });
});