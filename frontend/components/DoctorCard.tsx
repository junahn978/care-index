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

  return (
    <div className="mb-8 border-2 border-solid p-4 shadow-md rounded-lg p-9">
      <div className="grid grid-cols-2 gap-6 mb-7">
        <div className="flex">
          <User className="mr-2" /> {card.doctorName}
        </div>
        <div className="text-right">{card.specialty}</div>
        <div className="flex">
          <Phone color="#008378" className="mr-2" /> {card.phone ?? "-"}
        </div>
        <div className="flex">
          <Globe color="#008378" className="mr-2" /> {card.website ?? "-"}
        </div>
      </div>
      <div className="flex mb-7">
        <MapPin size={20} color="#008378" />
        <div className="ml-2">
          {card.clinicName ?? "-"}
          <div>
            {card.streetAddress1},{card.streetAddress2 ?? "-"},{card.city},
            {card.stateProvince},{card.zipCode ?? "-"},{card.country}
          </div>
        </div>
      </div>
      <div className="flex mb-7">
        <FileText size={20} color="#008378" />
        <div className="ml-2">
          Notes
          <div>{card.notes ?? "-"}</div>
        </div>
      </div>
      <div className="flex justify-between items-center pt-10">
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
                <Button size="xl">
                  {" "}
                  <PencilLine /> Edit Details
                </Button>
              }
            />
            <DialogContent
              showCloseButton={false}
              className="p-0 sm:max-w-[672px] max-h-[825px] overflow-y-auto"
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
