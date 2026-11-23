import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
# os.environ[...] rather than getenv: if either is missing, the app stops at startup instead of at the first email
RESEND_API_KEY = os.environ["RESEND_API_KEY"]
# where the frontend runs, for links like {FRONTEND_URL}/accept-invitation#token=... (http://localhost:3000 in dev).
# A trailing slash is dropped so it doesn't double up in links
FRONTEND_URL = os.environ["FRONTEND_URL"].rstrip("/")