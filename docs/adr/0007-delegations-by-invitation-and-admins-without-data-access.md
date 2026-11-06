# Delegations by Invitation, and Admins who never see Doctor Cards

Doctor Cards hold medical information, so the only ways to reach one are to be its Owner or to hold a Delegation the Owner offered and the Delegate accepted. Account-wide powers are roles (Member, Admin), but card access is decided per request from the Delegation's attributes (Owner, Access Level, status, expiry), giving each person the least access that does the job. Admins manage accounts but can never grant access to data, because an Admin who could grant Delegations could grant one to themselves. This replaces ADR 0006's Shares, which needed no acceptance, could never delete, and were limited to Members.

## Considered Options

- **Delegate as a role.** Rejected: being a Delegate is relative to one Owner (a full Delegate of Mom, nobody's Delegate otherwise), which a global role can't express. Anyone can be a Member and a Delegate at once.
- **Admins as superusers.** Rejected: they could read or grant access to anyone's medical information. Admins can only take access away.
- **Deleting compromised accounts.** Rejected as the default: deleting destroys a real person's records. Admins suspend instead; deletion exists but needs a reason.
- **Roles and Delegations inside the sign-in token.** Rejected: a token lives about an hour, so a revoked Delegate would keep access until it expired. FastAPI reads them from the database on every request.
- **403 for cards outside your access.** Rejected: it confirms the card exists. Card ids are sequential, so it would let someone map which ids are real.

## Consequences

### Who can do what with an Owner's Doctor Cards

| | View | Add / edit | Delete / restore | Manage Delegations |
|---|---|---|---|---|
| Owner | ✅ | ✅ | ✅ | ✅ |
| Full Access Delegate | ✅ | ✅ (cards stay the Owner's) | ✅ | ❌ |
| View Only Delegate | ✅ | ❌ | ❌ | ❌ |
| Admin without a Delegation | ❌ | ❌ | ❌ | revoke or downgrade only |
| Anyone else | ❌ | ❌ | ❌ | ❌ |

- Only Members (on the Allowlist) have Doctor Cards of their own. A person who isn't on the Allowlist but holds an active Delegation is Delegate-only: they can sign in and work with the cards shared with them, nothing else. Delegate-only is worked out on every request, not stored, so it ends by itself when their last Delegation is revoked or expires.
- Delegates can never pass access on. Only the Owner offers Delegations, and only an accepted Invitation creates one.
- All of these rules live in one authorization check (`can(person, action, owner)`) that every route calls; no route decides on its own.

### Answers

| Situation | Status |
|---|---|
| No valid sign-in token | 401 |
| Not on the Allowlist and no active Delegation | 403 "Not authorized" |
| Your own account is Suspended | 403 "Account suspended" |
| A card or Owner outside your access: not yours, no Delegation, a revoked or expired one, a Suspended Owner, or a card in the Trash | 404 |
| A card you can see, but your Access Level doesn't allow the action | 403 |
| An Admin acting on themselves or on the last Admin | 403 |

### Invitations

- The Owner's Invitation names one email and an Access Level. FastAPI makes a random single-use token, stores only its hash, and returns a link with the raw token, which the Owner copies and sends. Emailing it through Resend comes later.
- Accepting needs someone signed in (Google or magic link) with the invited email, a token that is unused and under 7 days old, and neither the Owner nor the invitee Suspended. A failed accept gives one generic "invalid or expired" answer.
- Resending makes a new token and kills the old one. Cancelling kills the Invitation, and revoking a Delegate also kills any pending Invitation to them.
- Nobody can invite themselves, Admins included, nor someone who already holds a Delegation from them. Suspended Members can't send Invitations.

### Suspension and Admins

- Admins are set directly in the database, never through the app. They can add and remove Allowlist emails, Suspend and unsuspend accounts, revoke or downgrade Delegations, and delete accounts. They can never create or upgrade a Delegation.
- Because Admins edit the Allowlist in the app, it moves from the `ALLOWED_EMAILS` setting into the `allowed_emails` table ADR 0004 describes.
- A Suspended person can't reach their own Doctor Cards or any Delegation they hold, and can't send Invitations. Their Delegates also lose access to their cards. Unsuspending restores all of it unchanged.
- Deleting an account needs a written reason, which goes in the Audit Log. It removes the person's Doctor Cards, Delegations and Invitations; the Audit Log keeps its entries.
- No Admin can Suspend or delete themselves or the last Admin.

### Audit Log

- Every Delegate action (viewing a list, viewing, adding, editing, deleting or restoring a card), every Admin action, and every Delegation and Invitation change is logged with who did it, whose card it was, which card, and when.
- The log is append-only: the app can only add rows, and a database trigger rejects any change or delete. Entries store plain ids and emails rather than links that would delete them along with a person or card. Someone with full database access could still alter it; preventing that would mean sending the log to an outside service.

### Trash

- Deleting a Doctor Card moves it to the Trash. The Owner and Full Access Delegates can restore it for 30 days; a daily job then removes cards that have been there longer. The job itself comes later.

### Not decided yet

- Insurance Plans: this covers Doctor Cards only; how Delegations apply to Insurance Plans is decided when they are built.
- Whether a Delegate can leave a Delegation themselves.
- How an Admin deletion removes the person's Supabase sign-in record, which would need Supabase's service key in the backend.
