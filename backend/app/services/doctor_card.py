from sqlalchemy.orm import Session
from backend.app.schemas.doctor_cards import DoctorCardCreate
from backend.app.models.doctor_card import DoctorCard

# create doctor card
def create_doctor_card(db: Session, card_in: DoctorCardCreate, user_id: str) -> DoctorCard:
    # turn the card_in python object to a standard dictionary
    card_data = card_in.model_dump()
    
    #instantiate a model with DoctorCard and card_in
    new_card = DoctorCard(**card_data, user_id=user_id)

    db.add(new_card)
    db.commit()
    db.refresh(new_card)

    return new_card
