import { MapPin, Phone, Globe, FileText } from "lucide-react";
import { DoctorCardData } from "@/lib/types";

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
}: DoctorCardData) {
  return (
    <div>
      <div className="grid grid-col-2">
        <div>{doctorName}</div>
        <div>{specialty}</div>
        <div>
          <Phone color="#008378" /> {phone ?? "-"}
        </div>
        <div>
          <Globe color="#008378" /> {website ?? "-"}
        </div>
      </div>
      <div className="flex">
        <MapPin size={20} color="#008378" />
        <div className="ml-2">
          {clinicName ?? "-"}
          {streetAddress1},{streetAddress2 ?? "-"},{city},{stateProvince},
          {zipCode ?? "-"},{country}
        </div>
      </div>
      <div className="flex">
        <FileText size={20} color="#008378" /> Notes
        <div className="ml-2">{notes ?? "-"}</div>
      </div>
    </div>
  );
}
