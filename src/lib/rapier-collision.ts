import { interactionGroups } from "@react-three/rapier";

export const RAPIER_COLLISION_GROUPS = {
  player: 0,
  follower: 1,
  npc: 2,
  floor: 3,
  obstacle: 4,
} as const;

export type RapierCollisionGroupName = keyof typeof RAPIER_COLLISION_GROUPS;

export const RIGID_BODY_NAMES = {
  player: "player",
  follower: "follower-pkm",
  npc: "npc",
  floor: "floor",
  obstacle: "obstacle",
} as const;

type CollisionGroupsInput =
  | RapierCollisionGroupName
  | RapierCollisionGroupName[];

type CollisionTargetLike = {
  rigidBodyObject?: { name?: string | null } | null;
  colliderObject?: { name?: string | null } | null;
};

export type CollisionEnterLike = {
  other: CollisionTargetLike;
};

function toGroupIds(value: CollisionGroupsInput): number[] {
  const groups = Array.isArray(value) ? value : [value];
  return groups.map((group) => RAPIER_COLLISION_GROUPS[group]);
}

export function buildCollisionGroups(
  memberships: CollisionGroupsInput,
  filters?: CollisionGroupsInput,
) {
  return interactionGroups(
    toGroupIds(memberships),
    filters ? toGroupIds(filters) : undefined,
  );
}

export const COLLISION_GROUPS = {
  player: buildCollisionGroups("player", ["floor", "npc", "obstacle"]),
  follower: buildCollisionGroups("follower", ["floor"]),
  npc: buildCollisionGroups("npc", ["floor", "player", "obstacle"]),
  floor: buildCollisionGroups("floor", ["player", "follower", "npc"]),
  obstacle: buildCollisionGroups("obstacle", ["player", "npc"]),
} as const;

export function getCollisionObjectName(target?: CollisionTargetLike | null) {
  return target?.rigidBodyObject?.name ?? target?.colliderObject?.name ?? null;
}

export function isFloorCollision(payload: CollisionEnterLike) {
  return getCollisionObjectName(payload.other) === RIGID_BODY_NAMES.floor;
}

export function shouldPlayBumpingSound(payload: CollisionEnterLike) {
  return !isFloorCollision(payload);
}
