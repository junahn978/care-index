from pydantic import BaseModel

# what GET /me tells the frontend about the signed-in person. Only what the frontend can't learn itself:
# id and email are already in its Supabase session, and is_suspended would always be false here,
# since a Suspended person gets a 403 before /me runs
class MeResponse(BaseModel):
    is_admin: bool
