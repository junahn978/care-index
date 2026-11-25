import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
# os.environ[...] rather than getenv: if either is missing, the app stops at startup instead of at the first email
RESEND_API_KEY = os.environ["RESEND_API_KEY"].strip()
# a key with a line break in it makes the requests library refuse the header, and that error's message, which the
# Invitation route logs, holds the whole key. So whitespace around the key is dropped, and an empty key, or one with
# whitespace left inside, stops the app here too. The message never shows the key
if not RESEND_API_KEY or any(character.isspace() for character in RESEND_API_KEY):
    raise RuntimeError("RESEND_API_KEY is empty or has whitespace inside it")
# where the frontend runs, for links like {FRONTEND_URL}/accept-invitation#token=... (http://localhost:3000 in dev).
# A trailing slash is dropped so it doesn't double up in links
FRONTEND_URL = os.environ["FRONTEND_URL"].rstrip("/")