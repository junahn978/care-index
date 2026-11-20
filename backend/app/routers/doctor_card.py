from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db import get_db
from backend.app.schemas.doctor_cards import DoctorCardCreate, DoctorCardResponse, DoctorCardUpdate
from backend.app.services.doctor_card import create_doctor_card, retrieve_doctor_card, update_doctor_card, remove_doctor_card, retrieve_all_doctor_card
import uuid
from backend.app.auth import CurrentUser, get_current_user
from backend.app.authorization import can

mock_user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")

#craete an instance of the APIrouter
router = APIRouter(
    prefix="/doctor-card",
    tags=["Doctor Cards"]
)

#decorator to define the POST endpoint to create a new Doctor Card
@router.post(
    "/", 
    response_model=DoctorCardResponse, 
    status_code=201,
    summary="Create a new Doctor Card",
)
def post_doctor_card(card: DoctorCardCreate, db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    # for now a new card always goes to the person adding it, but can() still decides
    if not can(user, "add", user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    response = create_doctor_card(db, card, user.id, user)
    return response

# get card by card_id function
@router.get(
    "/{card_id}",
    response_model=DoctorCardResponse,
    status_code=200,
    summary="Get Doctor Card information"
)
def get_doctor_card(card_id: int, db:Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    response = retrieve_doctor_card(db, card_id)

    # a missing card and someone else's card get the same 404, so the answer doesn't reveal which card ids exist
    if response is None or not can(user, "view", response.user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"card ID: {card_id} not found")
    else: return response

# get all doctor cards for an user
@router.get(
    "/",
    response_model=list[DoctorCardResponse],
    status_code=200,
    summary="get all doctor card for a given user"
)
def get_all_doctor_card(db:Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    # always the caller's own cards for now, but can() still decides
    if not can(user, "view", user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    response = retrieve_all_doctor_card(db, user.id)

    return response


# update exsisting doctor card
@router.patch(
    "/{card_id}",
    response_model=DoctorCardResponse,
    status_code=200,
    summary="Update Doctor Card Information"
)
def patch_doctor_card(card_id: int, card: DoctorCardUpdate, db:Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    doctor_card = retrieve_doctor_card(db, card_id)

    if doctor_card is None or not can(user, "edit", doctor_card.user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"card ID: {card_id} not found")

    response = update_doctor_card(db, doctor_card, card, user)
    return response

# delete doctor card
@router.delete(
    "/{card_id}",
    status_code=204,
    summary="Delete doctor card"
)
def delete_doctor_card(card_id: int, db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    doctor_card = retrieve_doctor_card(db, card_id)

    if doctor_card is None or not can(user, "delete", doctor_card.user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"card ID: {card_id} not found")

    remove_doctor_card(db, doctor_card, user)
