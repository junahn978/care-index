import { DoctorCardData, NewDoctorCardData } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Shape of a card as the FastAPI backend sends it
type ApiDoctorCardResponse = {
  card_id: number;
  doctor_name: string;
  specialty: string;
  clinic_name: string | null;
  phone: string | null;
  website: string | null;
  street_address_1: string;
  street_address_2: string | null;
  city: string;
  state_province: string;
  zip_code: string | null;
  country: string;
  notes: string | null;
};

// convert api response of doctor card from snake case to camel case
function convertToDoctorCardData(
  doctorCard: ApiDoctorCardResponse,
): DoctorCardData {
  const doctorCardData: DoctorCardData = {
    cardId: doctorCard.card_id,
    doctorName: doctorCard.doctor_name,
    specialty: doctorCard.specialty,
    clinicName: doctorCard.clinic_name,
    phone: doctorCard.phone,
    website: doctorCard.website,
    streetAddress1: doctorCard.street_address_1,
    streetAddress2: doctorCard.street_address_2,
    city: doctorCard.city,
    stateProvince: doctorCard.state_province,
    zipCode: doctorCard.zip_code,
    country: doctorCard.country,
    notes: doctorCard.notes,
  };
  return doctorCardData;
}

export async function getDoctorCards(): Promise<DoctorCardData[]> {
  const url = `${API_URL}/doctor-card/`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const cards: ApiDoctorCardResponse[] = await response.json();
  return cards.map(convertToDoctorCardData);
}

export async function editDoctorCard() {}

export async function deleteDoctorCard(card_id: number) {
  const url = `${API_URL}/doctor-card/${card_id}`;

  const response = await fetch(url, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return;
  }
}

export async function createDoctorCard(card: NewDoctorCardData) {
  const url = `${API_URL}/doctor-card/`;

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(card),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiDoctorCardResponse = await response.json();
  return convertToDoctorCardData(result);
}
