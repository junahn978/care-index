import { MailCheck, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCESS_LEVELS, daysUntil, formatDate } from "@/lib/delegation";
import { PendingInvitation } from "@/lib/types";

// one invitation in Pending Invitations
export default function PendingInvitationCard(invitation: PendingInvitation) {
  const daysLeft = daysUntil(invitation.expiresAt);
  const access = ACCESS_LEVELS[invitation.accessLevel];

  return (
    // details on the left and buttons on the right from laptop up; buttons below on smaller
    // screens. wrap-anywhere: a long email breaks to fit phone widths
    <article className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm wrap-anywhere tablet:p-6 laptop:flex-row laptop:items-center laptop:justify-between laptop:gap-6">
      <div className="flex min-w-0 items-center gap-3 tablet:gap-4">
        <div
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#EFFFFB] tablet:size-14"
        >
          <MailCheck className="size-5 text-[#0F766E]" />
        </div>
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-semibold">{invitation.email}</h3>
            {invitation.relationship && (
              <span className="text-muted-foreground">
                {invitation.relationship}
              </span>
            )}
            {/* a template string, not cn: cn reads text-fluid-sm as a text color and drops it */}
            <span
              className={`rounded-full px-2.5 py-0.5 text-fluid-sm ${access.badgeClass}`}
            >
              {access.label}
            </span>
          </div>
          {daysLeft > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6E0] px-2.5 py-0.5 text-fluid-sm text-[#B45309]">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-[#F59E0B]"
              />
              Invitation Sent (Expires in {daysLeft}{" "}
              {daysLeft === 1 ? "day" : "days"})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-fluid-sm text-[#B91C1C]">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-[#EF4444]"
              />
              Invitation Expired
            </span>
          )}
          <p className="text-fluid-sm text-muted-foreground">
            Dispatched {formatDate(invitation.sentAt)}
          </p>
        </div>
      </div>
      {/* not wired up yet: resending and cancelling come with the backend */}
      <div className="flex flex-wrap gap-1 laptop:shrink-0">
        <Button variant="ghost" size="lg">
          <RotateCw /> Resend Invite
          <span className="sr-only"> to {invitation.email}</span>
        </Button>
        <Button variant="ghost" size="lg" className="text-muted-foreground">
          <X /> Cancel
          <span className="sr-only"> invitation to {invitation.email}</span>
        </Button>
      </div>
    </article>
  );
}
