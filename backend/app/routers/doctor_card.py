from fastapi import APIRouter
from backend.app.schemas.doctor_cards import DoctorCardCreate, DoctorCardResponse
from backend.app.models.doctor_card import DoctorCard
from backend.app.services import create_doctor_card


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
def post_doctor_card(db: session, card: DoctorCardCreate):
    response = create_doctor_card(db, card)
    return response
    
