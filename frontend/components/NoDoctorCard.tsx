import { Button } from "@/components/ui/button";
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
  return (
    <div className="flex flex-col items-center mt-60 bg-[#ffffff] w-150">
      <BriefcaseMedical size={50} className="mt-8" color="#008378" />
      <h1 className="text-3xl font-semibold mt-4">No Doctor Cards Found</h1>
      <h2 className="mt-3">
        You haven’t added any healthcare providers to your Care-Index directory
        yet.
      </h2>

      <Dialog>
        <form>
          <DialogTrigger
            render={<Button className="mt-3 mb-8">Add Doctor</Button>}
          />
          <DialogContent className="sm:max-w-[672px] max-h-[825px] overflow-y-auto">
            <AddDoctorCard setDoctorCards={setDoctorCards}></AddDoctorCard>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  );
}
