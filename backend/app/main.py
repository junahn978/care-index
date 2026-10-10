from fastapi import FastAPI
from backend.app.routers.doctor_card import router as doctor_card_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# mount the router
app.include_router(doctor_card_router)

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Only let these specific websites in
    allow_credentials=True,     # Allow cookies or login tokens
    allow_methods=["*"],        # Allow all actions (GET, POST, PUT, DELETE)
    allow_headers=["*"],        # Allow all extra information headers
)

@app.get("/")
async def root():
    return {"Hello": "World"}