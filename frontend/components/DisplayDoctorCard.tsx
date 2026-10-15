import DoctorCard from "./DoctorCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddDoctorCard from "./AddDoctorCard";
import { DoctorCardData } from "@/lib/types";

export default function DisplayDoctorCard({
  doctorCount,
  doctorCards,
}: {
  doctorCount: number;
  doctorCards: DoctorCardData[];
}) {
  return (
    <div>
      <div className="flex justify-between">
        <div>My Care Team | {doctorCount} Doctors</div>
        <Dialog>
          <form>
            <DialogTrigger
              render={
                <Button className="bg-[#008378] mt-3 mb-8 ">Add Doctor</Button>
              }
            />
            <DialogContent className="sm:max-w-[672px] max-h-[825px] overflow-y-auto">
              <AddDoctorCard></AddDoctorCard>
            </DialogContent>
          </form>
        </Dialog>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {doctorCards.map((doctorCards) => (
          <DoctorCard key={doctorCards.doctorName} {...doctorCards} />
        ))}
      </div>
    </div>
  );
}
