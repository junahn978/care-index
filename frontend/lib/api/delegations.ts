import { DAY_MS, INVITATION_VALID_DAYS } from "../delegation";
import { Delegate, NewDelegateInvitation, PendingInvitation } from "../types";

// Placeholders until the backend has delegation routes. They return sample data in the shape
// the page uses, so each one can later be swapped for a fetch call like those in
// doctor-cards.ts. The sample emails use example.com and example.org, which are reserved for
// examples and belong to nobody

const HOUR_MS = 60 * 60 * 1000;

// the time `ms` milliseconds ago, so the sample sessions and invitation always look recent
function timeAgo(ms: number) {
  return new Date(Date.now() - ms).toISOString();
}

export async function getDelegates(): Promise<Delegate[]> {
  return [
    {
      delegateId: 1,
      name: "Mark Jenkins",
      email: "mark.jenkins@example.com",
      relationship: "Family",
      accessLevel: "full",
      status: "active",
      addedAt: "2024-10-12T12:00:00Z",
      lastSession: { at: timeAgo(2 * HOUR_MS), device: "Safari (iOS 18)" },
    },
    {
      delegateId: 2,
      name: "Dr. Amanda Cole",
      email: "amanda.cole@example.org",
      relationship: "Primary Care",
      accessLevel: "view",
      status: "active",
      addedAt: "2024-08-05T12:00:00Z",
      lastSession: {
        at: timeAgo(DAY_MS + 3 * HOUR_MS),
        device: "Chrome (macOS)",
      },
    },
  ];
}

export async function getPendingInvitations(): Promise<PendingInvitation[]> {
  const sentAt = Date.now() - 2 * DAY_MS;
  return [
    {
      invitationId: 1,
      email: "claire.jenkins@example.com",
      relationship: "Family",
      accessLevel: "view",
      sentAt: new Date(sentAt).toISOString(),
      expiresAt: new Date(
        sentAt + INVITATION_VALID_DAYS * DAY_MS,
      ).toISOString(),
    },
  ];
}

// resolves with the invitation as it appears in Pending Invitations
export async function sendDelegateInvitation(
  invitation: NewDelegateInvitation,
): Promise<PendingInvitation> {
  // waits about as long as a real request, so the button's sending state shows
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const sentAt = Date.now();
  return {
    invitationId: sentAt,
    ...invitation,
    sentAt: new Date(sentAt).toISOString(),
    expiresAt: new Date(sentAt + INVITATION_VALID_DAYS * DAY_MS).toISOString(),
  };
}
