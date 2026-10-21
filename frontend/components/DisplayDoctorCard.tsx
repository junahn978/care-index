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
      <div className="flex justify-between items-center my-5 px-4 py-3 shadow-lg rounded-lg border-1 border-solid">
        <div className="flex items-center gap-3">
          <span>My Care Team</span>
          <span>|</span>
          <span>{doctorCount} Doctors</span>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            className="p-0 sm:max-w-[672px] max-h-[825px] overflow-y-auto"
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
      <div className="grid grid-cols-2 gap-5 my-10">
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
