# Care Index — MVP1 Spec

Terms in **bold** are defined in [`CONTEXT.md`](../CONTEXT.md). Decisions with real trade-offs are recorded in [`docs/adr/`](./adr/).

## Goal

A private, invite-only web app (installable as a PWA) where each **Member** keeps their **Doctor Cards** and **Insurance Plans**, and can **Share** them with family. Audience: the author, their parents and sister. $0 to run.

## Stack

| Layer           | Choice                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Frontend        | Next.js (App Router, TypeScript), Tailwind, shadcn/ui — hosted on Vercel Hobby                        |
| Backend         | FastAPI, SQLModel, Alembic, `uv` — hosted on Render free tier                                         |
| Database & auth | Supabase free tier (Postgres + Supabase Auth). Two projects: `care-index-dev` and `care-index` (prod) |
| Sign-in         | Google OAuth; magic link as fallback                                                                  |
| CI              | GitHub Actions: lint + tests on push; keep-alive ping every 3 days                                    |

Repo layout: `frontend/`, `backend/`, `docs/`.

Architecture rules:

- FastAPI is the **only** database client ([ADR 0001](./adr/0001-fastapi-is-the-only-database-client.md)). Next.js uses `@supabase/ssr` for sign-in and session only, and sends the Supabase access token to FastAPI as `Authorization: Bearer …`.
- RLS is enabled on every table with no policies, so Supabase's auto-generated Data API exposes nothing.
- FastAPI verifies the token against the Supabase project's JWKS on every request.

## Data model

```
allowed_emails   email (pk, lowercased), note, created_at

members          id (uuid, pk = Supabase auth user id), email (unique),
                 display_name (nullable until set), created_at

access_denied    id, email, auth_user_id (nullable), ip, user_agent, path,
                 occurred_at

specialties      id, owner_id (fk members, NULL = Preset Specialty), name, created_at
                 unique (owner_id, lower(name)); presets unique on lower(name)

doctor_cards     id, owner_id (fk members), doctor_name*, clinic_name, phone,
                 address, website, notes, created_at, updated_at

doctor_card_specialties
                 doctor_card_id, specialty_id  (pk both; cascade on delete of either)

insurance_plans  id, owner_id (fk members), plan_type* (medical|dental|vision|other),
                 insurer*, member_id*, group_number*, plan_name,
                 member_services_phone, notes, created_at, updated_at

shares           id, owner_id (fk members), recipient_id (fk members),
                 doctors_access (none|view|edit), insurance_access (none|view|edit),
                 created_at, updated_at
                 unique (owner_id, recipient_id); owner_id <> recipient_id;
                 not (doctors_access = none and insurance_access = none)
```

`*` = required. The Preset Specialty list is seeded by a migration:

> Primary Care · Urgent Care · Cardiology · Dermatology · Endocrinology · ENT (Ear, Nose & Throat) · Gastroenterology · Neurology · OB/GYN · Oncology · Ophthalmology · Optometry · Orthopedics · Sports Medicine · Physical Therapy · Chiropractic · Allergy & Immunology · Psychiatry · Therapy / Counseling · Pulmonology · Rheumatology · Urology · Dentistry · Orthodontics

## Rules

### Access

1. Every request except `/health` needs a valid Supabase token **and** an email in `allowed_emails`. Otherwise FastAPI responds `403 not_authorized` and writes a row to `access_denied`. The Supabase auth record of an uninvited person is kept on purpose, for auditing ([ADR 0004](./adr/0004-supabase-auth-with-fastapi-enforced-allowlist.md)).
2. On the first allowed request, FastAPI creates the `members` row. `display_name` comes from the Google profile name if present; otherwise the frontend asks for a first name before showing anything else.
3. Removing an email from `allowed_emails` cuts off access immediately. The Member's data and Shares stay.

### Authorization (per resource category: Doctors, Insurance)

| Actor                 | Read | Create                  | Update | Delete |
| --------------------- | ---- | ----------------------- | ------ | ------ |
| Owner                 | ✅   | ✅                      | ✅     | ✅     |
| Recipient with `edit` | ✅   | ✅ (owned by the Owner) | ✅     | ❌     |
| Recipient with `view` | ✅   | ❌                      | ❌     | ❌     |
| Anyone else           | ❌   | ❌                      | ❌     | ❌     |

