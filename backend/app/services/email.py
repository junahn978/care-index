import html
import resend
from backend.app.config import RESEND_API_KEY

# Invitations come from this address (ADR 0007), on the domain verified in Resend
SENDER = "Care-Index <delegations@mail.careindexapp.com>"

# how the email names each Access Level, and what it lets the Delegate do with the Owner's cards (CONTEXT.md)
ACCESS_LEVELS = {
    "view_only": ("View Only access", "see them"),
    "full_access": ("Full Access", "see, add, edit, delete and restore them"),
}

# set from config rather than left to the SDK, which reads RESEND_API_KEY when it's imported, and that can
# happen before backend/.env is loaded
resend.api_key = RESEND_API_KEY
# the SDK waits 30 seconds by default. The Owner's request waits on this call, so give up after 10
resend.default_http_client = resend.RequestsClient(timeout=10)


# emails one Invitation through Resend and returns Resend's id for it. If Resend refuses the email or doesn't
# answer within 10 seconds, it raises ResendError, so the caller can save nothing and tell the Owner.
# "Sent" means Resend took the email, not that it reached the inbox
def send_invitation_email(to: str, owner_email: str, access_level: str, link: str) -> str:
    level, allowed = ACCESS_LEVELS[access_level]
    invited = f"invited you to their Doctor Cards on Care-Index with {level}, so you'll be able to {allowed}."
    params: resend.Emails.SendParams = {
        "from": SENDER,
        "to": [to],
        "subject": f"{owner_email} invited you to their Doctor Cards on Care-Index",
        # the emails and the link are escaped because they end up inside HTML
        "html": (
            f"<p>{html.escape(owner_email)} {invited}</p>"
            f'<p><a href="{html.escape(link)}">Accept the invitation</a></p>'
            f"<p>To accept, sign in with {html.escape(to)}. The link works once and expires in 7 days.</p>"
            "<p>If you weren't expecting this, you can ignore this email.</p>"
        ),
        # for mail apps that don't show HTML
        "text": (
            f"{owner_email} {invited}\n\n"
            f"Accept the invitation: {link}\n\n"
            f"To accept, sign in with {to}. The link works once and expires in 7 days.\n\n"
            "If you weren't expecting this, you can ignore this email.\n"
        ),
    }
    return resend.Emails.send(params)["id"]
