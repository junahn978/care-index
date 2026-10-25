"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import createClient from "@/lib/supabase";

const supabase = createClient();

export default function Header() {
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    async function obtainUserName() {
      const { data, error } = await supabase.auth.getClaims();

      if (error) {
        throw new Error(`Error fetching claims: ${error.message}`);
      }

      const fullName = data?.claims.user_metadata?.full_name;
      setFullName(fullName);
    }
    obtainUserName();
  }, []);

  return (
    <div className="flex items-center justify-between bg-[#ffffff] h-[100px]">
      <Link href="/" className="ml-5">
        <Image
          className="ml-5"
          src="/care_index_logo.svg"
          alt="Care Index Logo"
          width={150}
          height={50}
          style={{ cursor: "pointer" }}
        />
      </Link>
      <Button size="xxl">My Care Team / Doctors</Button>
      <div
        className="flex items-center gap-2 mr-5"
        style={{ cursor: "pointer" }}
      >
        <User size={30} color="#008378" />
        <p className="">{fullName}</p>
      </div>
    </div>
  );
}
