"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BriefcaseMedical } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import AddDoctorCard from "./AddDoctorCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DoctorCardData } from "@/lib/types";

export default function NoDoctorCards({
  setDoctorCards,
}: {
  setDoctorCards: Dispatch<SetStateAction<DoctorCardData[]>>;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  return (
    // max-w: full width on phones, 37.5rem at most; the top margin shrinks on short screens
    <div className="mx-auto flex flex-col items-center mt-[clamp(3rem,22vh,15rem)] bg-[#ffffff] max-w-150 px-6 text-center">
      <BriefcaseMedical className="mt-8 size-12" color="#008378" />
      <h1 className="text-fluid-3xl font-semibold mt-4 text-balance">
        No Doctor Cards Found
      </h1>
      <h2 className="mt-3 text-pretty">
        You haven’t added any healthcare providers to your Care-Index directory
        yet.
      </h2>

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        disablePointerDismissal
      >
        <form>
          <DialogTrigger
            render={<Button className="mt-3 mb-8">Add Doctor</Button>}
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
  );
}
