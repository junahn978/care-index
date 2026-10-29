"use client";

import DoctorCard from "./DoctorCard";
import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { UserRoundPlus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddDoctorCard from "./AddDoctorCard";
import { DoctorCardData } from "@/lib/types";

export default function DisplayDoctorCard({
  doctorCount,
  doctorCards,
  setDoctorCards,
}: {
  doctorCount: number;
  doctorCards: DoctorCardData[];
  setDoctorCards: Dispatch<SetStateAction<DoctorCardData[]>>;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  return (
    <div>
      {/* flex-wrap: on narrow screens the Add Doctor button drops below the title instead of squeezing it */}
      <div className="flex flex-wrap justify-between items-center gap-3 my-5 px-4 py-3 shadow-lg rounded-lg border-1 border-solid">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>My Care Team</span>
          <span aria-hidden="true">|</span>
          <span>{doctorCount} Doctors</span>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          disablePointerDismissal
        >
          <form>
            <DialogTrigger
              render={
                <Button size="xl">
                  <UserRoundPlus />
                  Add Doctor
                </Button>
              }
            />
            <DialogContent
              showCloseButton={false}
              className="p-0 sm:max-w-[42rem] max-h-[90svh] overflow-y-auto"
            >
              <AddDoctorCard
                setDoctorCards={setDoctorCards}
                setIsDialogOpen={setIsDialogOpen}
                showSpinner={showSpinner}
                setShowSpinner={setShowSpinner}
              ></AddDoctorCard>
            </DialogContent>
          </form>
        </Dialog>
      </div>
      {/* 4 columns on large monitors, 3 on laptops, collapsing to 2 on tablets and phones */}
      <div className="grid grid-cols-2 gap-3 my-6 tablet:gap-5 tablet:my-10 laptop:grid-cols-3 desktop:grid-cols-4">
        {doctorCards.map((doctorCards) => (
          <DoctorCard
            key={doctorCards.doctorName}
            {...doctorCards}
            setDoctorCards={setDoctorCards}
          />
        ))}
      </div>
    </div>
  );
}
