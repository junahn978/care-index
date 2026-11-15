from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db import get_db
from backend.app.schemas.doctor_cards import DoctorCardCreate, DoctorCardResponse, DoctorCardUpdate
from backend.app.services.doctor_card import create_doctor_card, retrieve_doctor_card, update_doctor_card, remove_doctor_card, retrieve_all_doctor_card
import uuid
from backend.app.auth import CurrentUser, get_current_user

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
    response = create_doctor_card(db, card, user.id)
    return response

# get card by card_id function
@router.get(
    "/{card_id}",
    response_model=DoctorCardResponse,
    status_code=200,
    summary="Get Doctor Card information"
)
def get_doctor_card(card_id: int, db:Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    response = retrieve_doctor_card(db, card_id, user.id)
    
    if response is None:
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
    response = update_doctor_card(db, card_id, card, user.id)
    
    if response is None: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"card ID: {card_id} not found")
    else: return response

# delete doctor card
@router.delete(
    "/{card_id}",
    status_code=204,
    summary="Delete doctor card"
)
def delete_doctor_card(card_id: int, db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    response = remove_doctor_card(db, card_id, user.id)

    if not response: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"card ID: {card_id} not found")
    
    