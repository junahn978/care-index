import { MapPin, Phone, Globe, FileText, User } from "lucide-react";
import { DoctorCardData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { deleteDoctorCard } from "@/lib/api/doctor-cards";

export default function DoctorCard({
  cardId,
  doctorName,
  specialty,
  clinicName,
  phone,
  website,
  streetAddress1,
  streetAddress2,
  city,
  stateProvince,
  zipCode,
  country,
  notes,
  setDoctorCards,
}: DoctorCardData & {
  setDoctorCards: Dispatch<SetStateAction<DoctorCardData[]>>;
}) {
  async function handleRemove() {
    await deleteDoctorCard(cardId);
    removeDoctorCardId();
  }

  // removes the specific doctor card based on the cardId and updates the state to trigger rerender
  function removeDoctorCardId() {
    setDoctorCards((cards) => cards.filter((card) => card.cardId !== cardId));
  }

  return (
    <div className="mb-8 border-2 border-solid p-4">
      <div className="grid grid-cols-2 gap-6 mb-7">
        <div className="flex">
          <User className="mr-2" /> {doctorName}
        </div>
        <div>{specialty}</div>
        <div className="flex">
          <Phone color="#008378" className="mr-2" /> {phone ?? "-"}
        </div>
        <div className="flex">
          <Globe color="#008378" className="mr-2" /> {website ?? "-"}
        </div>
      </div>
      <div className="flex mb-7">
        <MapPin size={20} color="#008378" />
        <div className="ml-2">
          {clinicName ?? "-"}
          <div>
            {streetAddress1},{streetAddress2 ?? "-"},{city},{stateProvince},
            {zipCode ?? "-"},{country}
          </div>
        </div>
      </div>
      <div className="flex mb-7">
        <FileText size={20} color="#008378" />
        <div className="ml-2">
          Notes
          <div>{notes ?? "-"}</div>
        </div>
      </div>
      <div className="flex justify-between">
        <Button className="bg-[#008378]" onClick={handleRemove}>
          Remove
        </Button>
        <Dialog>
          <form>
            <DialogTrigger
              render={
                <Button className="bg-[#008378] mt-3 mb-8">Edit Details</Button>
              }
            />
            <DialogContent className="sm:max-w-[672px] max-h-[825px] overflow-y-auto"></DialogContent>
          </form>
        </Dialog>
      </div>
    </div>
  );
}
