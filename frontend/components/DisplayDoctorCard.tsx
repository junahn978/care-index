import DoctorCard from "./DoctorCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddDoctorCard from "./AddDoctorCard";

type DoctorCardData = {
  doctorName: string;
  specialty: string;
  clinicName: string;
  phone: string;
  website: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  stateProvince: string;
  zipCode: string;
  country: string;
  notes: string;
};

export default function DisplayDoctorCard({
  doctorCount,
  doctorCards,
}: {
  doctorCount: number;
  doctorCards: DoctorCardData[];
}) {
  return (
    <div>
      <div className="flex">
        My Care Team | {doctorCount} Doctors
        <Dialog>
          <form>
            <DialogTrigger
              render={
                <Button className="bg-[#008378] mt-3 mb-8" variant="outline">
                  Add Doctor
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[672px] max-h-[825px] overflow-y-auto">
              <AddDoctorCard></AddDoctorCard>
            </DialogContent>
          </form>
        </Dialog>
      </div>

      {doctorCards.map((doctorCards) => (
        <DoctorCard key={doctorCards.doctorName} {...doctorCards} />
      ))}
    </div>
  );
}
