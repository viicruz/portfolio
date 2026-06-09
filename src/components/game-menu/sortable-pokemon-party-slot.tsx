"use client";

//* Libraries imports
import { useSortable } from "@dnd-kit/react/sortable";

//* Components imports
import { PokemonPartySlot } from "@/components/game-menu/pokemon-party-slot";

//* Utils imports
import type { PokemonKey } from "@/utils/pokemon-sprites";

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

  return (
    <div
      ref={sortable.ref}
      className={sortable.isDragging ? "opacity-50" : undefined}
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
