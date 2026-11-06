"use client";

import { CloudAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// shown when the doctor cards couldn't be loaded, so a failed request isn't mistaken for having none
export default function LoadError() {
  return (
    // same card as the empty state: full width on phones, 37.5rem at most
    <div
      role="alert"
      className="mx-auto flex flex-col items-center mt-[clamp(3rem,22vh,15rem)] bg-[#ffffff] max-w-150 px-6 text-center"
    >
      <CloudAlert className="mt-8 size-12" color="#008378" aria-hidden="true" />
      <h1 className="text-fluid-3xl font-semibold mt-4 text-balance">
        Couldn’t Load Doctor Cards
      </h1>
      <p className="mt-3 text-pretty">
        Something went wrong while loading your doctor cards. Please try
        again.
      </p>
      <Button className="mt-3 mb-8" onClick={() => window.location.reload()}>
        Try again
      </Button>
    </div>
  );
}
