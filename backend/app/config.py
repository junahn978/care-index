import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")

# emails allowed to use the API, comma separated in backend/.env so they stay out of the public repo.
# Lowercased to match however the email is capitalized; if it's missing, nobody is allowed in
ALLOWED_EMAILS = {email.strip().lower() for email in os.getenv("ALLOWED_EMAILS", "").split(",") if email.strip()}