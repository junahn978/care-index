import html
import resend
from backend.app.auth import CurrentUser
from backend.app.config import RESEND_API_KEY
from backend.app.models.invitation import AccessLevel

# Invitations come from this address (ADR 0007), on the domain verified in Resend
SENDER = "Care-Index <delegations@mail.careindexapp.com>"

# how the email names each Access Level, and what it lets the Delegate do with the Owner's cards (CONTEXT.md)
ACCESS_LEVELS: dict[AccessLevel, tuple[str, str]] = {
    "view_only": ("View Only access", "see them"),
    "full_access": ("Full Access", "see, add, edit, delete and restore them"),
}

# set from config rather than left to the SDK, which reads RESEND_API_KEY when it's imported, and that can
# happen before backend/.env is loaded
resend.api_key = RESEND_API_KEY
# the SDK waits 30 seconds by default. The Owner's request waits on this call, so give up after 10
resend.default_http_client = resend.RequestsClient(timeout=10)


# emails one Invitation from the Owner through Resend and returns Resend's id for it.
# If Resend refuses the email or doesn't answer within 10 seconds, it raises ResendError, so the caller can save
# nothing and tell the Owner. "Sent" means Resend took the email, not that it reached the inbox
def send_invitation_email(to: str, owner: CurrentUser, access_level: AccessLevel, link: str) -> str:
    level, allowed = ACCESS_LEVELS[access_level]
    # "Alex Kim (alex@example.com)", or just the email when they have no name. The email Supabase verified always
    # shows, so a made-up full name can't pass for someone else
    inviter = f"{owner.full_name} ({owner.email})" if owner.full_name else owner.email
    invited = f"invited you to their Doctor Cards on Care-Index with {level}, so you'll be able to {allowed}."
    params: resend.Emails.SendParams = {
        "from": SENDER,
        "to": [to],
        "subject": f"{inviter} invited you to their Doctor Cards on Care-Index",
        # the inviter, the invited email and the link are escaped because they end up inside HTML
        "html": (
            f"<p>{html.escape(inviter)} {invited}</p>"
            f'<p><a href="{html.escape(link)}">Accept the invitation</a></p>'
            f"<p>To accept, sign in with {html.escape(to)}. The link works once and expires in 7 days.</p>"
            "<p>If you weren't expecting this, you can ignore this email.</p>"
        ),
        # for mail apps that don't show HTML
        "text": (
            f"{inviter} {invited}\n\n"
            f"Accept the invitation: {link}\n\n"
            f"To accept, sign in with {to}. The link works once and expires in 7 days.\n\n"
            "If you weren't expecting this, you can ignore this email.\n"
        ),
    }
    return resend.Emails.send(params)["id"]
