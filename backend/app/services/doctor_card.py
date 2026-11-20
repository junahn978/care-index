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

# get doctor card by card_id, whoever owns it. Who may see it is can()'s decision, not this query's,
# so every caller must ask can() before using the card
def retrieve_doctor_card(db: Session, card_id: int) -> DoctorCard | None:

    query = select(DoctorCard).where(DoctorCard.card_id == card_id)
    result = db.execute(query)
    response = result.scalar_one_or_none()
    
    return response

#retrive all doctor cards for a given user_id 
def retrieve_all_doctor_card(db: Session, user_id:UUID) -> list[DoctorCard]:
    statement = select(DoctorCard).where(DoctorCard.user_id == user_id)
    response = db.scalars(statement).all()
    return list(response)

# takes the card the route already loaded and checked with can(), so the card checked is the card edited
def update_doctor_card(db: Session, card: DoctorCard, card_update: DoctorCardUpdate) -> DoctorCard:
    #extract only the fields user changed
    update_data = card_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(card, field, value)

    db.commit()
    db.refresh(card)

    return card

# same as update: deletes the card the route already checked with can()
def remove_doctor_card(db:Session, doctor_card: DoctorCard) -> None:
    db.delete(doctor_card)
    db.commit()
