"use client";

//* Libraries imports
import { useTranslations } from "next-intl";
import { MarsIcon, VenusIcon } from "lucide-react";
import Image from "next/image";

//* Components imports
import { PokemonPortrait } from "@/components/game-menu/pokemon-portrait";

//* Utils imports
import {
  POKEMON_LABEL_KEYS,
  POKEMON_PARTY_STATS,
  type PokemonKey,
} from "@/utils/pokemon-sprites";
import { cn } from "@/lib/utils";

type PokemonPartySlotProps = {
  slotIndex: number;
  pokemonKey: PokemonKey | null;
  isLead: boolean;
  isDragging?: boolean;
};

export function PokemonPartySlot(props: PokemonPartySlotProps) {
  const t = useTranslations("menu");
  const pokemonKey = props.pokemonKey;
  const lv = 5;
  const isPair = props.slotIndex % 2 === 0;
  const marginTop = !props.isLead ? (isPair ? "-mt-4" : "mt-0") : undefined;

  if (pokemonKey === null) {
    return (
      <div
        className={cn(
          "flex h-36 sm:h-20 items-center justify-center rounded border-2 border-[#2d5a2d]/40 bg-[#4a8c4a]/30 opacity-50 pokemon-slot-border",
          marginTop,
        )}
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
      className={cn(
        "flex h-36 sm:h-20 w-full border-2 border-black bg-linear-to-b from-emerald-800 to-green-400 p-2 font-pixel text-white pokemon-slot-border",
        cursorClass,
      )}
    >
      <div className="flex flex-col sm:flex-row w-full gap-2 justify-center items-center sm:items-start relative">
        <div className="absolute left-4 top-2 -translate-x-1/2 -translate-y-1/2">
          {props.isLead ? (
            <Image
              width={20}
              height={20}
              src="/assets/sprites/menu/open-pokeball.png"
              alt={t("active")}
              className="size-20 object-contain [image-rendering:pixelated] aspect-square"
            />
          ) : (
            <Image
              width={20}
              height={20}
              src="/assets/sprites/menu/closed-pokeball.png"
              alt={t("active")}
              className="size-20 object-contain [image-rendering:pixelated] aspect-square"
            />
          )}
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center pl-4">
          <PokemonPortrait pokemonKey={pokemonKey} className="size-12 z-10" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col w-full">
          <div className="flex items-center justify-between">
            <span className="truncate text-xs">{t(labelKey)}</span>
            {POKEMON_PARTY_STATS[pokemonKey].gender === "male" ? (
              <MarsIcon className="size-4 text-blue-500" />
            ) : (
              <VenusIcon className="size-4 text-pink-500" />
            )}
          </div>

          <div className="pt-2 flex flex-col">
            <div className="flex items-center border bg-black border-black rounded px-1 gap-1">
              <span className="shrink-0 rounded text-orange-500 text-[0.5rem] leading-none font-bold">
                {t("hp")}
              </span>

              <div className="h-2 flex-1 overflow-hidden rounded-sm">
                <div className="h-full bg-[#39d353]" />
              </div>
            </div>

            <div className="flex flex-row w-full gap-2 sm:gap-4">
              <span className="pt-2 text-center text-[0.6rem] font-bold leading-none tracking-wider text-white drop-shadow-[1px_1px_0_#000]">
                {"Lv"}.{lv}
              </span>
              <span className="pt-2 text-center text-[0.6rem] font-bold leading-none tracking-wider text-white drop-shadow-[1px_1px_0_#000]">
                {hp} / {hp}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
