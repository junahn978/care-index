from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db import get_db
from backend.app.schemas.doctor_cards import DoctorCardCreate, DoctorCardResponse, DoctorCardUpdate
from backend.app.services.doctor_card import create_doctor_card, retrieve_doctor_card, update_doctor_card

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
def post_doctor_card(card: DoctorCardCreate, db: Session = Depends(get_db)):
    user_id = "test-user-id"
    response = create_doctor_card(db, card, user_id)
    return response

# get card by card_id function
@router.get(
    "/{card_id}",
    response_model=DoctorCardResponse,
    status_code=200,
    summary="Get Doctor Card information"
)
def get_doctor_card(card_id: int, db:Session = Depends(get_db)):
    user_id = "test-user-id"
    response = retrieve_doctor_card(db, card_id, user_id)
    return response

# update exsisting doctor card
@router.patch(
    "/{card_id}",
    response_model=DoctorCardResponse,
    status_code=200,
    summary="Update Doctor Card Information"
)
def patch_doctor_card(card_id: int, card: DoctorCardUpdate, db:Session = Depends(get_db)):
    user_id = "test-user-id"
    response = update_doctor_card(card_id, )
    return response