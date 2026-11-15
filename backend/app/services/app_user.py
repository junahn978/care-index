from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from backend.app.models.app_user import AppUser
from uuid import UUID

# get the caller's app_users row, creating it on their first request after signing in
def get_or_create_app_user(db: Session, user_id: UUID, email: str) -> AppUser:
    app_user = db.get(AppUser, user_id)
    if app_user is not None:
        return app_user

    # two first requests can arrive together (e.g. two tabs), and both see no row above.
    # ON CONFLICT on the primary key lets the second insert do nothing instead of failing
    statement = (
        insert(AppUser)
        .values(id=user_id, email=email)
        .on_conflict_do_nothing(index_elements=[AppUser.id])
    )
    db.execute(statement)

    # committed here, on its own: GET routes never commit, and the row should exist
    # even if the route that follows fails and rolls back
    db.commit()

    return db.get(AppUser, user_id)
