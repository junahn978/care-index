"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 mr-5 transition-transform duration-150 ease-out hover:scale-105"
          style={{ cursor: "pointer" }}
        >
          <User size={30} color="#008378" />
          <span>{fullName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuItem className="cursor-pointer">
            <User /> View profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
