# No application-level encryption in MVP1

Insurance Plans hold member IDs and group numbers, but MVP1 stores them as plain columns and relies on Supabase's encryption at rest, TLS in transit, the Allowlist, and FastAPI scoping every query to its Member. Encrypting fields in the app was deferred because it adds key management and makes those fields unsearchable, which isn't worth it for a family-only app. Revisit before Care Index opens to friends.
