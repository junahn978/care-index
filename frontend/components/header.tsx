import Image from "next/image";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <div className="flex items-center justify-between bg-[#ffffff] h-[100px]">
      <Image
        className="ml-5"
        src="/care_index_logo.svg"
        alt="Care Index Logo"
        width={150}
        height={50}
      />
      <Button size="xl" className="bg-[#008378]">
        My Care Team / Doctors
      </Button>
      <div className="flex items-center gap-2 mr-5">
        <User size={30} color="#008378" />
        <p className="">John Doe</p>
      </div>
    </div>
  );
}