- Custom Specialties follow the **Doctors** level: Editors can create them (they belong to the card's Owner), but only the Owner can delete them.
- If the actor can't read a resource, respond `404`, not `403`, so its existence isn't revealed.
- Only the Owner creates, changes or revokes a Share. The Recipient can leave it (deletes the Share). There is no re-sharing.
- Revoking or leaving takes effect on the next request.

### Doctor Cards and Specialties

- Creating or editing a card requires **at least one** Specialty.
- A card's Specialties can be any mix of Preset Specialties and the Owner's Custom Specialties.
- Creating a Custom Specialty whose name matches an existing preset or one of the Owner's customs (case-insensitive) returns the existing one.
- A Custom Specialty stays until the Owner deletes it (no automatic cleanup). Deleting one asks for confirmation with the usage count ("Remove from 2 cards?"), then strips it from those cards. Cards left with no Specialty become **Unassigned**.
- Delete is permanent, after a confirmation dialog. This applies to cards, plans, Custom Specialties and Shares.

### Validation

- US phone numbers only; stored as digits and displayed as `(555) 123-4567`.
- `website` must be an absolute `http(s)://` URL.
- Address is one free-text field.

## API (FastAPI, prefix `/api`)

`{owner}` is a member id or `me`.

```
GET    /health                                   no auth; runs SELECT 1 (keep-alive target)

GET    /me                                       profile; creates the member on first call
PATCH  /me                                       { display_name }

GET    /members/{owner}/doctor-cards             ?q=  ?specialty_id=  ?unassigned=true
POST   /members/{owner}/doctor-cards
GET    /doctor-cards/{id}
PATCH  /doctor-cards/{id}
DELETE /doctor-cards/{id}                         Owner only

GET    /members/{owner}/specialties              presets + Owner's customs, with usage counts
POST   /members/{owner}/specialties              { name } → existing or new Custom Specialty
DELETE /specialties/{id}                          Owner only; custom only

GET    /members/{owner}/insurance-plans
POST   /members/{owner}/insurance-plans
GET    /insurance-plans/{id}
PATCH  /insurance-plans/{id}
DELETE /insurance-plans/{id}                      Owner only

GET    /shares                                   { outgoing: [...], incoming: [...] }
POST   /shares                                   { recipient_email, doctors_access, insurance_access }
PATCH  /shares/{id}                              Owner only; change levels
DELETE /shares/{id}                              Owner revokes or Recipient leaves
```

- `q` matches doctor name and clinic name.
- `POST /shares` returns `404 "No Member with that email"` unless the email belongs to someone who has signed in at least once.

## Screens

- **Sign in**: "Continue with Google" button, plus an email field for a magic link.
- **Not authorized**: shown when `/me` returns 403; signs the person out.
- **Welcome**: asks for a first name when there's no Display Name.
- **Top bar**: profile icon → menu with **Sharing**, **My specialties**, **Display name**, **Sign out**.
- **Bottom tab bar**: **Doctors** (home) and **Insurance**.
- **Doctors tab**:
  - A `Viewing: Me ▾` switcher listing Members who share Doctors with you. When viewing someone else, a banner reads "Mom's doctors — view only" or "— you can edit".
  - A search box, and Specialty filter chips. The **Unassigned** chip appears only when such cards exist.
  - The list is sorted A–Z by doctor name. Each row shows the name, Specialty chips, clinic and a call button. Unassigned cards show a "Needs a specialty" badge.
  - A floating **+** button, shown for the Owner or an Editor.
- **Doctor Card detail**: all fields, with `tel:` and Maps links. **Edit** is shown to the Owner or an Editor; **Delete** to the Owner only.
- **Doctor Card form**: fields, plus a multi-select Specialty picker with "+ Other".
- **Insurance tab**: the same switcher and banner pattern. Plans are ordered Medical → Dental → Vision → Other, with the **+** button, detail page and form.
- **Sharing**:
  - **I share with**: one row per Recipient showing Display Name, email, `Doctors [Off|View|Edit]` and `Insurance [Off|View|Edit]` controls, and **Revoke**. A **+ Share** button opens a dialog asking for an email and the two levels.
  - **Shared with me**: a list of who shares what with you, at what level, each with **Leave**.
- **My specialties**: your Custom Specialties with usage counts and Delete.
- Mobile first: large tap targets and readable text sizes.

## Build order

Auth comes first, because every later phase needs an Owner.

1. **Foundation.** Monorepo scaffold, `care-index-dev` Supabase project, Alembic baseline (RLS lockdown, preset seed), token verification, allowlist, `access_denied`, `/me`, Display Name, sign-in and not-authorized screens.
2. **Doctor Cards.** CRUD, Specialties (preset, custom, delete, Unassigned), search and filters.
3. **Insurance Plans.** CRUD.
4. **Deploy.** Prod Supabase project, Render, Vercel, CI workflow, keep-alive workflow (`/health` every 3 days).
5. **Sharing.** `shares` table, the authorization matrix above, switcher, banners, Sharing screen.
6. **PWA.** Manifest, icons, installable on iOS and Android.

## Testing

- pytest against a real Postgres for FastAPI.
- The authorization matrix is covered exhaustively: Owner, Recipient with View, Recipient with Edit, a revoked Share, a left Share, an allowlisted non-recipient, and an unlisted email, each against every endpoint.
- Light frontend tests only.

## Out of scope for MVP1

Appointments, reminders, medications, medical records, insurance card photos and file uploads, a "last edited by" line and change history, app-level encryption ([ADR 0005](./adr/0005-no-application-level-encryption-in-mvp1.md)), soft delete, self-service account deletion, backups and export, a native app, a custom domain, and non-US phone numbers or addresses.

## Revisit before opening to friends or the public

- App-level encryption of Insurance Plan identifiers.
- Member lookup by email reveals who uses the app.
- Paid hosting to remove cold starts.
- Backups.
- A Supabase "before user created" hook.
- Scheduled GitHub workflows are auto-disabled after 60 days without repo activity, so the keep-alive job needs watching during quiet periods.
