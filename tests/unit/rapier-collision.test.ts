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
  test("maps named groups to rapier indices", () => {
    const result = buildCollisionGroups(["player", "npc"], ["floor"]);

    expect(RAPIER_COLLISION_GROUPS.player).toBe(0);
    expect(RAPIER_COLLISION_GROUPS.npc).toBe(2);
    expect(result).toBeDefined();
  });

  test("returns the rigid body name when available", () => {
    expect(
      getCollisionObjectName({ rigidBodyObject: { name: RIGID_BODY_NAMES.floor } }),
    ).toBe(RIGID_BODY_NAMES.floor);
    expect(
      getCollisionObjectName({ colliderObject: { name: RIGID_BODY_NAMES.npc } }),
    ).toBe(RIGID_BODY_NAMES.npc);
  });

  test("detects floor collisions and filters bump sounds", () => {
    expect(
      isFloorCollision({ other: { rigidBodyObject: { name: RIGID_BODY_NAMES.floor } } }),
    ).toBe(true);
    expect(
      shouldPlayBumpingSound({ other: { rigidBodyObject: { name: RIGID_BODY_NAMES.floor } } }),
    ).toBe(false);
    expect(
      shouldPlayBumpingSound({ other: { rigidBodyObject: { name: RIGID_BODY_NAMES.npc } } }),
    ).toBe(true);
  });
});