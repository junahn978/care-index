"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { cn } from "cn";
import Header from "@/components/Header";
import LoadingData from "@/components/LoadingData";
import AccessDenied from "@/components/AccessDenied";
import AccountSuspended from "@/components/AccountSuspended";
import LoadError from "@/components/LoadError";
import { getMe } from "@/lib/api/me";
import { AccessDeniedError, AccountSuspendedError } from "@/lib/api/errors";
import { Me } from "@/lib/types";

type MeState =
  | { status: "loading" }
  | { status: "suspended" }
  | { status: "accessDenied" }
  | { status: "loadFailed" }
  | { status: "ready"; me: Me };

const MeContext = createContext<Me | null>(null);

// the signed-in person, for any page inside the gate
export function useMe() {
  const me = useContext(MeContext);
  if (!me) {
    throw new Error("useMe must be used inside MeGate");
  }
  return me;
}

// asks /me once per app load and shows the matching screen before any signed-in page.
// It sits in a layout, which stays mounted while moving between pages, so it doesn't ask again
export default function MeGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MeState>({ status: "loading" });

  useEffect(() => {
    // React runs this effect twice in development. Only the latest run may update the page,
    // so a request from the first run that finishes first (or fails) can't flash the wrong screen
    let ignore = false;

    const fetchMe = async () => {
      try {
        const me = await getMe();
        if (ignore) return;
        setState({ status: "ready", me });
      } catch (error) {
        if (ignore) return;
        // an Admin suspended this account
        if (error instanceof AccountSuspendedError) {
          setState({ status: "suspended" });
          return;
        }
        // signed in, but the email isn't on the Allowlist
        if (error instanceof AccessDeniedError) {
          setState({ status: "accessDenied" });
          return;
        }
        console.error("Error fetching the signed-in user:", error);
        setState({ status: "loadFailed" });
      }
    };
    fetchMe();

    return () => {
      ignore = true;
    };
  }, []);

  if (state.status === "ready") {
    return <MeContext value={state.me}>{children}</MeContext>;
  }

  const isLoading = state.status === "loading";

  return (
    // the same shell as the pages, so the loader sits in the same spot when the page takes over
    <div className="flex flex-1 flex-col">
      <Header />
      <main
        className={cn(
          "page-container",
          isLoading ? "flex flex-1 items-center justify-center" : "pb-10",
        )}
      >
        {isLoading ? (
          <LoadingData />
        ) : state.status === "suspended" ? (
          <AccountSuspended />
        ) : state.status === "accessDenied" ? (
          <AccessDenied />
        ) : (
          <LoadError />
        )}
      </main>
    </div>
  );
}
