from typing import Literal
from uuid import UUID
from backend.app.auth import CurrentUser

# the one check that decides who may do what with Doctor Cards: every card and Delegation route asks can(),
# none decides on its own (ADR 0007). auth.py works out who the person is, this decides what they may do

# what a request wants to do with an Owner's Doctor Cards, in CONTEXT.md's words, plus manage_delegations
# (ADR 0007's Manage Delegations: deciding who else reaches them, such as sending an Invitation).
# restore joins with the Trash
Action = Literal["view", "add", "edit", "delete", "manage_delegations"]

# everything an Owner may do with their own cards. manage_delegations is the Owner's alone: Delegates can never
# pass access on, so no rule for Delegates may ever list it
OWNER_ACTIONS: frozenset[Action] = frozenset({"view", "add", "edit", "delete", "manage_delegations"})


# user has already passed get_current_user, so they're signed in and not Suspended.
# owner_id is the Owner whose cards, or whose Delegations, the request touches
def can(user: CurrentUser, action: Action, owner_id: UUID) -> bool:
    # only Members have Doctor Cards of their own, so the Owner rule needs the Allowlist too.
    # Always true while the gate turns away everyone not on the Allowlist; it matters once
    # Delegate-only people get through.
    # is_admin plays no part: an Admin is a Member, so they reach their own cards here and no one else's
    if user.is_allowlisted and user.id == owner_id and action in OWNER_ACTIONS:
        return True

    # deny by default: anything not allowed above is refused, so someone else's cards,
    # or an action no rule lists yet, fail closed
    return False
