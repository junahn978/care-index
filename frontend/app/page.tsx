"use client";

import { useState, useEffect } from "react";
import { cn } from "cn";
import { Spinner } from "@/components/ui/spinner";
import DisplayDoctorCard from "@/components/DisplayDoctorCard";
import NoDoctorCards from "@/components/NoDoctorCard";
import Header from "@/components/Header";
import AccessDenied from "@/components/AccessDenied";
import { getDoctorCards, AccessDeniedError } from "@/lib/api/doctor-cards";
import { DoctorCardData } from "@/lib/types";

export default function Home() {
  const [doctorCards, setDoctorCards] = useState<DoctorCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  useEffect(() => {
    const fetchDoctorCards = async () => {
      try {
        const response: DoctorCardData[] = await getDoctorCards();
        setDoctorCards(response);
      } catch (error) {
        // signed in, but the email isn't on the allowlist
        if (error instanceof AccessDeniedError) {
          setIsAccessDenied(true);
          return;
        }
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
    // flex-1: fill the screen height so the loader can sit in the middle of the space below the header
    <div className="flex flex-1 flex-col">
      <Header />
      <main
        className={cn(
          "page-container",
          isLoading ? "flex flex-1 items-center justify-center" : "pb-10",
        )}
      >
        {isLoading ? (
          <div
            role="status"
            className="flex flex-col items-center gap-4 text-[#008378]"
          >
            <Spinner className="size-[2.5em]" aria-hidden="true" />
            <p className="flex items-baseline text-fluid-lg font-medium">
              Loading Data
              {/* three dots bouncing one after another; still for users who prefer reduced motion */}
              <span aria-hidden="true" className="flex">
                {[
                  "",
                  "[animation-delay:150ms]",
                  "[animation-delay:300ms]",
                ].map((delay, i) => (
                  <span
                    key={i}
                    className={cn("animate-bounce motion-reduce:animate-none", delay)}
                  >
                    .
                  </span>
                ))}
              </span>
            </p>
          </div>
        ) : isAccessDenied ? (
          <AccessDenied />
        ) : doctorCards.length > 0 ? (
          <DisplayDoctorCard
            doctorCount={doctorCards.length}
            doctorCards={doctorCards}
            setDoctorCards={setDoctorCards}
          />
        ) : (
          <NoDoctorCards setDoctorCards={setDoctorCards} />
        )}
      </main>
    </div>
  );
}
