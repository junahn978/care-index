import {
  Eye,
  KeyRound,
  Mail,
  MonitorSmartphone,
  Pencil,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACCESS_LEVELS,
  formatDate,
  formatSessionTime,
} from "@/lib/delegation";
import { Delegate } from "@/lib/types";

// "MJ" for Mark Jenkins and "AC" for Dr. Amanda Cole: first and last name, skipping a title
function initials(name: string) {
  const words = name
    .replace(/^(dr|mr|mrs|ms|mx)\.?\s+/i, "")
    .trim()
    .split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// one delegate in Active Delegates
export default function DelegateCard(delegate: Delegate) {
  const AccessIcon = delegate.accessLevel === "full" ? KeyRound : Eye;
  // em-sized so icons scale with the fluid text
  const iconClass = "size-[1.1em] shrink-0";
  // thin line between the name, relationship and status
  const divider = <span aria-hidden="true" className="h-4 w-px bg-border" />;

  return (
    // from laptop up: details and buttons side by side, the last session below both. On smaller
    // screens the buttons move to the bottom, so "Added" and "Last session" stay together.
    // wrap-anywhere: long names and emails break to fit phone widths
    <article className="grid gap-4 rounded-2xl border bg-card p-4 shadow-sm wrap-anywhere tablet:p-6 laptop:grid-cols-[minmax(0,1fr)_auto] laptop:items-center laptop:gap-x-6">
      <div className="flex min-w-0 items-start gap-3 tablet:gap-4">
        {/* placeholder until delegates have profile photos */}
        <div
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#EFFFFB] font-semibold text-[#0F766E] tablet:size-14"
        >
          {initials(delegate.name)}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h3 className="font-medium">{delegate.name}</h3>
            {delegate.relationship && (
              <>
                {divider}
                <span>{delegate.relationship}</span>
              </>
            )}
            {divider}
            <span
              className={
                delegate.status === "active"
                  ? "text-[#0F766E]"
                  : "text-muted-foreground"
              }
            >
              {delegate.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1.5">
              <Mail aria-hidden="true" className={iconClass} />
              {delegate.email}
            </span>
            <span aria-hidden="true">•</span>
            <span className="flex items-center gap-1.5">
              <AccessIcon aria-hidden="true" className={iconClass} />
              {ACCESS_LEVELS[delegate.accessLevel].label}
            </span>
          </div>
          <p className="text-fluid-sm text-muted-foreground">
            Added {formatDate(delegate.addedAt)}
          </p>
        </div>
      </div>
      {/* these open dialogs once editing permissions and revoking access are built */}
      <div className="order-last flex flex-wrap gap-1 laptop:order-none laptop:col-start-2 laptop:row-start-1">
        <Button variant="ghost" size="lg">
          <Pencil /> Edit Permissions
          <span className="sr-only"> for {delegate.name}</span>
        </Button>
        <Button variant="ghost" size="lg">
          <UserMinus /> Revoke Access
          <span className="sr-only"> for {delegate.name}</span>
        </Button>
      </div>
      <p className="flex items-start gap-2 text-fluid-sm laptop:col-span-2">
        <MonitorSmartphone
          aria-hidden="true"
          className="mt-[0.15em] size-[1.15em] shrink-0 text-muted-foreground"
        />
        {delegate.lastSession
          ? `Last session: ${formatSessionTime(delegate.lastSession.at)} from ${delegate.lastSession.device}`
          : "Hasn’t signed in yet"}
      </p>
    </article>
  );
}
