export const PLAYER_GENDERS = ["boy", "girl"] as const;

export type PlayerGender = (typeof PLAYER_GENDERS)[number];

export type PlayerProfile = {
  name: string;
  gender: PlayerGender;
};

export const PLAYER_PROFILE_STORAGE_KEY = "portfolio:player-profile:v1";

const MAX_NAME_LENGTH = 12;
const MIN_NAME_LENGTH = 1;

export function isPlayerGender(value: unknown): value is PlayerGender {
  return (
    typeof value === "string" &&
    PLAYER_GENDERS.includes(value as PlayerGender)
  );
}

export function sanitizePlayerName(value: string): string {
  return value.trim().slice(0, MAX_NAME_LENGTH);
}

export function isValidPlayerName(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const sanitized = sanitizePlayerName(value);
  return sanitized.length >= MIN_NAME_LENGTH;
}

export function isValidPlayerProfile(value: unknown): value is PlayerProfile {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return isValidPlayerName(record.name) && isPlayerGender(record.gender);
}

export function loadPlayerProfile(): PlayerProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as unknown;

    if (!isValidPlayerProfile(parsed)) {
      return null;
    }

    return {
      name: sanitizePlayerName(parsed.name),
      gender: parsed.gender,
    };
  } catch {
    return null;
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: PlayerProfile = {
      name: sanitizePlayerName(profile.name),
      gender: profile.gender,
    };

    localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage unavailable
  }
}

export { MAX_NAME_LENGTH, MIN_NAME_LENGTH };