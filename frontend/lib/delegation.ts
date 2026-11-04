import { AccessLevel, DelegateRelationship } from "./types";

// offered in the Relationship dropdown, in this order
export const RELATIONSHIPS = [
  "Family",
  "Primary Care",
] as const satisfies readonly DelegateRelationship[];

// how long a delegate has to accept an invitation
export const INVITATION_VALID_DAYS = 7;

export const DAY_MS = 24 * 60 * 60 * 1000;

// how each access level is described on the invite form and in the delegate lists
export const ACCESS_LEVELS: Record<
  AccessLevel,
  { label: string; badge: string; description: string; badgeClass: string }
> = {
  full: {
    label: "Full Access",
    badge: "Unrestricted",
    description: "View, edit, add, and delete doctor information",
    badgeClass: "bg-[#D5F3EC] text-[#0F766E]",
  },
  view: {
    label: "View Only",
    badge: "Read-Only",
    description:
      "Can only view your doctor information, cannot add, delete, or edit doctor cards",
    badgeClass: "bg-[#EEF0F3] text-[#4B5563]",
  },
};

// "Oct 12, 2024"
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// "Today, 09:14 AM" or "Yesterday, 10:19 PM", and the date for anything older:
// "Oct 28, 2026, 08:02 AM"
export function formatSessionTime(iso: string) {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }
  return `${formatDate(iso)}, ${time}`;
}

// whole days left until the given time, rounded up; 0 or less once it has passed
export function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS);
}
