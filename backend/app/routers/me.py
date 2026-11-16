from fastapi import APIRouter, Depends
from backend.app.auth import CurrentUser, get_current_user
from backend.app.schemas.me import MeResponse

router = APIRouter(tags=["Me"])

# the frontend calls this each time the app loads, to choose which screen to show.
# It takes no parameters: who "me" is comes from the token, so it can only ever describe the caller
@router.get(
    "/me",
    response_model=MeResponse,
    status_code=200,
    summary="Get the signed-in person's attributes",
)
def get_me(user: CurrentUser = Depends(get_current_user)):
    return MeResponse(is_admin=user.is_admin)
