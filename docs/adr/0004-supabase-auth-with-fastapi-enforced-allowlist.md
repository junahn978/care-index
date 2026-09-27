# Supabase Auth, with the Allowlist enforced in FastAPI

Members sign in with Google (OAuth) or a Supabase magic link as a fallback; Next.js uses Supabase Auth only for sign-in and session handling. Auth.js was rejected because magic links would need a separate email provider and FastAPI would have to verify tokens in a format Supabase doesn't issue. FastAPI verifies the Supabase access token on every request and rejects any email not in the `allowed_emails` table with a 403, which the frontend shows as "not authorized".

## Consequences

- Sign-in happens between the browser and Supabase, so an uninvited person who signs in still gets a Supabase auth record; they just can't read or write anything. We keep it that way deliberately: those records are part of the audit trail. (Blocking creation would need a Supabase "before user created" hook.)
- Every rejected request is also written to an `access_denied` table (email, Supabase user ID, time, IP, user agent, path), because Supabase's own records say who signed in but not what they tried or from where.
- Adding a family member (or later, friends) is a row insert, not a redeploy.
