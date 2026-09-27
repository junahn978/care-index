# Owner-controlled Shares instead of a Household

Every Doctor Card and Insurance Plan still has exactly one Owner, but an Owner can create a Share giving another Member (picked by email) access to their Doctor Cards, Insurance Plans, or both, at View or Edit level. Shares take effect immediately with no acceptance step and the Owner can revoke them at any time. We rejected a shared family list and an everyone-sees-everything Household because both break down once friends join; with Shares nothing is visible to anyone unless its Owner chose to share it.

## Consequences

- Authorization is no longer just "is this row mine?": every read and write in FastAPI must also check for a matching Share and its Access Level.
- Sharing is part of MVP1 but built last, after Doctor Cards, Insurance Plans and the first deploy.
- Access Level is set per category (Doctors, Insurance). Edit means add and change but never delete, because deletes are permanent and should only ever be the Owner's call; this includes deleting Custom Specialties. Anything an Editor creates (cards, plans, Custom Specialties) belongs to the Owner.
- Recipients cannot re-share; they can leave a Share, which has the same effect as the Owner revoking it.
- Only existing Members can be Recipients. Looking up a Member by email reveals who uses Care Index; acceptable for a family, to revisit before going public.
