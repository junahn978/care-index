from sqlalchemy.orm import Session
from sqlalchemy import select
from backend.app.schemas.doctor_cards import DoctorCardCreate, DoctorCardUpdate
from backend.app.models.doctor_card import DoctorCard
from backend.app.auth import CurrentUser
from backend.app.services.audit_log import log_action
from uuid import UUID

# every change below is logged in the same transaction as the change itself: log_action only adds the
# entry, and the one commit at the end saves both or neither (ADR 0007)

# create doctor card. owner_id is whose card it becomes, actor is who adds it (the same person for now)
def create_doctor_card(db: Session, card_in: DoctorCardCreate, owner_id: UUID, actor: CurrentUser) -> DoctorCard:
    # turn the card_in python object to a standard dictionary
    card_data = card_in.model_dump()

    #instantiate a model with DoctorCard and card_in
    new_card = DoctorCard(**card_data, user_id=owner_id)

    db.add(new_card)
    # sends the INSERT so Postgres assigns card_id, which the log entry needs. Nothing is committed yet
    db.flush()
    log_action(db, actor, "add_card", owner_id=owner_id, card_id=new_card.card_id)

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
def update_doctor_card(db: Session, card: DoctorCard, card_update: DoctorCardUpdate, actor: CurrentUser) -> DoctorCard:
    #extract only the fields the request sent
    update_data = card_update.model_dump(exclude_unset=True)

    # the edit form sends every field, so a field only counts as changed if its value is different
    changed_fields = [field for field, value in update_data.items() if getattr(card, field) != value]

    # a save that changes nothing isn't a change: nothing to write or log
    if not changed_fields:
        return card

    for field in changed_fields:
        setattr(card, field, update_data[field])

    # the names of the changed fields, never their values: the log outlives deleted cards and accounts
    log_action(db, actor, "edit_card", owner_id=card.user_id, card_id=card.card_id, details={"fields": sorted(changed_fields)})

    db.commit()
    db.refresh(card)

    return card

# same as update: deletes the card the route already checked with can()
def remove_doctor_card(db:Session, doctor_card: DoctorCard, actor: CurrentUser) -> None:
    db.delete(doctor_card)
    # the entry keeps card_id after the card is gone: audit_log has no link to doctor_card
    log_action(db, actor, "delete_card", owner_id=doctor_card.user_id, card_id=doctor_card.card_id)

    db.commit()
