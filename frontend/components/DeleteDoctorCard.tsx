"use client";

import { useState } from "react";
import { Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { DoctorCardData } from "@/lib/types";

// confirmation shown in the Remove dialog; the card is only deleted once the user confirms here
export default function DeleteDoctorCard({
  doctorName,
  specialty,
  clinicName,
  onDelete,
}: Pick<DoctorCardData, "doctorName" | "specialty" | "clinicName"> & {
  onDelete: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      // on success the card leaves the list, which unmounts this dialog along with it
      await onDelete();
    } catch (error) {
      console.error("Error deleting doctor card:", error);
      setError("Could not delete the card. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[#FEE2E2]">
        <Trash2 className="size-6 text-[#DC2626]" />
      </div>
      <div className="flex flex-col gap-2">
        <DialogTitle className="text-fluid-xl leading-snug font-bold text-balance">
          Are you sure you want to delete {doctorName}?
        </DialogTitle>
        <DialogDescription className="text-fluid-sm text-pretty">
          This will remove {doctorName} and all associated clinic notes,
          facility details, and contact information from your active
          directory. This action cannot be undone.
        </DialogDescription>
      </div>
      {/* the card being deleted, so the user can check it is the right one */}
      <div className="flex w-full items-center gap-3 rounded-xl border border-[#DCE3F5] bg-[#EEF2FF] p-3 text-left">
        {/* placeholder until doctor photos can be uploaded, same as on the card */}
        <div
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#EFFFFB]"
        >
          <UserRound className="size-1/2 text-[#0F766E]" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{doctorName}</p>
          <p className="text-fluid-sm font-semibold text-[#0F766E]">
            {specialty}
          </p>
          {clinicName && (
            <p className="text-fluid-sm text-muted-foreground">{clinicName}</p>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-fluid-sm text-destructive">
          {error}
        </p>
      )}
      {/* stacked on phones, side by side from tablet up */}
      <div className="grid w-full gap-3 tablet:grid-cols-2">
        <DialogClose
          disabled={isDeleting}
          render={
            <Button
              size="xl"
              className="bg-[#DCE6FD] text-foreground hover:bg-[#CBD9FC]"
            />
          }
        >
          Cancel
        </DialogClose>
        <Button
          size="xl"
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-[#B91C1C] text-white hover:bg-[#991B1B]"
        >
          {isDeleting ? (
            <>
              <Spinner /> Deleting…
            </>
          ) : (
            <>
              <Trash2 /> Yes, Delete the Card
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
