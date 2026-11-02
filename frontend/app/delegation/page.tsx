"use client";

import { useState, useEffect } from "react";
import { SquareUser } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Header from "@/components/Header";
import SettingsMenu from "@/components/SettingsMenu";
import InviteDelegate from "@/components/InviteDelegate";
import DelegateCard from "@/components/DelegateCard";
import PendingInvitationCard from "@/components/PendingInvitationCard";
import { getDelegates, getPendingInvitations } from "@/lib/api/delegations";
import { Delegate, PendingInvitation } from "@/lib/types";

export default function DelegationPage() {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // loaded in the browser like the doctor cards, which also keeps the times ("Today, 09:14 AM",
  // "Expires in 5 days") from being worked out on the server
  useEffect(() => {
    const fetchDelegation = async () => {
      try {
        const [delegates, invitations] = await Promise.all([
          getDelegates(),
          getPendingInvitations(),
        ]);
        setDelegates(delegates);
        setInvitations(invitations);
      } catch (error) {
        console.error("Error fetching delegates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDelegation();
  }, []);

  const emptyClass =
    "rounded-2xl border border-dashed p-6 text-center text-muted-foreground";

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="page-container pt-6 pb-10 tablet:pt-10 tablet:pb-16">
        <h1 className="text-fluid-lg font-medium text-muted-foreground">
          Settings
        </h1>
        {/* the menu above the content on phones and tablets, beside it from laptop up */}
        <div className="mt-4 grid gap-6 laptop:mt-8 laptop:grid-cols-[16rem_minmax(0,1fr)] laptop:items-start laptop:gap-8">
          <SettingsMenu current="delegation" />
          <div className="flex min-w-0 flex-col gap-6 tablet:gap-8">
            <section
              aria-labelledby="delegation-heading"
              className="rounded-2xl border bg-card p-4 shadow-sm tablet:p-6 laptop:p-8"
            >
              <h2
                id="delegation-heading"
                className="flex items-center gap-2 text-fluid-lg font-medium"
              >
                <SquareUser aria-hidden="true" className="size-[1.1em] shrink-0" />
                Account Delegation & Care Delegates
              </h2>
              <p className="mt-1 max-w-[42rem] text-pretty text-muted-foreground">
                Allow trusted family members, caregivers, or legal proxies to
                view and manage your{" "}
                {/* nowrap: keep the name from splitting at its hyphen */}
                <span className="whitespace-nowrap">Care-Index</span> health
                records and doctor directory on your behalf.
              </p>
            </section>

            <InviteDelegate setInvitations={setInvitations} />

            {isLoading ? (
              <div
                role="status"
                className="flex items-center justify-center gap-3 py-10 text-[#008378]"
              >
                <Spinner className="size-6" aria-hidden="true" />
                Loading delegates…
              </div>
            ) : (
              <>
                <section
                  aria-labelledby="active-delegates-heading"
                  className="flex flex-col gap-4"
                >
                  <div>
                    <h2
                      id="active-delegates-heading"
                      className="text-fluid-lg font-medium"
                    >
                      Active Delegates ({delegates.length})
                    </h2>
                    <p className="text-muted-foreground">
                      Authorized individuals with active portal access tokens
                    </p>
                  </div>
                  {delegates.length > 0 ? (
                    delegates.map((delegate) => (
                      <DelegateCard key={delegate.delegateId} {...delegate} />
                    ))
                  ) : (
                    <p className={emptyClass}>
                      No delegates yet. Invitations they accept show up here.
                    </p>
                  )}
                </section>

                <section
                  aria-labelledby="pending-invitations-heading"
                  className="flex flex-col gap-4"
                >
                  <div>
                    <h2
                      id="pending-invitations-heading"
                      className="text-fluid-lg font-medium"
                    >
                      Pending Invitations ({invitations.length})
                    </h2>
                    <p className="text-muted-foreground">
                      Invitations awaiting delegate identity verification
                    </p>
                  </div>
                  {invitations.length > 0 ? (
                    invitations.map((invitation) => (
                      <PendingInvitationCard
                        key={invitation.invitationId}
                        {...invitation}
                      />
                    ))
                  ) : (
                    <p className={emptyClass}>No pending invitations.</p>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
