# GitHub Actions migrates the database, then deploys FastAPI

Backend code that expects a migration the database doesn't have yet breaks, so migrations must reach the prod database before the code that needs them. Render's Pre-Deploy Command is made for this, but it's paid only, and ADR 0003 keeps MVP1 on free tiers. So Render's auto-deploy is Off, and a GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to `main`: it runs the checks, then `alembic upgrade head` against the prod database, and only if that succeeds calls Render's Deploy Hook to deploy FastAPI. A failed migration stops the run, so the new backend code is never deployed. We chose this over migrating in Render's build because the checks gate every migration before it touches prod, and the pipeline lives in the repo.

## Considered Options

- **Render's Pre-Deploy Command.** Rejected: paid only. Revisit when we move to paid hosting.
- **Migrations in the Render Build Command.** Rejected: it's the simplest choice and works on Free, since a failed build cancels the deploy. But nothing gates the migration before it touches prod, a PR preview turned on by mistake would migrate prod, and the pipeline would live in Render's settings instead of in the repo. It's the fallback if GitHub Actions becomes a burden.
- **Migrations in the Start Command.** Rejected: free services spin down after 15 minutes without traffic and can be restarted at any time, so the migration would rerun on every cold start and restart.
- **Render's "After CI Checks Pass" instead of the hook.** Rejected: every check on the commit gates the deploy, a run cancelled by a concurrency group counts as a failure, and Render's docs don't say what happens when a newer commit lands while checks run. The hook keeps the workflow the one place that decides when, and which commit, deploys.
- **Running `alembic upgrade head` by hand before deploys.** Rejected: it's easy to forget. After PR #65 widened the Audit Log's CHECK for the Invitation actions, sending an Invitation (PR #67) would fail on save until someone upgraded the dev database.

## Consequences

- The backend's dependencies get pinned in a `requirements.txt` (alembic, psycopg2-binary, resend, email-validator and the rest) for GitHub Actions and Render to install.
- Two GitHub Actions secrets hold the prod `DATABASE_URL` and the Deploy Hook URL. The `DATABASE_URL` must be Supabase's session pooler URL on port 5432, as the dev one already is: GitHub-hosted runners are IPv4-only, the direct connection is IPv6 without the paid add-on, and the transaction pooler (port 6543) isn't for migrations. Render is IPv4-only too, so the backend's own `DATABASE_URL` there needs a pooler URL as well.
- Render's auto-deploy stays Off, or Render would deploy each push without waiting for its migration. PR previews stay off too: they copy the service's environment, so they'd run PR code against prod.
- The workflow calls the hook with `curl -f` and `ref` set to the run's commit, so a rejected call fails the run and Render deploys that commit rather than whatever is newest on `main`. The hook only starts the deploy: a green run doesn't mean the deploy succeeded.
- Migrations must work with the backend that's already running (expand, then contract). That backend serves on the new schema for the whole Render build, and indefinitely if the deploy fails. Adding a table or widening a CHECK, like PR #65, is safe. Don't drop or rename a column in the same deploy that stops using it: stop using it first, then remove it in a later deploy.
- Forward only: the pipeline never downgrades, and a bad migration is fixed with a new one. Render rollbacks skip the build, so they never run or undo migrations. Some downgrades can't run at all: the one in `c26d3c3bb3eb` fails once any Invitation action is logged.
- Runs share one concurrency group, so only one migrates and deploys at a time. `cancel-in-progress` stays off, since it would kill a running migration.
- Until tests exist, the checks step is small. When tests are written, they go there and gate the migration.

### Running `alembic upgrade head`

Alembic always runs from the repo root, where alembic.ini is. env.py reads only `DATABASE_URL` (from `backend/.env` locally, from the environment in the workflow) and doesn't import the app's config, so migrating needs no other settings.

- Prod: automatically, in the workflow, before every deploy. The run fails if Alembic shows more than one head, which happens when two PRs add migrations on the same parent.
- Dev: by hand, as `.venv/bin/alembic upgrade head`, after pulling a merged migration. It stays manual: each migration PR is verified against dev inside a transaction that's rolled back, so merging one leaves the dev database as it was until someone runs the upgrade.
