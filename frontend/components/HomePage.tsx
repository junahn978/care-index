"use client";

import { useState, useEffect } from "react";
import { cn } from "cn";
import DisplayDoctorCard from "@/components/DisplayDoctorCard";
import NoDoctorCards from "@/components/NoDoctorCard";
import Header from "@/components/Header";
import LoadingData from "@/components/LoadingData";
import AccessDenied from "@/components/AccessDenied";
import AccountSuspended from "@/components/AccountSuspended";
import LoadError from "@/components/LoadError";
import { getDoctorCards } from "@/lib/api/doctor-cards";
import { AccessDeniedError, AccountSuspendedError } from "@/lib/api/errors";
import { DoctorCardData } from "@/lib/types";

export default function HomePage() {
  const [doctorCards, setDoctorCards] = useState<DoctorCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isLoadFailed, setIsLoadFailed] = useState(false);

  useEffect(() => {
    // React runs this effect twice in development. Only the latest run may update the page,
    // so a request from the first run that finishes first (or fails) can't flash the wrong screen
    let ignore = false;

    const fetchDoctorCards = async () => {
      try {
        const response: DoctorCardData[] = await getDoctorCards();
        if (ignore) return;
        setDoctorCards(response);
        // this run can succeed where an earlier one failed, e.g. when navigating back to the page
        setIsLoadFailed(false);
      } catch (error) {
        if (ignore) return;
        // /me already passed when the app loaded, so an Admin suspended this account since then
        if (error instanceof AccountSuspendedError) {
          setIsSuspended(true);
          return;
        }
        // signed in, but the email isn't on the Allowlist
        if (error instanceof AccessDeniedError) {
          setIsAccessDenied(true);
          return;
        }
        console.error("Error fetching data:", error);
        // not the empty state: failing to load the cards doesn't mean there are none
        setIsLoadFailed(true);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    fetchDoctorCards();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    console.log(doctorCards);
  }, [doctorCards]);

  // same as MeGate: a blocked person can't use anything the Header links to
  const isBlocked = isSuspended || isAccessDenied;

  return (
    // flex-1: fill the screen height so the loader can sit in the middle of the space below the header
    <div className="flex flex-1 flex-col">
      {!isBlocked && <Header />}
      <main
        className={cn(
          "page-container",
          isLoading ? "flex flex-1 items-center justify-center" : "pb-10",
        )}
      >
        {isLoading ? (
          <LoadingData />
        ) : isSuspended ? (
          <AccountSuspended />
        ) : isAccessDenied ? (
          <AccessDenied />
        ) : isLoadFailed ? (
          <LoadError />
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
