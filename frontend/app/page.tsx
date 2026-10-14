"use client";

import { useState } from "react";
import DoctorCard from "@/components/DoctorCard";
import AddDoctorCard from "@/components/AddDoctorCard";
import NoDoctorCards from "@/components/NoDoctorCard";
import Header from "@/components/header";

export default function Home() {
  const mockDoctors = [
    {
      doctorName: "Dr. Marcus Vance, MD",
      specialty: "Cardiology / Electrophysiology",
      clinicName: "Northwest Cardio Specialists",
      phone: "(555) 234-8901",
      website: "northwestcardio.org",
      streetAddress1: "742 Evergreen Terrace",
      streetAddress2: "Suite 400",
      city: "Springfield",
      stateProvince: "OR",
      zipCode: "97477",
      country: "United States",
      notes:
        "Special referral requirements, direct nurse triage line, or portal login notes...",
    },
    {
      doctorName: "Dr. Priya Raman, DO",
      specialty: "Endocrinology / Diabetes Care",
      clinicName: "Cascade Metabolic Health Center",
      phone: "(555) 817-4420",
      website: "cascademetabolic.com",
      streetAddress1: "1180 Lakeview Boulevard",
      streetAddress2: "Building B, Floor 2",
      city: "Bellevue",
      stateProvince: "WA",
      zipCode: "98004",
      country: "United States",
      notes:
        "New patients must submit recent A1C results before scheduling. Fax referrals to (555) 817-4499.",
    },
  ];

  const [doctorCards, setDoctorCards] = useState(mockDoctors);

  return (
    <div>
      <Header />
      <div className="flex justify-center">
        {doctorCards.length > 0 ? (
          doctorCards.map((doctorCard) => (
            <DoctorCard key={doctorCard.doctorName} {...doctorCard} />
          ))
        ) : (
          <NoDoctorCards />
        )}
      </div>
    </div>
  );
}
