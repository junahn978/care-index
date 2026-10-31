"use client";

import { Ref, useMemo, useRef, useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_SPECIALTIES, isSameSpecialty } from "@/lib/specialties";

// the Specialty field: a button that opens a searchable list of specialties, with a box at the
// bottom for adding one that isn't listed. Used in a Controller like Input: {...field}
export default function SpecialtySelect({
  value,
  onChange,
  onBlur,
  ref,
  invalid,
  savedSpecialties = [],
}: {
  value: string;
  onChange: (specialty: string) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
  invalid?: boolean;
  // the specialties on the user's saved cards, so a custom one stays listed once a card has it
  savedSpecialties?: string[];
}) {
  const [open, setOpen] = useState(false);
  // custom specialties added in this form; still listed if another one is picked afterwards
  const [added, setAdded] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const newSpecialtyRef = useRef<HTMLInputElement>(null);

  // the defaults in their order, then the saved and added ones. The current value is listed too,
  // so a specialty typed in before this was a dropdown still shows as selected
  const specialties = useMemo(() => {
    const list: string[] = [];
    for (const specialty of [
      ...DEFAULT_SPECIALTIES,
      ...savedSpecialties,
      ...added,
      value,
    ]) {
      const name = specialty.trim();
      if (name && !list.some((listed) => isSameSpecialty(listed, name))) {
        list.push(name);
      }
    }
    return list;
  }, [savedSpecialties, added, value]);

  function addSpecialty() {
    const name = newSpecialty.trim().replace(/\s+/g, " ");
    if (!name) {
      newSpecialtyRef.current?.focus();
      return;
    }
    // picks the listed one rather than adding a duplicate, e.g. "Cardiology" for "cardiology"
    const listed = specialties.find((specialty) =>
      isSameSpecialty(specialty, name),
    );
    if (!listed) setAdded((current) => [...current, name]);
    onChange(listed ?? name);
    setNewSpecialty("");
    setOpen(false);
  }

  return (
    <Combobox.Root
      items={specialties}
      value={value || null}
      // null would clear the field; a specialty is required, so picking one only ever changes it
      onValueChange={(specialty) => specialty && onChange(specialty)}
      isItemEqualToValue={(item, selected) =>
        selected != null && isSameSpecialty(item, selected)
      }
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setNewSpecialty("");
      }}
      autoHighlight
    >
      <Combobox.Trigger
        ref={ref}
        onBlur={onBlur}
        aria-invalid={invalid}
        render={
          <Button
            variant="outline"
            className="flex justify-between text-left aria-expanded:border-[#008378] aria-expanded:bg-background"
          />
        }
      >
        {/* one line at the inputs' height, cut off with "…" if it doesn't fit */}
        <span className="truncate">
          <Combobox.Value placeholder="Select or create specialty..." />
        </span>
        <ChevronDown />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner
          align="start"
          sideOffset={4}
          className="isolate z-50 outline-none"
        >
          {/* as wide as the button; only the list scrolls, between the search and add boxes */}
          <Combobox.Popup className="flex max-h-[min(24rem,var(--available-height))] w-(--anchor-width) origin-(--transform-origin) flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="relative border-b p-2">
              <Search className="pointer-events-none absolute top-1/2 left-4.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Combobox.Input
                render={<Input />}
                placeholder="Search specialties..."
                aria-label="Search specialties"
                className="pl-8"
              />
            </div>
            <Combobox.Empty>
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No matching specialties
              </p>
            </Combobox.Empty>
            {/* the picked one stays tinted, with a check. Styled with aria-selected because
                shadcn's CSS makes data-selected: match only data-selected="true", which Base UI
                doesn't set */}
            <Combobox.List className="min-h-0 flex-1 divide-y overflow-y-auto overscroll-contain">
              {(specialty: string) => (
                <Combobox.Item
                  key={specialty}
                  value={specialty}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm outline-none select-none data-highlighted:bg-[#EFFFFB] aria-selected:bg-[#EFFFFB] aria-selected:font-medium aria-selected:text-[#0F766E]"
                >
                  <span className="min-w-0 flex-1 wrap-anywhere">
                    {specialty}
                  </span>
                  <Combobox.ItemIndicator>
                    <Check className="size-4 text-[#008378]" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
            <div className="flex items-center gap-2 border-t bg-muted/50 p-2">
              <Input
                ref={newSpecialtyRef}
                value={newSpecialty}
                onChange={(event) => setNewSpecialty(event.target.value)}
                onKeyDown={(event) => {
                  // Enter adds it, like the + button
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSpecialty();
                  }
                }}
                maxLength={100}
                placeholder="Create custom specialty"
                aria-label="Create custom specialty"
                autoComplete="off"
              />
              <Button
                type="button"
                size="icon"
                onClick={addSpecialty}
                aria-label="Add custom specialty"
                className="hover:scale-110"
              >
                <Plus />
              </Button>
            </div>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
