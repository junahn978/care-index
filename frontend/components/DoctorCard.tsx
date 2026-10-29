"use client";

import {
  MapPin,
  Phone,
  Globe,
  FileText,
  User,
  Trash,
  PencilLine,
} from "lucide-react";
import { useState } from "react";
import { DoctorCardData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { deleteDoctorCard } from "@/lib/api/doctor-cards";
import EditDoctorCard from "./EditDoctorCard";

export default function DoctorCard({
  setDoctorCards,
  ...card
}: DoctorCardData & {
  setDoctorCards: Dispatch<SetStateAction<DoctorCardData[]>>;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  async function handleRemove() {
    await deleteDoctorCard(card.cardId);
    removeDoctorCardId();
  }

  // removes the specific doctor card based on the cardId and updates the state to trigger rerender
  function removeDoctorCardId() {
    setDoctorCards((cards) => cards.filter((c) => c.cardId !== card.cardId));
  }

  // only the parts that are filled in, comma-and-space separated so the line can wrap
  const address = [
    card.streetAddress1,
    card.streetAddress2,
    card.city,
    card.stateProvince,
    card.zipCode,
    card.country,
  ]
    .filter(Boolean)
    .join(", ");

  // em-sized so icons scale with the fluid text; the offset centers them on the first line
  const iconClass = "mt-[0.125em] size-[1.25em] shrink-0";

  return (
    // wrap-anywhere: long names, URLs and notes break to fit even the narrow 2-column phone cards
    <div className="flex flex-col gap-5 border-2 border-solid p-3 shadow-md rounded-lg wrap-anywhere tablet:gap-7 tablet:p-6">
      {/* name and specialty share a row when they fit, otherwise specialty wraps below */}
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <div className="flex gap-2">
          <User className={iconClass} /> {card.doctorName}
        </div>
        <div>{card.specialty}</div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <div className="flex gap-2">
          <Phone color="#008378" className={iconClass} /> {card.phone ?? "-"}
        </div>
        <div className="flex gap-2">
          <Globe color="#008378" className={iconClass} /> {card.website ?? "-"}
        </div>
      </div>
      <div className="flex gap-2">
        <MapPin color="#008378" className={iconClass} />
        <div>
          {card.clinicName ?? "-"}
          <div>{address}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <FileText color="#008378" className={iconClass} />
        <div>
          Notes
          <div>{card.notes ?? "-"}</div>
        </div>
      </div>
      {/* mt-auto keeps the buttons on the bottom edge when cards in a row differ in height;
          stacked full width on phones, split left and right from tablet up */}
      <div className="mt-auto flex flex-col gap-2 pt-3 tablet:flex-row tablet:justify-between tablet:items-center tablet:pt-10">
        <Button size="xl" onClick={handleRemove}>
          <Trash /> Remove
        </Button>
        <Dialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          disablePointerDismissal
        >
          <form>
            <DialogTrigger
              render={
                <Button size="xl" className="w-full tablet:w-auto">
                  {" "}
                  <PencilLine /> Edit Details
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
      </div>
    </div>
  );
}
