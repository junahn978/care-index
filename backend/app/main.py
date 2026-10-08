from fastapi import FastAPI
from backend.app.routers.doctor_card import router as doctor_card_router

app = FastAPI()

# mount the router
app.include_router(doctor_card_router)

@app.get("/")
async def root():
    return {"Hello": "World"}