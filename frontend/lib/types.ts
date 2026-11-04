export type DoctorCardData = {
  cardId: number;
  doctorName: string;
  specialty: string;
  clinicName: string | null;
  phone: string | null;
  website: string | null;
  streetAddress1: string;
  streetAddress2: string | null;
  city: string;
  stateProvince: string;
  zipCode: string | null;
  country: string;
  notes: string | null;
};

export type NewDoctorCardData = Omit<DoctorCardData, "cardId">;

// who a delegate is to the user, picked when inviting them
export type DelegateRelationship = "Family" | "Primary Care";

// full: view, add, edit and delete doctor cards. view: only see them
export type AccessLevel = "full" | "view";

// someone who accepted an invitation and can use the account
export type Delegate = {
  delegateId: number;
  name: string;
  email: string;
  relationship: DelegateRelationship | null;
  accessLevel: AccessLevel;
  status: "active" | "inactive";
  addedAt: string; // ISO date-time
  // their latest sign-in, or null before the first one
  lastSession: { at: string; device: string } | null;
};

// an invitation the delegate hasn't accepted yet
export type PendingInvitation = {
  invitationId: number;
  email: string;
  relationship: DelegateRelationship | null;
  accessLevel: AccessLevel;
  sentAt: string; // ISO date-time
  expiresAt: string; // ISO date-time
};

export type NewDelegateInvitation = Pick<
  PendingInvitation,
  "email" | "relationship" | "accessLevel"
>;
