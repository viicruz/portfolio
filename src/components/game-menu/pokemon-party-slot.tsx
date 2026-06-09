"use client";

//* Libraries imports
import { useTranslations } from "next-intl";

//* Components imports
import { PokemonPortrait } from "@/components/game-menu/pokemon-portrait";

//* Utils imports
import {
  POKEMON_LABEL_KEYS,
  POKEMON_PARTY_STATS,
  type PokemonKey,
} from "@/utils/pokemon-sprites";

type PokemonPartySlotProps = {
  slotIndex: number;
  pokemonKey: PokemonKey | null;
  isLead: boolean;
  isDragging?: boolean;
};

function PokeballIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-4 shrink-0"
    >
      <circle cx="8" cy="8" r="7" fill="#e53935" stroke="#1a1a1a" strokeWidth="1" />
      <rect x="1" y="7" width="14" height="2" fill="#1a1a1a" />
      <circle cx="8" cy="8" r="2.5" fill="#fff" stroke="#1a1a1a" strokeWidth="1" />
    </svg>
  );
}

export function PokemonPartySlot(props: PokemonPartySlotProps) {
  const t = useTranslations("menu");
  const pokemonKey = props.pokemonKey;

  if (pokemonKey === null) {
    return (
      <div
        className="flex h-24 items-center justify-center rounded border-2 border-[#2d5a2d]/40 bg-[#4a8c4a]/30 opacity-50"
        aria-hidden
      />
    );
  }

  const labelKey = POKEMON_LABEL_KEYS[pokemonKey];
  const hp = POKEMON_PARTY_STATS[pokemonKey].hp;

  const cursorClass = props.isDragging ? "cursor-grabbing" : "cursor-grab";

  return (
    <div
      id={`game-menu-pokemon-slot-${props.slotIndex}`}
      className={`flex h-24 w-full flex-col rounded border-2 border-[#1a4a1a] bg-[#4a8c4a] p-2 text-left font-pixel text-[8px] text-white ${cursorClass}`}
    >
      <div className="flex items-start gap-1">
        <PokeballIcon />
        <PokemonPortrait pokemonKey={pokemonKey} className="size-8" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span className="truncate text-[9px]">{t(labelKey)}</span>
            {props.isLead ? (
              <span className="ml-auto shrink-0 text-[7px] text-blue-200">
                {t("active")}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded bg-orange-500 px-0.5 text-[6px] text-white">
              {t("hp")}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-sm border border-[#1a4a1a] bg-[#2d5a2d]">
              <div className="h-full w-full bg-[#78c850]" />
            </div>
            <span className="shrink-0 text-[7px]">
              {hp} / {hp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
