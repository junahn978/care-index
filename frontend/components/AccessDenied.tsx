"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import createClient from "@/lib/supabase";

const supabase = createClient();

// shown when the backend rejects the signed-in email because it isn't on the allowlist
export default function AccessDenied() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.replace("/login");
  };

  useEffect(() => {
    async function obtainEmail() {
      const { data } = await supabase.auth.getClaims();
      setEmail(data?.claims.email ?? "");
    }
    obtainEmail();
  }, []);

  return (
    // same card as the empty state: full width on phones, 37.5rem at most
    <div
      role="alert"
      className="mx-auto flex flex-col items-center mt-[clamp(3rem,22vh,15rem)] bg-[#ffffff] max-w-150 px-6 text-center"
    >
      <ShieldX className="mt-8 size-12" color="#008378" aria-hidden="true" />
      <h1 className="text-fluid-3xl font-semibold mt-4 text-balance">
        Access Denied
      </h1>
      <p className="mt-3 text-pretty">
        {/* break-all: a long email wraps on phones instead of widening the page */}
        {email ? (
          <span className="font-medium break-all">{email}</span>
        ) : (
          "This account"
        )}{" "}
        doesn’t have access to{" "}
        {/* nowrap: keep the name from splitting at its hyphen */}
        <span className="whitespace-nowrap">Care-Index</span>. If you think
        this is a mistake, ask the person who invited you to add your email.
      </p>
      <Button className="mt-3 mb-8" onClick={handleSignOut}>
        Sign in with a different account
      </Button>
    </div>
  );
}
