"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    router.refresh();
    router.replace("/login");
    console.log("suecesfully signed out!");
  };

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
    <header className="bg-[#ffffff]">
      {/* mobile: logo and user on the first row, the nav button full width below;
          tablet and up: one row with the nav button centered */}
      <div className="page-container grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-3 [grid-template-areas:'logo_user'_'nav_nav'] tablet:min-h-[6.25rem] tablet:grid-cols-[1fr_auto_1fr] tablet:[grid-template-areas:'logo_nav_user']">
        <Link href="/" className="[grid-area:logo]">
          {/* width/height are the SVG's own proportions; the class sets the size shown */}
          <Image
            className="h-auto w-[clamp(6.5rem,5rem+6vw,9.5rem)]"
            src="/care_index_logo.svg"
            alt="Care Index Logo"
            width={520}
            height={160}
          />
        </Link>
        <Button
          size="xxl"
          className="h-auto min-h-10 py-2 text-center whitespace-normal [grid-area:nav] tablet:min-h-12"
        >
          My Care Team / Doctors
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 justify-self-end text-left transition-transform duration-150 ease-out [grid-area:user] hover:scale-105">
            <User className="size-7 shrink-0" color="#008378" />
            <span className="max-w-48 min-w-0">{fullName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40" align="end">
            <DropdownMenuItem className="cursor-pointer">
              <User /> View profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
