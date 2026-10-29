"use client";

import {
  Check,
  Copy,
  Globe,
  MapIcon,
  MapPin,
  NotebookText,
  Phone,
  SquareArrowOutUpRight,
  SquarePen,
  Stethoscope,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { DoctorCardData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { deleteDoctorCard } from "@/lib/api/doctor-cards";
import EditDoctorCard from "./EditDoctorCard";

// adds https:// when the saved URL has no scheme, so the link always opens the external site
// (and a value like "javascript:..." can never become a script link)
function toWebsiteHref(website: string) {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

// shown without the scheme, "www." and a trailing slash, e.g. "metroneurospine.com"
function toWebsiteLabel(website: string) {
  return website
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

// Google Maps search for the address; street address 2 (suite, floor) is left out since it
// tends to make the search miss
function toMapsHref(card: DoctorCardData) {
  const query = [
    card.streetAddress1,
    card.city,
    card.stateProvince,
    card.zipCode,
    card.country,
  ]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function DoctorCard({
  setDoctorCards,
  ...card
}: DoctorCardData & {
  setDoctorCards: Dispatch<SetStateAction<DoctorCardData[]>>;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  // swaps the copy icon for a check for a moment after the phone number is copied
  const [phoneCopied, setPhoneCopied] = useState(false);

  async function handleRemove() {
    await deleteDoctorCard(card.cardId);
    removeDoctorCardId();
  }

  // removes the specific doctor card based on the cardId and updates the state to trigger rerender
  function removeDoctorCardId() {
    setDoctorCards((cards) => cards.filter((c) => c.cardId !== card.cardId));
  }

  async function handleCopyPhone() {
    if (!card.phone) return;
    try {
      await navigator.clipboard.writeText(card.phone);
      setPhoneCopied(true);
      setTimeout(() => setPhoneCopied(false), 2000);
    } catch (error) {
      console.error("Could not copy the phone number:", error);
    }
  }

  // first line in the darker text: the clinic name, or the street when there is no clinic name
  const addressLines = [
    card.clinicName,
    card.streetAddress1,
    card.streetAddress2,
    `${card.city}, ${card.stateProvince}${card.zipCode ? ` ${card.zipCode}` : ""}, ${card.country}`,
  ].filter(Boolean);

  // em-sized so icons scale with the fluid text; the offset centers them on the first line
  const iconClass = "mt-[0.125em] size-[1.25em] shrink-0";
  const labelClass =
    "flex items-center gap-1.5 text-fluid-sm text-muted-foreground";

  return (
    // wrap-anywhere: long names, URLs and notes break to fit even the narrow 2-column phone cards
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-3 shadow-sm wrap-anywhere tablet:gap-5 tablet:p-6">
      {/* photo with the name and specialty to its right; stacked on narrow phone cards */}
      <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:gap-4">
        {/* placeholder until doctor photos can be uploaded */}
        <div
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#EFFFFB] tablet:size-18"
        >
          <UserRound className="size-1/2 text-[#0F766E]" />
        </div>
        <div className="flex min-w-0 flex-col items-start gap-2">
          <h3 className="text-fluid-lg font-bold">{card.doctorName}</h3>
          <span className="inline-flex items-start gap-1.5 rounded-xl bg-[#C6FFF3] px-2.5 py-0.5 text-fluid-sm font-medium text-[#0F766E]">
            <Stethoscope className="mt-[0.15em] size-[1.1em] shrink-0" />
            {card.specialty}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-[#EEF2FF] p-2 tablet:p-3 tablet:px-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className={
              card.phone
                ? "flex min-w-0 gap-2 text-[#0F766E]"
                : "flex min-w-0 gap-2 text-muted-foreground"
            }
          >
            <Phone className={iconClass} /> {card.phone ?? "-"}
          </span>
          {card.phone && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopyPhone}
              aria-label={phoneCopied ? "Phone number copied" : "Copy phone number"}
              title={phoneCopied ? "Copied" : "Copy phone number"}
              className="text-muted-foreground hover:bg-white"
            >
              {phoneCopied ? <Check className="text-[#0F766E]" /> : <Copy />}
            </Button>
          )}
        </div>
        {card.website ? (
          <a
            href={toWebsiteHref(card.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-2 font-semibold text-[#0F766E] hover:underline"
          >
            <span className="flex min-w-0 gap-2">
              <Globe className={iconClass} />
              {toWebsiteLabel(card.website)}
            </span>
            {/* size-7 box lines the icon up with the copy button above */}
            <span className="flex size-7 shrink-0 items-center justify-center text-muted-foreground group-hover:text-foreground">
              <SquareArrowOutUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </span>
          </a>
        ) : (
          <span className="flex gap-2 text-muted-foreground">
            <Globe className={iconClass} /> -
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-[#EEF2FF] p-2 tablet:p-3 tablet:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={labelClass}>
            <MapPin className="size-[1.1em] shrink-0" /> Facility Address
          </span>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <a
                href={toMapsHref(card)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open the address in Google Maps (opens in a new tab)"
              />
            }
            className="bg-white font-semibold text-[#0F766E]"
          >
            <MapIcon /> Map
          </Button>
        </div>
        <div>
          {addressLines.map((line, i) => (
            <div
              key={i}
              className={i === 0 ? "font-medium" : "text-muted-foreground"}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>
          <NotebookText className="size-[1.1em] shrink-0" /> Clinical Care Notes
        </span>
        <p className={card.notes ? undefined : "text-muted-foreground"}>
          {card.notes ?? "No notes added."}
        </p>
      </div>

      {/* mt-auto keeps the buttons on the bottom edge when cards in a row differ in height;
          stacked full width on phones, two equal halves from tablet up */}
      <div className="mt-auto grid gap-2 pt-1 tablet:grid-cols-2 tablet:gap-3">
        <Dialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          disablePointerDismissal
        >
          <form>
            <DialogTrigger
              render={
                <Button
                  size="xl"
                  className="w-full bg-[#DCE6FD] text-foreground hover:bg-[#CBD9FC]"
                >
                  <SquarePen /> Update
                </Button>
              }
            />
            <DialogContent
              showCloseButton={false}
              className="p-0 sm:max-w-[42rem] max-h-[90svh] overflow-y-auto"
            >
              <EditDoctorCard
                {...card}
                setDoctorCards={setDoctorCards}
                setShowSpinner={setShowSpinner}
                showSpinner={showSpinner}
                setIsDialogOpen={setIsDialogOpen}
              ></EditDoctorCard>
            </DialogContent>
          </form>
        </Dialog>
        <Button
          size="xl"
          onClick={handleRemove}
          className="bg-[#D5F3EC] text-[#0F766E] hover:bg-[#C2EDE3]"
        >
          <Trash2 /> Remove
        </Button>
      </div>
    </div>
  );
}
