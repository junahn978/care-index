from sqlalchemy.orm import Session
from backend.app.models.allowed_email import AllowedEmail

# whether this email is on the Allowlist. Emails are stored lowercased, so lowercase before calling
def is_email_allowed(db: Session, email: str) -> bool:
    return db.get(AllowedEmail, email) is not None
