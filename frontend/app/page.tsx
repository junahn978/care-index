"use client";

import { useState } from "react";
import DoctorCard from "@/components/DoctorCard";
import AddDoctorCard from "@/components/AddDoctorCard";
import NoDoctorCards from "@/components/NoDoctorCard";
import Header from "@/components/header";

export default function Home() {
  const [doctorCards, setDoctorCards] = useState([]);

  return (
    <div>
      <Header />
      <div className="flex justify-center">
        {doctorCards.length > 0 ? <DoctorCard /> : <NoDoctorCards />}
      </div>
    </div>
  );
}
