# FastAPI is the only database client

Supabase lets a frontend query Postgres directly, but we route every read and write through a FastAPI backend: Next.js sends the Member's Supabase access token, FastAPI verifies it and scopes each query to that Member. We chose this for a clean frontend/backend separation and because learning FastAPI/Python is an explicit goal of the project.

## Consequences

- The Next.js app never uses the Supabase data client, only Supabase Auth.
- Row-level security is enabled on every table with no policies for the `anon`/`authenticated` roles, so Supabase's auto-generated Data API exposes nothing; FastAPI connects with its own database credentials.
- Splitting access (frontend reads direct, backend writes) was rejected: two paths into the data means two places to get authorization wrong.
