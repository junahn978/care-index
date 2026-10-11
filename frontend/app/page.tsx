import Image from "next/image";
import DoctorCard from "@/components/DoctorCard";
import NoDoctorCards from "@/components/NoDoctorCard";
import Header from "@/components/header";

export default function Home() {
  const doctor_cards = [];

  return (
    <div>
      <Header />
      <div className="flex justify-center">
        <NoDoctorCards />
      </div>
    </div>
  );
}
