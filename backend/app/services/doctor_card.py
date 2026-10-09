from sqlalchemy.orm import Session
from sqlalchemy import select
from backend.app.schemas.doctor_cards import DoctorCardCreate, DoctorCardUpdate
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

# get doctor card by card_id
def retrieve_doctor_card(db: Session, card_id: int, user_id: str) -> DoctorCard | None:
    
    query = select(DoctorCard).where(DoctorCard.card_id == card_id)
    result = db.execute(query)
    response = result.scalar_one_or_none()
    
    return response

def update_doctor_card(db: Session, card_id: int, card_update: DoctorCardUpdate, user_id) -> DoctorCard | None:
    # fetch exsisting matching card_id
    card = db.get(DoctorCard, card_id)

    #extract only the fields user changed
    update_data = card_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(card, field, value)

    db.commit()
    db.refresh(card)

    return card


def remove_doctor_card(db:Session, card_id:int, user_id:str):
    doctor_card = db.get(DoctorCard, card_id)
    if doctor_card:
        db.delete(doctor_card)
        db.commit()
