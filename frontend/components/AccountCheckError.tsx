"use client";

import { CloudAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// shown when /me fails, so the app can't tell who's signed in
export default function AccountCheckError() {
  return (
    // same card as the empty state: full width on phones, 37.5rem at most
    <div
      role="alert"
      className="mx-auto flex flex-col items-center mt-[clamp(3rem,22vh,15rem)] bg-[#ffffff] max-w-150 px-6 text-center"
    >
      <CloudAlert className="mt-8 size-12" color="#008378" aria-hidden="true" />
      <h1 className="text-fluid-3xl font-semibold mt-4 text-balance">
        Sorry, we couldn’t check your account
      </h1>
      <p className="mt-3 text-pretty">Please try again.</p>
      <Button className="mt-3 mb-8" onClick={() => window.location.reload()}>
        Try again
      </Button>
    </div>
  );
}
