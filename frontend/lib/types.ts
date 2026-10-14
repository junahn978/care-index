export type DoctorCardData = {
  cardId: number;
  doctorName: string;
  specialty: string;
  clinicName: string | null;
  phone: string | null;
  website: string | null;
  streetAddress1: string;
  streetAddress2: string | null;
  city: string;
  stateProvince: string;
  zipCode: string | null;
  country: string;
  notes: string | null;
};
