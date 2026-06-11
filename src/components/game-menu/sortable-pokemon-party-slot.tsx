"use client";

//* Libraries imports
import { useSortable } from "@dnd-kit/react/sortable";

//* Components imports
import { PokemonPartySlot } from "@/components/game-menu/pokemon-party-slot";

//* Utils imports
import type { PokemonKey } from "@/utils/pokemon-sprites";
import { cn } from "@/lib/utils";

type SortablePokemonPartySlotProps = {
  slotIndex: number;
  pokemonKey: PokemonKey;
  isLead: boolean;
};

export function SortablePokemonPartySlot(props: SortablePokemonPartySlotProps) {
  const sortable = useSortable({
    id: props.pokemonKey,
    index: props.slotIndex,
    group: "party",
  });

  const isPair = props.slotIndex % 2 === 0;
  const marginTop = !props.isLead ? (isPair ? "-mt-4" : "mt-4") : undefined;

  return (
    <div
      ref={sortable.ref}
      className={cn(sortable.isDragging ? "opacity-50" : undefined, marginTop)}
    >
      <PokemonPartySlot
        slotIndex={props.slotIndex}
        pokemonKey={props.pokemonKey}
        isLead={props.isLead}
        isDragging={sortable.isDragging}
      />
    </div>
  );
}
