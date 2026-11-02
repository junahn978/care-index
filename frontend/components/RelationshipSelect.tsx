"use client";

import { Ref } from "react";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown, IdCard } from "lucide-react";
import { RELATIONSHIPS } from "@/lib/delegation";
import { DelegateRelationship } from "@/lib/types";

// the Relationship field: a button that opens the list of relationships. Used in a Controller
// like Input: {...field}. Optional, so null shows the placeholder
export default function RelationshipSelect({
  value,
  onChange,
  onBlur,
  ref,
  id,
}: {
  value: DelegateRelationship | null;
  onChange: (relationship: DelegateRelationship | null) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
  id?: string;
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        id={id}
        ref={ref}
        onBlur={onBlur}
        className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-[#C3C9D2] bg-white px-3 text-left transition-colors outline-none hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:border-[#008378]"
      >
        <IdCard
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        {/* one line at the input's height, cut off with "…" if it doesn't fit */}
        <Select.Value
          placeholder="Select relationship type..."
          className="min-w-0 flex-1 truncate data-placeholder:text-muted-foreground"
        />
        <Select.Icon
          render={
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          }
        />
      </Select.Trigger>
      <Select.Portal>
        {/* opens below the field like a dropdown, rather than over it */}
        <Select.Positioner
          sideOffset={4}
          alignItemWithTrigger={false}
          className="isolate z-50 outline-none"
        >
          <Select.Popup className="w-(--anchor-width) origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            {/* styled with aria-selected, like the Specialty dropdown, because shadcn's CSS makes
                data-selected: match only data-selected="true", which Base UI doesn't set */}
            <Select.List>
              {RELATIONSHIPS.map((relationship) => (
                <Select.Item
                  key={relationship}
                  value={relationship}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none select-none data-highlighted:bg-[#EFFFFB] aria-selected:font-medium aria-selected:text-[#0F766E]"
                >
                  <Select.ItemText className="min-w-0 flex-1">
                    {relationship}
                  </Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="size-4 text-[#008378]" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
