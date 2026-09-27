# Care Index

A private, one-stop index of the doctors a person sees, so their care team's details are always at hand on web and phone.

## Language

**Member**:
A person who has been invited to Care Index and signs in to it.
_Avoid_: User, patient, account

**Display Name**:
The name other Members see for a Member, taken from their Google profile or asked for at first sign-in.

**Doctor Card**:
A record of a single doctor a Member sees, owned by exactly that Member.
_Avoid_: Contact, provider, entry, card (alone, when ambiguous)

**Specialty**:
A label for a kind of care a doctor provides, such as Primary Care, Orthopedics, or Sports Medicine. A Doctor Card carries one or more.
_Avoid_: Type, category, department, tag (alone)

**Preset Specialty**:
A Specialty from the built-in list every Member starts with.

**Custom Specialty**:
A Specialty a Member creates when no Preset Specialty fits. It belongs to that Member: it appears only in their own Specialty picker and stays until they delete it.
_Avoid_: Other

**Unassigned**:
The state of a Doctor Card with no Specialty, which only happens when its last Custom Specialty is deleted. Shown to the Member so they can reassign it.
_Avoid_: No tags, untagged

**Insurance Plan**:
One of a Member's own insurance coverages (e.g. medical, dental, vision), recorded so its identifiers such as member ID and group number are at hand.
_Avoid_: Policy, insurance card, coverage

## Sharing

**Owner**:
The Member whose Doctor Cards and Insurance Plans they are.

**Share**:
An Owner's standing permission for one other Member to access the Owner's Doctor Cards, Insurance Plans, or both, with a separate Access Level for each. Takes effect immediately and lasts until the Owner revokes it or the Recipient leaves it.
_Avoid_: Invite, invitation, grant

**Recipient**:
The Member a Share is given to.
_Avoid_: Viewer, invitee, guest

**Access Level**:
What a Share lets its Recipient do with one category of the Owner's data: View (read-only) or Edit (add and change, never delete). Deleting is always the Owner's alone.
_Avoid_: Role, permission (alone)

## Access

**Allowlist**:
The set of email addresses permitted to become Members.
_Avoid_: Whitelist, invite list
