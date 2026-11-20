"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { cn } from "cn";
import LoadingData from "@/components/LoadingData";
import AccessDenied from "@/components/AccessDenied";
import AccountSuspended from "@/components/AccountSuspended";
import AccountCheckError from "@/components/AccountCheckError";
import { getMe } from "@/lib/api/me";
import { AccessDeniedError, AccountSuspendedError } from "@/lib/api/errors";
import { Me } from "@/lib/types";

type MeState =
  | { status: "loading" }
  | { status: "suspended" }
  | { status: "accessDenied" }
  | { status: "checkFailed" }
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
        // no response (the backend is down or the Wi-Fi dropped), 502/503/504 while the backend
        // restarts, or 404 when the frontend went live before the backend had /me. Anything else
        // lands here too, since trying again is the next step for all of them
        setState({ status: "checkFailed" });
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

  // no Header on any of these screens: until /me says yes, the name it shows could belong to
  // someone who isn't allowed in. Each page brings its own Header, so it first appears with them
  return (
    // flex-1 while loading: fill the screen height so the loader can sit in the middle of it
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
        <AccountCheckError />
      )}
    </main>
  );
}
