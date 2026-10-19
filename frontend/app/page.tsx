"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import DisplayDoctorCard from "@/components/DisplayDoctorCard";
import NoDoctorCards from "@/components/NoDoctorCard";
import Header from "@/components/header";
import { getDoctorCards } from "@/lib/api/doctor-cards";
import { DoctorCardData } from "@/lib/types";

export default function Home() {
  const [doctorCards, setDoctorCards] = useState<DoctorCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorCards = async () => {
      try {
        const response: DoctorCardData[] = await getDoctorCards();
        setDoctorCards(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorCards();
  }, []);

  useEffect(() => {
    console.log(doctorCards);
  }, [doctorCards]);

  return (
    <div>
      <Header />
      <div className="flex justify-center">
        {isLoading ? (
          <Spinner />
        ) : doctorCards.length > 0 ? (
          <DisplayDoctorCard
            doctorCount={doctorCards.length}
            doctorCards={doctorCards}
            setDoctorCards={setDoctorCards}
          />
        ) : (
          <NoDoctorCards setDoctorCards={setDoctorCards} />
        )}
      </div>
    </div>
  );
}
