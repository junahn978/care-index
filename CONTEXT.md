# Care Index

A private, one-stop index of the doctors a person sees, so their care team's details are always at hand on web and phone.

## Language

**Member**:
A person whose email is on the Allowlist, who signs in and keeps their own Doctor Cards.
_Avoid_: User, patient, account, authorized user

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

## Delegation

**Owner**:
The Member whose Doctor Cards they are.

**Delegation**:
An Owner's standing permission for one Delegate to access the Owner's Doctor Cards at one Access Level. It starts when the Delegate accepts an Invitation and lasts until it is revoked or expires.
_Avoid_: Share, grant (alone), permission (alone)

**Delegate**:
A person who holds a Delegation from an Owner. They may also be a Member with Doctor Cards of their own.
_Avoid_: Recipient, viewer, guest

**Delegate-only**:
A signed-in person who isn't on the Allowlist but holds at least one active Delegation: they can work with the Doctor Cards delegated to them and have none of their own.
_Avoid_: Guest, delegate role

**Invitation**:
An Owner's offer of a Delegation to one email address at one Access Level. It becomes a Delegation only when someone signed in with that email accepts it, and lapses after 7 days.
_Avoid_: Share, invite (as a noun)

**Access Level**:
What a Delegation lets its Delegate do with the Owner's Doctor Cards: View Only (read) or Full Access (view, add, edit, delete and restore).
_Avoid_: Role, permission (alone), Edit

## Access

**Allowlist**:
The set of email addresses permitted to become Members.
_Avoid_: Whitelist, invite list

**Admin**:
A Member who manages accounts: the Allowlist, suspending accounts, and taking Delegations away. An Admin sees no one's Doctor Cards except through a Delegation of their own.
_Avoid_: Superuser, moderator

**Suspended**:
The state of an account an Admin has frozen: its holder reaches neither their own Doctor Cards nor any Delegation, and their Delegates can't reach their cards, until it is unsuspended.
_Avoid_: Banned, disabled, locked

**Audit Log**:
The permanent, append-only record of what Delegates and Admins did and of every Delegation and Invitation change.
_Avoid_: History, activity feed

**Trash**:
Where a deleted Doctor Card waits for 30 days, restorable by its Owner or a Full Access Delegate, before it is removed for good.
_Avoid_: Recycle bin, archive
