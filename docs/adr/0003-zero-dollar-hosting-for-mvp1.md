# $0 hosting for MVP1

MVP1 runs entirely on free tiers: Supabase free (one dev and one prod project), Render free for FastAPI, and Vercel Hobby for Next.js. We accept the known costs: Render sleeps when idle so the first request can take ~30s+, and an inactive Supabase free project gets paused (mitigated by a GitHub Actions job hitting `/health` every 3 days). Google Cloud Run was rejected because it needs a billing account and more setup. Moving to paid hosting to remove cold starts is deferred until the app opens to friends.
