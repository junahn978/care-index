from sqlalchemy.orm import Session
from sqlalchemy import select
from backend.app.schemas.doctor_cards import DoctorCardCreate, DoctorCardUpdate
from backend.app.models.doctor_card import DoctorCard
from uuid import UUID 

# create doctor card
def create_doctor_card(db: Session, card_in: DoctorCardCreate, user_id: UUID) -> DoctorCard:
    # turn the card_in python object to a standard dictionary
    card_data = card_in.model_dump()
    
    #instantiate a model with DoctorCard and card_in
    new_card = DoctorCard(**card_data, user_id=user_id)

    db.add(new_card)
    db.commit()
    db.refresh(new_card)

    return new_card

# get doctor card by card_id, only if it belongs to user_id. Another user's card returns None,
# same as a missing card, so the routes answer 404 and don't reveal which card ids exist
def retrieve_doctor_card(db: Session, card_id: int, user_id: UUID) -> DoctorCard | None:
    
    query = select(DoctorCard).where(DoctorCard.card_id == card_id, DoctorCard.user_id == user_id)
    result = db.execute(query)
    response = result.scalar_one_or_none()
    
    return response

#retrive all doctor cards for a given user_id 
def retrieve_all_doctor_card(db: Session, user_id:UUID) -> list[DoctorCard]:
    statement = select(DoctorCard).where(DoctorCard.user_id == user_id)
    response = db.scalars(statement).all()
    return list(response)

def update_doctor_card(db: Session, card_id: int, card_update: DoctorCardUpdate, user_id:UUID) -> DoctorCard | None:
    # fetch exsisting matching card_id that belongs to user_id
    card = retrieve_doctor_card(db, card_id, user_id)

    # card does not exsist or belongs to another user, return none, exit early
    if card is None: 
        return None
    
    #extract only the fields user changed
    update_data = card_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(card, field, value)

    db.commit()
    db.refresh(card)

    return card

def remove_doctor_card(db:Session, card_id:int, user_id:UUID)-> bool:
    
    # only a card that belongs to user_id can be deleted
    doctor_card = retrieve_doctor_card(db, card_id, user_id)

    if doctor_card:
        db.delete(doctor_card)
        db.commit()
        return True
    else: return False
    
    
